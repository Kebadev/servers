const express = require('express');
const fs = require('fs');
const util = require('minecraft-server-util');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const DATA_FILE = './servers.json';

// وظيفة لحفظ البيانات في ملف
app.post('/api/add', (req, res) => {
    let servers = [];
    if (fs.existsSync(DATA_FILE)) {
        servers = JSON.parse(fs.readFileSync(DATA_FILE));
    }
    servers.push(req.body); // إضافة السيرفر الجديد من البوت
    fs.writeFileSync(DATA_FILE, JSON.stringify(servers, null, 2));
    res.status(200).send("Done");
});

// وظيفة لعرض السيرفرات في الصفحة
app.get('/api/servers', async (req, res) => {
    if (!fs.existsSync(DATA_FILE)) return res.json([]);
    
    let servers = JSON.parse(fs.readFileSync(DATA_FILE));
    
    const results = await Promise.all(servers.map(async (s) => {
        try {
            const status = await util.status(s.ip);
            return { ...s, online: true, players: status.players.online };
        } catch {
            return { ...s, online: false, players: 0 };
        }
    }));
    res.json(results);
});

app.listen(3000, () => console.log('الموقع شغال بدون قاعدة بيانات خارجية!'));
