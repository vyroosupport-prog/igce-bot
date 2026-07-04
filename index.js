require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

// ==================== SIMPLE CHROME FIX ====================
// Force Puppeteer to use the system Chrome
process.env.PUPPETEER_EXECUTABLE_PATH = '/usr/bin/google-chrome';

// ==================== CONFIGURATION ====================
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
    // First, try to find system Chrome
    const possiblePaths = [
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium'
    ];
    
    for (const path of possiblePaths) {
        try {
            if (fs.existsSync(path)) {
                console.log(`✅ Found browser at: ${path}`);
                return path;
            }
        } catch (e) {}
    }
    
    // If no system Chrome, return null to let Puppeteer download Chromium
    console.log('⚠️ No browser found. Puppeteer will download Chromium.');
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
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    }
});

// ==================== EVENT LISTENERS ====================

// QR Code
client.on('qr', (qr) => {
    console.log('📱 SCAN THIS QR CODE WITH WHATSAPP:');
    qrcode.generate(qr, { small: true });
    console.log('📲 Or copy this URL:');
    console.log(qr);
});

// Ready
client.on('ready', () => {
    console.log(`✅ ${CONFIG.businessName} Bot is ONLINE!`);
    console.log(`📊 Bot Status: ${CONFIG.autoReplyEnabled ? 'Auto-Reply ON' : 'Auto-Reply OFF'}`);
    console.log(`⏰ Business Hours: ${CONFIG.businessHours.start} - ${CONFIG.businessHours.end}`);
    console.log(`👥 Admins: ${CONFIG.adminNumbers.join(', ')}`);
});

// Message Handler
client.on('message', async (message) => {
    try {
        if (message.fromMe) return;
        
        const sender = message.from;
        const senderName = message._data.notifyName || 'Unknown';
        const phoneNumber = sender.replace('@c.us', '');
        const messageBody = message.body?.trim() || '';
        
        console.log(`📩 Message from ${senderName} (${phoneNumber}): ${messageBody.substring(0, 50)}`);

        // Check business hours
        if (!isWithinBusinessHours()) {
            await sendOutOfHoursReply(sender, senderName);
            return;
        }

        // Initialize user
        initializeUser(phoneNumber, senderName);

        // Check for conversation session
        const session = DB.conversations.get(phoneNumber);
        if (session && session.state) {
            await handleConversationFlow(sender, phoneNumber, senderName, messageBody, session);
            return;
        }

        // Import keywords and process
        try {
            const KEYWORDS = require('./keywords.js');
            const lowerMsg = messageBody.toLowerCase();
            let matched = false;

            // Check for exact commands first
            if (lowerMsg.includes('enroll') || lowerMsg.includes('new') || lowerMsg.includes('sign up')) {
                await startEnrollment(sender, phoneNumber, senderName);
                return;
            }

            if (lowerMsg.includes('support') || lowerMsg.includes('issue') || lowerMsg.includes('problem') || lowerMsg.includes('not working') || lowerMsg.includes('down')) {
                await startSupport(sender, phoneNumber, senderName);
                return;
            }

            if (lowerMsg.includes('renew') || lowerMsg.includes('extend') || lowerMsg.includes('subscription')) {
                await startRenewal(sender, phoneNumber, senderName);
                return;
            }

            if (lowerMsg.includes('boss') || lowerMsg.includes('ceo') || lowerMsg.includes('manager') || lowerMsg.includes('owner')) {
                await connectToBoss(sender, phoneNumber, senderName);
                return;
            }

            if (lowerMsg.includes('status') || lowerMsg.includes('check') || lowerMsg.includes('track')) {
                await checkStatus(sender, phoneNumber);
                return;
            }

            if (lowerMsg.includes('complaint') || lowerMsg.includes('angry') || lowerMsg.includes('unhappy')) {
                await lodgeComplaint(sender, phoneNumber, senderName);
                return;
            }

            // Check all keyword categories
            for (const [category, data] of Object.entries(KEYWORDS)) {
                if (data.keywords.some(keyword => lowerMsg.includes(keyword))) {
                    const response = data.response(senderName);
                    await client.sendMessage(sender, response);
                    console.log(`📤 ${category} reply sent to ${senderName}`);
                    matched = true;
                    break;
                }
            }

            // If no keywords match, use default
            if (!matched) {
                const defaultResponse = KEYWORDS.default.response(senderName);
                await client.sendMessage(sender, defaultResponse);
                console.log(`📤 Default reply sent to ${senderName}`);
            }

        } catch (error) {
            console.error('Error importing keywords:', error);
            await client.sendMessage(sender, `🤖 *${CONFIG.businessName} Bot*\n\nI'm here to help! Type *Help* to see all options.`);
        }

    } catch (error) {
        console.error('Error processing message:', error);
        await client.sendMessage(sender, '⚠️ Sorry, I encountered an error. Please try again or contact support.');
    }
});

// ==================== BUSINESS FUNCTIONS ====================

function initializeUser(phoneNumber, name) {
    if (!DB.users.has(phoneNumber)) {
        DB.users.set(phoneNumber, {
            name: name || 'Unknown',
            firstSeen: new Date(),
            lastActive: new Date(),
            messages: 0,
            enrollments: [],
            supportTickets: [],
            renewals: []
        });
        console.log(`🆕 New customer: ${name} (${phoneNumber})`);
    } else {
        const user = DB.users.get(phoneNumber);
        user.lastActive = new Date();
        user.messages += 1;
        DB.users.set(phoneNumber, user);
    }
}

function isWithinBusinessHours() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;
    return currentTime >= CONFIG.businessHours.start && currentTime <= CONFIG.businessHours.end;
}

async function sendOutOfHoursReply(sender, name) {
    const reply = `🕐 *${CONFIG.businessName}*\n\nHello ${name}! 👋\n\nOur business hours are *${CONFIG.businessHours.start} - ${CONFIG.businessHours.end}*.\n\n📋 *You can still:*\n• Send your details for enrollment\n• Report issues (we'll respond in the morning)\n• Request a call back\n\nWe'll get back to you as soon as we open! 🌙`;
    await client.sendMessage(sender, reply);
}

// ==================== ENROLLMENT ====================
async function startEnrollment(sender, phoneNumber, name) {
    DB.conversations.set(phoneNumber, {
        state: 'ENROLLMENT',
        data: { step: 1, customer: { name: name, phone: phoneNumber } }
    });

    await client.sendMessage(sender,
        `📡 *New Fiber WiFi Enrollment - ${CONFIG.businessName}*\n\n` +
        `Thank you for choosing us! 🎉\n\n` +
        `📋 *Step 1 of 5: Full Name*\n\n` +
        `Please type your *Full Name*.`
    );

    // Notify admin
    await notifyAdmin(`📡 *New Enrollment Started*\n\nCustomer: ${name}\nPhone: ${phoneNumber}`);
}

// ==================== SUPPORT ====================
async function startSupport(sender, phoneNumber, name) {
    DB.conversations.set(phoneNumber, {
        state: 'SUPPORT',
        data: { step: 1, customer: { name: name, phone: phoneNumber } }
    });

    await client.sendMessage(sender,
        `🔧 *Support - ${CONFIG.businessName}*\n\n` +
        `Sorry to hear you're having issues. 😔\n\n` +
        `📋 *Step 1 of 3: Describe the problem*\n\n` +
        `Please describe what's happening with your service.\n\n` +
        `💡 *Example:*\n` +
        `• No internet connection\n` +
        `• Slow speed\n` +
        `• Intermittent connection\n` +
        `• Router issues`
    );

    await notifyAdmin(`🔧 *New Support Ticket*\n\nCustomer: ${name}\nPhone: ${phoneNumber}`);
}

// ==================== RENEWAL ====================
async function startRenewal(sender, phoneNumber, name) {
    DB.conversations.set(phoneNumber, {
        state: 'RENEWAL',
        data: { step: 1, customer: { name: name, phone: phoneNumber } }
    });

    await client.sendMessage(sender,
        `🔄 *Renewal - ${CONFIG.businessName}*\n\n` +
        `Thank you for staying with us! 🙏\n\n` +
        `📋 *Step 1 of 3: Customer ID or Phone Number*\n\n` +
        `Please provide your *Customer ID* or *Registered Phone Number*.`
    );

    await notifyAdmin(`🔄 *New Renewal Request*\n\nCustomer: ${name}\nPhone: ${phoneNumber}`);
}

// ==================== CONNECT TO BOSS ====================
async function connectToBoss(sender, phoneNumber, name) {
    DB.conversations.set(phoneNumber, {
        state: 'BOSS',
        data: { customer: { name: name, phone: phoneNumber } }
    });

    await client.sendMessage(sender,
        `👤 *Connect to Boss - ${CONFIG.businessName}*\n\n` +
        `We understand you want to speak with the CEO directly. 👔\n\n` +
        `📋 *Please provide:*\n\n` +
        `1️⃣ *Your Full Name:*\n` +
        `2️⃣ *Phone Number:*\n` +
        `3️⃣ *Reason for contacting the boss:*\n\n` +
        `⏰ *Response Time:* Within 1 hour\n\n` +
        `Your message will be escalated immediately. 🚀`
    );

    await notifyAdmin(`👤 *Boss Request*\n\nCustomer: ${name}\nPhone: ${phoneNumber}`);
}

// ==================== CHECK STATUS ====================
async function checkStatus(sender, phoneNumber) {
    await client.sendMessage(sender,
        `📊 *Check Service Status - ${CONFIG.businessName}*\n\n` +
        `To check your service status, please provide:\n\n` +
        `1️⃣ *Your Customer ID:*\n` +
        `2️⃣ *Or your registered phone number:*\n\n` +
        `We'll check and get back to you immediately! 🔍`
    );
}

// ==================== COMPLAINT ====================
async function lodgeComplaint(sender, phoneNumber, name) {
    DB.conversations.set(phoneNumber, {
        state: 'COMPLAINT',
        data: { customer: { name: name, phone: phoneNumber } }
    });

    await client.sendMessage(sender,
        `📝 *Complaint - ${CONFIG.businessName}*\n\n` +
        `We're sorry you've had a bad experience. 😔\n\n` +
        `📋 *Please provide:*\n\n` +
        `1️⃣ *Your Customer ID:*\n` +
        `2️⃣ *Description of the complaint:*\n` +
        `3️⃣ *What solution do you want?*\n\n` +
        `Your complaint will be escalated to the boss immediately! 👤`
    );

    await notifyAdmin(`📝 *New Complaint*\n\nCustomer: ${name}\nPhone: ${phoneNumber}`);
}

// ==================== NOTIFY ADMIN ====================
async function notifyAdmin(message) {
    for (const admin of CONFIG.adminNumbers) {
        try {
            await client.sendMessage(`${admin}@c.us`, message);
        } catch (error) {
            console.error(`Failed to notify admin ${admin}:`, error);
        }
    }
}

// ==================== CONVERSATION FLOW ====================
async function handleConversationFlow(sender, phoneNumber, name, messageBody, session) {
    const lowerMsg = messageBody.toLowerCase();
    const state = session.state;
    const data = session.data;

    if (lowerMsg === 'cancel') {
        DB.conversations.delete(phoneNumber);
        await client.sendMessage(sender, `❌ Cancelled. You can start again anytime!`);
        return;
    }

    switch (state) {
        case 'ENROLLMENT':
            await handleEnrollmentFlow(sender, phoneNumber, name, messageBody, data);
            break;
        case 'SUPPORT':
            await handleSupportFlow(sender, phoneNumber, name, messageBody, data);
            break;
        case 'RENEWAL':
            await handleRenewalFlow(sender, phoneNumber, name, messageBody, data);
            break;
        case 'BOSS':
            await handleBossFlow(sender, phoneNumber, name, messageBody, data);
            break;
        case 'COMPLAINT':
            await handleComplaintFlow(sender, phoneNumber, name, messageBody, data);
            break;
        default:
            DB.conversations.delete(phoneNumber);
            await client.sendMessage(sender, `Please type *Help* to see options.`);
    }
}

// ==================== ENROLLMENT FLOW ====================
async function handleEnrollmentFlow(sender, phoneNumber, name, messageBody, data) {
    const step = data.step || 1;

    switch (step) {
        case 1: // Full Name
            data.customer.fullName = messageBody;
            data.step = 2;
            DB.conversations.set(phoneNumber, { state: 'ENROLLMENT', data: data });
            await client.sendMessage(sender,
                `📋 *Step 2 of 5: Address/Location*\n\n` +
                `Please type your *Full Address* or *Location*.`
            );
            break;

        case 2: // Address
            data.customer.address = messageBody;
            data.step = 3;
            DB.conversations.set(phoneNumber, { state: 'ENROLLMENT', data: data });
            await client.sendMessage(sender,
                `📋 *Step 3 of 5: Choose Your Plan*\n\n` +
                `💰 *Plans:*\n` +
                `• Basic - ₦[Price] - [Speed] Mbps\n` +
                `• Standard - ₦[Price] - [Speed] Mbps\n` +
                `• Premium - ₦[Price] - [Speed] Mbps\n\n` +
                `Type the plan you want: *Basic*, *Standard*, or *Premium*.`
            );
            break;

        case 3: // Plan
            data.customer.plan = messageBody;
            data.step = 4;
            DB.conversations.set(phoneNumber, { state: 'ENROLLMENT', data: data });
            await client.sendMessage(sender,
                `📋 *Step 4 of 5: Preferred Installation Date*\n\n` +
                `Please type your preferred installation date.\n\n` +
                `💡 *Example:* "Monday 15th" or "Next week" or "Any day"`
            );
            break;

        case 4: // Installation Date
            data.customer.installDate = messageBody;
            data.step = 5;
            DB.conversations.set(phoneNumber, { state: 'ENROLLMENT', data: data });
            await client.sendMessage(sender,
                `📋 *Step 5 of 5: Additional Notes*\n\n` +
                `Any special requests or additional information?\n\n` +
                `Type *None* if no extra info.`
            );
            break;

        case 5: // Done
            data.customer.notes = messageBody;
            const enrollmentId = `ENR-${Date.now().toString().slice(-6)}`;
            DB.enrollments.set(enrollmentId, data.customer);

            // Notify admin
            await notifyAdmin(
                `📡 *NEW ENROLLMENT #${enrollmentId}*\n\n` +
                `Name: ${data.customer.fullName}\n` +
                `Phone: ${data.customer.phone}\n` +
                `Address: ${data.customer.address}\n` +
                `Plan: ${data.customer.plan}\n` +
                `Install Date: ${data.customer.installDate}\n` +
                `Notes: ${data.customer.notes}`
            );

            await client.sendMessage(sender,
                `✅ *Enrollment Submitted!* 🎉\n\n` +
                `📋 *Enrollment #${enrollmentId}*\n\n` +
                `Name: ${data.customer.fullName}\n` +
                `Plan: ${data.customer.plan}\n` +
                `Install Date: ${data.customer.installDate}\n\n` +
                `📞 We'll contact you within 24 hours to confirm your installation!\n\n` +
                `Thank you for choosing ${CONFIG.businessName}! 🌐`
            );

            DB.conversations.delete(phoneNumber);
            break;
    }
}

// ==================== SUPPORT FLOW ====================
async function handleSupportFlow(sender, phoneNumber, name, messageBody, data) {
    const step = data.step || 1;

    switch (step) {
        case 1: // Problem description
            data.problem = messageBody;
            data.step = 2;
            DB.conversations.set(phoneNumber, { state: 'SUPPORT', data: data });
            await client.sendMessage(sender,
                `📋 *Step 2 of 3: Customer ID or Phone Number*\n\n` +
                `Please provide your *Customer ID* or *Registered Phone Number*.`
            );
            break;

        case 2: // Customer ID
            data.customerId = messageBody;
            data.step = 3;
            DB.conversations.set(phoneNumber, { state: 'SUPPORT', data: data });
            await client.sendMessage(sender,
                `📋 *Step 3 of 3: When did the problem start?*\n\n` +
                `Please tell us when this issue began.\n\n` +
                `💡 *Example:* "Today", "Yesterday", "Last week", etc.`
            );
            break;

        case 3: // Done
            data.timeStarted = messageBody;
            const ticketId = `TKT-${Date.now().toString().slice(-6)}`;
            DB.supportTickets.set(ticketId, data);

            await notifyAdmin(
                `🔧 *SUPPORT TICKET #${ticketId}*\n\n` +
                `Customer: ${name}\n` +
                `Phone: ${phoneNumber}\n` +
                `Customer ID: ${data.customerId}\n` +
                `Problem: ${data.problem}\n` +
                `Started: ${data.timeStarted}`
            );

            await client.sendMessage(sender,
                `✅ *Support Ticket Submitted!* 🔧\n\n` +
                `📋 *Ticket #${ticketId}*\n\n` +
                `We've received your issue and will respond within:\n` +
                `⏰ *30 minutes* during business hours\n\n` +
                `💡 *Quick Tip:* Try restarting your router if you haven't already.\n\n` +
                `We'll get back to you shortly! 🙏`
            );

            DB.conversations.delete(phoneNumber);
            break;
    }
}

// ==================== RENEWAL FLOW ====================
async function handleRenewalFlow(sender, phoneNumber, name, messageBody, data) {
    const step = data.step || 1;

    switch (step) {
        case 1: // Customer ID
            data.customerId = messageBody;
            data.step = 2;
            DB.conversations.set(phoneNumber, { state: 'RENEWAL', data: data });
            await client.sendMessage(sender,
                `📋 *Step 2 of 3: Which plan do you want to renew?*\n\n` +
                `💰 *Plans:*\n` +
                `• Basic - ₦[Price] - [Speed] Mbps\n` +
                `• Standard - ₦[Price] - [Speed] Mbps\n` +
                `• Premium - ₦[Price] - [Speed] Mbps\n\n` +
                `Type the plan you want to renew: *Basic*, *Standard*, or *Premium*.`
            );
            break;

        case 2: // Plan
            data.plan = messageBody;
            data.step = 3;
            DB.conversations.set(phoneNumber, { state: 'RENEWAL', data: data });
            await client.sendMessage(sender,
                `📋 *Step 3 of 3: Payment Method*\n\n` +
                `How would you like to pay?\n\n` +
                `💳 *Options:*\n` +
                `• Bank Transfer\n` +
                `• Paystack (Card)\n` +
                `• Cash on Delivery\n\n` +
                `Type your preferred payment method.`
            );
            break;

        case 3: // Done
            data.paymentMethod = messageBody;
            const renewalId = `RNL-${Date.now().toString().slice(-6)}`;
            DB.renewals.set(renewalId, data);

            await notifyAdmin(
                `🔄 *RENEWAL #${renewalId}*\n\n` +
                `Customer: ${name}\n` +
                `Phone: ${phoneNumber}\n` +
                `Customer ID: ${data.customerId}\n` +
                `Plan: ${data.plan}\n` +
                `Payment: ${data.paymentMethod}`
            );

            await client.sendMessage(sender,
                `✅ *Renewal Request Submitted!* 🎉\n\n` +
                `📋 *Renewal #${renewalId}*\n\n` +
                `Plan: ${data.plan}\n` +
                `Payment Method: ${data.paymentMethod}\n\n` +
                `💳 We'll send you payment details shortly.\n\n` +
                `Thank you for staying with ${CONFIG.businessName}! 🌐`
            );

            DB.conversations.delete(phoneNumber);
            break;
    }
}

// ==================== BOSS FLOW ====================
async function handleBossFlow(sender, phoneNumber, name, messageBody, data) {
    await notifyAdmin(
        `👤 *BOSS REQUEST*\n\n` +
        `Customer: ${name}\n` +
        `Phone: ${phoneNumber}\n` +
        `Message: ${messageBody}\n\n` +
        `Please respond to this customer ASAP!`
    );

    await client.sendMessage(sender,
        `✅ *Message Sent to Boss!* 👤\n\n` +
        `The CEO has been notified and will get back to you within:\n` +
        `⏰ *1 hour* during business hours\n\n` +
        `Thank you for your patience! 🙏`
    );

    DB.conversations.delete(phoneNumber);
}

// ==================== COMPLAINT FLOW ====================
async function handleComplaintFlow(sender, phoneNumber, name, messageBody, data) {
    await notifyAdmin(
        `📝 *COMPLAINT*\n\n` +
        `Customer: ${name}\n` +
        `Phone: ${phoneNumber}\n` +
        `Complaint: ${messageBody}\n\n` +
        `This complaint has been escalated to the boss!`
    );

    await client.sendMessage(sender,
        `✅ *Complaint Submitted!* 📝\n\n` +
        `We take your complaint seriously.\n\n` +
        `🎯 *What happens next:*\n` +
        `1️⃣ Boss will review your complaint\n` +
        `2️⃣ You'll receive a response within 2 hours\n` +
        `3️⃣ We'll work to resolve the issue\n\n` +
        `We appreciate your patience and feedback! 💪`
    );

    DB.conversations.delete(phoneNumber);
}

// ==================== DISCONNECT HANDLER ====================
client.on('disconnected', (reason) => {
    console.log('❌ Client disconnected:', reason);
    console.log('🔄 Attempting to reconnect in 5 seconds...');
    setTimeout(() => {
        client.initialize();
    }, 5000);
});

// ==================== UNHANDLED REJECTIONS ====================
process.on('unhandledRejection', (error) => {
    if (error.message && error.message.includes('Execution context was destroyed')) {
        console.log('🔄 Execution context destroyed - reconnecting...');
        setTimeout(() => {
            client.initialize();
        }, 5000);
    } else {
        console.error('Unhandled rejection:', error);
    }
});

// ==================== START THE BOT ====================
console.log(`🚀 Starting ${CONFIG.businessName} WhatsApp Bot...`);
console.log(`📱 Initializing...`);

client.initialize();