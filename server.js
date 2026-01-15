const express = require('express');
const fs = require('fs');
const path = require('path');
const util = require('minecraft-server-util');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'servers.json');

app.use(express.json());

// --- التعديل هنا ---
// بدلاً من البحث في public، سيقرأ الملفات من المجلد الرئيسي مباشرة
app.use(express.static(__dirname));

// صفحة البداية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API الإضافة
app.post('/api/add', (req, res) => {
    let servers = [];
    if (fs.existsSync(DATA_FILE)) {
        servers = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
    servers.push(req.body);
    fs.writeFileSync(DATA_FILE, JSON.stringify(servers, null, 2));
    res.status(200).json({ message: "Done" });
});

// API جلب البيانات
app.get('/api/servers', async (req, res) => {
    if (!fs.existsSync(DATA_FILE)) return res.json([]);
    const servers = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    const results = await Promise.all(servers.map(async (s) => {
        try {
            const status = await util.status(s.ip);
            return { ...s, online: true, players: status.players.online, max: status.players.max };
        } catch {
            return { ...s, online: false, players: 0, max: 0 };
        }
    }));
    res.json(results);
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
