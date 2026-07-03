// ============================================
// IGCE LIMITED - Fiber WiFi Business Bot
// Pidgin + English Mix
// ============================================

module.exports = {

    // ==================== GREETINGS ====================
    greetings: {
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'good afternoon', 'how far', 'how you dey', 'morning', 'evening', 'afternoon'],
        response: (userName) => {
            return `👋 *Hello ${userName}!* Welcome to *IGCE LIMITED* 🌐\n\n` +
                   `We provide reliable *Fiber WiFi Services* for homes and businesses.\n\n` +
                   `💬 *How can we help you today?*\n\n` +
                   `📡 *New Enrollment* - Sign up for fiber WiFi\n` +
                   `🔧 *Support* - Report issues with your service\n` +
                   `🔄 *Renewal* - Renew your subscription\n` +
                   `👤 *Boss* - Speak directly with the CEO\n\n` +
                   `Type *Help* to see all options! 🚀`;
        }
    },

    // ==================== NEW ENROLLMENT ====================
    enrollment: {
        keywords: ['enroll', 'enrollment', 'sign up', 'new', 'register', 'subscribe', 'start', 'fiber', 'wifi', 'internet', 'connect', 'installation'],
        response: (userName) => {
            return `📡 *New Fiber WiFi Enrollment - IGCE LIMITED*\n\n` +
                   `Thank you for choosing IGCE LIMITED! 🎉\n\n` +
                   `📋 *To enroll, please provide these details:*\n\n` +
                   `1️⃣ *Full Name:*\n` +
                   `2️⃣ *Phone Number:*\n` +
                   `3️⃣ *Address/Location:*\n` +
                   `4️⃣ *Plan Type:* (Basic/Standard/Premium)\n` +
                   `5️⃣ *Preferred Installation Date:*\n\n` +
                   `💡 *Plans:*\n` +
                   `• Basic: ₦[Price] - [Speed] Mbps\n` +
                   `• Standard: ₦[Price] - [Speed] Mbps\n` +
                   `• Premium: ₦[Price] - [Speed] Mbps\n\n` +
                   `Reply with your details and we'll get back to you! 📲`;
        }
    },

    // ==================== SUPPORT ====================
    support: {
        keywords: ['support', 'help', 'issue', 'problem', 'not working', 'down', 'fault', 'complain', 'trouble', 'error', 'network', 'slow', 'bad connection'],
        response: (userName) => {
            return `🔧 *Support - IGCE LIMITED*\n\n` +
                   `Sorry to hear you're having issues. 😔\n\n` +
                   `📋 *To help you quickly, please provide:*\n\n` +
                   `1️⃣ *Your Customer ID or Phone Number:*\n` +
                   `2️⃣ *Description of the problem:*\n` +
                   `   - No connection?\n` +
                   `   - Slow speed?\n` +
                   `   - Intermittent?\n` +
                   `3️⃣ *When did it start?*\n\n` +
                   `💡 *Quick Troubleshooting:*\n` +
                   `• Restart your router (unplug for 30 seconds)\n` +
                   `• Check if all cables are properly connected\n` +
                   `• Make sure you don't have outstanding bills\n\n` +
                   `If the problem continues, we'll send a technician! 🔧\n\n` +
                   `Reply with your details and we'll assist you immediately.`;
        }
    },

    // ==================== RENEWAL ====================
    renewal: {
        keywords: ['renew', 'renewal', 'extend', 'continue', 'pay', 'subscription', 'expire', 'expiring', 'bill', 'invoice'],
        response: (userName) => {
            return `🔄 *Renewal - IGCE LIMITED*\n\n` +
                   `Thank you for staying with IGCE LIMITED! 🙏\n\n` +
                   `📋 *To renew your service, please provide:*\n\n` +
                   `1️⃣ *Your Customer ID or Phone Number:*\n` +
                   `2️⃣ *Plan you want to renew:* (Basic/Standard/Premium)\n\n` +
                   `💰 *Renewal Prices:*\n` +
                   `• Basic: ₦[Price] per month\n` +
                   `• Standard: ₦[Price] per month\n` +
                   `• Premium: ₦[Price] per month\n\n` +
                   `💳 *Payment Options:*\n` +
                   `• Bank Transfer\n` +
                   `Send your details and we'll process your renewal.`;
        }
    },

    // ==================== BOSS (Direct to CEO) ====================
    boss: {
        keywords: ['boss', 'ceo', 'manager', 'director', 'owner', 'founder', 'supervisor', 'complain to boss'],
        response: (userName) => {
            return `👤 *Connect to Boss - IGCE LIMITED*\n\n` +
                   `We understand you want to speak with the CEO directly. 👔\n\n` +
                   `📋 *Please provide:*\n\n` +
                   `1️⃣ *Your Full Name:*\n` +
                   `2️⃣ *Phone Number:*\n` +
                   `3️⃣ *Reason for contacting the boss:*\n\n` +
                   `📞 *Or call directly:* [Boss Phone Number]\n\n` +
                   `⏰ *Response Time:* Within 1 hour during business hours\n\n` +
                   `Your message will be escalated immediately. 🚀`;
        }
    },

    // ==================== PRICES ====================
    prices: {
        keywords: ['price', 'prices', 'cost', 'how much', 'plan', 'plans', 'rate', 'fees'],
        response: (userName) => {
            return `💰 *IGCE LIMITED - Price Plans*\n\n` +
                   `📡 *Fiber WiFi Plans:*\n\n` +
                   `📶 *Basic:* ₦[Price] - [Speed] Mbps\n` +
                   `   • Perfect for small homes\n` +
                   `   • 2-3 devices\n\n` +
                   `📶 *Standard:* ₦[Price] - [Speed] Mbps\n` +
                   `   • Great for families\n` +
                   `   • 5-7 devices\n\n` +
                   `📶 *Premium:* ₦[Price] - [Speed] Mbps\n` +
                   `   • Best for businesses\n` +
                   `   • 10+ devices\n\n` +
                   `💡 *All plans include:*\n` +
                   `✅ Free installation\n` +
                   `✅ 24/7 support\n` +
                   `✅ 99.9% uptime guarantee\n\n` +
                   `Type *Enroll* to sign up! 🚀`;
        }
    },

    // ==================== STATUS/ORDER ====================
    status: {
        keywords: ['status', 'check', 'update', 'installation', 'when', 'progress', 'track'],
        response: (userName) => {
            return `📊 *Check Service Status - IGCE LIMITED*\n\n` +
                   `To check your service status, please provide:\n\n` +
                   `1️⃣ *Your Customer ID:*\n` +
                   `2️⃣ *Or your registered phone number:*\n\n` +
                   `We'll check and get back to you immediately! 🔍`;
        }
    },

    // ==================== COMPLAINT ====================
    complaint: {
        keywords: ['complain', 'complaint', 'bad service', 'poor service', 'unhappy', 'disappointed', 'angry', 'frustrated'],
        response: (userName) => {
            return `📝 *Complaint - IGCE LIMITED*\n\n` +
                   `We're sorry you've had a bad experience. 😔\n\n` +
                   `📋 *Please provide:*\n\n` +
                   `1️⃣ *Your Customer ID:*\n` +
                   `2️⃣ *Description of the complaint:*\n` +
                   `3️⃣ *What solution do you want?*\n\n` +
                   `Your complaint will be escalated to the boss immediately! 👤\n\n` +
                   `We value your feedback and we'll make things right. 💪`;
        }
    },

    // ==================== HELP / MENU ====================
    help: {
        keywords: ['help', 'menu', 'options', 'what can you do', 'commands', 'guide'],
        response: (userName) => {
            return `🤖 *IGCE LIMITED - Help Center*\n\n` +
                   `I can help you with:\n\n` +
                   `📡 *New Enrollment*\n` +
                   `• "Enroll" - Sign up for fiber WiFi\n` +
                   `• "Prices" - View our plans\n\n` +
                   `🔧 *Support*\n` +
                   `• "Support" - Report issues\n` +
                   `• "Status" - Check service status\n` +
                   `• "Complaint" - Lodge a complaint\n\n` +
                   `🔄 *Renewal*\n` +
                   `• "Renew" - Renew your subscription\n\n` +
                   `👤 *Boss*\n` +
                   `• "Boss" - Speak with CEO\n\n` +
                   `💬 Just type what you need! 😊`;
        }
    },

    // ==================== THANK YOU ====================
    thanks: {
        keywords: ['thank', 'thanks', 'thank you', 'appreciate', 'grateful', 'bless'],
        response: (userName) => {
            return `🙏 *Thank you, ${userName}!*\n\n` +
                   `We appreciate you choosing *IGCE LIMITED* 🌐\n\n` +
                   `✨ *We're here to serve you:*\n` +
                   `• 24/7 support\n` +
                   `• Reliable fiber WiFi\n` +
                   `• Fast response\n\n` +
                   `Feel free to reach out anytime you need us! 🚀`;
        }
    },

    // ==================== GOODBYE ====================
    goodbye: {
        keywords: ['bye', 'goodbye', 'bye bye', 'see you', 'later', 'cheers'],
        response: (userName) => {
            return `👋 *Goodbye ${userName}!*\n\n` +
                   `Thank you for contacting *IGCE LIMITED* 🌐\n\n` +
                   `For any questions:\n` +
                   `• Type *Help* to see options\n` +
                   `• Type *Support* for issues\n` +
                   `• Type *Boss* to speak with CEO\n\n` +
                   `Have a great day! 🌟`;
        }
    },

    // ==================== DEFAULT (Fallback) ====================
    default: {
        keywords: [],
        response: (userName) => {
            return `🤖 *IGCE LIMITED - I didn't quite get that!*\n\n` +
                   `But no worry! 😊\n\n` +
                   `💬 *Here are things I can help with:*\n` +
                   `• "Enroll" - Sign up for fiber WiFi\n` +
                   `• "Support" - Report an issue\n` +
                   `• "Renew" - Renew your subscription\n` +
                   `• "Prices" - Check our plans\n` +
                   `• "Boss" - Speak with CEO\n` +
                   `• "Help" - See all options\n\n` +
                   `Tell me what you need! 🚀`;
        }
    }
};