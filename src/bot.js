const DiepSocket = require('diepsocket');
const Discord = require('discord.js');
const client = new Discord.Client();
const emojiRegex = require('emoji-regex')();

const COLORS = {
    3: '🔵',
    4: '🔴',
    5: '🟣',
    6: '🟢',
    13: '🟢',
};
const GAMEMODES = {
    '4teams': '4 Teams',
    dom: 'Domination',
    ffa: 'FFA',
    maze: 'Maze',
    sandbox: 'Sandbox',
    survival: 'Survival',
    tag: 'Tag',
    teams: '2 Teams',
};
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async (msg) => {
    if (msg.channel.name === 'emote-only') emoteOnly(msg);
    else if (msg.channel.name === 'gif-only') gifOnly(msg);
    else {
        if (!msg.content.startsWith('!')) return;

        if (msg.content.startsWith('!leaderboard ') || msg.content.startsWith('!lb ')) {
            const args = msg.content.split(' ');
            let link;
            try {
                DiepSocket.linkParse(args[1]);
                link = args[1];
            } catch {}
            if (!link) {
                let gamemode = args[1];
                let region = args[2];
                if(DiepSocket.GAMEMODES.includes(gamemode) && DiepSocket.REGIONS.includes(region)) {
                    link = await DiepSocket.findServerSync(gamemode, region);
                }
                else {
                    msg.reply('Usage: !leaderboard <link> | !leaderboard <gamemode> <region>');
                }
            }
            if(!link) {
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
                bot.leaderboard.forEach((x, i) => {
                    const line = `${COLORS[x.color]} ${x.name} - ${formatScore(x.score)} | ${DiepSocket.TANKS[x.tank]}`;
                    leaderboardString += line + '\n';
                });

                const embedLeaderboard = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(GAMEMODES[bot.gamemode])
                    .setURL(bot.link)
                    .setDescription(leaderboardString)
                    .setTimestamp()
                    .setFooter(
                        'Powered by DiepSocket',
                        'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/microsoft/209/milky-way_1f30c.png'
                    );
                msg.reply(embedLeaderboard);
                bot.close();
            });

            bot.on('error', () => {
                msg.react('❌');
            });
        }
    }
});

function formatScore(num) {
    let score = '';
    num = ~~num;
    if (num > 1000000) score = `${Number.parseFloat(num / 1000000).toFixed(1)}m`;
    else if (num > 1000) score = `${Number.parseFloat(num / 1000).toFixed(1)}k`;
    return score;
}

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
