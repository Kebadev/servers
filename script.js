async function fetchServers() {
    try {
        const response = await fetch('/api/servers');
        const servers = await response.json();
        const listElement = document.getElementById('server-list');
        
        if (servers.length === 0) {
            listElement.innerHTML = "<p>لا يوجد سيرفرات مضافة حالياً.</p>";
            return;
        }

        listElement.innerHTML = servers.map(s => `
            <div class="server-card">
                <div class="status-indicator ${s.online ? 'online' : 'offline'}"></div>
                <h2>${s.name}</h2>
                <div class="ip-badge" onclick="copyIP('${s.ip}')">
                    ${s.ip} <br> <small>(اضغط للنسخ)</small>
                </div>
                <p>اللاعبين: <strong>${s.players || 0}</strong></p>
                <a href="${s.discord}" target="_blank" class="discord-btn">انضم للديسكورد</a>
            </div>
        `).join('');
    } catch (err) {
        console.error("خطأ في جلب البيانات");
    }
}

function copyIP(ip) {
    navigator.clipboard.writeText(ip);
    alert("تم نسخ الآي بي: " + ip);
}

// تحديث الصفحة كل 30 ثانية تلقائياً
fetchServers();
setInterval(fetchServers, 30000);
