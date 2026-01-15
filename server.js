const express = require('express');
const fs = require('fs');
const path = require('path');
const util = require('minecraft-server-util');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'servers.json');

// إعدادات لقراءة البيانات القادمة من البوت
app.use(express.json());

// --- السطر السحري الذي يحل مشكلة Cannot GET / ---
// يخبر السيرفر بأن كل ملفات الواجهة موجودة داخل مجلد public
app.use(express.static(path.join(__dirname, 'public')));

// API: استقبال البيانات من بوت البايثون
app.post('/api/add', (req, res) => {
    try {
        let servers = [];
        if (fs.existsSync(DATA_FILE)) {
            servers = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        }
        
        // إضافة السيرفر الجديد للقائمة
        const newServer = {
            name: req.body.name,
            ip: req.body.ip,
            discord: req.body.discord
        };
        
        servers.push(newServer);
        fs.writeFileSync(DATA_FILE, JSON.stringify(servers, null, 2));
        
        console.log("تم إضافة سيرفر جديد:", newServer.name);
        res.status(200).json({ message: "Success" });
    } catch (error) {
        console.error("خطأ في إضافة السيرفر:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// API: جلب القائمة لعرضها في الموقع
app.get('/api/servers', async (req, res) => {
    try {
        if (!fs.existsSync(DATA_FILE)) return res.json([]);
        
        const servers = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        
        const results = await Promise.all(servers.map(async (s) => {
            try {
                // فحص حالة السيرفر (أونلاين أو أوفلاين)
                const status = await util.status(s.ip);
                return { 
                    ...s, 
                    online: true, 
                    players: status.players.online, 
                    max: status.players.max 
                };
            } catch {
                return { ...s, online: false, players: 0, max: 0 };
            }
        }));
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: "Error fetching servers" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
