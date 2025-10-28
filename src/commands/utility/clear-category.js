const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear-category')
        .setDescription('Delete all channels from category')
        .addChannelOption(option =>
            option
                .setName('category')
                .setDescription('The category to be cleared')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setDMPermission(false),

    async execute(interaction) {
        await interaction.deferReply();

        const category = interaction.options.getChannel('category');
        const channels = category.children.cache;
        
        const deletionPromises = channels.map(channel => {
            return channel.delete()
                .then()
                .catch(error => { 
                    console.error(error);
                });
        })
        
        await Promise.all(deletionPromises)
            .then(async () => { 
                await interaction.editReply('Done!');
            })
            .catch(async (error) => {
                console.error(error)
                await interaction.editReply(
                    'Operation failed while deleting channels.');
        });

    }
};