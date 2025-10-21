import { Cron } from "croner";

const scheduledJobs = new Map<string, Cron>();

export function scheduleAutoRelease(
  dealId: string,
  delayMs: number,
  callback: () => Promise<void>
) {
  const runAt = new Date(Date.now() + delayMs * 1000);

  // Create cron job to run once at specific date
  const job = new Cron(runAt, async () => {
    console.log(`Running auto-release for deal ${dealId}`);
    await callback();
    scheduledJobs.delete(dealId);
  });

  // Set cron job
  scheduledJobs.set(dealId, job);

  console.log(
    `Scheduled auto-release for deal ${dealId} at ${runAt.toISOString()}`
  );
}

export function cancelAutoRelease(dealId: string) {
  const job = scheduledJobs.get(dealId);
  if (job) {
    // Stop cron job
    job.stop();

    // Remove from map
    scheduledJobs.delete(dealId);

    console.log(`Cancelled scheduled auto-release for deal ${dealId}`);
  }
}

export function listScheduledJobs() {
  return Array.from(scheduledJobs.keys());
}
