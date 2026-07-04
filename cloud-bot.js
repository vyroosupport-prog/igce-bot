require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());

// Your credentials from Meta Developer Portal
const { phoneNumberId, accessToken, verifyToken } = {
    phoneNumberId: process.env.PHONE_NUMBER_ID,
    accessToken: process.env.ACCESS_TOKEN,
    verifyToken: process.env.VERIFY_TOKEN || 'IGCE123'
};

// Webhook verification
app.get('/webhook', (req, res) => {
    if (req.query['hub.verify_token'] === verifyToken) {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Error: Invalid token');
    }
});

// Webhook handler
app.post('/webhook', async (req, res) => {
    try {
        const { body } = req;
        if (body.object === 'whatsapp_business_account') {
            const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
            if (message) {
                const from = message.from;
                const text = message.text?.body || '';
                console.log(`📩 Message from ${from}: ${text}`);

                // Simple auto-reply logic
                let reply = `Hello! 👋 Welcome to IGCE LIMITED. How can we help?\n\nReply with:\n📡 Enroll - Sign up for fiber WiFi\n🔧 Support - Report an issue\n🔄 Renew - Renew your subscription`;

                if (text.toLowerCase().includes('enroll')) {
                    reply = `📡 *Enrollment*\nPlease send your:\n1. Full Name\n2. Address\n3. Phone Number\n\nWe'll get back to you within 24 hours.`;
                } else if (text.toLowerCase().includes('support')) {
                    reply = `🔧 *Support*\nPlease describe your issue and we'll get back to you.`;
                } else if (text.toLowerCase().includes('renew')) {
                    reply = `🔄 *Renewal*\nPlease send your Customer ID and we'll process your renewal.`;
                }

                // Send reply via WhatsApp Cloud API
                await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        messaging_product: 'whatsapp',
                        to: from,
                        text: { body: reply }
                    })
                });
            }
        }
        res.sendStatus(200);
    } catch (error) {
        console.error('Error:', error);
        res.sendStatus(500);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ IGCE LIMITED WhatsApp Bot running on port ${PORT}`));