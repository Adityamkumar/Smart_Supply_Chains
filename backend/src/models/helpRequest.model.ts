import mongoose, { Document, Schema } from "mongoose";

export interface IHelpRequest extends Document {
  name: string;
  phone: string;
  description: string;
  descriptionEnglish?: string;
  descriptionHindi?: string;
  location: {
    address: string;
    coordinates: [number, number];
  };
  volunteersNeeded: number;
  priority: "low" | "medium" | "high" | "emergency";
  status: "pending" | "approved" | "converted" | "rejected" | "completed";
  linkedTask?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const helpRequestSchema = new Schema<IHelpRequest>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    description: { type: String, required: true },
    descriptionEnglish: { type: String },
    descriptionHindi: { type: String },
    location: {
      address: { type: String, required: true },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    volunteersNeeded: { type: Number, default: 1 },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "emergency"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "converted", "rejected", "completed"],
      default: "pending",
    },
    linkedTask: {
      type: Schema.Types.ObjectId,
      ref: "Task",
    },
  },
  { timestamps: true }
);


helpRequestSchema.index({ "location.coordinates": "2dsphere" });

export const HelpRequest = mongoose.model<IHelpRequest>("HelpRequest", helpRequestSchema);
