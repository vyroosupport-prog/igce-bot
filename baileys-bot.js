const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const QRCode = require('qrcode-terminal');
const express = require('express');

// ==================== KEEP-ALIVE SERVER ====================
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('IGCE Bot is running!');
});

app.listen(port, () => {
    console.log(`✅ Keep-alive server running on port ${port}`);
});

// ==================== WHATSAPP BOT ====================
async function startBot() {
    console.log('🚀 Starting bot...');
    
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    });

    sock.ev.on('connection.update', (update) => {
        console.log('📡 Connection update:', Object.keys(update));
        
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('📱 SCAN THIS QR CODE WITH WHATSAPP:');
            QRCode.generate(qr, { small: true });
            console.log('📲 Or copy this URL to scan:');
            console.log(qr);
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== 401;
            console.log('Connection closed, reconnecting...');
            if (shouldReconnect) {
                setTimeout(startBot, 5000);
            }
        } else if (connection === 'open') {
            console.log('✅ IGCE LIMITED Bot is ONLINE!');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.key.fromMe && msg.message) {
            const sender = msg.key.remoteJid;
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
            console.log(`📩 Message from ${sender}: ${text}`);

            let reply = `Hello! 👋 Welcome to IGCE LIMITED.\n\nReply with:\n📡 Enroll\n🔧 Support\n🔄 Renew`;

            if (text.toLowerCase().includes('enroll')) {
                reply = `📡 Enrollment\nPlease send your Full Name, Address, and Phone Number.`;
            } else if (text.toLowerCase().includes('support')) {
                reply = `🔧 Support\nPlease describe your issue.`;
            } else if (text.toLowerCase().includes('renew')) {
                reply = `🔄 Renewal\nPlease send your Customer ID.`;
            }

            await sock.sendMessage(sender, { text: reply });
        }
    });
}

startBot();