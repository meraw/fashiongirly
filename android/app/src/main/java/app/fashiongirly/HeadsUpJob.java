package app.fashiongirly;

import android.app.job.JobParameters;
import android.app.job.JobService;

/** The morning check, run by Android once the phone has a connection after the alarm (see HeadsUp). */
public final class HeadsUpJob extends JobService {
    @Override
    public boolean onStartJob(JobParameters params) {
        long due = params.getExtras().getLong("due", System.currentTimeMillis());
        HeadsUp.morning(this, due, () -> jobFinished(params, false));
        return true;
    }

    @Override
    public boolean onStopJob(JobParameters params) {
        // Stopped (the connection went): the check is let go rather than retried, so a late heads-up never arrives.
        return false;
    }
}
