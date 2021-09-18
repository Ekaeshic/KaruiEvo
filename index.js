/**
 * Module Imports
 */
const { Client, Collection } = require("discord.js");
const { readdirSync } = require("fs");
const { join } = require("path");
const { TOKEN, PREFIX } = require("./util/Util");
const i18n = require("./util/i18n");

const client = new Client({
  disableMentions: "everyone",
  restTimeOffset: 0
});

client.login(TOKEN);
client.commands = new Collection();
client.prefix = PREFIX;
client.queue = new Map();
const cooldowns = new Collection();
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Client Events
 */
client.on("ready", () => {
  console.log(`${client.user.username} ready!`);
  client.user.setPresence({
		game: {
			name: 'Aku bosan~ | ~help',
			type: 'PLAYING',
		}
	})
  client.user.setActivity('coba ~meme | ~help untuk list perintah~', { type: 'WATCHING' })
  .then(presence => console.log(`Activity set to ${presence.activities[0].name}`))
  .catch(console.error);
});
client.on("warn", (info) => console.log(info));
client.on("error", console.error);

/**
 * Import all commands
 */
const commandFiles = readdirSync(join(__dirname, "commands")).filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(join(__dirname, "commands", `${file}`));
  client.commands.set(command.name, command);
}

client.on("message", async (message) => {
  //KaruiCommand
	//List chat commands :
	if (message.content.toLowerCase() === "halo"){
		message.reply('Halo juga, Master~:heart:');
	}
	else if (message.content.toLowerCase() === 'ping'){
		message.reply('Pong~');
	}
	if (message.content.toLowerCase() === "gan"){
		message.reply('Kalo mau tanya, tinggal sebutin pertanyaannya dulu. Tidak perlu nulis "Gan" terus nunggu sampai ada orang respon. https://imgur.com/gallery/UjXRnYc');
	}
  
  
  if (message.author.bot) return;
  if (!message.guild) return;

  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(PREFIX)})\\s*`);
  if (!prefixRegex.test(message.content)) return;

  const [, matchedPrefix] = message.content.match(prefixRegex);

  const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 1) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        i18n.__mf("common.cooldownMessage", { time: timeLeft.toFixed(1), name: command.name })
      );
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply(i18n.__("common.errorCommand")).catch(console.error);
  }
});



/*(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://ilmu.upnjatim.ac.id/login/index.php?authCAS=NOCAS");
  await page.type("#username", "19081010105");
  await page.type("#password", "12082001");
  await page.click("#loginbtn");
  try {
    if(page.waitForSelector(".empty-placeholder-image-lg")){
      console.log("Tidak ada matkul");
    }
    else{
      const satu = document.getElementById('label_3_12').getAttribute('href');
    }
  } catch (error) {
    
  };


})();*/
