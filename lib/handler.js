/**
- PERINGATAN: PROYEK INI DILINDUNGI OLEH HAK CIPTA DAN LISENSI ISC
- 
- Made by: Dani Technology (Full Stack Engineer)
- Created on: August 6, 2024
- 
- KONTAK DEVELOPER:
-     - WhatsApp: +62 838-3499-4479 or +62 823-2066-7363
-     - Email: dani.technology.id@gmail.com
-     - GitHub: https://github.com/dani-techno
- 
- PERINGATAN:
-     - Anda tidak boleh mengklaim proyek ini sebagai milik Anda sendiri.
-     - Anda tidak boleh menjual proyek ini tanpa izin tertulis dari pemilik hak cipta.
-     - Anda tidak boleh mengubah atau menghapus atribusi hak cipta dari proyek ini.
- 
- KONSEKUENSI PELANGGARAN:
-     - Ganti rugi atas pelanggaran hak cipta sebesar Rp 1.000.000.000 (satu miliar rupiah) atau lebih.
-     - Penghentian penggunaan proyek ini dan semua derivatifnya.
-     - Tindakan hukum lainnya yang sesuai, termasuk tuntutan pidana dan perdata.
- 
- DENGAN MENGGUNAKAN PROYEK INI, ANDA MENYATAKAN BAHWA ANDA TELAH MEMBACA, MEMAHAMI, DAN MENYETUJUI SYARAT-SYARAT LISENSI DAN HAK CIPTA INI.
*/

const chalk = require('chalk');
const fs = require('fs');

const config = require('../config.js');

const handleResponse = require('../commands.js');

const date = new Date();
const currentTime = `${date.getHours()}:${date.getMinutes() < 10 ? '0' : '' }${date.getMinutes()}:${date.getSeconds() < 10 ? '0' : '' }${date.getSeconds()} WIB, ${date.getDate() < 10 ? '0' : '' }${date.getDate()}-${date.getMonth() + 1 < 10 ? '0' : '' }${date.getMonth() + 1}-${date.getFullYear()}`;

module.exports = async (socket, messages, memoryStore) => {
  const client = sock = socket;
  const msg = messages;
  const mstore = memoryStore;

  const jid = msg.chat ? msg.chat : msg.key.remoteJid;
  const botNumber = socket.user.id.split(':')[0];
  const botName = config.bot_name;
  const ownerNumber = config.owner_number;
  const ownerName = config.owner_name;
  const senderNumber = msg.sender.replace(/\D/g, '');
  let senderName = msg.pushName || 'Unknown';

  if (senderNumber === botNumber) {
    senderName = 'Me';
  }

  const body = msg.mtype === 'conversation' ? msg.message.conversation : msg.mtype === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : msg.mtype === 'imageMessage' ? msg.message.imageMessage.caption : msg.mtype === 'videoMessage' ? msg.message.videoMessage.caption : '';
  const budy = typeof msg.text === 'string' ? msg.text : '';
  const commands = body.startsWith(config.prefix) ? body.replace(config.prefix, '').trim().split(/ +/).shift().toLowerCase() : ''; // to use without prefix: body.trim().split(/ +/).shift().toLowerCase()
  const command = config.prefix ? commands.replace(config.prefix, '') : body.trim().split(/ +/).shift().toLowerCase();
  const query = body.trim().split(/ +/).slice(1).join(' ');
  const parameters = (separator) => query.split(separator).map(parameter => parameter.trim());
  const isQuoted = msg.quoted ? msg.quoted : msg;
  const isQuotedMsg = (isQuoted.msg || isQuoted);
  const isQuotedMimeType = (isQuoted.msg || isQuoted).mimetype || '';
  const isQuotedText = msg.type === 'extendexTextMessage' && JSON.stringify(msg).includes('textMessage');
  const isQuotedImage = msg.type === 'extendedTextMessage' && JSON.stringify(msg).includes('imageMessage');
  const isQuotedLocation = msg.type === 'extendedTextMessage' && JSON.stringify(msg).includes('locationMessage');
  const isQuotedVideo = msg.type === 'extendedTextMessage' && JSON.stringify(msg).includes('videoMessage');
  const isQuotedSticker = msg.type === 'extendedTextMessage' && JSON.stringify(msg).includes('stickerMessage');
  const isQuotedAudio = msg.type === 'extendedTextMessage' && JSON.stringify(msg).includes('audioMessage');
  const isQuotedContact = msg.type === 'extendedTextMessage' && JSON.stringify(msg).includes('contactMessage');
  const isQuotedDocument = msg.type === 'extendedTextMessage' && JSON.stringify(msg).includes('documentMessage');
  const isMedia = /image|video|sticker|audio/.test(isQuotedMimeType);
  const isImage = (msg.type == 'imageMessage');
  const isVideo = (msg.type == 'videoMessage');
  const isAudio = (msg.type == 'audioMessage');
  const isText = (msg.type == 'textMessage');
  const isSticker = (msg.type == 'stickerMessage');

  const isMe = botNumber === senderNumber;
  const isOwner = ownerNumber === senderNumber;

  const isGroup = msg.isGroup;

  let groupMetadata;
  let groupName;
  let groupId;
  let groupAdmin;

  if (isGroup) {
    groupMetadata = await client.groupMetadata(jid);
    groupName = groupMetadata.subject;
    groupId = groupMetadata.id;
    groupAdmin = groupMetadata.participants.find(participant => participant.id === msg.sender && participant.admin !== null);
  }

  if (config.chat_mode === 'private') {
    if (msg) {
      if (isGroup) {
        if (body.startsWith(config.prefix)) {
          msg.reply('Bot hanya dapat digunakan di private chat');
          return;
        }
      }
    }
  } else if (config.chat_mode === 'group') {
    if (msg) {
      if (!isGroup) {
        if (body.startsWith(config.prefix)) {
          msg.reply('Bot hanya dapat digunakan di group chat');
          return;
        }
      }
    }
  } else if (config.chat_mode === 'self') {
    if (!msg.key.fromMe && !isOwner) {
      return;
    }
  }

  if (config.bot_offline_status) {
    client.sendPresenceUpdate('unavailable', jid);
  } else {
    client.sendPresenceUpdate('available', jid);
  }

  if (config.automatic_update_profile_status[0]) {
    client.updateProfileStatus(config.automatic_update_profile_status[1]);
  }

  if (msg.message) {
    if (body.startsWith(config.prefix)) {
      if (config.automatic_read_messages) {
        client.readMessages([msg.key]);
      }

      if (config.automatic_typing_or_recording[0]) {
        if (config.automatic_typing_or_recording[1] === 'typing') {
          client.sendPresenceUpdate('composing', jid);
        } else if (config.automatic_typing_or_recording[1] === 'recording') {
          client.sendPresenceUpdate('recording', jid);
        } else {
          client.sendPresenceUpdate('paused', jid);
        }
      }
    }

    if (config.only_show_command_chat) {
      if (msg.message && body.startsWith(config.prefix)) {
        console.log('\n• ' + chalk.bold(chalk.greenBright('New Message:')) + '\n- ' + chalk.cyanBright('From:'), chalk.whiteBright(senderName), chalk.yellowBright('- ' + senderNumber) + '\n- ' + chalk.cyanBright('In:'), chalk.whiteBright(!isGroup ? 'Private Chat' : 'Group Chat - ' + chalk.yellowBright(groupName)) + '\n- ' + chalk.cyanBright('Time: ') + chalk.whiteBright(currentTime) + '\n- ' + chalk.cyanBright('Message: ') + chalk.whiteBright(body || msg.mtype));
      }
    } else {
      console.log('\n• ' + chalk.bold(chalk.greenBright('New Message:')) + '\n- ' + chalk.cyanBright('From:'), chalk.whiteBright(senderName), chalk.yellowBright('- ' + senderNumber) + '\n- ' + chalk.cyanBright('In:'), chalk.whiteBright(!isGroup ? 'Private Chat' : 'Group Chat - ' + chalk.yellowBright(groupName)) + '\n- ' + chalk.cyanBright('Time: ') + chalk.whiteBright(currentTime) + '\n- ' + chalk.cyanBright('Message: ') + chalk.whiteBright(body || msg.mtype));
    }
  }

  if (!body.startsWith(config.prefix) || body === config.prefix) {
    return;
  }

  try {
    await handleResponse(command, client, msg, {
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
    });
  } catch (error) {
    console.error(error);
  }
};