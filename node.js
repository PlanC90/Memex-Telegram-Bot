const fs = require('fs');
const express = require('express');
const app = express();

app.use(express.json());

app.post('/log-error', (req, res) => {
    const { message, details, timestamp } = req.body;
    const logEntry = `[${timestamp}] ${message}\nDetails: ${JSON.stringify(details)}\n\n`;

    fs.appendFile('public/error.txt', logEntry, (err) => {
        if (err) {
            console.error('Error writing to error.txt:', err);
            return res.status(500).send('Failed to log error.');
        }
        res.send({ success: true });
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
