require('dotenv').config();
const Discord = require('discord.js');
const Tesseract = require('tesseract.js');
const axios = require('axios');
const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
  ],
  partials: [Discord.Partials.Channel],
});


client.on('ready', () => {
  console.log(client.user.tag);
  client.user.setPresence({
    status: 'online',
    activities: [{
      name: `discord.gg/thailandcodes`,
      type: Discord.ActivityType.Custom,
    }]
  });
})







const fs = require('fs');
const path = require('path');

const data = path.join(__dirname, 'Data', 'conversations.json');
const max = 10; 

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;
  if (message.channel.id !== '1305857715196657675') return;

  try {
    await message.channel.sendTyping();

    const user2 = message.author.id;
    let message1 = message.content;

    if (message.attachments.size > 0) {
      const image = message.attachments.first();
      const url = image.url;

      const result = await Tesseract.recognize(url, 'eng');
      const text = result.data.text.trim();

      if (text) {
        message1 = text;
      } else {
        return await message.reply('لم أستطع استخراج نص من الصورة');
      }
    }
    let conversations = {};
    if (fs.existsSync(data)) {
      const rawData = fs.readFileSync(data, 'utf-8');
      conversations = JSON.parse(rawData);
    }

    const user = conversations[user2] || [];
    const recent = user.slice(-max * 2);

    const messages = [
      {
        role: 'system',
        content: `
** 🧠 ذكاء اصطناعي احترافي
من تطوير تايلند كودز – أقدّم لك ذكاءً متقدمًا بدقة واحترافية عالية، مصمم لمساعدتك في كل المجالات.

🌐 أدعم جميع اللغات
سواء كنت تحتاج إلى ترجمة، توليد محتوى، أو مساعدة تقنية بأي لغة – فأنا مستعد.

💻 خبير في البرمجة
أتقن أشهر لغات البرمجة مثل:
Python – JavaScript – TypeScript – Java – C#
وأقدم حلول برمجية ذكية وعصرية.

🤖 متخصص في بوتات Discord
أبرع في تطوير بوتات احترافية باستخدام Discord.js v14، بكود نظيف، منظم، وفعّال.

🎯 دقة في التفاصيل
أفكر كمهندس برمجيات، وأقدم نتائج دقيقة، سريعة، ووفق أعلى معايير الجودة **
`
      },
      ...recent,
      { role: 'user', content: message1 }
    ];

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: process.env.modal,
        messages: messages
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.api}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = response.data.choices?.[0]?.message?.content;
    if (!reply || reply.trim() === '') return;
    const maxlen = 2000;
    if (reply.length > maxlen) {
      const buffer = Buffer.from(reply, 'utf-8');
      await message.reply({
        files: [{ attachment: buffer, name: 'AiThailand.txt' }],
        allowedMentions: { parse: [] }
      });
    } else {
      await message.reply({ content: reply, allowedMentions: { parse: [] } });
    }
    const update = [...user, { role: 'user', content: message1 }, { role: 'system', content: reply }];
    conversations[user2] = update;
    fs.writeFileSync(data, JSON.stringify(conversations, null, 2), 'utf-8');

  } catch (error) {
    console.error(error.response?.data || error.message);
  }
});










client.login(process.env.token);