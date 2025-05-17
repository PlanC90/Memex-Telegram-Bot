require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const { Telegraf } = require("telegraf");

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN || '');

// Add error handling for bot token
if (!process.env.BOT_TOKEN) {
    console.error('BOT_TOKEN is not set in environment variables');
    process.exit(1);
}

const PORT = process.env.PORT || 3000;

// Middleware: Statik dosyalar ve JSON verisi
app.use(express.static("public"));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

// -----------------------------------------
// API Rotaları
// -----------------------------------------

// JSON dosyasını kaydetmek için POST API'si
app.post("/save/:fileName", (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, "public", "data", fileName);

    try {
        // Gelen veriyi belirtilen dosyaya kaydet
        fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
        res.status(200).send("Data saved.");
    } catch (error) {
        console.error("Error saving data:", error);
        res.status(500).send("An error occurred while saving data.");
    }
});

// Kullanıcı bilgilerini alma API'si
app.get("/api/user/:username/:id", async (req, res) => {
    const { username, id } = req.params;

    try {
        const user = await bot.telegram.getChat(id); // Telegram kullanıcı bilgisi al
        res.json({
            username: user.username || user.first_name || "Guest",
            photo_url: user.photo?.big_file_id
                ? `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${user.photo.big_file_id}`
                : null,
            id,
        });
    } catch (error) {
        console.error("Error fetching user data:", error);

// İndirme rotası
app.get('/download', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'download.html'));
});

app.get('/download-all-json', (req, res) => {
    try {
        const AdmZip = require('adm-zip');
        const zip = new AdmZip();
        const dataPath = path.join(__dirname, 'public', 'data');
        
        fs.readdirSync(dataPath).forEach(file => {
            if (file.endsWith('.json')) {
                zip.addLocalFile(path.join(dataPath, file));
            }
        });

        const downloadName = `tum_veriler_${Date.now()}.zip`;
        const data = zip.toBuffer();

        res.set('Content-Type', 'application/octet-stream');
        res.set('Content-Disposition', `attachment; filename=${downloadName}`);
        res.set('Content-Length', data.length);
        res.send(data);

    } catch (error) {
        console.error('İndirme hatası:', error);
        res.status(500).send('Dosya indirme sırasında hata oluştu');
    }
});

        res.status(404).json({ error: "User not found." });
    }
});

// Kullanıcı bilgilerini sorgulama (query params)
app.get("/user-info", async (req, res) => {
    const { username, id } = req.query;

    if (!username || !id) {
        return res.status(400).json({ error: "Username and ID are required." });
    }

    try {
        const user = await bot.telegram.getChat(id);
        res.json({
            username: user.username || user.first_name || "Guest",
            id: user.id,
            photo_url: user.photo?.big_file_id
                ? `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${user.photo.big_file_id}`
                : null,
        });
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(404).json({ error: "User not found." });
    }
});

// -----------------------------------------
// Telegram Bot Ayarları
// -----------------------------------------

// Botun başlangıç mesajı
bot.start(async (ctx) => {
    const username = ctx.from.username || ctx.from.first_name || "guest";
    const userId = ctx.from.id;
    const gameUrl = `https://t.me/mmx_memex_bot/mmx_memex?username=${username}&id=${userId}`;

    try {
        await ctx.replyWithPhoto("https://cdn.glitch.global/41b9d177-2df3-49bd-8ecc-057b6d9aa045/1.jpg", {
            caption: `Welcome to MEMEX Airdrop, @${username}! 🎮\n\n` +
                `🌟 **Join the airdrop and earn your first rewards!**\n` +
                `✅ **Complete simple tasks and withdraw your earnings directly to your wallet!**\n` +
                `🚀 Powered by **Electra Protocol**, ensuring the lowest fees, fastest transactions, and ultimate security!`,
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [[{ text: "🟩 Claim Your Airdrop", url: gameUrl }]]
            },
        });
    } catch (error) {
        console.error("Error sending bot message:", error);
    }
});

// -----------------------------------------
// Sunucu Başlatma
// -----------------------------------------

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Botu başlat
bot.launch();

// Sunucu durdurulurken botu düzgün kapat
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
