/**
 * Made by: Dani Technology (Full Stack Engineer)
 * Created on: August 6, 2024
 * Contact developer:
 * - WhatsApp: +62 838-3499-4479 or +62 823-2066-7363
 * - Email: dani.technology.id@gmail.com
 * - GitHub: https://github.com/dani-techno
 */

const fs = require('fs');
const axios = require('axios');

const {
  exec,
  spawn,
  execSync
} = require('child_process');

const {
  generateRandomText,
  toRupiah,
  imageUploader,
  imageToBase64
} = require('./lib/functions.js');

module.exports = async (command, client, msg, options) => {
  const {
    config,
    parameters,
    isOwner,
    isMe,
    isGroup,
    groupMetadata,
    jid,
    botNumber,
    botName,
    senderNumber,
    senderName,
    ownerName,
    ownerNumber
  } = options;

  const prefix = config.prefix || '';

  async function sendMessage(options) {
    return await client.sendMessage(jid, options, {
      quoted: msg
    });
  };

  async function sendTemporaryMessage(options, countdown) {

    await client.sendMessage(jid, options, {
      quoted: msg
    }).then(sentMessage => {

      const messageId = sentMessage.key.id;

      setTimeout(() => {
        client.sendMessage(jid, {
          delete: {
            remoteJid: jid,
            fromMe: true,
            id: messageId
          },
        });
      }, countdown);
    });
  };

  async function sendReaction(emoji) {
    const reactionMessage = {
      react: {
        text: emoji,
        key: msg.key,
      },
    };

    return await client.sendMessage(jid, reactionMessage);
  };

  switch (command) {
    case 'menu':
    case 'menu_list': 
    case 'all_menu': {
      const menu = `*\`Hai ${senderName}\`*
            
\`Menu\`
- ${prefix}total_features
- ${prefix}whoami
- ${prefix}text
- ${prefix}temporary_msg [text, milliseconds]
- ${prefix}image
- ${prefix}video
- ${prefix}gif
- ${prefix}audio
- ${prefix}vn
- ${prefix}document
- ${prefix}location
- ${prefix}contact
- ${prefix}reaction
- ${prefix}owner_menu

\`Bot ini telah terintegrasi dengan API yang disediakan oleh ${config.api.base_url}\`
`;
      msg.reply(menu);
      break;
    }

    case 'owner_menu':
    case 'menu_owner': {
      if (!(isOwner || isMe)) {
        return msg.reply('❌ Kamu tidak memiliki izin untuk menggunakan fitur ini.');
      }

      const menu = `*\`Hai ${senderName}\`*
            
\`Owner Menu\`
- ${prefix}owner_number
- ${prefix}self
- ${prefix}public

\`Bot ini telah terintegrasi dengan API yang disediakan oleh ${config.api.base_url}\`
`;
      msg.reply(menu);
      break;
    }
    
    case 'self':
    case 'public': {
      if (!(isOwner || isMe)) {
        return msg.reply('❌ Kamu tidak memiliki izin untuk menggunakan fitur ini.');
      }
      
      client.public = command;
      
      msg.reply(`Mode ${command.toUpperCase()} telah diaktifkan.`);
      break;
    };
    
    case 'test': {
      msg.reply('Ok, Success!');
      break;
    }

    case 'total_features': case 'total_fitur': {
      const totalFeatures = (fs.readFileSync('./commands.js').toString().match(new RegExp('break', 'g')) || []).length - 1;
      msg.reply(`Jumlah fitur saat ini: ${totalFeatures}`);
      break;
    }

    case 'whoami': {
      if (!(isOwner || isMe)) {
        return msg.reply('Anda adalah pengguna bot.');
      }

      if (isOwner) {
        msg.reply('Anda adalah owner bot.');
      } else if (isMe) {
        msg.reply('Anda adalah bot.');
      } else {
        msg.reply('Anda adalah bot sekaligus owner bot-nya.');
      }

      break;
    }

    case 'text': {
      const options = {
        text: `Hai @${senderNumber}`,
        mentions: [`${senderNumber}@s.whatsapp.net`]
        //contextInfo: { forwardingScore: 2, isForwarded: false }
      };

      await sendMessage(options);
      break;
    };

    case 'temporary_msg': {
      const [text, countdown] = parameters('|');

      if (!text || !countdown) {
        return msg.reply(`Example: ${prefix}${command} Hai | 5000`);
      }

      const options = {
        text: text,
        mentions: [`${text.split('@')[1]}@s.whatsapp.net`]
        //contextInfo: { forwardingScore: 2, isForwarded: false }
      };

      await sendTemporaryMessage(options, 5000);
      break;
    };

    case 'image': {
      const options = {
        image: {
          url: './src/media/images/example.jpg'
        },
        caption: 'Hai',
        contextInfo: {
          forwardingScore: 2,
          isForwarded: false
        }
      };

      await sendMessage(options);
      break;
    };

    case 'video': {
      const thumbnail = imageToBase64('./src/media/images/example.jpg');

      const options = {
        video: {
          url: './src/media/video/example.mp4'
        },
        caption: 'Hai',
        gifPlayback: false,
        jpegThumbnail: thumbnail,
        contextInfo: {
          forwardingScore: 100,
          isForwarded: false
        }
      };

      await sendMessage(options);
      break;
    };

    case 'gif': {
      const options = {
        video: {
          url: './src/media/video/example.mp4'
        },
        caption: 'Hai',
        gifPlayback: true,
        contextInfo: {
          forwardingScore: 2,
          isForwarded: false
        }
      };

      await sendMessage(options);
      break;
    };

    case 'audio': {
      const options = {
        audio: {
          url: './src/media/audio/example.mp3'
        },
        ptt: false,
        contextInfo: {
          forwardingScore: 100,
          isForwarded: false
        }
      };

      await sendMessage(options);
      break;
    };

    case 'vn': {
      const options = {
        audio: {
          url: './src/media/audio/example.mp3'
        },
        ptt: true,
        contextInfo: {
          forwardingScore: 2,
          isForwarded: false
        }
      };

      await sendMessage(options);
      break;
    };

    case 'document': {
      const options = {
        document: {
          url: './src/media/documents/example.zip'
        },
        fileName: 'example.zip',
        mimetype: 'application/zip',
        caption: 'Hai',
        contextInfo: {
          forwardingScore: 2,
          isForwarded: false
        }
      };

      await sendMessage(options);
      break;
    };

    case 'location': {
      const options = {
        location: {
          degreesLatitude: 24.121231,
          degreesLongitude: 55.1121221
        },
        contextInfo: {
          forwardingScore: 2,
          isForwarded: false
        }
      };

      await sendMessage(options);
      break;
    };

    case 'contact':
    case 'owner_number': {
      const vcard =
        "BEGIN:VCARD\n" +
        "VERSION:3.0\n" +
        "FN:" + ownerName + "\n" +
        "ORG:" + "Owner of " + botName + ";\n" +
        "TEL;type=CELL;type=VOICE;waid=" + ownerNumber + ":+" + ownerNumber + "\n" +
        "END:VCARD";

      const options = {
        contacts: {
          displayName: ownerName,
          contacts: [{
            vcard
          }],
        },
        contextInfo: {
          forwardingScore: 2,
          isForwarded: false
        }
      };

      await sendMessage(options);
      break;
    };

    case 'reaction': case 'react': {
      await sendReaction('💖');
      break;
    };

    default: {
      msg.reply('Perintah tidak dikenali. Gunakan .menu untuk melihat daftar perintah.');
    }
  }
};