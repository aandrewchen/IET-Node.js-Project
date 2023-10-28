import express from 'express';

const app = express();

const PORT = 8080;

app.get('/', (req, res) => {
    res.status(200).send('Hello, World!');
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
