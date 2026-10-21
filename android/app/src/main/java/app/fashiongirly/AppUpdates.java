package app.fashiongirly;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * Keeps the web app (garments, styling, worlds) up to date without a new APK. The Deploy Pages workflow publishes each
 * build of main to GitHub Pages with version.json (its number: the commit count, as for the APK) and app.zip (the whole
 * build). Now and then this downloads a newer app.zip and unpacks it to files/web/<version>/; the app then serves that
 * copy instead of the one inside the APK, at the same address, so saved looks stay. Without internet, or if anything
 * fails, the app keeps the copy it has.
 */
final class AppUpdates {
    static final String SITE = "https://meraw.github.io/fashiongirly/";
    private static final long CHECK_EVERY = 60 * 60 * 1000L;
    private static final String LAST_CHECK = "lastCheck";

    private final File root;
    private final SharedPreferences prefs;
    private final int bundled;
    private final ExecutorService worker = Executors.newSingleThreadExecutor();
    /** The downloaded copy being shown, or null for the one inside the APK. Read by the download thread. */
    private volatile File serving;

    AppUpdates(Context context) {
        root = new File(context.getFilesDir(), "web");
        prefs = context.getSharedPreferences("updates", Context.MODE_PRIVATE);
        bundled = bundledVersion(context);
    }

    @SuppressWarnings("deprecation")
    private static int bundledVersion(Context context) {
        try {
            return context.getPackageManager().getPackageInfo(context.getPackageName(), 0).versionCode;
        } catch (PackageManager.NameNotFoundException e) {
            return 0;
        }
    }

    /** The newest downloaded copy that is newer than the APK's, or null to use the APK's own. */
    File newest() {
        File best = null;
        int bestVersion = bundled;
        File[] dirs = root.listFiles();
        if (dirs == null) return null;
        for (File dir : dirs) {
            int version = versionOf(dir);
            if (version > bestVersion && new File(dir, "index.html").isFile()) {
                best = dir;
                bestVersion = version;
            }
        }
        return best;
    }

    void serve(File dir) {
        serving = dir;
    }

    /** Looks for a newer version in the background, at most once an hour. It is shown the next time the app is opened. */
    void checkSoon() {
        long now = System.currentTimeMillis();
        long last = prefs.getLong(LAST_CHECK, 0);
        if (now - last < CHECK_EVERY && now >= last) return;
        prefs.edit().putLong(LAST_CHECK, now).apply();
        worker.execute(() -> {
            tidy();
            try {
                download();
            } catch (IOException | JSONException | RuntimeException e) {
                // No internet, or Pages is mid-deploy: keep what we have and try again later.
            } finally {
                deleteAll(new File(root, "app.zip"));
                deleteAll(new File(root, "unpacking"));
            }
        });
    }

    private void download() throws IOException, JSONException {
        int latest = new JSONObject(new String(fetch("version.json"), StandardCharsets.UTF_8)).getInt("version");
        File current = newest();
        if (latest <= (current == null ? bundled : versionOf(current))) return;

        root.mkdirs();
        File zip = new File(root, "app.zip");
        try (InputStream in = open("app.zip"); OutputStream out = new FileOutputStream(zip)) {
            copy(in, out);
        }
        File unpacking = new File(root, "unpacking");
        deleteAll(unpacking);
        unzip(zip, unpacking);
        // The zip's own version.json says what it holds (Pages may have moved on since version.json was read).
        int version;
        try (InputStream in = new FileInputStream(new File(unpacking, "version.json"))) {
            version = new JSONObject(new String(readAll(in), StandardCharsets.UTF_8)).getInt("version");
        }
        File target = new File(root, Integer.toString(version));
        if (version <= bundled || target.exists() || !new File(unpacking, "index.html").isFile()) return;
        if (!unpacking.renameTo(target)) throw new IOException("Could not move the new version into place");
    }

    /** Removes copies that will not be shown again: older than the APK's, or neither shown now nor the newest. */
    private void tidy() {
        File keep = newest();
        File shown = serving;
        File[] dirs = root.listFiles();
        if (dirs == null) return;
        for (File dir : dirs) {
            if (!dir.isDirectory() || dir.equals(keep) || dir.equals(shown)) continue;
            if (versionOf(dir) > 0 || dir.getName().equals("unpacking")) deleteAll(dir);
        }
    }

    private static int versionOf(File dir) {
        try {
            return dir.isDirectory() ? Integer.parseInt(dir.getName()) : 0;
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private static HttpURLConnection connect(String path) throws IOException {
        HttpURLConnection connection = (HttpURLConnection) new URL(SITE + path).openConnection();
        connection.setConnectTimeout(15000);
        connection.setReadTimeout(60000);
        connection.setUseCaches(false);
        if (connection.getResponseCode() != HttpURLConnection.HTTP_OK) {
            connection.disconnect();
            throw new IOException(path + ": HTTP " + connection.getResponseCode());
        }
        return connection;
    }

    private static InputStream open(String path) throws IOException {
        return connect(path).getInputStream();
    }

    private static byte[] fetch(String path) throws IOException {
        try (InputStream in = open(path)) {
            return readAll(in);
        }
    }

    private static void unzip(File zip, File into) throws IOException {
        String base = into.getCanonicalPath() + File.separator;
        try (ZipInputStream in = new ZipInputStream(new FileInputStream(zip))) {
            for (ZipEntry entry; (entry = in.getNextEntry()) != null; ) {
                File file = new File(into, entry.getName());
                // Never write outside the folder, whatever the zip's names say.
                if (!file.getCanonicalPath().startsWith(base)) throw new IOException("Bad entry " + entry.getName());
                if (entry.isDirectory()) {
                    file.mkdirs();
                    continue;
                }
                file.getParentFile().mkdirs();
                try (OutputStream out = new FileOutputStream(file)) {
                    copy(in, out);
                }
            }
        }
    }

    private static byte[] readAll(InputStream in) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        copy(in, out);
        return out.toByteArray();
    }

    private static void copy(InputStream in, OutputStream out) throws IOException {
        byte[] buffer = new byte[64 * 1024];
        for (int n; (n = in.read(buffer)) > 0; ) out.write(buffer, 0, n);
    }

    private static void deleteAll(File file) {
        File[] children = file.listFiles();
        if (children != null) for (File child : children) deleteAll(child);
        file.delete();
    }
}
