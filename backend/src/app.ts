import express from "express";
import cookieParser from "cookie-parser";

// import cors from "cors";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

// const allowedOrigins = process.env.CLIENT_URL?.split(",") || [];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // allow requests with no origin (like Postman)
//       if (!origin) return callback(null, true);

//       if (allowedOrigins.includes(origin)) {
//         return callback(null, true);
//       } else {
//         return callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   })
// );

//user Route
import userRouter from "./routes/user.route.js";
app.use("/api/user", userRouter);

//task Route
import taskRouter from "./routes/task.route.js";
app.use("/api/task", taskRouter);

//assign volunteer
import assignVolunteerRouter from './routes/assignTask.route.js'
app.use('/api/assignVolunteer', assignVolunteerRouter)

//ai Route
import aiRoutes from "./routes/ai.route.js";
app.use("/api/assign/ai", aiRoutes);


app.get("/", (req, res) => {
  res.send("Hello Welcome to my App");
});

export default app;
