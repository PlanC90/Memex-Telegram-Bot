import { config } from 'dotenv';
config();

export const BOT_CONFIG = {
    token: process.env.BOT_TOKEN,
    username: process.env.BOT_USERNAME,
    mainGroup: process.env.MAIN_GROUP
};
