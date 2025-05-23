import { ChatBoxModel, IMessage } from "@/models/ChatBoxModel";
import { triggerSocketEvent } from "../socket/triggerSocketEvent";
import { SocketTriggerTypes } from "../constants";

/**
 * Marks all messages as "seen" that were sent by the sender and received by the viewer.
 *
 * @param senderId - The ID of the message sender (i.e., the chat box owner).
 * @param viewerUserId - The ID of the user who is viewing the messages (i.e., the participant).
 */
export async function resetUnseenMessageCount(senderId: string, viewerUserId: string) {
    const chatBox = await ChatBoxModel.findOne({ ownerId: senderId });
    if (!chatBox) return [];

    const participant = chatBox.participants.get(viewerUserId);
    if (!participant) return [];

    // Step 1: Find all unseen messages
    const unseenMessages = participant.chats.filter((chat: IMessage) => !chat.seen && chat._id);
    const unseenMsgIds = unseenMessages.map((chat: IMessage) => chat._id!.toString());

    if (unseenMsgIds.length === 0) return [];

    // Step 2: Perform atomic update using MongoDB array filters
    await ChatBoxModel.updateOne(
        {
            ownerId: senderId,
            [`participants.${viewerUserId}.chats._id`]: { $in: unseenMsgIds }
        },
        {
            $set: {
                [`participants.${viewerUserId}.chats.$[elem].seen`]: true
            }
        },
        {
            arrayFilters: [{ "elem._id": { $in: unseenMessages.map((chat: IMessage) => chat._id) } }]
        }
    );

    // Step 3: Trigger real-time event
    triggerSocketEvent({
        userId: senderId,
        type: SocketTriggerTypes.UPDATE_MESSAGE_SEEN,
        notificationData: {
            data: unseenMsgIds,
            user_id: viewerUserId,
        },
    });

    return unseenMsgIds;
}