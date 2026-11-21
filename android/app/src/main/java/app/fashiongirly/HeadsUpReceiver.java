package app.fashiongirly;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * The morning alarm, and the moments its alarm must be set again: after the phone restarts, the app is updated, or
 * the clock or time zone changes (see HeadsUp).
 */
public final class HeadsUpReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (HeadsUp.ACTION.equals(intent.getAction())) HeadsUp.onAlarm(context);
        else HeadsUp.schedule(context);
    }
}
