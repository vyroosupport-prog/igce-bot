require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs');

// ==================== CONFIG ====================
const CONFIG = {
    businessName: process.env.BUSINESS_NAME || 'IGCE LIMITED',
    autoReplyEnabled: process.env.AUTO_REPLY_ENABLED === 'true',
    businessHours: {
        start: process.env.BUSINESS_HOURS_START || '08:00',
        end: process.env.BUSINESS_HOURS_END || '21:00'
    },
    adminNumbers: process.env.ADMIN_NUMBERS ? process.env.ADMIN_NUMBERS.split(',') : []
};

// ==================== DATABASE ====================
const DB = {
    users: new Map(),
    orders: new Map(),
    tickets: new Map(),
    conversations: new Map(),
    customers: new Map(),
    enrollments: new Map(),
    renewals: new Map(),
    supportTickets: new Map()
};

// ==================== FIND CHROME ====================
function findChrome() {
    const possiblePaths = [
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
        '/opt/google/chrome/chrome'
    ];

    console.log('🔍 Looking for Chrome...');
    for (const p of possiblePaths) {
        try {
            if (fs.existsSync(p)) {
                console.log(`✅ Found Chrome at: ${p}`);
                return p;
            }
        } catch (e) {}
    }

    console.log('⚠️ Chrome not found. Trying default.');
    return null;
}

const chromePath = findChrome();

// ==================== WHATSAPP CLIENT ====================
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: path.join(__dirname, 'session')
    }),
    puppeteer: {
        headless: true,
        ...(chromePath && { executablePath: chromePath }),
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    }
});

// ==================== QR CODE ====================
client.on('qr', (qr) => {
    console.log('📱 SCAN THIS QR CODE WITH WHATSAPP:');
    qrcode.generate(qr, { small: true });
});

// ==================== READY ====================
client.on('ready', () => {
    console.log(`✅ ${CONFIG.businessName} Bot is ONLINE!`);
    console.log(`📊 Auto-Reply: ${CONFIG.autoReplyEnabled ? 'ON' : 'OFF'}`);
    console.log(`⏰ Hours: ${CONFIG.businessHours.start} - ${CONFIG.businessHours.end}`);
    console.log(`👥 Admins: ${CONFIG.adminNumbers.join(', ')}`);
});

// ==================== MESSAGE HANDLER ====================
client.on('message', async (message) => {
    if (message.fromMe) return;
    const sender = message.from;
    const senderName = message._data.notifyName || 'Unknown';
    const phoneNumber = sender.replace('@c.us', '');
    const messageBody = message.body?.trim() || '';

    console.log(`📩 Message from ${senderName}: ${messageBody.substring(0, 50)}`);

    await client.sendMessage(sender,
        `Hello ${senderName}! 👋 Welcome to ${CONFIG.businessName}.\n\nI'm your fiber WiFi bot. How can I help you today?`
    );
});

// ==================== START ====================
console.log(`🚀 Starting ${CONFIG.businessName} WhatsApp Bot...`);
console.log(`📱 Initializing...`);

client.initialize();