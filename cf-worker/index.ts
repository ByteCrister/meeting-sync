declare const CRON_SECRET: string;

const worker = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async scheduled(_event: ScheduledEvent): Promise<void> {
        await fetch("https://meeting-sync-beta.vercel.app/api/run-cron", {
            method: "POST",
            headers: {
                "x-cron-secret": CRON_SECRET,
            },
        });
    },
};

export default worker;