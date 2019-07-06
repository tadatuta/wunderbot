const TelegramBot = require('node-telegram-bot-api');

const WunderlistApi = require('./api');
const {WUNDERLIST_CLIENT_ID, WUNDERLIST_ACCESS_TOKEN, TELEGRAM_BOT_TOKEN} = process.env;

// uses 'polling' to fetch new updates
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, {polling: true});

const wunderlistApi = new WunderlistApi(WUNDERLIST_CLIENT_ID, WUNDERLIST_ACCESS_TOKEN);

(async function() {
    const inbox = await wunderlistApi.getInbox();
    const defaultListId = inbox.id;

    bot.on('message', async msg => {
        if (msg === '/start') return;

        // TODO: support other users
        if (msg.from.username !== 'tadatuta') return;

        const chatId = msg.chat.id;
        const [title, ...noteArr] = msg.text.split('\n');

        // wunderlist title is 255 chars max
        const note = title.length > 255 ?
            '...' + title.slice(255, title.length) + noteArr.join('\n') :
            noteArr.join('\n');

        try {
            const newTask = await wunderlistApi.createTask({ listId: defaultListId, title });
            await wunderlistApi.createNote(newTask.id, note);

            bot.sendMessage(chatId, 'Added new task');
        } catch(err) {
            bot.sendMessage(chatId, 'Error! ' + err);
        }
    });
}());
