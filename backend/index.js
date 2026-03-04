import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";

import connectDB from "./config/mongodb.js";

const app = express();
const port = process.env.PORT || 4000

// Database Connection
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials: true}));

app.get('/', (req,res) => res.send("API Working"));

app.listen(port, () => console.log(`Server Started on PORT: ${port}`));