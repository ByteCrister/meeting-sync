// cf-worker/index.ts

const cronWorker = {
  async scheduled(_event: ScheduledEvent, env: { CRON_SECRET: string }): Promise<void> {
    console.log("-> CRON triggered");

    const res = await fetch("https://meeting-sync-beta.vercel.app/api/run-cron", {
      method: "POST",
      headers: {
        "x-cron-secret": env.CRON_SECRET,
      },
    });

    console.log("-> Response status:", res.status);
  },
};

export default cronWorker;
