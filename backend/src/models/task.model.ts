import mongoose, { Document, Schema, type ObjectId } from "mongoose";

export interface ITask extends Document {
  title: string;
  description: string;
  requiredSkills: string[];
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  volunteersNeeded: number;
  assignedCount: number;
  status: "open" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    requiredSkills: [
      {
        type: String,
        required: true
      },
    ],

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    volunteersNeeded: {
      type: Number,
    },
    assignedCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "completed"],
      default: 'open'
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: 'medium'
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);
taskSchema.index({ location: "2dsphere" });
export const Task = mongoose.model('Task', taskSchema)