/**
Proyek ini dilindungi oleh hak cipta dan lisensi ISC. Pengembangan proyek ini dilakukan oleh Dani Technology (Full Stack Developer & Software Engineer) pada tanggal 21 Februari 2025. Perlu diingat bahwa pelanggaran hak cipta dapat mengakibatkan konsekuensi hukum yang serius, termasuk ganti rugi dan tindakan hukum lainnya. Oleh karena itu, kami berharap Anda untuk menghormati hak cipta kami dan tidak melakukan tindakan yang dapat melanggar hak cipta ini.

KONTAK DEVELOPER:

- WhatsApp: +62 838-3499-4479 atau +62 823-2066-7363
- Email: dani.technology.id@gmail.com
- GitHub: @dani-techno

SYARAT-SYARAT LISENSI:

- Anda tidak diperbolehkan mengklaim proyek ini sebagai milik Anda sendiri.
- Anda tidak diperbolehkan menjual proyek ini tanpa izin tertulis dari pemilik hak cipta.
- Anda tidak diperbolehkan mengubah atau menghapus atribusi hak cipta dari proyek ini.

KONSEKUENSI PELANGGARAN

Jika Anda melanggar syarat-syarat lisensi ini, maka Anda dapat menghadapi konsekuensi hukum berikut:

- Ganti rugi atas pelanggaran hak cipta sebesar Rp 1.000.000.000 (satu miliar rupiah) atau lebih, sesuai dengan ketentuan Pasal 113 Undang-Undang Hak Cipta No. 28 Tahun 2014.
- Penghentian penggunaan proyek ini dan semua derivatifnya, sesuai dengan ketentuan Pasal 114 Undang-Undang Hak Cipta No. 28 Tahun 2014.
- Tindakan hukum lainnya yang sesuai, termasuk tuntutan pidana dan perdata, sesuai dengan ketentuan Pasal 115 Undang-Undang Hak Cipta No. 28 Tahun 2014.

PASAL-PASAL YANG RELEVAN

- Pasal 113 Undang-Undang Hak Cipta No. 28 Tahun 2014 tentang ganti rugi atas pelanggaran hak cipta.
- Pasal 114 Undang-Undang Hak Cipta No. 28 Tahun 2014 tentang penghentian penggunaan proyek yang melanggar hak cipta.
- Pasal 115 Undang-Undang Hak Cipta No. 28 Tahun 2014 tentang tindakan hukum lainnya yang sesuai.

DENGAN MENGGUNAKAN PROYEK INI, ANDA MENYATAKAN BAHWA ANDA TELAH MEMBACA, MEMAHAMI, DAN MENYETUJUI SYARAT-SYARAT LISENSI DAN HAK CIPTA INI.

PERINGATAN AKHIR:

Dengan ini, kami memberikan peringatan bahwa pelanggaran hak cipta atas proyek ini akan diambil tindakan hukum yang serius. Jika Anda terbukti menjual atau mengklaim proyek ini sebagai milik Anda sendiri tanpa izin, kami akan mengambil langkah-langkah hukum yang diperlukan untuk melindungi hak cipta kami, termasuk ganti rugi dan tindakan hukum lainnya.
**/

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

  async function deleteMessage(id) {
    return await client.sendMessage(jid, {
      delete: {
        remoteJid: jid,
        fromMe: true,
        id: id
      }
    });
  };

  async function sendTemporaryMessage(options, countdown) {

    await client.sendMessage(jid, options, {
      quoted: msg
    }).then(sentMessage => {

      const msgId = sentMessage.key.id;

      setTimeout(() => {
        deleteMessage(msgId);
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
- ${prefix}test
- ${prefix}start
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

    case 'total_features':
    case 'total_fitur': {
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
        mentions: [`${senderNumber}@s.whatsapp.net`],
        //contextInfo: { forwardingScore: 2, isForwarded: true }
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
        mentions: [`${text.split('@')[1]}@s.whatsapp.net`],
        //contextInfo: { forwardingScore: 2, isForwarded: true }
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

    case 'reaction':
    case 'react': {
      await sendReaction('💖');
      break;
    };

    /* Start area */
    case 'start': {
      /*const [text] = parameters();

      if (!text) {
        return msg.reply(`Example: ${prefix}${command} Hi`);
      }*/

      try {
        await sendReaction(config.reactions.process);

        const options = {
          text: `Hai ${senderName} - @${senderNumber}. Aku adalah ${botName}`,
          mentions: [`${senderNumber}@s.whatsapp.net`],
          //contextInfo: { forwardingScore: 2, isForwarded: true }
        };

        await sendMessage(options).then(async () => {
          await sendReaction(config.reactions.success);
        });

      } catch (error) {
        await sendReaction(config.reactions.failed);
        msg.reply(`Error: ${error.message}`);
        console.error(error);
      };

      break;
    };
    /* End Start area */

    default: {
      msg.reply('Perintah tidak dikenali. Gunakan .menu untuk melihat daftar perintah.');
    }
  }
};