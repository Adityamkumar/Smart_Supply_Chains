import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || true, 
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

import userRouter from "./routes/user.route.js";
app.use("/api/user", userRouter);

import taskRouter from "./routes/task.route.js";
app.use("/api/task", taskRouter);

import assignVolunteerRouter from './routes/assignTask.route.js'
app.use('/api/assignVolunteer', assignVolunteerRouter)

import aiRoutes from "./routes/ai.route.js";
app.use("/api/assign/ai", aiRoutes);

import helpRequestRouter from "./routes/helpRequest.route.js";
app.use("/api/help-requests", helpRequestRouter);

app.get("/", (req, res) => {
  res.json({ message: "VolunSync Strategic API is Live", status: "Operational" });
});


app.use((err: any, req: any, res: any, next: any) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
  });
});

export default app;
