const DiepSocket = require('diepsocket');
const Discord = require('discord.js');
const client = new Discord.Client();
const emojiRegex = require('emoji-regex')();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', (msg) => {
    if (msg.channel.name === 'emote-only') emoteOnly(msg);
    else if (msg.channel.name === 'gif-only') gifOnly(msg);
    else {
        if (!msg.content.startsWith('!')) return;

        if (msg.content.startsWith('!leaderboard')) {
            const link = msg.content.split(' ')[1];
            try {
                DiepSocket.linkParse(link);
            } catch (e) {
                msg.react('❌');
                return;
            }

            const bot = new DiepSocket(link, {
                ws_options: {
                    family: 6,
                },
            });
            bot.on('accept', () => {
                let leaderboardString = '';
                bot.leaderboard.forEach((x,i) => {
                    const line = `${i}. ${x.name} - ${x.score} | ${x.tank} ${x.color}`
                    leaderboardString += line+ '\n';
                });
    
                const embedLeaderboard = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(bot.gamemode)
                    .setURL(bot.link)
                    .setDescription(leaderboardString)
                    .setTimestamp()
                    .setFooter('Powered by DiepSocket', 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/microsoft/209/milky-way_1f30c.png');
                msg.reply(embedLeaderboard);
                bot.close();
            });

            bot.on('error', () => {
                msg.react('❌');
            });
        }
    }
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
function gifOnly(msg) {
    if (!msg.startsWith('https://tenor.com/view/')) {
        if (!msg.deletable) {
            msg.reply('^ not a gif 😡');
            return;
        } else msg.delete().catch();
    }
}

client.login(process.env.TOKEN);
