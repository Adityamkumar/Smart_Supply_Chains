import mongoose, { Document } from "mongoose";

export interface IAssignment extends Document {
  task: mongoose.Types.ObjectId;
  volunteer: mongoose.Types.ObjectId;
  status: "assigned" | "accepted" | "rejected" | "completed";
  aiReason: string;
  aiScore:number
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["assigned", "accepted", "rejected", "completed"],
      default: "assigned",
    },
    aiReason: {
      type: String,
    },

    aiScore: {
      type: Number,
    },
  },
  { timestamps: true },
);


assignmentSchema.index({ task: 1, volunteer: 1 }, { unique: true });

export const Assignment = mongoose.model<IAssignment>(
  "Assignment",
  assignmentSchema,
);
