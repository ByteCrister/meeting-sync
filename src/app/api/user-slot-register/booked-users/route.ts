import ConnectDB from '@/config/ConnectDB';
import SlotModel, { IRegisterStatus } from '@/models/SlotModel';
import UserModel, { IUserFollowInfo } from '@/models/UserModel';
import { SocketTriggerTypes } from '@/utils/constants';
import { triggerSocketEvent } from '@/utils/socket/triggerSocketEvent';
import mongoose, { Types } from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';


// GET: get booked users or get blocked users
export async function GET(req: NextRequest) {
    try {
        await ConnectDB();

        const url = new URL(req.url);
        const slotId = url.searchParams.get("slotId");
        const type = url.searchParams.get("type"); // either "users" or "blocked"

        if (!slotId || !Types.ObjectId.isValid(slotId)) {
            return NextResponse.json({ message: "Valid slotId is required" }, { status: 400 });
        }

        if (type !== "users" && type !== "blocked-users") {
            return NextResponse.json({ message: "Invalid type. Must be 'users' or 'blocked'" }, { status: 400 });
        }


        const fieldToPopulate = type === "users" ? "bookedUsers" : "blockedUsers";

        const slot = await SlotModel.findById(slotId).populate(fieldToPopulate, "username email image");

        if (!slot) {
            return NextResponse.json({ message: "Slot not found" }, { status: 404 });
        }

        const rawUsers = type === "users" ? slot.bookedUsers : slot.blockedUsers;

        const formattedUsers = rawUsers.map((user: { _id: mongoose.Types.ObjectId, username: string, email: string, image: string }) => ({
            _id: user._id.toString(),
            username: user.username,
            email: user.email,
            image: user.image,
            ...(type === 'users' && { isRemoved: false }),
        }));

        return NextResponse.json({ success: true, data: formattedUsers }, { status: 200 });
    } catch (error) {
        console.error("[GET_SLOT_USERS]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Block user (add to blockedUsers + remove from bookedUsers)
export async function POST(req: NextRequest) {
    try {
        await ConnectDB();

        const { userId, slotId } = await req.json() as { userId: string, slotId: string };

        if (!userId || !slotId) {
            return NextResponse.json({ message: "Missing userId or slotId" }, { status: 400 });
        }

        const slot = await SlotModel.findById(slotId);

        if (!slot) {
            return NextResponse.json({ message: "Slot not found" }, { status: 404 });
        }

        // Prevent duplicate entry
        if (!slot.blockedUsers.includes(userId)) {
            slot.blockedUsers.push(userId);
        }

        // Optionally: remove from bookedUsers as well
        slot.bookedUsers = slot.bookedUsers.filter(
            (id: mongoose.Types.ObjectId) => id.toString() !== userId
        );

        await slot.save();

        return NextResponse.json({ success: true, message: "User blocked successfully" });
    } catch (error) {
        console.error("Error blocking user:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// PUT: Unblock user (remove from blockedUsers) + Un-do remove users
export async function PUT(req: NextRequest) {
    try {
        await ConnectDB();
        const { userId, slotId, type } = await req.json() as { userId: string, slotId: string, type: 'unblock-user' | 'undo-remove-user' };

        if (!userId || !slotId || !type) {
            return NextResponse.json({ message: "Missing userId or slotId" }, { status: 400 });
        }

        if (type !== "unblock-user" && type !== "undo-remove-user") {
            return NextResponse.json({ message: "Invalid type. Must be 'unblock-user' or 'undo-remove-user'" }, { status: 400 });
        }

        const slot = await SlotModel.findById(slotId);
        if (!slot) {
            return NextResponse.json({ message: "Slot not found" }, { status: 404 });
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);

        if (type === 'unblock-user') {
            // Remove user from blockedUsers if exists
            slot.blockedUsers = slot.blockedUsers.filter(
                (id: mongoose.Types.ObjectId) => !id.equals(userObjectId)
            );
        } else {
            // Add user back to bookedUsers if not already there
            if (!slot.bookedUsers.some((id: mongoose.Types.ObjectId) => id.equals(userObjectId))) {
                slot.bookedUsers.push(userObjectId);
            }
        }

        await slot.save();

        const action = type === 'unblock-user' ? "unblocked" : "re-added to booked users";
        return NextResponse.json({ success: true, message: `User ${action} successfully` });

    } catch (error) {
        console.error("Error unblocking or re-adding user:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        await ConnectDB();

        // Get slot id
        const { slotId, userId } = await req.json() as { slotId: string, userId: string };
        if (!slotId || !userId) {
            return NextResponse.json({ success: false, message: "Invalid Credentials." }, { status: 400 });
        }

        //  Update users bookedSlot array, remove the slotId
        const updatedUser = await UserModel.findOneAndUpdate(
            { _id: userId },
            { $pull: { bookedSlots: { slotId } } },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Update bookedUsers from slot owners, remove userId
        const slot = await SlotModel.findOneAndUpdate(
            { _id: slotId },
            { $pull: { bookedUsers: userId } },
            { new: true }
        );

        if (!slot) {
            return NextResponse.json({ message: "Slot not found. Slot may be removed by the owner." }, { status: 404 });
        }

        // !  Notify other users who follow the slot owner, that one guest is decreased **Only if the meeting is still upcoming
        // ? This will trigger in frontend & change the slot booked guest count, to show the real-time booking count 
        if (slot.status !== IRegisterStatus.Upcoming) {
            // * Notify new booking count to the all followers of the slot owner in Meeting feed's
            const slotOwner = await UserModel.findById(slot.ownerId).select("followers");

            if (slotOwner?.followers?.length) {
                const followersToNotify = slotOwner.followers;

                const userSlotBookedData = {
                    type: SocketTriggerTypes.USER_SLOT_UNBOOKED,
                    sender: userId, // * user who unbooked the slot
                    slotId: slot._id,
                };

                await Promise.all(
                    followersToNotify.map((follower: IUserFollowInfo) => {
                        const followerId = follower.userId;
                        // ! Emit a notification to the follower's of the slot owner to update new booking count in meeting feed's      
                        triggerSocketEvent({
                            userId: followerId.toString(),
                            type: SocketTriggerTypes.USER_SLOT_UNBOOKED,
                            notificationData: userSlotBookedData,
                        });
                    })
                )

            }
        }

        // ? This will decrease the number of booked users on owner's account in real-time
        triggerSocketEvent({
            userId: slot.ownerId.toString(),
            type: SocketTriggerTypes.DECREASE_BOOKED_USER,
            notificationData: {
                bookedUserId: userId.toString(),
                slotId: slotId.toString()
            }
        });


        return NextResponse.json({ success: true, message: "User is removed from this meeting." });
    } catch (error) {
        console.error("[DELETE_BOOKED_SLOT_ERROR]", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
};