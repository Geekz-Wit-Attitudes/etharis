import { Cron } from "croner";

const scheduledJobs = new Map<string, Cron>();

export function scheduleJob(
  id: string,
  runAtOrDelay: Date | number, // Date or delay in seconds
  callback: () => Promise<void>
) {
  const runAt =
    runAtOrDelay instanceof Date
      ? runAtOrDelay
      : new Date(Date.now() + runAtOrDelay * 1000);

  const existingJob = scheduledJobs.get(id);

  if (existingJob) {
    const nextRun = existingJob.nextRun(); // get next scheduled date
    if (nextRun && nextRun.getTime() === runAt.getTime()) {
      console.log(
        `Job for ${id} already scheduled at the same time. Skipping.`
      );
      return; // same run time, no need to reschedule
    }
    cancelJob(id); // cancel old job if time changed
  }

  const job = new Cron(runAt, async () => {
    console.log(`Running job for deal ${id}`);
    await callback();

    // Remove the job from the map after running
    scheduledJobs.delete(id);
  });

  scheduledJobs.set(id, job);

  console.log(`Scheduled job for deal ${id} at ${runAt.toISOString()}`);
}

export function cancelJob(id: string) {
  const job = scheduledJobs.get(id);
  if (job) {
    // Stop cron job
    job.stop();

    // Remove from map
    scheduledJobs.delete(id);

    console.log(`Cancelled scheduled job for deal ${id}`);
  }
}

export function listScheduledJobs() {
  return Array.from(scheduledJobs.keys());
}
