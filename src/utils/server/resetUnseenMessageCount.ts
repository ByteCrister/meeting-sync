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
    if (!chatBox) return;

    const participant = chatBox.participants.get(viewerUserId);
    if (!participant) return;

    const unseenMsgIds: string[] = [];

    // Mark messages as seen locally
    const updatedChats = participant.chats.map((chat: IMessage) => {
        if (!chat?.seen) {
            if (chat._id) unseenMsgIds.push(chat._id.toString());
            return { ...chat, seen: true };
        }
        return chat;
    });

    // Use $set to atomically replace the chat array
    await ChatBoxModel.updateOne(
        { ownerId: senderId },
        { $set: { [`participants.${viewerUserId}.chats`]: updatedChats } }
    );

    triggerSocketEvent({
        userId: senderId,
        type: SocketTriggerTypes.UPDATE_MESSAGE_SEEN,
        notificationData: { data: unseenMsgIds, user_id: viewerUserId },
    });

    return unseenMsgIds;
}