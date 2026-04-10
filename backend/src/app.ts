import express from "express";
import cookieParser from "cookie-parser";


const app = express();

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
  res.send("Hello Welcome to my App");
});


import { ApiError } from "./utils/ApiError.js";

app.use((err: any, req: any, res: any, next: any) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }


  return res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
