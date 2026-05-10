import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/mongodb.js";
import authRouter     from "./routes/authRoutes.js";
import userRouter     from "./routes/userRoutes.js";
import projectRouter  from "./routes/projectRoutes.js";
import settingsRouter from "./routes/settingsRoutes.js";
import estimateRouter from "./routes/estimateRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const port = process.env.PORT || 4000;

// Database Connection
connectDB();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173'
];

app.use(cors({
    origin: (origin, callback) => {

        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS: ' + origin));
    },
    credentials: true
}));

// Static folder for uploaded plans
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Endpoints
app.get('/', (req,res) => res.send("Quantrox API Working"));
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/project',  projectRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/estimate', estimateRouter);  

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err.message);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Server error'
    });
});

app.listen(port, () => console.log(`Server Started on PORT: ${port}`));