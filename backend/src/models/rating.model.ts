import mongoose, { Document, Schema } from "mongoose";

export interface IRating extends Document {
  volunteerId: mongoose.Types.ObjectId;
  requestId?: mongoose.Types.ObjectId;
  voterId: string; 
  voterName: string;
  message?: string;
  rating: number;
}

const ratingSchema = new Schema<IRating>(
  {
    volunteerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestId: {
      type: Schema.Types.ObjectId,
      ref: "HelpRequest",
    },
    voterId: {
      type: String,
      required: true,
    },
    voterName: {
      type: String,
      required: true,
      default: "Anonymous",
    },
    message: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

// Ensure a customer can only rate a specific volunteer once overall
ratingSchema.index({ volunteerId: 1, voterId: 1 }, { unique: true });

export const Rating = mongoose.model<IRating>("Rating", ratingSchema);
