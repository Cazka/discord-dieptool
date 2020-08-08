const Discord = require('discord.js');
const client = new Discord.Client();
const emojiRegex = require('emoji-regex')();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', (msg) => {
    if (msg.channel.name === 'emote-only') emoteOnly(msg);
});

function emoteOnly(msg) {
    let s = msg.content
        .replace(/:[^:\s]+:|<:[^:\s]+:[0-9]+>|<a:[^:\s]+:[0-9]+>/g, '')
        .replace(emojiRegex, '')
        .replace(/\s+/g, '');
    if (s) {
        if (!msg.deletable) {
            msg.reply('^ not an emote 😡');
            return;
        } else msg.delete().catch();
    }
}
function gifOnly(msg){

}

client.login(process.env.TOKEN);
