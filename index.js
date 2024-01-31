const { Client, MessageAttachment, RichPresence, MessageEmbed } = require('discord.js-selfbot-v13');
const express = require('express');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
require('moment/locale/id');

// Mendapatkan path file config.json
const configPath = path.join(__dirname, 'config.json');

const rawData = fs.readFileSync(configPath);
const config = JSON.parse(rawData);

const app = express();
const port = 3000;

const req = require("node-fetch");
const bot = new Client({
  checkUpdate: false
}); // Define The User

const prefix = "?"
const autoRespond = `\`\`\`js\n'===== This is Autorespond Message ====='\`\`\`\n*•*                          ***ID: Ada apa tag saya?***                         *•*\n*•*                          ***EN: Why you tag me?***                         *•*\n ==========================================\n\`\`\`js\n{ID: <Kalo penting reply chat ini>\n{EN:/* When your Massage is IMPORTANT\n    Please Do reply this Auto Massage */\n\`\`\`\n_\`\`\`Autorespond terkirim pada\n${moment().format('dddd DD/MM/YYYY')}\n                        © 2023 Sanshi14\`\`\`_`;

app.use(express.static(path.join(__dirname, './Website')));

// Menangani permintaan GET ke root URL ("/")
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './Website/index.html'));
});

// Mulai server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

bot.on('ready', async () => {
  function updateActivity() {
    let pr = new RichPresence()
      .setName(config.name)
      .setType(config.type.toUpperCase())
      .setApplicationId(process.env.CLIENTID)
      .setState(config.state)
      .setDetails(config.details)

    bot.user.setActivity(pr.toJSON());
  }

  // Set initial activity
  updateActivity();

  // Schedule the activity update every 24 hours
  setInterval(updateActivity, 1000);
  console.log(`${bot.user.username} is ready!`);
});

bot.on('messageCreate', async (msg) => {
  if (msg.content.includes(`<@${bot.user.id}>`) && !msg.author.bot) {
    return msg.reply({ content: `${autoRespond}` });
  }

  if (
    !msg.content.toLowerCase().startsWith(prefix) ||
    msg.author.id !== bot.user.id
  ) return;

  const [cmd, ...args] = msg.content
    .slice(prefix.length)
    .trim()
    .split(/ +/g);

  // Menangani perintah translate
  if (cmd.toLowerCase() === "translate" || cmd.toLowerCase() === "tl") {
    let arguments = args.join(" ").split(" | ");
    if (!arguments[0] || !arguments[1]) return msg.reply({ content: "Contoh Command :\n.tl Hello | id" });
    const params = new URLSearchParams({
      to: arguments[1].toLowerCase(),
      text: arguments[0]
    });
    const results = await req("https://api.popcat.xyz/translate?" + params);
    const result = await results.json();
    msg.delete().then(() => msg.channel.send({ content: `${result.translated}` }));
  }
  // Menangani perintah setstatus atau st
  else if (cmd.toLowerCase() === "setstatus" || cmd.toLowerCase() === "st") {
    if (args.length === 0) {
      msg.reply("Mohon berikan argumen status yang valid (online, idle, dnd, atau offline).");
      return;
    }

    let newStatus = args[0].toLowerCase();
    if (newStatus === 'online' || newStatus === 'idle' || newStatus === 'dnd' || newStatus === 'offline') {
      bot.user.setStatus(newStatus); // Mengubah status bot sesuai dengan argumen yang diberikan
      msg.reply(`Status berhasil diubah menjadi ${newStatus}.`);
    } else {
      msg.reply('Status yang valid adalah: online, idle, dnd, atau offline.');
    }
  }
});

bot.login(process.env.TOKEN);
