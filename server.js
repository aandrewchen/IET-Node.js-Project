import express from 'express';
import mongoose from 'mongoose';
import aggiefeedRouter from './routes/AggieFeed/activities.js';
import rssRouter from './routes/RSS/activities.js';

const app = express();

const PORT = 8080;

mongoose.connect('mongodb://localhost:27017/IET-NodeJS-Project')
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

app.use('/posts', aggiefeedRouter);

app.use('/test', rssRouter)

app.get('/', (req, res) => {
    res.status(200).send('<h1 style="text-align: center; margin-top: 50px;">IET-Node.js-Project API</h1>');
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});