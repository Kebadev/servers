const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
const express = require('express');
const loki = require('lokijs');
const util = require('minecraft-server-util');

// 1. إعداد قاعدة البيانات
const db = new loki('servers.db', { autoload: true, autosave: true });
let servers = db.getCollection('servers') || db.addCollection('servers');

// 2. إعداد البوت
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const TOKEN = 'MTQzNDE2NjQ2NzA0OTI5NTg3Mg.GsFH2V.WdSQ5xpz_JQN9JPDgXlCRx14N_9GRpS0977YYM';
const CLIENT_ID = '1434166467049295872';

// 3. أمر السلاش لإضافة سيرفر
const commands = [
    new SlashCommandBuilder()
        .setName('addserver')
        .setDescription('إضافة سيرفر جديد للموقع')
        .addStringOption(opt => opt.setName('ip').setDescription('آي بي السيرفر').setRequired(true))
        .addStringOption(opt => opt.setName('discord').setDescription('رابط الديسكورد').setRequired(true))
        .addStringOption(opt => opt.setName('name').setDescription('اسم السيرفر').setRequired(true))
].map(command => command.toJSON());

// تسجيل الأوامر
const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('تم تسجيل أوامر السلاش!');
    } catch (e) { console.error(e); }
})();

// تفاعل البوت مع الأمر
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'addserver') {
        const ip = interaction.options.getString('ip');
        const discord = interaction.options.getString('discord');
        const name = interaction.options.getString('name');

        servers.insert({ name, ip, discord, votes: 0 });
        await interaction.reply(`✅ تم إضافة سيرفر **${name}** للموقع بنجاح!`);
    }
});

client.login(TOKEN);

// 4. إعداد الموقع (Express)
const app = express();
app.use(express.static('public'));

app.get('/api/servers', async (req, res) => {
    const allServers = servers.find();
    // جلب حالة اللاعبين لكل سيرفر بشكل سريع
    const updatedServers = await Promise.all(allServers.map(async (s) => {
        try {
            const status = await util.status(s.ip);
            return { ...s, online: true, players: status.players.online };
        } catch {
            return { ...s, online: false, players: 0 };
        }
    }));
    res.json(updatedServers);
});

app.listen(3000, () => console.log('الموقع والبوت شغالين على منفذ 3000'));
