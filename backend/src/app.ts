import express from "express";
// import cors from "cors";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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


app.get("/", (req, res) => {
  res.send("Hello Welcome to my App");
});

export default app;
