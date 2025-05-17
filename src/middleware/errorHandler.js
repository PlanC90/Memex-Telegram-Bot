import fs from 'fs';
import path from 'path';

export const errorHandler = (err, req, res, next) => {
    const errorLog = {
        timestamp: new Date().toISOString(),
        error: err.message,
        stack: err.stack,
        path: req.path
    };

    console.error('Error:', errorLog);

    // Hata logunu kaydet
    fs.appendFileSync(
        path.join(process.cwd(), 'logs', 'error.log'),
        JSON.stringify(errorLog) + '\n'
    );

    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message 
    });
};
