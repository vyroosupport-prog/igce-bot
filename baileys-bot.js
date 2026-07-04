const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const QRCode = require('qrcode-terminal');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    
    const sock = makeWASocket({
        auth: state
    });

    // Handle QR code manually
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('📱 SCAN THIS QR CODE WITH WHATSAPP:');
            QRCode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== 401;
            console.log('Connection closed, reconnecting...');
            if (shouldReconnect) {
                startBot();
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