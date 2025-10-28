const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Retuns the bot info'),
    async execute(interaction) {
        await interaction.reply('An experiment with channel invites and probability.');
    }
};
