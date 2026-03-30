import express from 'express';
import { getUserData } from '../controllers/userController';
import userAuth from '../middleware/userAuth';

const userRouter = express.Router();

userRouter.get('/data', userAuth, getUserData);

export default userRouter;
