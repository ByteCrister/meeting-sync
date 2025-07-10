// src/app/api/run-cron/route.ts

import { updateSlotStatuses } from "@/utils/cron/updateSlotStatus";
import { cleanupExpiredVideoCalls } from "@/utils/server/cleanUpExpiredVideoCalls";

export async function POST(req: Request) {
    const token = req.headers.get("x-cron-secret");
    if (token !== process.env.CRON_SECRET) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        await updateSlotStatuses();
        await cleanupExpiredVideoCalls();
        return new Response(JSON.stringify({ status: "Cron executed" }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (err) {
        console.error("Cron error:", err);
        return new Response("Error running cron", { status: 500 });
    }
}