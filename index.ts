import dotenv from "dotenv";
import { Client, GatewayIntentBits, VoiceState, ChannelType } from "discord.js";

const envFile =
  process.env.NODE_ENV === "production"
    ? "./.env.production"
    : "./.env.development";

dotenv.config({ path: envFile });

const token = process.env.TOKEN || "";
const channelID = process.env.CHANNEL_ID || "";

(async () => {
  if (!token || !channelID) {
    console.log("Lost token or channel id");

    return;
  }

  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  });

  client.on("ready", () => {
    console.log(`Logged in as ${client.user?.tag}!`);
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "ping") {
      await interaction.reply("Pong!");
    }
  });

  client.on(
    "voiceStateUpdate",
    (oldState: VoiceState, newState: VoiceState) => {
      const user = newState.member?.user;
      if (!oldState.channel && newState.channel) {
        const user = newState.member?.user;
        const voiceChannel = newState.channel;
        const textChannel = client.channels.cache.get(channelID);
        if (
          textChannel?.isTextBased() &&
          textChannel?.type === ChannelType.GuildText
        ) {
          textChannel.send(
            `${user?.username} 加入了語音頻道 ${voiceChannel.name}！`
          );
        }
      }

      if (oldState.channel && !newState.channel) {
        const user = oldState.member?.user;
        const voiceChannel = oldState.channel;
        const textChannel = client.channels.cache.get(channelID);
        if (
          textChannel?.isTextBased() &&
          textChannel?.type === ChannelType.GuildText
        ) {
          textChannel.send(
            `${user?.username} 離開了語音頻道 ${voiceChannel.name}！`
          );
        }
      }

      if (
        oldState.channel &&
        newState.channel &&
        oldState.channel.id !== newState.channel.id
      ) {
        const oldChannel = oldState.channel;
        const newChannel = newState.channel;
        const textChannel = client.channels.cache.get(channelID);
        if (
          textChannel?.isTextBased() &&
          textChannel?.type === ChannelType.GuildText
        ) {
          textChannel.send(
            `${user?.username} 從語音頻道 ${oldChannel.name} 切換到了 ${newChannel.name}！`
          );
        }
      }

      if (!oldState.streaming && newState.streaming) {
        const voiceChannel = newState.channel;
        const textChannel = client.channels.cache.get(channelID);
        if (
          textChannel?.isTextBased() &&
          textChannel?.type === ChannelType.GuildText
        ) {
          textChannel.send(
            `${user?.globalName}(${user?.username}) 在語音頻道 ${voiceChannel?.name} 開啟了直播！`
          );
        }
      }
    }
  );

  client.login(token);
})();
