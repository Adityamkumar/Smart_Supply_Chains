import mongoose, { Document, Schema } from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin" | "volunteer";
  skills: string[];
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  availability: boolean;
  refreshToken:string;
  generateAccessToken(): string
  generateRefreshToken(): string
  isPasswordCorrect(enteredPassword: string):Promise<boolean>
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    role: {
      type: String,
      enum: ["admin", "volunteer"],
      default: "volunteer",
    },

    skills: [
      {
        type: String,
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

    availability: {
      type: Boolean,
      default: true,
    },

    rating: {
      type: Number,
      default: 0,
    },
     refreshToken:{
    type: String
  },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function(enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.methods.generateAccessToken = function(){
   return jwt.sign(
        {
            _id: this._id,
        },
        process.env.ACCESS_TOKEN_SECRET!,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
   return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET!,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

userSchema.index({ location: "2dsphere" });

export const User = mongoose.model<IUser>("User", userSchema);