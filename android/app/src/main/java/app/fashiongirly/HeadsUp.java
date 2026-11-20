package app.fashiongirly;

import android.Manifest;
import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.job.JobInfo;
import android.app.job.JobScheduler;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.PersistableBundle;

import androidx.javascriptengine.JavaScriptIsolate;
import androidx.javascriptengine.JavaScriptSandbox;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 * The morning heads-up as a notification (the user's request, 20 November 2026): each morning at the time the user
 * chose, with the app closed, it checks the day's forecast and, on a day the weather changes what to wear (rain, wind,
 * cold, strong sun), says so. An alarm wakes HeadsUpReceiver at that time; it hands the check to HeadsUpJob, which
 * runs once the phone is online. The check runs the web app's own rules (src/weather/morning.js, built into
 * heads-up.js) in a JavaScript sandbox, so the rules update with the web app, without a new APK: the script says what
 * to fetch, this fetches it from Open-Meteo, and the script says what to tell. The place is the last one the Today
 * page used (setPlace), so no background location is needed. Nothing is sent on an ordinary day.
 */
final class HeadsUp {
    static final String ACTION = "app.fashiongirly.HEADS_UP";
    static final String DEFAULT_TIME = "07:30";
    private static final String PREFS = "headsup";
    private static final String CHANNEL = "heads-up";
    private static final String FORECAST = "https://api.open-meteo.com/";
    private static final int ALARM = 1, JOB = 1, NOTIFICATION = 1;
    /** A morning check that could not run within three hours of its time (no connection) is let go. */
    private static final long LATE = 3 * 3600 * 1000L;
    private static final long WAIT = 20;

    private static final ExecutorService worker = Executors.newSingleThreadExecutor();
    private static volatile boolean busy;
    /** Told whenever status() may have changed, on any thread. */
    private static volatile Runnable listener;

    private HeadsUp() {}

    static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    static void setListener(Runnable value) {
        listener = value;
    }

    private static void changed() {
        Runnable l = listener;
        if (l != null) l.run();
    }

    /** Whether this phone can run the check with the app closed: Android 8 and a WebView with the JavaScript sandbox. */
    static boolean supported() {
        try {
            return Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && JavaScriptSandbox.isSupported();
        } catch (RuntimeException | LinkageError e) {
            return false;
        }
    }

    static boolean allowed(Context context) {
        if (Build.VERSION.SDK_INT >= 33
                && context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            return false;
        }
        NotificationManager manager = context.getSystemService(NotificationManager.class);
        return manager == null || manager.areNotificationsEnabled();
    }

    /** granted, ask (Android has not asked yet) or denied (the user said no, or turned them off in settings). */
    static String permission(Context context) {
        if (allowed(context)) return "granted";
        boolean undecided = Build.VERSION.SDK_INT >= 33
                && context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
                && !prefs(context).getBoolean("refused", false);
        return undecided ? "ask" : "denied";
    }

    static void setRefused(Context context, boolean refused) {
        prefs(context).edit().putBoolean("refused", refused).apply();
    }

    /** What the Today page shows (src/today/notify.js). */
    static String status(Context context) {
        SharedPreferences p = prefs(context);
        JSONObject json = new JSONObject();
        try {
            json.put("supported", supported());
            json.put("enabled", p.getBoolean("enabled", false));
            json.put("time", p.getString("time", DEFAULT_TIME));
            json.put("permission", permission(context));
            json.put("place", p.contains("lat") ? p.getString("place", "") : JSONObject.NULL);
            json.put("busy", busy);
            if (p.contains("lastAt")) {
                json.put("last", new JSONObject().put("at", p.getLong("lastAt", 0)).put("title", p.getString("lastTitle", "")));
            } else {
                json.put("last", JSONObject.NULL);
            }
        } catch (JSONException ignored) {
            // Only plain values are put.
        }
        return json.toString();
    }

    static void setEnabled(Context context, boolean enabled, String time) {
        SharedPreferences.Editor edit = prefs(context).edit().putBoolean("enabled", enabled);
        if (time != null && time.matches("([01]\\d|2[0-3]):[0-5]\\d")) edit.putString("time", time);
        edit.apply();
        schedule(context);
        changed();
    }

    /** The place the Today page last read the weather for; name is empty for the phone's own location. */
    static void setPlace(Context context, double lat, double lon, String name) {
        if (!(lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180)) return;
        prefs(context).edit()
                .putString("lat", Double.toString(lat))
                .putString("lon", Double.toString(lon))
                .putString("place", name == null || "undefined".equals(name) || "null".equals(name) ? "" : name)
                .apply();
    }

    /** Sets the next morning's alarm, or none when the heads-up is off. Safe to call often. */
    static void schedule(Context context) {
        AlarmManager alarms = context.getSystemService(AlarmManager.class);
        if (alarms == null) return;
        PendingIntent pending = alarmIntent(context);
        alarms.cancel(pending);
        SharedPreferences p = prefs(context);
        if (!p.getBoolean("enabled", false)) return;
        long at = nextTime(p.getString("time", DEFAULT_TIME), System.currentTimeMillis());
        // Inexact but allowed while the phone dozes: a few minutes late at worst, with no exact-alarm permission.
        alarms.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pending);
    }

    /** The next time of day "HH:MM" after now (a minute's margin, so an alarm that just fired sets tomorrow's). */
    static long nextTime(String time, long now) {
        int hour = 7, minute = 30;
        try {
            hour = Integer.parseInt(time.substring(0, 2));
            minute = Integer.parseInt(time.substring(3, 5));
        } catch (RuntimeException ignored) {
            // The default time.
        }
        Calendar at = Calendar.getInstance();
        at.setTimeInMillis(now);
        at.set(Calendar.HOUR_OF_DAY, hour);
        at.set(Calendar.MINUTE, minute);
        at.set(Calendar.SECOND, 0);
        at.set(Calendar.MILLISECOND, 0);
        if (at.getTimeInMillis() <= now + 60 * 1000L) at.add(Calendar.DAY_OF_YEAR, 1);
        return at.getTimeInMillis();
    }

    private static PendingIntent alarmIntent(Context context) {
        Intent intent = new Intent(context, HeadsUpReceiver.class).setAction(ACTION);
        return PendingIntent.getBroadcast(context, ALARM, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    /** The morning alarm: tomorrow's is set, and today's check waits for a connection (HeadsUpJob). */
    static void onAlarm(Context context) {
        schedule(context);
        JobScheduler jobs = context.getSystemService(JobScheduler.class);
        if (jobs == null) return;
        PersistableBundle extras = new PersistableBundle();
        extras.putLong("due", System.currentTimeMillis());
        jobs.schedule(new JobInfo.Builder(JOB, new ComponentName(context, HeadsUpJob.class))
                .setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY)
                .setExtras(extras)
                .build());
    }

    /** Today's check from HeadsUpJob, due at `due`; done is run when it has finished. */
    static void morning(Context context, long due, Runnable done) {
        worker.execute(() -> {
            try {
                if (System.currentTimeMillis() - due <= LATE) run(context.getApplicationContext(), false);
            } finally {
                done.run();
            }
        });
    }

    /** "Send one now" on the Today page: today's heads-up at once, or a word that there is nothing to watch out for. */
    static void test(Context context) {
        worker.execute(() -> run(context.getApplicationContext(), true));
    }

    private static void run(Context context, boolean test) {
        busy = true;
        changed();
        try {
            check(context, test);
        } catch (Exception e) {
            if (test) post(context, "Couldn’t check the weather", "No connection, or the forecast did not answer. It will try again tomorrow morning.");
            remember(context, "Couldn’t check the weather");
        } finally {
            busy = false;
            changed();
        }
    }

    private static void check(Context context, boolean test) throws Exception {
        SharedPreferences p = prefs(context);
        String day = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
        if (!test && day.equals(p.getString("sentDay", ""))) return;
        if (!p.contains("lat")) {
            if (test) post(context, "Open Today once", "So the morning heads-up knows where you are.");
            remember(context, "Open Today once");
            return;
        }
        if (!supported()) {
            if (test) post(context, "Update Android System WebView", "This phone needs a newer WebView from the Play Store to check the weather with the app closed.");
            remember(context, "Update Android System WebView");
            return;
        }
        String place = p.getString("place", "");
        try (JavaScriptSandbox sandbox = JavaScriptSandbox.createConnectedInstanceAsync(context).get(WAIT, TimeUnit.SECONDS);
             JavaScriptIsolate js = sandbox.createIsolate()) {
            // The script defines FashiongirlyHeadsUp; it ends on a plain string so the sandbox has a value to hand back.
            js.evaluateJavaScriptAsync(script(context) + "\n;'ready'").get(WAIT, TimeUnit.SECONDS);
            String url = js.evaluateJavaScriptAsync("FashiongirlyHeadsUp.morningUrl(" + p.getString("lat", "0") + ", "
                    + p.getString("lon", "0") + ", " + JSONObject.quote(day) + ")").get(WAIT, TimeUnit.SECONDS);
            if (url == null || !url.startsWith(FORECAST)) throw new IOException("Unexpected forecast address");
            String forecast = get(url);
            String answer = js.evaluateJavaScriptAsync("JSON.stringify(FashiongirlyHeadsUp.morningNotification("
                    + JSONObject.quote(forecast) + ", " + JSONObject.quote(day) + ", " + JSONObject.quote(place) + ", " + test + "))")
                    .get(WAIT, TimeUnit.SECONDS);
            if (!test) p.edit().putString("sentDay", day).apply();
            if (answer == null || "null".equals(answer) || answer.isEmpty()) {
                remember(context, "Nothing to watch out for");
                return;
            }
            JSONObject note = new JSONObject(answer);
            post(context, note.optString("title", "Heads-up"), note.optString("body", ""));
            remember(context, note.optString("title", "Heads-up"));
        }
    }

    private static void remember(Context context, String title) {
        prefs(context).edit().putLong("lastAt", System.currentTimeMillis()).putString("lastTitle", title).apply();
    }

    /** heads-up.js from the copy of the web app being served: the newest download, or the APK's own. */
    private static String script(Context context) throws IOException {
        File dir = new AppUpdates(context).newest();
        File downloaded = dir == null ? null : new File(dir, "heads-up.js");
        try (InputStream in = downloaded != null && downloaded.isFile() ? new FileInputStream(downloaded) : context.getAssets().open("heads-up.js")) {
            return read(in);
        }
    }

    private static String get(String address) throws IOException {
        HttpURLConnection connection = (HttpURLConnection) new URL(address).openConnection();
        connection.setConnectTimeout(15000);
        connection.setReadTimeout(15000);
        try {
            if (connection.getResponseCode() != 200) throw new IOException("Forecast answered " + connection.getResponseCode());
            try (InputStream in = connection.getInputStream()) {
                return read(in);
            }
        } finally {
            connection.disconnect();
        }
    }

    private static String read(InputStream in) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buffer = new byte[16384];
        for (int n; (n = in.read(buffer)) > 0; ) out.write(buffer, 0, n);
        return out.toString(StandardCharsets.UTF_8.name());
    }

    @SuppressWarnings("deprecation")
    private static void post(Context context, String title, String body) {
        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager == null || !allowed(context)) return;
        Notification.Builder builder;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            manager.createNotificationChannel(new NotificationChannel(CHANNEL, "Morning heads-up", NotificationManager.IMPORTANCE_DEFAULT));
            builder = new Notification.Builder(context, CHANNEL);
        } else {
            builder = new Notification.Builder(context);
        }
        Intent open = new Intent(context, MainActivity.class).setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent tap = PendingIntent.getActivity(context, 0, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        manager.notify(NOTIFICATION, builder
                .setSmallIcon(R.drawable.ic_heads_up)
                .setColor(0xFFEF7B3C)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new Notification.BigTextStyle().bigText(body))
                .setContentIntent(tap)
                .setAutoCancel(true)
                .build());
    }
}
