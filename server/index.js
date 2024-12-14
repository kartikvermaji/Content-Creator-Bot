import { Telegraf } from 'telegraf';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import USERS from './src/user.js'; 
import EVENTS from './src/event.js'; 

dotenv.config(); 

const token = process.env.TELEGRAM_API;

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], 
});
 
const bot = new Telegraf(token);

mongoose.set('debug', true);
mongoose.connect('mongodb://localhost:27017/Concreate')
  .then(() => console.log("Connected to local MongoDB"))
  .catch(err => console.log("Error connecting to local MongoDB:", err));

bot.start(async (ctx) => {
  const from = ctx.update.message.from;

  try {

    const updatedUser = await USERS.findOneAndUpdate(
      { tgId: from.id },
      {
        $set: {
          tgId: from.id,
          firstname: from.first_name,
          lastname: from.last_name || '',
          username: from.username || '',
          isBot: from.is_bot,
        }
      },
      { upsert: true, new: true }
    );
    await ctx.reply(`Hey! ${from.first_name}, Welcome to Content Creator Bot`);
  } catch (err) {
    console.log('Error:', err);
    await ctx.reply("Server is Down! Please try again later.");
  }
});
bot.command("generate", async (ctx) => {
  const from = ctx.update.message.from;
  const startday = new Date();
  startday.setHours(0, 0, 0, 0); 
  const endday = new Date();
  endday.setHours(23, 59, 59, 999);  

  try {
  
    const event = await EVENTS.find({
      tgId: from.id,
      createdAt: {
        $gte: startday,
        $lte: endday
      }
    });

    if (event.length === 0) {
      await ctx.reply("No new Messages today? Huh!!!");
      return;
    }
    const chatcompletion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: "Act as a senior copywriter. Write highly engaging posts for LinkedIn, Facebook, and Telegram using the provided thoughts/events throughout the day."
        },
        {
          role: "user",
          content: `Write like a human for humans. Craft three engaging posts for LinkedIn, Facebook, and Telegram audiences. Use simple language. Use the following events to craft the posts. Ensure the tone is conversational and impactful. Focus on engaging new audiences, encouraging interaction, and driving interest in the events: ${event.map((e) => e.text).join(', ')}`
        }
      ],
      model: process.env.OPEN_MODEL
    });
    await USERS.findOneAndUpdate(
      { tgId: from.id },
      {
        $inc: {
          promptToken: chatcompletion.usage.prompt_tokens,
          completionToken: chatcompletion.usage.completion_tokens
        }
      }
    );
    await ctx.reply(chatcompletion.choices[0].message.content);
  } catch (err) {
    console.log("Error in generate command:", err);
    await ctx.reply("API difficulties, please try again later.");
  }
});
bot.on('text', async (ctx) => {
  const from = ctx.update.message.from;
  const messageText = ctx.update.message.text;

  try {
   
    await EVENTS.create({
      text: messageText,
      tgId: from.id
    });
    ctx.reply("Got the message!");
  } catch (Err) {
    console.log(Err);
    await ctx.reply("Facing difficulties, please try again later.");
  }
});
bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
