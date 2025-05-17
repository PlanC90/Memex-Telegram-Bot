import express from 'express';
import { saveData } from '../services/dataService.js';
import path from 'path';
import fs from 'fs/promises'; // Use fs/promises for async file operations

const router = express.Router();

router.post('/save/:file', async (req, res) => {
  try {
    const fileName = req.params.file;
    const data = req.body;
    
    // Save to both public/data and /data directories
    const publicPath = path.join(process.cwd(), 'public', 'data', fileName);
    const dataPath = path.join(process.cwd(), 'data', fileName);
    
    await fs.writeFile(publicPath, JSON.stringify(data, null, 2));
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
    
    res.json({success: true});
  } catch (error) {
    console.error(`Error saving ${fileName}:`, error);
    res.status(500).json({error: error.message});
  }
});


export default router;
const express = require('express');
const router = express.Router();
const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');

// Other routes...

router.get('/download', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/download.html'));
});

router.get('/download-all-json', (req, res) => {
  try {
    const zip = new AdmZip();
    const jsonPath = path.join(__dirname, '../../public/data');
    
    fs.readdirSync(jsonPath).forEach(file => {
      if (file.endsWith('.json')) {
        zip.addLocalFile(path.join(jsonPath, file));
      }
    });

    const downloadName = `all_data_${Date.now()}.zip`;
    const data = zip.toBuffer();

    res.set('Content-Type', 'application/octet-stream');
    res.set('Content-Disposition', `attachment; filename=${downloadName}`);
    res.set('Content-Length', data.length);
    res.send(data);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).send('Error creating download');
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { saveData } = require('../services/dataService');

router.post('/api/users/save', async (req, res) => {
    try {
        const success = await saveData('users.json', req.body);
        if (success) {
            res.json({ success: true });
        } else {
            res.status(500).json({ error: 'Failed to save user data' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
