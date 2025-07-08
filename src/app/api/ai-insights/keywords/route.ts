import ConnectDB from "@/config/ConnectDB";
import SlotModel from "@/models/SlotModel";
import { extractTopKeywords } from "@/utils/ai/tfidf";
import { NextResponse } from "next/server";
import { PartialSlot } from "../trending/route";

export async function GET() {
    try {
        await ConnectDB();

        const rawSlots = await SlotModel
            .find(
                { status: "completed", trendScore: { $gt: 0 } }, // Only completed + trending
                { title: 1, description: 1, tags: 1 }
            )
            .sort({ trendScore: -1 }) // Highest trend first
            .limit(100) // Limit to most relevant
            .lean();

        const slots: PartialSlot[] = rawSlots as unknown as PartialSlot[];
        const keywords = await extractTopKeywords(slots);

        return NextResponse.json({ success: true, data: keywords }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to extract keywords", details: error },
            { status: 500 }
        );
    }
}
