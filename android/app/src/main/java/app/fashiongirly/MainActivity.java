package app.fashiongirly;

import android.Manifest;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.webkit.WebViewAssetLoader;

import java.io.File;

/**
 * Shows the web app in a full-screen WebView: the copy bundled in the APK's assets, or a newer one AppUpdates has
 * downloaded. Either is served from https://appassets.androidplatform.net/assets/ (a secure origin, so ES modules, saved
 * looks and location all work as in a browser, and saved looks stay when the copy changes). Links to other sites
 * (Open-Meteo's credit) open in the phone's browser, so only the app's own pages are ever shown here. They can ask how
 * updates are going through window.FashiongirlyApp (see Bridge) and hear of a change through an app-update event, and
 * set the morning heads-up (HeadsUp), hearing of its changes through a heads-up-change event.
 */
public class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String START = "https://" + HOST + "/assets/index.html";
    private static final int LOCATION_REQUEST = 1;
    private static final int NOTIFY_REQUEST = 2;

    private WebView web;
    private AppUpdates updates;
    private volatile WebViewAssetLoader assets;
    private File serving;
    private String pendingOrigin;
    private GeolocationPermissions.Callback pendingCallback;
    /** What to do once Android answers the notification permission: turn the heads-up on at this time, or test it. */
    private String pendingTime;
    private boolean pendingTest;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        updates = new AppUpdates(this);
        serve(updates.newest());
        web = new WebView(this);
        setContentView(web);

        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setGeolocationEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return assets.shouldInterceptRequest(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri url = request.getUrl();
                if (HOST.equals(url.getHost())) return false;
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, url));
                } catch (ActivityNotFoundException ignored) {
                    // No browser: stay in the app.
                }
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                // The page asks for her location for the forecast: answer at once if the phone already allows it,
                // otherwise ask the user (the page falls back to a typed town if they say no).
                if (hasLocation()) {
                    callback.invoke(origin, true, false);
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    pendingOrigin = origin;
                    pendingCallback = callback;
                    requestPermissions(new String[]{Manifest.permission.ACCESS_COARSE_LOCATION}, LOCATION_REQUEST);
                } else {
                    callback.invoke(origin, false, false);
                }
            }
        });

        web.addJavascriptInterface(new Bridge(), "FashiongirlyApp");
        updates.setListener(() -> runOnUiThread(() -> {
            if (web != null) web.evaluateJavascript("dispatchEvent(new Event('app-update'))", null);
        }));
        HeadsUp.setListener(this::headsUpChanged);
        // The morning alarm, set again on every open in case Android dropped it.
        HeadsUp.schedule(this);

        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl(START);
    }

    /** Serves the downloaded copy in dir, or the APK's own copy when dir is null. */
    private void serve(File dir) {
        serving = dir;
        updates.serve(dir);
        assets = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", dir == null
                        ? new WebViewAssetLoader.AssetsPathHandler(this)
                        : new WebViewAssetLoader.InternalStoragePathHandler(this, dir))
                .build();
    }

    @Override
    protected void onResume() {
        super.onResume();
        // Back in the app: show a version downloaded since it was opened, then look for a newer one.
        File newest = updates.newest();
        if (newest != null && !newest.equals(serving)) {
            serve(newest);
            web.reload();
        }
        updates.checkSoon();
        // Notifications may have been turned on or off in Android's settings meanwhile.
        if (HeadsUp.allowed(this)) HeadsUp.setRefused(this, false);
        headsUpChanged();
    }

    /** Tells the page the heads-up's status may have changed (src/today/notify.js). */
    private void headsUpChanged() {
        runOnUiThread(() -> {
            if (web != null) web.evaluateJavascript("dispatchEvent(new Event('heads-up-change'))", null);
        });
    }

    /** Turns the heads-up on (asking for the notification permission first if needed) or off, or tests it. */
    private void headsUp(boolean on, String time, boolean test) {
        if (!on) {
            HeadsUp.setEnabled(this, false, time);
            return;
        }
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            if (HeadsUp.prefs(this).getBoolean("refused", false)) {
                headsUpChanged();
                return;
            }
            pendingTime = time;
            pendingTest = test;
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, NOTIFY_REQUEST);
            return;
        }
        if (test) HeadsUp.test(this);
        else HeadsUp.setEnabled(this, true, time);
    }

    /** What the page may ask of the app: how updates are going, to look now, and to show a downloaded version. */
    private final class Bridge {
        @JavascriptInterface
        public String status() {
            return updates.status();
        }

        @JavascriptInterface
        public void check() {
            updates.check();
        }

        @JavascriptInterface
        public String headsUp() {
            return HeadsUp.status(MainActivity.this);
        }

        @JavascriptInterface
        public void setHeadsUp(boolean on, String time) {
            runOnUiThread(() -> MainActivity.this.headsUp(on, time, false));
        }

        @JavascriptInterface
        public void testHeadsUp() {
            runOnUiThread(() -> MainActivity.this.headsUp(true, null, true));
        }

        @JavascriptInterface
        public void setPlace(double lat, double lon, String name) {
            HeadsUp.setPlace(MainActivity.this, lat, lon, name);
        }

        @JavascriptInterface
        public void notificationSettings() {
            runOnUiThread(() -> {
                Intent intent = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                        ? new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE, getPackageName())
                        : new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + getPackageName()));
                try {
                    startActivity(intent);
                } catch (ActivityNotFoundException ignored) {
                    // No settings screen to open.
                }
            });
        }

        @JavascriptInterface
        public void showUpdate() {
            runOnUiThread(() -> {
                File newest = updates.newest();
                if (web != null && newest != null && !newest.equals(serving)) {
                    serve(newest);
                    web.reload();
                }
            });
        }
    }

    private boolean hasLocation() {
        return Build.VERSION.SDK_INT < Build.VERSION_CODES.M
                || checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == NOTIFY_REQUEST) {
            boolean granted = grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED;
            HeadsUp.setRefused(this, !granted);
            if (granted && pendingTest) HeadsUp.test(this);
            else if (granted) HeadsUp.setEnabled(this, true, pendingTime);
            headsUpChanged();
            return;
        }
        if (requestCode != LOCATION_REQUEST || pendingCallback == null) return;
        boolean granted = grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED;
        pendingCallback.invoke(pendingOrigin, granted, false);
        pendingCallback = null;
        pendingOrigin = null;
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        web.saveState(outState);
    }

    @Override
    public void onBackPressed() {
        // Back steps through the app's pages (Today, Dress her, Wardrobe) before leaving it.
        if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        updates.setListener(null);
        HeadsUp.setListener(null);
        if (web != null) web.destroy();
        web = null;
        super.onDestroy();
    }
}
