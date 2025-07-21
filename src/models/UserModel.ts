import mongoose, { Schema, Document } from "mongoose";
import { IRegisterStatus } from "./SlotModel";

export interface IUserFollowInfo {
    userId: string;
    startedFrom: Date;
}

//  * Interface for booked slots
export interface IBookedSlots {
    userId: string;
    slotId: string;
    status: IRegisterStatus;
}

interface IUserBehaviorProfile extends Document {
    chatKeywords: string[];          // Keywords extracted from user chats
    bookingPatterns: {
        favoriteCategories: string[]; // Top meeting categories booked
        avgMeetingDuration: number;
        bookingFrequency: number;      // e.g. meetings booked per week
    };
    searchKeywords: string[];        // Frequent search terms
    behaviorClusters?: number;       // Cluster or segment ID assigned by ML model
    interestTags: string[];          // Predicted interest tags or categories
    lastUpdated: Date;
}

// * Interface for User document
export interface IUsers extends Document {
    username: string;
    title: string;
    email: string;
    password: string;
    image: string;
    profession: string;
    timeZone: string;
    searchScore: number;
    trendScore: number;
    followers: IUserFollowInfo[];
    following: IUserFollowInfo[];
    bookedSlots: IBookedSlots[];
    registeredSlots: string[];
    disabledNotificationUsers: string[];
    countOfNotifications: number; // * this is for refreshing notifications
    isNewsFeedRefreshed: boolean;
    behaviorProfile?: IUserBehaviorProfile;
    createdAt: Date;
    updatedAt: Date;
}

const BehaviorProfileSchema = new Schema(
    {
        chatKeywords: { type: [String], default: [] },
        bookingPatterns: {
            favoriteCategories: { type: [String], default: [] },
            avgMeetingDuration: { type: Number, default: 0 },
            bookingFrequency: { type: Number, default: 0 },
        },
        searchKeywords: { type: [String], default: [] },
        behaviorClusters: { type: Number },
        interestTags: { type: [String], default: [] },
        lastUpdated: { type: Date, default: Date.now },
    },
    { _id: false } // prevent a separate _id for this subdocument
);


// * Users Schema
const UserSchema = new Schema<IUsers>(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true,
            minlength: [3, "Username must be at least 3 characters"],
        },
        title: {
            type: String,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please enter a valid email address",
            ],
            index: true, // ? Improves search performance
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
        },
        image: {
            type: String,
        },
        profession: {
            type: String
        },
        timeZone: {
            type: String,
            required: [true, "Time zone is required"],
        },
        searchScore: {
            type: Number,
            default: 0,
            min: 0,
        },
        trendScore: {
            type: Number,
            default: 0,
            min: 0,
        },
        followers: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "users",
                    required: true,
                },
                startedFrom: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        following: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "users",
                    required: true,
                },
                startedFrom: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        bookedSlots: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "users",
                    required: true,
                },
                slotId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "slots",
                    required: true,
                    index: true
                },
                status: {
                    type: String,
                    enum: ["upcoming", "ongoing", "completed", "expired"],
                    required: true,
                },
            },
        ],
        countOfNotifications: {
            type: Number,
            default: 0
        },
        isNewsFeedRefreshed: {
            type: Boolean,
            default: true
        },
        registeredSlots: [{ type: mongoose.Schema.Types.ObjectId, ref: "slots" }],
        disabledNotificationUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
        behaviorProfile: {
            type: BehaviorProfileSchema,
            default: () => ({}), // default empty behavior profile
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const UserModel = mongoose.models.users || mongoose.model<IUsers>("users", UserSchema);
export default UserModel;
