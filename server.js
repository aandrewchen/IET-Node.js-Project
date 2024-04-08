import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import aggiefeedRouter from './routes/AggieFeed/activities.js';
import rssRouter from './routes/RSS/activities.js';

dotenv.config();

const app = express();
const PORT = 3001;

const username = process.env.MONGO_INITDB_ROOT_USERNAME;
const password = process.env.MONGO_INITDB_ROOT_PASSWORD;

app.use('/posts', aggiefeedRouter);

app.use('/rssData', rssRouter)

app.get('/', (req, res) => {
    res.status(200).send('<h1 style="text-align: center; margin-top: 50px;">IET-Node.js-Project API</h1>');
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});