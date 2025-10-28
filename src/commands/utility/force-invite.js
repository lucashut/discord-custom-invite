const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType } = require('discord.js');

const { findBestMatch } = require('./../../funcs/best-match.js');


async function createChannels(parent, amount, naming) {

    const channelsArray = [];
    var channelNum = -1;

    const creationPromises = Array.from( {length: amount}, async ()=>{

        channelNum += 1;

        const response = await parent.guild.channels.create({
            name: `${naming}-${channelNum}`, type: ChannelType.GuildText
        })
            .then( channel => channel.setParent(parent.id) );

        return response;
    });

    const createdChannels = await Promise.all(creationPromises);
    
    channelsArray.push(...createdChannels);

    return channelsArray;
}

async function createInvites(guild, channels) {
    const invitesArray = [];

    const creationPromises = Array.from( channels, async (channel)=>{

        const response = await guild.invites.create(
            channel.id, { maxAge: 0, maxUses: 0 })

        return response;
    });

    const createdInvites = await Promise.all(creationPromises);
    
    invitesArray.push(...createdInvites);

    return invitesArray;
}

async function getBestCode(guild, target, codes) {
    const bestCode = findBestMatch(target, codes);
    const codesLast = [];
    
    codes.map( code => code === bestCode ? true : codesLast.push(code) );

    const deletionPromises = Array.from(codesLast, async (code)=>{
        const response = await guild.invites.delete(code);
        
        return response
    });

    await Promise.all(deletionPromises);

    return bestCode;
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName('force-invite')
        .setDescription('Create invite codes using different channels')
        .addChannelOption(option =>
            option
                .setName('category')
                .setDescription('The category to setup the channels')
                .setRequired(true))
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('The number of channels to create')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('target-code')
                .setDescription('The target invite code')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setDMPermission(false),

    async execute(interaction) {
        await interaction.deferReply();

        const category = interaction.options.getChannel('category');
        const amount = interaction.options.getInteger('amount');
        const targetCode = interaction.options.getString('target-code');
        const inviteChannels = [];
        const inviteCodes = [];


        await createChannels(category, amount, targetCode)
        .then(channels => 
            channels.map( channel => inviteChannels.push(channel) ))
        .catch(async (error) => {
            console.error(error);
            await interaction.editReply(
                'Operation failed while creating channels.');
        });

        await createInvites(interaction.guild, inviteChannels)
            .then(invites =>
                invites.map( invite => inviteCodes.push(invite.code) ))
            .catch(async (error) => {
                console.error(error);
                await interaction.editReply(
                    'Operation failed while creating invites.');
        });

        await getBestCode(interaction.guild, targetCode, inviteCodes)
            .then(async (code) =>
                await interaction.editReply(`Best match: discord.gg/${code}`))
            .catch(async (error) => {
                console.error(error);
                await interaction.editReply(
                    'Operation failed while removing invites.');
        });

    }
};