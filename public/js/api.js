const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const app = express();
app.use(express.json());

// Kullanıcı verileri JSON dosyasının yolu
const DATA_FILE = path.join(__dirname, "../data/users.json");

// Kullanıcı verilerini yükleme fonksiyonu
async function loadUsers() {
    try {
        const data = await fs.readFile(DATA_FILE, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Kullanıcıları yükleme hatası:", error);
        return [];
    }
}

// Kullanıcı verilerini kaydetme fonksiyonu
async function saveUsers(users) {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2), "utf-8");
    } catch (error) {
        console.error("Kullanıcıları kaydetme hatası:", error);
    }
}

// API: Referans kaydı yap
app.post("/api/referral", async (req, res) => {
    const { referrer, referred } = req.body;

    if (!referrer || !referred || referrer === referred) {
        return res.status(400).json({ success: false, message: "Geçersiz referans bilgisi" });
    }

    try {
        const users = await loadUsers();
        let referrerUser = users.find(user => user.username === referrer);
        let referredUser = users.find(user => user.username === referred);

        // Referans veren kullanıcı yoksa hata döndür
        if (!referrerUser) {
            return res.status(404).json({ success: false, message: "Referans veren kullanıcı bulunamadı" });
        }

        // Referans alan kullanıcıyı oluştur veya zaten varsa geç
        if (!referredUser) {
            referredUser = {
                username: referred,
                balance: 500000, // Varsayılan bakiye
                tasks_completed: [],
                referral_earnings: 0,
                total_referrals: 0,
                last_login: new Date().toISOString()
            };
            users.push(referredUser);
        }

        // Referans kazançlarını ve toplam referansları güncelle
        referrerUser.total_referrals += 1;
        referrerUser.referral_earnings += 1000; // Referans ödülü

        // Güncellenmiş kullanıcıları kaydet
        await saveUsers(users);

        res.json({ success: true, message: "Referans kaydedildi" });
    } catch (error) {
        console.error("Referans API hatası:", error);
        res.status(500).json({ success: false, message: "Sunucu hatası" });
    }
});

// API: Kullanıcı referans istatistiklerini yükle
app.get("/api/referral/stats/:username", async (req, res) => {
    const username = req.params.username;

    try {
        const users = await loadUsers();
        const user = users.find(u => u.username === username);

        if (!user) {
            return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" });
        }

        res.json({
            totalReferrals: user.total_referrals || 0,
            totalEarnings: user.referral_earnings || 0
        });
    } catch (error) {
        console.error("Referans istatistik API hatası:", error);
        res.status(500).json({ success: false, message: "Sunucu hatası" });
    }
});

// Sunucuyu başlat (Glitch otomatik bir port seçer)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API çalışıyor: http://localhost:${PORT}`);
});
