import ConnectDB from "@/config/ConnectDB";
import UserModel from "@/models/UserModel";
import { getUserIdFromRequest } from "@/utils/server/getUserFromToken";
import { NextRequest, NextResponse } from "next/server";
import { ApiNotificationTypes } from "@/utils/constants";
import SlotModel, { IRegisterStatus } from "@/models/SlotModel";

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
            return new Response(JSON.stringify({ success: false, message: "User not found" }), { status: 404 });
        }

        const allowedStatuses = [
            IRegisterStatus.Upcoming,
            IRegisterStatus.Ongoing,
            IRegisterStatus.Completed,
        ];

        const slots = await SlotModel.find({
            ownerId: user._id,
            status: { $in: allowedStatuses },
        }).sort({ meetingDate: -1 });

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const recentBookedSlotIds: string[] = user.bookedSlots
            .filter((b: IBookedSlots) => {
                const statusValid = [IRegisterStatus.Upcoming, IRegisterStatus.Ongoing].includes(b.status);
                return statusValid;
            })
            .map((b: IBookedSlots) => b.slotId.toString());

        const activities = slots.map((slot) => {
            const isBooked = recentBookedSlotIds.includes(slot._id.toString());

            let type: "booked" | "upcoming" | "recent";

            if (
                slot.status === IRegisterStatus.Completed ||
                slot.status === IRegisterStatus.Expired
            ) {
                type = "recent";
            } else if (isBooked) {
                type = "booked";
            } else {
                type = "upcoming";
            }

            return {
                id: slot._id.toString(),
                title: slot.title,
                time: `${slot.durationFrom} - ${slot.durationTo}`,
                type,
            };
        });

        return NextResponse.json({ success: true, user, activities }, { status: 200 });
    } catch (error) {
        console.log("JWT Verification Error:", error);
        return new Response(JSON.stringify({ message: "Invalid token" }), { status: 401 });
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
