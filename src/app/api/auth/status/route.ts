import ConnectDB from "@/config/ConnectDB";
import UserModel from "@/models/UserModel";
import { getUserIdFromRequest } from "@/utils/server/getUserFromToken";
import { NextRequest, NextResponse } from "next/server";
import { ApiNotificationTypes } from "@/utils/constants";
import SlotModel, { IRegisterStatus } from "@/models/SlotModel";
import mongoose from "mongoose";

export interface IBookedSlots {
    userId: string;
    slotId: string;
    status: IRegisterStatus;
}


export async function GET(req: NextRequest) {
    try {
        await ConnectDB();

        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await UserModel.findById(userId).select("-password");
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);

        // Fetch all user-created slots
        const ownSlots = await SlotModel.find({ ownerId: userId }).lean();

        // Separate own slots by logic
        const upcomingSlots = ownSlots.filter(slot =>
            [IRegisterStatus.Upcoming, IRegisterStatus.Ongoing].includes(slot.status as IRegisterStatus)
        );

        const recentSlots = ownSlots.filter(slot =>
            [IRegisterStatus.Completed, IRegisterStatus.Expired].includes(slot.status as IRegisterStatus) &&
            slot.meetingDate >= oneWeekAgo
        );

        // Get user's booked slotIds
        const bookedSlotIds = user.bookedSlots.map((b: IBookedSlots) => b.slotId.toString());

        const bookedSlots = bookedSlotIds.length
            ? await SlotModel.find({
                _id: { $in: bookedSlotIds },
                meetingDate: { $gte: now, $lte: nextWeek }
            })
                .select("title durationFrom durationTo meetingDate status")
                .lean()
            : [];

        const activities = [
            ...upcomingSlots.map(slot => ({
                id: (slot._id as mongoose.Types.ObjectId).toString(),
                title: slot.title,
                time: `${slot.durationFrom} – ${slot.durationTo}`,
                type: "upcoming" as const,
            })),
            ...recentSlots.map(slot => ({
                id: (slot._id as mongoose.Types.ObjectId).toString(),
                title: slot.title,
                time: `${slot.durationFrom} – ${slot.durationTo}`,
                type: "recent" as const,
            })),
            ...bookedSlots.map(slot => ({
                id: (slot._id as mongoose.Types.ObjectId).toString(),
                title: slot.title,
                time: `${slot.durationFrom} – ${slot.durationTo}`,
                type: "booked" as const,
            })),
        ];

        return NextResponse.json({ success: true, user, activities }, { status: 200 });

    } catch (err) {
        console.error("GET /api/activities error:", err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// ? api-status-update :: Notification.tsx, , , , 
export async function POST(req: NextRequest) {
    try {
        await ConnectDB();

        const type = req.nextUrl.searchParams.get("type");

        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        if (type === ApiNotificationTypes.REFRESH_NOTIFICATION) {
            await UserModel.findByIdAndUpdate(userId, { countOfNotifications: 0 }, { new: true });

        } else if (type === ApiNotificationTypes.ADD_NEW_NOTIFICATION) {
            await UserModel.findByIdAndUpdate(userId, { $inc: { countOfNotifications: 1 } }, { new: true });

        }

        return NextResponse.json({ success: true, message: 'status updated successfully.' }, { status: 201 });

    } catch (error) {
        console.log("Status Update Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// ? PUT api from ProfileComponent.tsx
export async function PUT(req: NextRequest) {
    try {
        await ConnectDB();

        const body: { field: string; value?: string } = await req.json();
        const { field, value } = body;

        if (!field || (field !== 'image' && !value)) {
            return NextResponse.json({ message: 'Missing query parameters' }, { status: 400 });
        }

        const allowedFields = ['username', 'title', 'image', 'profession', 'timeZone'];
        if (!allowedFields.includes(field)) {
            return NextResponse.json({ message: 'Field update not allowed' }, { status: 400 });
        }

        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const previousValue = await UserModel.findById(userId).select(field);
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { [field]: value },
            { new: true }
        ).select(field);


        return NextResponse.json(
            {
                success: true,
                message: `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully.`,
                updated: { [field]: updatedUser?.[field as keyof typeof updatedUser] },
                previous: previousValue[field],
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Status PUT Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
