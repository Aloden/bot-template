const Discord = require("discord.js");
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const fs = require("fs");
//const keep_alive = require('./keep_alive.js')

const mongoose = require('mongoose');

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.events = new Discord.Collection();

const utils = require("./utils/utils")
const config = require("./utils/config.json");
client.config = config;

fs.readdir("./src/events/", (err, files) => {

    if (err) return console.error(err);
    files.forEach(file => {
        let eventFunction = require(`./src/events/${file}`);
        let eventStart = eventFunction.run.bind(null, client);
        let eventName = file.split(".")[0];
        client.events.set(eventName, eventStart)
        if(eventName !== 'message' && client.botStatus === 'off') return;
        client.on(eventName, (...args) => eventFunction.run(client, utils, ...args));
    })
});

fs.readdir('./src/commands/', (err, files) => {
    if (err) console.error(err);
    files.forEach(f => {
        let props = require(`./src/commands/${ f }`);
        props.fileName = f;
        console.log(`La commande ${f} a ete charger`)
        client.commands.set(props.help.name, props);
        props.help.aliases.forEach(alias => {
            client.aliases.set(alias, props.help.name);
        });
    });
});

client.on("message", message => {
    try {
        if (message.author.bot) return;
        if (message.content.indexOf(config.prefix) !== 0) return;

        const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
        let command = args.shift().toLowerCase();

        if (client.aliases.has(command)) command = client.commands.get(client.aliases.get(command)).help.name
        
        let commandFile = require(`./src/commands/${command}.js`);
        commandFile.run(client, message, args, utils);

    } catch (err) {
        if (err.message === `Cannot read property 'config' of undefined`) return console.log('err2')
        if (err.code == "MODULE_NOT_FOUND") return console.log('err1')
        console.error(err);
    }
});

require('dotenv').config()
client.login(process.env.TOKEN);