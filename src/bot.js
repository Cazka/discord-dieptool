const Discord = require('discord.js');
const client = new Discord.Client();
const emojiRegex = require('emoji-regex')();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', (msg) => {
    if(msg.channel.name === 'general' && msg.content.includes('@Cazka')) msg.delete().catch();
    if (msg.channel.name !== 'emote-only') return;
    if(msg.author.id === client.user.id) return;
    if(!msg.deletable){
        msg.reply('^ not an emote 😡');
        return;
    }
    let s = msg.content.replace(/:[^:\s]+:|<:[^:\s]+:[0-9]+>|<a:[^:\s]+:[0-9]+>/g, '').replace(emojiRegex, '').replace(/\s+/g, '');
    if (s) msg.delete().catch();
});
client.login(process.env.TOKEN);