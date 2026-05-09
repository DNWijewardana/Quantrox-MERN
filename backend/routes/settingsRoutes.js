import express from 'express';
import userAuth from '../middleware/userAuth.js';
import {
    getSettings,
    saveSettings,
    resetSettings
} from '../controllers/settingsController.js';

const settingsRouter = express.Router();

settingsRouter.get ('/', userAuth, getSettings);
settingsRouter.post('/', userAuth, saveSettings);
settingsRouter.post('/reset', userAuth, resetSettings);

export default settingsRouter;
