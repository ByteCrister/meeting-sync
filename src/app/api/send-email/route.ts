import ConnectDB from "@/config/ConnectDB";
import { emailAuthentication } from "@/config/NodeEmailer";
import NotificationsModel, { INotificationType } from "@/models/NotificationsModel";
import SlotModel, { IRegisterStatus } from "@/models/SlotModel";
import UserModel from "@/models/UserModel";
import { convertDateTimeBetweenTimeZones } from "@/utils/client/date-formatting/convertDateTimeBetweenTimeZones";
import { convertTimeBetweenTimeZones } from "@/utils/client/date-formatting/convertTimeBetweenTimeZones";
import { ApiSendEmailType, SocketTriggerTypes } from "@/utils/constants";
import getNotificationExpiryDate from "@/utils/server/getNotificationExpiryDate";
import { getUserIdFromRequest } from "@/utils/server/getUserFromToken";
import { triggerSocketEvent } from "@/utils/socket/triggerSocketEvent";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await ConnectDB();

        const body = await req.json();
        const { type, value } = body as { type: ApiSendEmailType; value: { updatedValue: string; previousValue: string } };
        const { updatedValue, previousValue } = value;

        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const user = await UserModel.findById(userId).select('image');

        if (type === ApiSendEmailType.UPDATE_TIME_ZONE) {
            // Fetch all the user's slots
            const userSlots = await SlotModel.find({
                ownerId: userId,
                meetingDate: { $gte: new Date() },
                status: IRegisterStatus.Upcoming
            });


            // Loop through all user slots and update their times based on the new time zone
            for (const slot of userSlots) {

                // Update meetingDate, durationFrom, and durationTo
                const updatedMeetingDate = convertDateTimeBetweenTimeZones(previousValue, updatedValue, slot.meetingDate.toISOString(), slot.durationFrom);
                const updatedDurationFrom = convertTimeBetweenTimeZones(previousValue, updatedValue, slot.meetingDate.toISOString(), slot.durationFrom);
                const updatedDurationTo = convertTimeBetweenTimeZones(previousValue, updatedValue, slot.meetingDate.toISOString(), slot.durationTo);

                // Save the updated times back to the slot
                await SlotModel.findByIdAndUpdate(
                    slot._id,
                    {
                        meetingDate: updatedMeetingDate,
                        durationFrom: updatedDurationFrom,
                        durationTo: updatedDurationTo,
                    },
                    { new: true }
                );

                console.log(JSON.stringify(slot, null, 2));

                const baseNotification = {
                    type: INotificationType.SLOT_UPDATED,
                    sender: userId,
                    message: `Meeting slot "${slot.title}" is updated.`,
                    isRead: false,
                    isClicked: false,
                    createdAt: new Date(),
                    expiresAt: getNotificationExpiryDate(30), 
                };

                for (const bookedUserId of slot.bookedUsers) {
                    const bookedUser = await UserModel.findById(bookedUserId).select('email');
                    if (!bookedUser) continue;

                    if (bookedUser?.email) {
                        await emailAuthentication(bookedUser.email, '***Updated Meeting Schedule***', HTMLUpdatedTimeZone(slot.title, updatedMeetingDate, updatedDurationFrom, updatedDurationTo));
                    }
                    const notification = { ...baseNotification, receiver: bookedUserId };
                    const saved = await NotificationsModel.create(notification);
                    // ! Emit a notification to the booked user of new meeting date and time duration  
                    triggerSocketEvent({
                        userId: bookedUserId.toString(),
                        type: SocketTriggerTypes.RECEIVED_NOTIFICATION,
                        notificationData: {
                            ...notification,
                            _id: saved._id,
                            slot: slot._id,
                            image: user?.image,
                        },
                    });
                }
            }
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.log('error : ' + error);
        return NextResponse.json({ error: "Failed to send email: " }, { status: 500 });
    }
};

// ? HTML code for sending email of update date adn time
const HTMLUpdatedTimeZone = (
  title: string,
  updatedMeetingDate: string,
  updatedDurationFrom: string,
  updatedDurationTo: string
) => {
  return `
  <div style="max-width: 600px; margin: auto; padding: 24px; font-family: Arial, sans-serif; background-color: #f8f9fa; border-radius: 10px; border: 1px solid #e0e0e0; color: #333;">
    <h2 style="text-align: center; color: #00796b; margin-bottom: 16px;">📅 MeetingSync – Schedule Update</h2>
    
    <p style="font-size: 16px;">Hey there,</p>
    
    <p style="font-size: 16px;">
      The schedule for the meeting titled <strong style="color: #000;">"${title}"</strong> has been updated.
    </p>
    
    <div style="margin: 24px 0; padding: 16px; background-color: #ffffff; border-radius: 8px; border: 1px solid #d0d0d0;">
      <p style="font-size: 16px; font-weight: bold; color: #444; margin-bottom: 8px;">🕒 New Schedule:</p>
      <ul style="list-style: none; padding: 0; font-size: 15px; color: #555;">
        <li><strong>Date:</strong> ${new Date(updatedMeetingDate).toLocaleDateString()}</li>
        <li><strong>Start Time:</strong> ${updatedDurationFrom}</li>
        <li><strong>End Time:</strong> ${updatedDurationTo}</li>
      </ul>
    </div>

    <p style="font-size: 15px;">
      Kindly update your calendar to reflect the new schedule.
    </p>

    <p style="font-size: 14px; color: #777; margin-top: 32px;">
      Thank you,<br>
      <strong style="color: #00796b;">– The MeetingSync Team</strong>
    </p>
  </div>`;
};
