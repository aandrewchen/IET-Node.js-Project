import express from 'express';
import activitiesRouter from './routes/activities.js';

const app = express();

const PORT = 8080;

app.use('/posts', activitiesRouter);

app.get('/', (req, res) => {
    res.status(200).send('<h1 style="text-align: center; margin-top: 50px;">IET-Node.js-Project API</h1>');
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});