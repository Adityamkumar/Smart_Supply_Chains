import mongoose, { Document, Schema } from "mongoose";

export interface IRating extends Document {
  volunteerId: mongoose.Types.ObjectId;
  voterId: string; // Could be a userId or an IP address for guests
  rating: number;
}

const ratingSchema = new Schema<IRating>(
  {
    volunteerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    voterId: {
      type: String,
      required: true,
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

// Ensure one person can only rate a volunteer once
ratingSchema.index({ volunteerId: 1, voterId: 1 }, { unique: true });

export const Rating = mongoose.model<IRating>("Rating", ratingSchema);
