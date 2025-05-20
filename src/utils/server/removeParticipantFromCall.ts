import VideoCallModel from '@/models/VideoCallModel';
import mongoose from 'mongoose';

export const removeParticipantFromAllCalls = async (userId: string) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.warn("Invalid userId passed to removeParticipantFromAllCalls");
        return;
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const result = await VideoCallModel.updateMany(
        {
            $or: [
                { "participants.userId": userObjectId },
                { "waitingParticipants.userId": userObjectId },
            ]
        },
        {
            $pull: {
                participants: { userId: userObjectId },
                waitingParticipants: { userId: userObjectId },
            },
        }
    );

    console.log(`Removed user ${userId} from ${result.modifiedCount} video call(s).`);
    return result;
};
