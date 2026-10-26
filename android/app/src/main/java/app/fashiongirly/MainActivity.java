package app.fashiongirly;

import android.Manifest;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.GeolocationPermissions;
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
 * (Open-Meteo's credit) open in the phone's browser.
 */
public class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String START = "https://" + HOST + "/assets/index.html";
    private static final int LOCATION_REQUEST = 1;

    private WebView web;
    private AppUpdates updates;
    private volatile WebViewAssetLoader assets;
    private File serving;
    private String pendingOrigin;
    private GeolocationPermissions.Callback pendingCallback;

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
    }

    private boolean hasLocation() {
        return Build.VERSION.SDK_INT < Build.VERSION_CODES.M
                || checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
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
        if (web != null) web.destroy();
        super.onDestroy();
    }
}
