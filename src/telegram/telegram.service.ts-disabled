import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TelegramBot from 'node-telegram-bot-api';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TelegramService {
  private bot: TelegramBot;
  private logger = new Logger(TelegramService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const botToken = this.configService.get('TELEGRAM_BOT_TOKEN');
    if (botToken) {
      this.bot = new TelegramBot(botToken, { polling: false });
      this.setupBot();
    }
  }

  private async setupBot() {
    if (!this.bot) return;

    try {
      const botInfo = await this.bot.getMe();
      this.logger.log(`Telegram bot connected: ${botInfo.username}`);
      
      // Set up webhook URL if configured
      const webhookUrl = this.configService.get('TELEGRAM_WEBHOOK_URL');
      if (webhookUrl) {
        await this.bot.setWebHook(webhookUrl);
        this.logger.log(`Webhook set to: ${webhookUrl}`);
      }
    } catch (error) {
      this.logger.error('Failed to setup Telegram bot:', error);
    }
  }

  async sendMessage(chatId: string | number, message: string, options?: any) {
    if (!this.bot) {
      this.logger.warn('Telegram bot not configured');
      return null;
    }

    try {
      return await this.bot.sendMessage(chatId, message, options);
    } catch (error) {
      this.logger.error(`Failed to send message to ${chatId}:`, error);
      throw error;
    }
  }

  async sendDocument(chatId: string | number, document: string | Buffer, options?: any) {
    if (!this.bot) {
      this.logger.warn('Telegram bot not configured');
      return null;
    }

    try {
      return await this.bot.sendDocument(chatId, document, options);
    } catch (error) {
      this.logger.error(`Failed to send document to ${chatId}:`, error);
      throw error;
    }
  }

  async handleWebhook(update: any) {
    if (!this.bot) return;

    try {
      // Process the update
      if (update.message) {
        await this.handleMessage(update.message);
      }
      
      if (update.callback_query) {
        await this.handleCallbackQuery(update.callback_query);
      }
    } catch (error) {
      this.logger.error('Error handling webhook:', error);
    }
  }

  private async handleMessage(message: any) {
    const chatId = message.chat.id;
    const text = message.text;

    // Handle commands
    if (text?.startsWith('/')) {
      await this.handleCommand(chatId, text, message);
      return;
    }

    // Handle file uploads
    if (message.document) {
      await this.handleDocumentUpload(chatId, message.document, message);
      return;
    }

    // Default response for regular messages
    await this.sendMessage(chatId, 'Hello! I can help you with dental lectures. Use /help to see available commands.');
  }

  private async handleCommand(chatId: string | number, command: string, message: any) {
    const [cmd, ...args] = command.split(' ');
    
    switch (cmd) {
      case '/start':
        await this.handleStartCommand(chatId, message);
        break;
      case '/help':
        await this.handleHelpCommand(chatId);
        break;
      case '/register':
        await this.handleRegisterCommand(chatId, message, args);
        break;
      case '/groups':
        await this.handleGroupsCommand(chatId, message);
        break;
      default:
        await this.sendMessage(chatId, 'Unknown command. Use /help to see available commands.');
    }
  }

  private async handleStartCommand(chatId: string | number, message: any) {
    const welcomeMessage = `
🦷 Welcome to the Dental Lecture Bot!

I can help you:
📚 Access dental lectures
👥 Join study groups  
🔍 Search for specific topics
📥 Download course materials

Use /register to link your account
Use /help to see all commands
    `.trim();

    await this.sendMessage(chatId, welcomeMessage);
  }

  private async handleHelpCommand(chatId: string | number) {
    const helpMessage = `
📋 Available Commands:

/start - Start the bot and get welcome message
/help - Show this help message
/register - Register your Telegram account
/groups - Show your study groups
/search [topic] - Search for lectures
/profile - Show your profile information

📤 You can also send me documents to upload them to your groups!
    `.trim();

    await this.sendMessage(chatId, helpMessage);
  }

  private async handleRegisterCommand(chatId: string | number, message: any, args: string[]) {
    // This would integrate with user registration
    // For now, just send a registration link
    await this.sendMessage(
      chatId, 
      'To register, please visit our website and link your Telegram account in your profile settings.'
    );
  }

  private async handleGroupsCommand(chatId: string | number, message: any) {
    try {
      // Find user by telegram ID and get their groups
      const user = await this.prisma.user.findUnique({
        where: { telegramUserId: chatId.toString() },
        include: {
          userGroups: {
            include: {
              group: {
                select: {
                  id: true,
                  name: true,
                  subject: true,
                  university: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        await this.sendMessage(chatId, 'Please register your account first using /register');
        return;
      }

      if (user.userGroups.length === 0) {
        await this.sendMessage(chatId, 'You are not a member of any study groups yet.');
        return;
      }

      let groupsList = '👥 Your Study Groups:\n\n';
      user.userGroups.forEach((userGroup, index) => {
        const group = userGroup.group;
        groupsList += `${index + 1}. 📚 ${group.name}\n`;
        groupsList += `   📖 Subject: ${group.subject}\n`;
        if (group.university) {
          groupsList += `   🏫 University: ${group.university}\n`;
        }
        groupsList += `   👤 Role: ${userGroup.role}\n\n`;
      });

      await this.sendMessage(chatId, groupsList);
    } catch (error) {
      this.logger.error('Error fetching user groups:', error);
      await this.sendMessage(chatId, 'Sorry, there was an error fetching your groups.');
    }
  }

  private async handleDocumentUpload(chatId: string | number, document: any, message: any) {
    await this.sendMessage(
      chatId,
      `📄 Received document: ${document.file_name}\n\nTo upload this to a study group, please use our web application. This feature will be available soon through the bot!`
    );
  }

  private async handleCallbackQuery(callbackQuery: any) {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    // Handle callback query data
    await this.bot.answerCallbackQuery(callbackQuery.id);
    
    // Process the callback data as needed
    this.logger.log(`Callback query: ${data} from ${chatId}`);
  }

  async notifyNewLecture(groupId: string, lectureTitle: string, lectureUrl: string) {
    try {
      const group = await this.prisma.lectureGroup.findUnique({
        where: { id: groupId },
        include: {
          userGroups: {
            include: {
              user: {
                select: {
                  telegramUserId: true,
                  notificationsEnabled: true,
                },
              },
            },
          },
        },
      });

      if (!group?.telegramChannelId) return;

      const notificationMessage = `
📚 New Lecture Available!

📖 Title: ${lectureTitle}
👥 Group: ${group.name}
📝 Subject: ${group.subject}

🔗 Access: ${lectureUrl}
      `.trim();

      // Send to channel if configured
      if (group.telegramChannelId) {
        await this.sendMessage(group.telegramChannelId, notificationMessage);
      }

      // Send to individual users who have notifications enabled
      for (const userGroup of group.userGroups) {
        const user = userGroup.user;
        if (user.telegramUserId && user.notificationsEnabled) {
          await this.sendMessage(
            user.telegramUserId,
            `🔔 ${notificationMessage}`
          );
        }
      }
    } catch (error) {
      this.logger.error('Error sending lecture notifications:', error);
    }
  }
}