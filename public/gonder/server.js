const express = require('express');
const path = require('path');
const app = express();

// JSON dosyalarına erişim sağlamak için public/gonder yolunu statik hale getirelim
app.use('/public/gonder', express.static(path.join(__dirname, 'public/gonder')));

// JSON dosyaları için public/data yolunu da statik hale getirelim
app.use('/public/data', express.static(path.join(__dirname, 'public/data')));

// Sunucu başlatma
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
