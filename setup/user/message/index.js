/* eslint-disable no-case-declarations */

/********** MODULES **********/
const { decryptMedia, Client } = require('@open-wa/wa-automate')
const { Configuration, OpenAIApi } = require('openai')
const fs = require('fs-extra')
const Nekos = require('nekos.life')
const neko = new Nekos()
const os = require('os')
const sagiri = require('sagiri')
const isPorn = require('is-porn')
const config = require('../config.json')
const saus = sagiri(config.nao)
const tts = require('node-gtts')
const ffmpeg = require('fluent-ffmpeg')
const path = require('path')
const ms = require('parse-ms')
const toMs = require('ms')
const canvas = require('canvacord')
const mathjs = require('mathjs')
const Filter = require('bad-words')
const badwords = new Filter()
const moment = require('moment-timezone')
moment.tz.setDefault('Europe/Berlin').locale('de')
const google = require('google-it')
const cron = require('node-cron')
const ocrtess = require('node-tesseract-ocr')

// Modules by User
const axios = require('axios')
const { spawn } = require('child_process')
const { exec } = require('child_process')
const gptprefix = require('../gptprefix.json')
/********** END OF MODULES **********/

/********** UTILS **********/
const { msgFilter, color, processTime, isUrl, createSerial } = require('../tools')
const { weeaboo } = require('../lib')
const { uploadImages } = require('../tools/fetcher')
// eslint-disable-next-line no-unused-vars
const { eng, ind } = require('./text/lang/')
const { daily, level, register, afk, reminder, premium, limit } = require('../function')
const cd = 4.32e+7
const limitCount = 25
const gptlimitCount = 20
const errorImg = 'https://i.ibb.co/jRCpLfn/user.png'
/********** END OF UTILS **********/

/********** DATABASES **********/
const _antilink = JSON.parse(fs.readFileSync('./database/group/antilink.json'))
const _antinsfw = JSON.parse(fs.readFileSync('./database/group/antinsfw.json'))
const _leveling = JSON.parse(fs.readFileSync('./database/group/leveling.json'))
const _welcome = JSON.parse(fs.readFileSync('./database/group/welcome.json'))
const _autosticker = JSON.parse(fs.readFileSync('./database/group/autosticker.json'))
const _badwords = JSON.parse(fs.readFileSync('./database/group/badwords.json'))
const _ban = JSON.parse(fs.readFileSync('./database/bot/banned.json'))
const _premium = JSON.parse(fs.readFileSync('./database/bot/premium.json'))
const _mute = JSON.parse(fs.readFileSync('./database/bot/mute.json'))
const _registered = JSON.parse(fs.readFileSync('./database/bot/registered.json'))
const _level = JSON.parse(fs.readFileSync('./database/user/level.json'))
let _limit = JSON.parse(fs.readFileSync('./database/user/limit.json'))
const _afk = JSON.parse(fs.readFileSync('./database/user/afk.json'))
const _reminder = JSON.parse(fs.readFileSync('./database/user/reminder.json'))
const _daily = JSON.parse(fs.readFileSync('./database/user/daily.json'))
const _setting = JSON.parse(fs.readFileSync('./database/bot/setting.json'))
let { memberLimit, groupLimit } = _setting

// Databases by User
const _levelingmedia = JSON.parse(fs.readFileSync('./database/group/levelingmedia.json'))
let _gptlimit = JSON.parse(fs.readFileSync('./database/user/gptlimit.json'))
const gptlimitFile = './database/user/gptlimit.json'
const limitFile = './database/user/limit.json'
/********** END OF DATABASES **********/

/********** MESSAGE HANDLER **********/
// eslint-disable-next-line no-undef
module.exports = msgHandler = async (bocchi = new Client(), message) => {
    try {
        const { type, id, from, t, sender, isGroupMsg, chat, caption, isMedia, mimetype, quotedMsg, quotedMsgObj, mentionedJidList } = message
        let { body } = message
        const { name, formattedTitle } = chat
        let { pushname, verifiedName, formattedName } = sender
        pushname = pushname || verifiedName || formattedName
        const botNumber = await bocchi.getHostNumber() + '@c.us'
        const blockNumber = await bocchi.getBlockedIds()
        const ownerNumber = config.ownerBot
        const authorWm = config.authorStick
        const packWm = config.packStick
        const prefix = config.prefix
        const groupId = isGroupMsg ? chat.groupMetadata.id : ''
        const groupAdmins = isGroupMsg ? await bocchi.getGroupAdmins(groupId) : ''
        const time = moment(t * 1000).format('DD/MM/YY HH:mm:ss')

        const chats = (type === 'chat') ? body : (type === 'image' || type === 'video') ? caption : ''
        body = (type === 'chat' && body.startsWith(prefix)) ? body : (((type === 'image' || type === 'video') && caption) && caption.startsWith(prefix)) ? caption : ''
        const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
        const args = body.trim().split(/ +/).slice(1)
        const q = args.join(' ')
        const ar = args.map((v) => v.toLowerCase())
        const url = args.length !== 0 ? args[0] : ''

        /********** VALIDATOR **********/
        const isCmd = body.startsWith(prefix)
        const isBlocked = blockNumber.includes(sender.id)
        const isOwner = sender.id === ownerNumber
        const isBanned = _ban.includes(sender.id)
        const isPremium = premium.checkPremiumUser(sender.id, _premium)
        const isRegistered = register.checkRegisteredUser(sender.id, _registered)
        const isGroupAdmins = isGroupMsg ? groupAdmins.includes(sender.id) : false
        const isBotGroupAdmins = isGroupMsg ? groupAdmins.includes(botNumber) : false
        const isWelcomeOn = isGroupMsg ? _welcome.includes(groupId) : false
        const isDetectorOn = isGroupMsg ? _antilink.includes(groupId) : false
        const isLevelingOn = isGroupMsg ? _leveling.includes(groupId) : false
		const isLevelingmediaOn = isGroupMsg ? _levelingmedia.includes(groupId) : false
        const isAutoStickerOn = isGroupMsg ? _autosticker.includes(groupId) : false
        const isAntiNsfw = isGroupMsg ? _antinsfw.includes(groupId) : false
        const isMute = isGroupMsg ? _mute.includes(chat.id) : false
        const isAfkOn = isGroupMsg ? afk.checkAfkUser(sender.id, _afk) : false
        const isAntiBadWords = isGroupMsg ? _badwords.includes(groupId) : false
        const isQuotedImage = quotedMsg && quotedMsg.type === 'image'
        const isQuotedVideo = quotedMsg && quotedMsg.type === 'video'
        const isQuotedSticker = quotedMsg && quotedMsg.type === 'sticker'
        const isQuotedGif = quotedMsg && quotedMsg.mimetype === 'image/gif'
        const isQuotedAudio = quotedMsg && quotedMsg.type === 'audio'
        const isQuotedVoice = quotedMsg && quotedMsg.type === 'ptt'
        const isImage = type === 'image'
        const isVideo = type === 'video'
        const isAudio = type === 'audio'
        const isVoice = type === 'ptt'
        const isGif = mimetype === 'image/gif'
        /********** END OF VALIDATOR **********/

// Repost Function: Save Video Temp File
const saveFile = async (data, filePath) => {
    try {
        await fs.promises.writeFile(filePath, data);
        console.log('File saved successfully:', filePath);
    } catch (error) {
        console.error('Error saving file:', error);
        throw error;
    }
};

// Repost Function: Delete Video Temp File
const deleteFile = async (filePath) => {
    try {
        await fs.promises.unlink(filePath);
        console.log('File deleted successfully:', filePath);
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
};

// Run FFMPEG Silently [Tomp3, Bass, Nightcore, Triggered] by User
const runFfmpegSilently = (args, callback) => {
    const ffmpeg = spawn('ffmpeg', args, {
        stdio: 'ignore',
        windowsHide: true
    });

    ffmpeg.on('error', (err) => {
        console.error('Failed to start ffmpeg:', err);
        callback(err);
    });

    ffmpeg.on('close', (code) => {
        if (code === 0) {
            callback(null);
        } else {
            callback(new Error(`ffmpeg exited with code ${code}`));
        }
    });
};

// Run FFMPEG Silently 2 [Repost, Gelbooru] by User
const runFfmpegSilently2 = async (args) => {
    return new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', args, {
            stdio: 'ignore',
            windowsHide: true
        });

        ffmpeg.on('error', (err) => {
            console.error('Failed to start ffmpeg:', err);
            reject(err);
        });

        ffmpeg.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`ffmpeg exited with code ${code}`));
            }
        });
    });
};

// GPTLimit by User
const checkgptlimit = (userId) => {
    if (!isPremium && !isOwner) {
        const userIndex = _gptlimit.findIndex(item => item.id === userId);
        if (userIndex === -1) {
            _gptlimit.push({ id: userId, gptlimit: gptlimitCount });
            fs.writeFileSync(gptlimitFile, JSON.stringify(_gptlimit));
        }
    }
};

// GPTLimit Update By User
const updategptlimit = (userId) => {
    if (!isPremium && !isOwner) {
        const userIndex = _gptlimit.findIndex(item => item.id === userId);
        
        if (userIndex !== -1) {
            _gptlimit[userIndex].gptlimit -= 1;
            
            if (_gptlimit[userIndex].gptlimit < 0) {
                _gptlimit[userIndex].gptlimit = 0;
            }
            
            fs.writeFileSync(gptlimitFile, JSON.stringify(_gptlimit));
        }
    }
};

// Create Serial Number by User
const createSerial = (length = 8) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};


// Gelbooru by User
async function gelbooruCommand(tags, from, id) {
    console.log('Gelbooru Tags:', tags);

    try {
        const result = await weeaboo.gelbooru(tags);
        
        if (result.post && result.post.length > 0) {
            const randomIndex = Math.floor(Math.random() * result.post.length);
            const imageUrl = result.post[randomIndex].file_url;
            const postUrl = `Gelbooru Post URL: https://gelbooru.com/index.php?page=post&s=view&id=${result.post[randomIndex].id}`;
            
            // Check the size of the media before sending it
            const imageBuffer = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const imageSize = imageBuffer.headers['content-length'];

            if (imageSize && parseInt(imageSize) <= 104857600) { // Maximum allowed file size of WhatsApp
                await bocchi.sendFileFromUrl(from, imageUrl, 'gelbooru_image.png', postUrl, id);
            } else {
                const tempVideoPath = `./temp/video/gelbooru_video_${createSerial()}.mp4`;
                await saveFile(imageBuffer.data, tempVideoPath);

                const compressedVideoPath = `./temp/video/compressed_gelbooru_video_${createSerial()}.mp4`;
                const ffmpegCommand = ['-i', tempVideoPath, '-vf', 'scale=-2:720', '-c:v', 'libx264', '-preset', 'slow', '-crf', '28', '-c:a', 'aac', '-b:a', '128k', compressedVideoPath];
                await runFfmpegSilently2(ffmpegCommand);

                // Check the size of the compressed media before sending it
                const compressedImageBuffer = await fs.promises.readFile(compressedVideoPath);
                const compressedImageSize = compressedImageBuffer.length;

                if (compressedImageSize && compressedImageSize <= 104857600) {
                    await bocchi.sendFile(from, compressedVideoPath, 'compressed_gelbooru_video.mp4', postUrl, id);
                } else {
                    await bocchi.reply(from, 'The file size is too large to send, even after compression!', id);
                }

                await Promise.all([
                    deleteFile(tempVideoPath),
                    deleteFile(compressedVideoPath)
                ]);
            }
        } else {
            await bocchi.reply(from, 'No files found for the specified tags.', id);
        }
    } catch (error) {
        console.error('Error fetching media from Gelbooru:', error);
        await bocchi.reply(from, 'An error has occurred! Please try again.', id);
    }
}


// Rule34 by User
async function rule34Command(tags, from, id) {
    console.log('Rule34 Tags:', tags);

    try {
        //await bocchi.reply(from, eng.wait(), id);

        const imageUrl = await weeaboo.rule34(tags);
        
		// Check the size of the media before sending it
        if (imageUrl) {
            const imageBuffer = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const imageSize = imageBuffer.headers['content-length'];
			
            if (imageSize && parseInt(imageSize) <= 104857600) { // Maximum allowed file size of WhatsApp
                await bocchi.sendFileFromUrl(from, imageUrl, 'rule34_image.png', '', id);
            } else {
                await bocchi.reply(from, 'The file size is too large to send!', id);
            }
        } else {
            await bocchi.reply(from, 'No files found for the specified tags.', id);
        }
    } catch (error) {
        console.error('Error fetching media from Rule34:', error);
        await bocchi.reply(from, 'An error has occurred! Please try again.', id);
    }
}

// Realbooru by User
async function realbooruCommand(tags, from, id) {
    console.log('Realbooru Tags:', tags);

    try {
        //await bocchi.reply(from, eng.wait(), id);

        const imageUrl = await weeaboo.realbooru(tags);
        
        if (imageUrl) {
            // Check if the image is actually a video by looking at its URL
            if (imageUrl.endsWith('.jpeg')) {
                // Replace .jpeg with .mp4 in the URL
                const videoUrlMP4 = imageUrl.replace('.jpeg', '.mp4');
                // Replace .jpeg with .webm in the URL
                const videoUrlWEBM = imageUrl.replace('.jpeg', '.webm');
                
                // Check if the video URL in MP4 format exists
                const responseMP4 = await axios.head(videoUrlMP4).catch(() => {});
                if (responseMP4 && responseMP4.status === 200) {
                    // Check the size of the media before sending it
                    const videoBuffer = await axios.get(videoUrlMP4, { responseType: 'arraybuffer' });
                    const videoSize = videoBuffer.headers['content-length'];
                    if (videoSize && parseInt(videoSize) <= 104857600) { // Maximum allowed file size of WhatsApp
                        // Send the video in MP4 format
                        await bocchi.sendFileFromUrl(from, videoUrlMP4, 'realbooru_video.mp4', '', id);
                        return;
                    } 
                } else {
                    // Check if the video URL in WEBM format exists
                    const responseWEBM = await axios.head(videoUrlWEBM).catch(() => {});
                    if (responseWEBM && responseWEBM.status === 200) {
                        // Check the size of the media before sending it
                        const videoBuffer = await axios.get(videoUrlWEBM, { responseType: 'arraybuffer' });
                        const videoSize = videoBuffer.headers['content-length'];
                        if (videoSize && parseInt(videoSize) <= 104857600) { // Maximum allowed file size of WhatsApp
                            // Send the video in WEBM format
                            await bocchi.sendFileFromUrl(from, videoUrlWEBM, 'realbooru_video.webm', '', id);
                            return;
                        } 
                    } 
                } 
            } 
            // Check the size of the image before sending it
            const imageBuffer = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const imageSize = imageBuffer.headers['content-length'];
            if (imageSize && parseInt(imageSize) <= 104857600) { // Maximum allowed file size of WhatsApp
                // Send the image
                await bocchi.sendFileFromUrl(from, imageUrl, 'realbooru_image.jpeg', '', id);
            } else {
                await bocchi.reply(from, 'The file size is too large to send!', id);
            }
        } else {
            await bocchi.reply(from, 'No files found for the specified tags.', id);
        }
    } catch (error) {
        console.error('Error fetching media from Realbooru:', error);
        await bocchi.reply(from, 'An error has occurred! Please try again.', id);
    }
}

        // Automate // Edited by User
        premium.expiredCheck(_premium)
        cron.schedule('0 */24 * * *', () => {
            const reset = []
            _limit = reset
			_gptlimit = reset
            console.log('Hang tight, it\'s time to reset usage limits...')
            fs.writeFileSync('./database/user/limit.json', JSON.stringify(_limit))
			fs.writeFileSync('./database/user/gptlimit.json', JSON.stringify(_gptlimit))
            console.log('Success!')
        }, {
            scheduled: true,
            timezone: 'Europe/Berlin'
        })

        // ROLE (Change to what you want, or add) and you can change the role sort based on XP.
        const levelRole = level.getLevelingLevel(sender.id, _level)
        var role = 'Copper V'
        if (levelRole >= 5) {
            role = 'Copper IV'
        }
        if (levelRole >= 10) {
            role = 'Copper III'
        }
        if (levelRole >= 15) {
            role = 'Copper II'
        }
        if (levelRole >= 20) {
            role = 'Copper I'
        }
        if (levelRole >= 25) {
            role = 'Silver V'
        }
        if (levelRole >= 30) {
            role = 'Silver IV'
        }
        if (levelRole >= 35) {
            role = 'Silver III'
        }
        if (levelRole >= 40) {
            role = 'Silver II'
        }
        if (levelRole >= 45) {
            role = 'Silver I'
        }
        if (levelRole >= 50) {
            role = 'Gold V'
        }
        if (levelRole >= 55) {
            role = 'Gold IV'
        }
        if (levelRole >= 60) {
            role = 'Gold III'
        }
        if (levelRole >= 65) {
            role = 'Gold II'
        }
        if (levelRole >= 70) {
            role = 'Gold I'
        }
        if (levelRole >= 75) {
            role = 'Platinum V'
        }
        if (levelRole >= 80) {
            role = 'Platinum IV'
        }
        if (levelRole >= 85) {
            role = 'Platinum III'
        }
        if (levelRole >= 90) {
            role = 'Platinum II'
        }
        if (levelRole >= 95) {
            role = 'Platinum I'
        }
        if (levelRole >= 100) {
            role = 'Exterminator'
        }
		
        // Leveling [BETA] by Slavyan
        if (isGroupMsg && isRegistered && !level.isGained(sender.id) && !isBanned && isLevelingOn) {
            try {
                //level.addCooldown(sender.id)
                const currentLevel = level.getLevelingLevel(sender.id, _level)
                const amountXp = Math.floor(Math.random() * (15 - 25 + 1) + 15)
                const requiredXp = 5 * Math.pow(currentLevel, 2) + 50 * currentLevel + 100
                level.addLevelingXp(sender.id, amountXp, _level)
                if (requiredXp <= level.getLevelingXp(sender.id, _level)) {
                    level.addLevelingLevel(sender.id, 1, _level)
                    const userLevel = level.getLevelingLevel(sender.id, _level)
                    const fetchXp = 5 * Math.pow(userLevel, 2) + 50 * userLevel + 100
                    await bocchi.reply(from, `*── 「 LEVEL UP 」 ──*\n\n➸ *Name*: ${pushname}\n➸ *XP*: ${level.getLevelingXp(sender.id, _level)} / ${fetchXp}\n➸ *Level*: ${currentLevel} -> ${level.getLevelingLevel(sender.id, _level)} 🆙 \n➸ *Role*: *${role}*`, id)
                }
            } catch (err) {
                console.error(err)
            }
        }

        // Levelingmedia [BETA] by User
		if (isGroupMsg && isRegistered && !level.isGained(sender.id) && !isBanned && _levelingmedia.includes(groupId) && (isMedia && (isImage || isVideo || isGif))) {
            try {
                //level.addCooldown(sender.id)
                const currentLevel = level.getLevelingLevel(sender.id, _level)
                const amountXp = Math.floor(Math.random() * (15 - 25 + 1) + 15)
                const requiredXp = 5 * Math.pow(currentLevel, 2) + 50 * currentLevel + 100
                level.addLevelingXp(sender.id, amountXp, _level)
                if (requiredXp <= level.getLevelingXp(sender.id, _level)) {
                    level.addLevelingLevel(sender.id, 1, _level)
                    const userLevel = level.getLevelingLevel(sender.id, _level)
                    const fetchXp = 5 * Math.pow(userLevel, 2) + 50 * userLevel + 100
                    await bocchi.reply(from, `*── 「 LEVEL UP 」 ──*\n\n➸ *Name*: ${pushname}\n➸ *XP*: ${level.getLevelingXp(sender.id, _level)} / ${fetchXp}\n➸ *Level*: ${currentLevel} -> ${level.getLevelingLevel(sender.id, _level)} 🆙 \n➸ *Role*: *${role}*`, id)
                }
            } catch (err) {
                console.error(err)
            }
        }

// Banned Checker by User
if (isGroupMsg && isBanned && isBotGroupAdmins && !isGroupAdmins && !isOwner) {
    console.log(color('[BAN]', 'red'), color('Banned user tried to join the group!', 'yellow'))
    await bocchi.reply(from, 'You are banned and not allowed to join this group!', id)
    await bocchi.removeParticipant(groupId, sender.id)
}

// Anti Large Files by User
if (isGroupMsg && !isGroupAdmins && isBotGroupAdmins && isMedia && !isCmd && message.size > 1073741824) { // 1GB = 1073741824 Bytes
    console.log(color('[LARGE FILE]', 'red'), color('Received a large file!', 'yellow'))
    await bocchi.sendTextWithMentions(from, `Large file detected! @${sender.id} was removed from the group!`)
	await bocchi.removeParticipant(groupId, sender.id)
	await bocchi.deleteMessage(id, false)
}

        // Anti group link detector // Edited by User
        if (isGroupMsg && !isGroupAdmins && isBotGroupAdmins && isDetectorOn && !isOwner) {
            if (chats && chats.match(new RegExp(/(https:\/\/chat.whatsapp.com)/gi))) {
                const valid = await bocchi.inviteInfo(chats)
                if (valid) {
                    console.log(color('[KICK]', 'red'), color('Received a group link and it is a valid link!', 'yellow'))
                    await bocchi.sendTextWithMentions(from, `*── 「 ANTI GROUP LINK 」 ──*\n\n@${sender.id} sent a group chat link! Sorry, but you have to leave...`)
                    await bocchi.removeParticipant(groupId, sender.id)
					await bocchi.deleteMessage(id, false)
                } else {
                    console.log(color('[WARN]', 'yellow'), color('Received a group link but it is not a valid link!', 'yellow'))
                }
            }
        }

        // Anti virtext by: @VideFrelan // Edited by User
        if (isGroupMsg && !isGroupAdmins && isBotGroupAdmins && !isCmd && !isOwner) {
            if (chats && chats.length >= 5000) {
                await bocchi.sendTextWithMentions(from, `Virtext detected! @${sender.id} was removed from the group!`)
                await bocchi.removeParticipant(groupId, sender.id)
				await bocchi.deleteMessage(id, false)
            }
        }

        // Anti fake group link detector by: Baguettou // Edited by User
        if (isGroupMsg && !isGroupAdmins && isBotGroupAdmins && isDetectorOn && !isOwner) {
            if (chats && chats.match(new RegExp(/(https:\/\/chat.(?!whatsapp.com))/gi))) {
                console.log(color('[KICK]', 'red'), color('Received a fake group link!', 'yellow'))
                await bocchi.reply(from, 'Fake group link detected!', id)
                await bocchi.removeParticipant(groupId, sender.id)
				await bocchi.deleteMessage(id, false)
            }
        }

        // Anti badwords // Edited by User
        if (isGroupMsg && isBotGroupAdmins && isAntiBadWords) {
            if (badwords.isProfane(chats)) {
                await bocchi.deleteMessage(id, false)
            }
        }

        // Anti NSFW link // Edited by User
        if (isGroupMsg && !isGroupAdmins && isBotGroupAdmins && isAntiNsfw && !isOwner) {
            if (isUrl(chats)) {
                const classify = new URL(isUrl(chats))
                console.log(color('[FILTER]', 'yellow'), 'Checking link:', classify.hostname)
                isPorn(classify.hostname, async (err, status) => {
                    if (err) return console.error(err)
                    if (status) {
                        console.log(color('[NSFW]', 'red'), color('The link is classified as NSFW!', 'yellow'))
                        await bocchi.reply(from, eng.linkNsfw(), id)
                        await bocchi.removeParticipant(groupId, sender.id)
						await bocchi.deleteMessage(id, false)
                    } else {
                        console.log(('[NEUTRAL]'), color('The link is safe!'))
                    }
                })
            }
        }

        // Auto sticker // Edited by User
        if (isGroupMsg && isAutoStickerOn && isMedia && isImage && !isCmd) {
            const mediaData = await decryptMedia(message)
            const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
            await bocchi.sendImageAsSticker(from, imageBase64, { author: authorWm, pack: packWm, keepScale: true })
            console.log(`Sticker processed for ${processTime(t, moment())} seconds`)
        }

        // Auto sticker video // Edited by User
        if (isGroupMsg && isAutoStickerOn && isMedia && isVideo && !isCmd) {
            const mediaData = await decryptMedia(message)
            const videoBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
            await bocchi.sendMp4AsSticker(from, videoBase64, { stickerMetadata: true, pack: packWm, author: authorWm, fps: 30, startTime: '00:00:00.0', endTime: '00:00:05.0', crop: true, loop: 0 })
            console.log(`Sticker processed for ${processTime(t, moment())} seconds`)
        }

        // AFK by Slavyan
        if (isGroupMsg) {
            for (let ment of mentionedJidList) {
                if (afk.checkAfkUser(ment, _afk)) {
                    const getId = afk.getAfkId(ment, _afk)
                    const getReason = afk.getAfkReason(getId, _afk)
                    const getTime = afk.getAfkTime(getId, _afk)
                    await bocchi.reply(from, eng.afkMentioned(getReason, getTime), id)
                }
            }
            if (afk.checkAfkUser(sender.id, _afk) && !isCmd) {
                _afk.splice(afk.getAfkPosition(sender.id, _afk), 1)
                fs.writeFileSync('./database/user/afk.json', JSON.stringify(_afk))
                await bocchi.sendText(from, eng.afkDone(pushname))
            }
        }

        // Mute
        if (isCmd && isMute && !isGroupAdmins && !isOwner && !isPremium) return

        // Ignore banned and blocked users
        if (isCmd && (isBanned || isBlocked) && !isGroupMsg) return console.log(color('[BAN]', 'red'), color(time, 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname))
        if (isCmd && (isBanned || isBlocked) && isGroupMsg) return console.log(color('[BAN]', 'red'), color(time, 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle))

        // Anti spam
        if (isCmd && msgFilter.isFiltered(from) && !isGroupMsg) return console.log(color('[SPAM]', 'red'), color(time, 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname))
        if (isCmd && msgFilter.isFiltered(from) && isGroupMsg) return console.log(color('[SPAM]', 'red'), color(time, 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle))

        // Log
        if (isCmd && !isGroupMsg) {
            console.log(color('[CMD]'), color(time, 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname))
            await bocchi.sendSeen(from)
        }
        if (isCmd && isGroupMsg) {
            console.log(color('[CMD]'), color(time, 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle))
            await bocchi.sendSeen(from)
        }

        // Anti spam
        if (isCmd && !isPremium && !isOwner) msgFilter.addFilter(from)

        switch (command) {	
            // Register by Slavyan
            case 'register':
                if (isGroupMsg) return await bocchi.reply(from, eng.pcOnly(), id)
                if (isRegistered) return await bocchi.reply(from, eng.registeredAlready(), id)
                if (!q) return await bocchi.reply(from, eng.wrongFormat(), id)
                const serialUser = createSerial(20)
                register.addRegisteredUser(sender.id, q, time, serialUser, _registered)
                await bocchi.reply(from, eng.registered(q, sender.id, time, serialUser), id)
                console.log(color('[REGISTER]'), color(time, 'yellow'), 'Name:', color(q, 'cyan'), 'Serial:', color(serialUser, 'cyan'))
                break
            case 'unregister':
            case 'unreg':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                _registered.splice(register.getRegisteredPosition(sender.id, _registered), 1)
                fs.writeFileSync('./database/bot/registered.json', JSON.stringify(_registered))
                await bocchi.reply(from, eng.unreg(), id)
                break

            // Level [BETA] by Slavyan // Edited by User
            case 'level':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                //if (!isLevelingOn) return await bocchi.reply(from, eng.levelingNotOn(), id)
                //if (!isGroupMsg) return await bocchi.reply(from, eng.groupOnly(), id)
                const userLevel = level.getLevelingLevel(sender.id, _level)
                const userXp = level.getLevelingXp(sender.id, _level)
                const ppLink = await bocchi.getProfilePicFromServer(sender.id)
                if (ppLink === undefined) {
                    var pepe = errorImg
                } else {
                    pepe = ppLink
                }
                const requiredXp = 5 * Math.pow(userLevel, 2) + 50 * userLevel + 100
                const rank = new canvas.Rank()
                    .setAvatar(pepe)
                    .setLevel(userLevel)
                    .setLevelColor('#ffa200', '#ffa200')
                    .setRank(Number(level.getUserRank(sender.id, _level)))
                    .setCurrentXP(userXp)
                    .setOverlay('#000000', 100, false)
                    .setRequiredXP(requiredXp)
                    .setProgressBar('#ffa200', 'COLOR')
                    .setBackground('COLOR', '#000000')
                    .setUsername(pushname)
                    .setDiscriminator(sender.id.substring(6, 10))
                rank.build()
                    .then(async (buffer) => {
                        const imageBase64 = `data:image/png;base64,${buffer.toString('base64')}`
                        await bocchi.sendImage(from, imageBase64, 'rank.png', '', id)
                    })
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, 'Error!', id)
                    })
                break
            case 'leaderboard':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (!isLevelingOn) return await bocchi.reply(from, eng.levelingNotOn(), id)
                if (!isGroupMsg) return await bocchi.reply(from.eng.groupOnly(), id)
                const resp = _level
                _level.sort((a, b) => (a.xp < b.xp) ? 1 : -1)
                let leaderboard = '*── 「 LEADERBOARDS 」 ──*\n\n'
                try {
                    for (let i = 0; i < 10; i++) {
                        var roles = 'Copper V'
                        if (resp[i].level >= 5) {
                            roles = 'Copper IV'
                        }
                        if (resp[i].level >= 10) {
                            roles = 'Copper III'
                        }
                        if (resp[i].level >= 15) {
                            roles = 'Copper II'
                        }
                        if (resp[i].level >= 20) {
                            roles = 'Copper I'
                        }
                        if (resp[i].level >= 25) {
                            roles = 'Silver V'
                        }
                        if (resp[i].level >= 30) {
                            roles = 'Silver IV'
                        }
                        if (resp[i].level >= 35) {
                            roles = 'Silver III'
                        }
                        if (resp[i].level >= 40) {
                            roles = 'Silver II'
                        }
                        if (resp[i].level >= 45) {
                            roles = 'Silver I'
                        }
                        if (resp[i].level >= 50) {
                            roles = 'Gold V'
                        }
                        if (resp[i].level >= 55) {
                            roles = 'Gold IV'
                        }
                        if (resp[i].level >= 60) {
                            roles = 'Gold III'
                        }
                        if (resp[i].level >= 65) {
                            roles = 'Gold II'
                        }
                        if (resp[i].level >= 70) {
                            roles = 'Gold I'
                        }
                        if (resp[i].level >= 75) {
                            roles = 'Platinum V'
                        }
                        if (resp[i].level >= 80) {
                            roles = 'Platinum IV'
                        }
                        if (resp[i].level >= 85) {
                            roles = 'Platinum III'
                        }
                        if (resp[i].level >= 90) {
                            roles = 'Platinum II'
                        }
                        if (resp[i].level >= 95) {
                            roles = 'Platinum I'
                        }
                        if (resp[i].level > 100) {
                            roles = 'Exterminator'
                        }
                        leaderboard += `${i + 1}. wa.me/${_level[i].id.replace('@c.us', '')}\n➸ *XP*: ${_level[i].xp} *Level*: ${_level[i].level}\n➸ *Role*: ${roles}\n\n`
                    }
                    await bocchi.reply(from, leaderboard, id)
                } catch (err) {
                    console.error(err)
                    await bocchi.reply(from, eng.minimalDb(), id)
                }
                break

            // Misc
            // OpenAI API Implementation by: VideFrelan // Edited by User
case 'ai':
case 'gpt':
    if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
    if (config.openAiKey == 'api-key') return await bocchi.reply(from, 'Invalid OpenAi Apikey. Please get your ApiKey at: https://platform.openai.com/account/api-keys', id)
    if (!q) return await bocchi.reply(from, eng.wrongFormat(), id)
	if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
	limit.addLimit(sender.id, _limit, isPremium, isOwner)
	
	//if (!isPremium) return await bocchi.reply(from, eng.notPremium(), id)
	
    checkgptlimit(sender.id);
    userIndex = _gptlimit.findIndex(item => item.id === sender.id);
	if (userIndex !== -1 && _gptlimit[userIndex].gptlimit <= 0 && !isPremium && !isOwner) {
		return await bocchi.reply(from, eng.gptlimit(), id);
	}

    try {
        const configuration = new Configuration({ apiKey: config.openAiKey });
        const openai = new OpenAIApi(configuration);
        const completion = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: q }],
        });
        await bocchi.reply(from, completion.data.choices[0].message.content, id);

        updategptlimit(sender.id);
    } catch (err) {
        console.error(err);
        await bocchi.reply(from, `Error: ${err.message}`, id);
    }
    break;
	
// OpenAI API ChatGPT 3.5 ZORG Jailbreak by User
case 'zorg':
    if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
    if (config.openAiKey == 'api-key') return await bocchi.reply(from, 'Invalid OpenAi Apikey. Please get your ApiKey at: https://platform.openai.com/account/api-keys', id)
    if (!q) return await bocchi.reply(from, eng.wrongFormat(), id)
    if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
    limit.addLimit(sender.id, _limit, isPremium, isOwner)

    checkgptlimit(sender.id);
    userIndex = _gptlimit.findIndex(item => item.id === sender.id);
    if (userIndex !== -1 && _gptlimit[userIndex].gptlimit <= 0 && !isPremium && !isOwner) {
        return await bocchi.reply(from, eng.gptlimit(), id);
    }

    try {
        const configuration = new Configuration({ apiKey: config.openAiKey });
        const openai = new OpenAIApi(configuration);
        const gptPrefix = gptprefix.gptPrefix || '';
        const prompt = `${gptPrefix}${q}`;
        const completion = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
        });
        await bocchi.reply(from, completion.data.choices[0].message.content, id);

        updategptlimit(sender.id);
    } catch (err) {
        console.error(err);
        await bocchi.reply(from, `Error: ${err.message}`, id);
    }
    break;

case 'image':
case 'img':
    if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
    if (config.openAiKey == 'api-key') return await bocchi.reply(from, 'Invalid OpenAi Apikey. Please get your ApiKey at: https://platform.openai.com/account/api-keys', id)
    if (!q) return await bocchi.reply(from, eng.wrongFormat(), id)
	if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
	limit.addLimit(sender.id, _limit, isPremium, isOwner)
	
	if (!isPremium) return await bocchi.reply(from, eng.notPremium(), id)

    checkgptlimit(sender.id);
    userIndex = _gptlimit.findIndex(item => item.id === sender.id);
	if (userIndex !== -1 && _gptlimit[userIndex].gptlimit <= 0 && !isPremium && !isOwner) {
		return await bocchi.reply(from, eng.gptlimit(), id);
	}

    try {
        const configuration = new Configuration({ apiKey: config.openAiKey });
        const openai = new OpenAIApi(configuration);
        const completion = await openai.createImage({
            prompt: q,
            n: 1,
            size: '1024x1024',
        });
        await bocchi.sendFileFromUrl(from, completion.data.data[0].url, 'image.jpg', null, id);

        updategptlimit(sender.id);
    } catch (err) {
        console.error(err);
        await bocchi.reply(from, `Error: ${err.message}`, id);
    }
    break;
	
// GptLimit Reset by User
case 'gptreset':
case 'gptres':
    if (!isOwner) return await bocchi.reply(from, eng.ownerOnly(), id);
    if (args.length === 0) {
        await bocchi.reply(from, eng.wrongFormat(), id);
    } else {
        if (args[0] === 'all') {
            _gptlimit.forEach(user => user.gptlimit = 20);
            fs.writeFileSync(gptlimitFile, JSON.stringify(_gptlimit));
            await bocchi.reply(from, eng.gptlimitResetAll(), id);
        } else if (mentionedJidList.length !== 0) {
            mentionedJidList.forEach(user => {
                const userId = user.endsWith('@c.us') ? user : `${user}@c.us`;
                const userLimitIndex = _gptlimit.findIndex(item => item.id === userId);
                if (userLimitIndex !== -1) {
                    _gptlimit[userLimitIndex].gptlimit = 20;
                }
            });
            fs.writeFileSync(gptlimitFile, JSON.stringify(_gptlimit));
            await bocchi.reply(from, eng.gptlimitReset(), id);
        } else if (args[0].length === 15 || args[0].match(/^\d{11,15}$/)) {
            const userId = `${args[0]}@c.us`;
            const userLimitIndex = _gptlimit.findIndex(item => item.id === userId);
            if (userLimitIndex !== -1) {
                _gptlimit[userLimitIndex].gptlimit = 20;
                fs.writeFileSync(gptlimitFile, JSON.stringify(_gptlimit));
                await bocchi.reply(from, eng.gptlimitReset(), id);
            } else {
                await bocchi.reply(from, eng.userNotFound(), id);
            }
        } else {
            await bocchi.reply(from, eng.wrongFormat(), id);
        }
    }
    break;

// Limit Reset by User
case 'limitreset':
case 'limitres':
    if (!isOwner) return await bocchi.reply(from, eng.ownerOnly(), id);
    if (args.length === 0) {
        await bocchi.reply(from, eng.wrongFormat(), id);
    } else {
        if (args[0] === 'all') {
            _limit.forEach(user => user.limit = 25);
            fs.writeFileSync(limitFile, JSON.stringify(_limit));
            await bocchi.reply(from, eng.limitResetAll(), id);
        } else if (mentionedJidList.length !== 0) {
            mentionedJidList.forEach(user => {
                const userId = user.endsWith('@c.us') ? user : `${user}@c.us`;
                const userLimitIndex = _limit.findIndex(item => item.id === userId);
                if (userLimitIndex !== -1) {
                    _limit[userLimitIndex].limit = 25;
                }
            });
            fs.writeFileSync(limitFile, JSON.stringify(_limit));
            await bocchi.reply(from, eng.limitReset(), id);
        } else if (args[0].length === 15 || args[0].match(/^\d{11,15}$/)) {
            const userId = `${args[0]}@c.us`;
            const userLimitIndex = _limit.findIndex(item => item.id === userId);
            if (userLimitIndex !== -1) {
                _limit[userLimitIndex].limit = 25;
                fs.writeFileSync(limitFile, JSON.stringify(_limit));
                await bocchi.reply(from, eng.limitReset(), id);
            } else {
                await bocchi.reply(from, eng.userNotFound(), id);
            }
        } else {
            await bocchi.reply(from, eng.wrongFormat(), id);
        }
    }
    break;

            case 'google': // chika-chantekkzz
            case 'googlesearch':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (!q) return await bocchi.reply(from, eng.wrongFormat(), id)
                if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                limit.addLimit(sender.id, _limit, isPremium, isOwner)
                await bocchi.reply(from, eng.wait(), id)
                google({ 'query': q, 'no-display': true })
                    .then(async (results) => {
                        let txt = `*── 「 GOOGLE SEARCH 」 ──\n\n_*Search results for: ${q}*_`
                        for (let i = 0; i < results.length; i++) {
                            txt += `\n\n➸ *Title*: ${results[i].title}\n➸ *Desc*: ${results[i].snippet}\n➸ *Link*: ${results[i].link}\n\n=_=_=_=_=_=_=_=_=_=_=_=_=`
                        }
                        await bocchi.reply(from, txt, id)
                    })
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, 'Error!', id)
                    })
                break;
            //case 'say':
                //if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                //if (!q) return await bocchi.reply(from, eng.wrongFormat(), id)
                //if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                //limit.addLimit(sender.id, _limit, isPremium, isOwner)
                //await bocchi.sendText(from, q)
                //break
            case 'afk': // by Slavyan // Edited by User
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (!isGroupMsg) return await bocchi.reply(from, eng.groupOnly(), id)
                if (isAfkOn) return await bocchi.reply(from, eng.afkOnAlready(), id)
                //if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                //limit.addLimit(sender.id, _limit, isPremium, isOwner)
                const reason = q ? q : 'Nothing.'
                afk.addAfkUser(sender.id, time, reason, _afk)
                await bocchi.reply(from, eng.afkOn(pushname, reason), id)
                break;
            case 'tts':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (!q) return await bocchi.reply(from, eng.wrongFormat(), id)
                if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                limit.addLimit(sender.id, _limit, isPremium, isOwner)
                const speech = q.substring(q.indexOf('|') + 2)
                const ptt = tts(ar[0])
                try {
                    ptt.save(`temp/${speech}.mp3`, speech, async () => {
                        await bocchi.sendPtt(from, `temp/${speech}.mp3`, id)
                        fs.unlinkSync(`temp/${speech}.mp3`)
                    })
                } catch (err) {
                    console.error(err)
                    await bocchi.reply(from, 'Error!', id)
                }
                break;
    case 'tomp3': // by Piyobot // Edited by User
        if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id);
        if (isMedia && isVideo || isQuotedVideo) {
            if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id);
            limit.addLimit(sender.id, _limit, isPremium, isOwner);
            await bocchi.reply(from, eng.wait(), id);
            const encryptMedia = isQuotedVideo ? quotedMsg : message;
            const _mimetype = isQuotedVideo ? quotedMsg.mimetype : mimetype;
            console.log(color('[WAPI]', 'green'), 'Downloading and decrypting media...');
            const mediaData = await decryptMedia(encryptMedia);
            const temp = './temp';
            const name = new Date() * 1;
            const fileInputPath = path.join(temp, 'video', `${name}.${_mimetype.replace(/.+\//, '')}`);
            const fileOutputPath = path.join(temp, 'audio', `${name}.mp3`);
            fs.writeFile(fileInputPath, mediaData, (err) => {
                if (err) return console.error(err);
                const args = [
                    '-i', fileInputPath,
                    '-q:a', '0',
                    '-map', 'a',
                    fileOutputPath
                ];
                runFfmpegSilently(args, async (err) => {
                    if (err) return console.error(err);
                    console.log(color('[FFmpeg]', 'green'), 'Processing finished!');
                    await bocchi.sendFile(from, fileOutputPath, 'audio.mp3', '', id);
                    console.log(color('[WAPI]', 'green'), 'Success sending mp3!');
                    setTimeout(() => {
                        fs.unlinkSync(fileInputPath);
                        fs.unlinkSync(fileOutputPath);
                    }, 30000);
                });
            });
        } else {
            await bocchi.reply(from, eng.wrongFormat(), id);
        }
        break;
			case 'toptt':
            case 'ptt':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (isMedia && isAudio || isQuotedAudio) {
                    if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                    limit.addLimit(sender.id, _limit, isPremium, isOwner)
                    await bocchi.reply(from, eng.wait(), id)
                    const encryptMedia = isQuotedAudio ? quotedMsg : message
                    const mediaData = await decryptMedia(encryptMedia)
                    const name = new Date() * 1
                    fs.writeFileSync(`./temp/audio/${name}.mp3`, mediaData)
                    await bocchi.sendPtt(from, `./temp/audio/${name}.mp3`, id)
                    fs.unlinkSync(`./temp/audio/${name}.mp3`)
                } else {
                    await bocchi.reply(from, eng.wrongFormat(), id)
                }
                break;
			// Math Edited by User
            case 'math':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (!q) return await bocchi.reply(from, eng.wrongFormat(), id)
                if (typeof mathjs.evaluate(q) !== 'number') {
                    await bocchi.reply(from, eng.notNum(q), id)
                } else {
                    //if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                    //limit.addLimit(sender.id, _limit, isPremium, isOwner)
                    await bocchi.reply(from, `*── 「 MATH 」 ──*\n\n${q} = ${mathjs.evaluate(q)}`, id)
                }
                break;
            case 'reminder': // by Slavyan // Edited by User
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (!q.includes('|')) return await bocchi.reply(from, eng.wrongFormat(), id)
                //if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                //limit.addLimit(sender.id, _limit, isPremium, isOwner)
                const timeRemind = q.substring(0, q.indexOf('|') - 1)
                const messRemind = q.substring(q.lastIndexOf('|') + 2)
                const parsedTime = ms(toMs(timeRemind))
                reminder.addReminder(sender.id, messRemind, timeRemind, _reminder)
                await bocchi.sendTextWithMentions(from, eng.reminderOn(messRemind, parsedTime, sender))
                const intervRemind = setInterval(async () => {
                    if (Date.now() >= reminder.getReminderTime(sender.id, _reminder)) {
                        await bocchi.sendTextWithMentions(from, eng.reminderAlert(reminder.getReminderMsg(sender.id, _reminder), sender))
                        _reminder.splice(reminder.getReminderPosition(sender.id, _reminder), 1)
                        fs.writeFileSync('./database/user/reminder.json', JSON.stringify(_reminder))
                        clearInterval(intervRemind)
                    }
                }, 1000)
                break;
            case 'imagetourl':
            case 'imgtourl':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (isMedia && isImage || isQuotedImage) {
                    if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                    limit.addLimit(sender.id, _limit, isPremium, isOwner)
                    await bocchi.reply(from, eng.wait(), id)
                    const encryptMedia = isQuotedImage ? quotedMsg : message
                    const mediaData = await decryptMedia(encryptMedia)
                    const linkImg = await uploadImages(mediaData, `${sender.id}_img`)
                    await bocchi.reply(from, linkImg, id)
                } else {
                    await bocchi.reply(from, eng.wrongFormat(), id)
                }
                break;
// Edited by User
    case 'bass':
        if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id);
        if (isMedia && isAudio || isQuotedAudio || isVoice || isQuotedVoice) {
            if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id);
            limit.addLimit(sender.id, _limit, isPremium, isOwner);
            const encryptMedia = isQuotedAudio || isQuotedVoice ? quotedMsg : message;
            console.log(color('[WAPI]', 'green'), 'Downloading and decrypting media...');
            const mediaData = await decryptMedia(encryptMedia);
            const temp = './temp';
            const name = new Date() * 1;
            const fileInputPath = path.join(temp, `${name}.mp3`);
            const fileOutputPath = path.join(temp, 'audio', `${name}.mp3`);
            fs.writeFile(fileInputPath, mediaData, (err) => {
                if (err) return console.error(err);
                const bassLevel = '100';
                const args = [
                    '-i', fileInputPath,
                    '-af', `equalizer=f=40:width_type=h:width=50:g=${bassLevel}`,
                    fileOutputPath
                ];
                runFfmpegSilently(args, async (err) => {
                    if (err) return console.error(err);
                    console.log(color('[FFmpeg]', 'green'), 'Processing finished!');
                    await bocchi.sendPtt(from, fileOutputPath, id);
                    console.log(color('[WAPI]', 'green'), 'Success sending audio!');
                    setTimeout(() => {
                        fs.unlinkSync(fileInputPath);
                        fs.unlinkSync(fileOutputPath);
                    }, 30000);
                });
            });
        } else {
            await bocchi.reply(from, eng.wrongFormat(), id);
        }
        break;
	// Edited by User
    case 'nightcore':
        if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id);
        if (isMedia && isAudio || isQuotedAudio || isVoice || isQuotedVoice) {
            if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id);
            limit.addLimit(sender.id, _limit, isPremium, isOwner);
            await bocchi.reply(from, eng.wait(), id);
            const encryptMedia = isQuotedAudio || isQuotedVoice ? quotedMsg : message;
            console.log(color('[WAPI]', 'green'), 'Downloading and decrypting media...');
            const mediaData = await decryptMedia(encryptMedia);
            const temp = './temp';
            const name = new Date() * 1;
            const fileInputPath = path.join(temp, `${name}.mp3`);
            const fileOutputPath = path.join(temp, 'audio', `${name}.mp3`);
            fs.writeFile(fileInputPath, mediaData, (err) => {
                if (err) return console.error(err);
                const args = [
                    '-i', fileInputPath,
                    '-af', 'asetrate=44100*1.25,aresample=44100,atempo=1.25',
                    fileOutputPath
                ];
                runFfmpegSilently(args, async (err) => {
                    if (err) return console.error(err);
                    console.log(color('[FFmpeg]', 'green'), 'Processing finished!');
                    await bocchi.sendPtt(from, fileOutputPath, id);
                    console.log(color('[WAPI]', 'green'), 'Success sending audio!');
                    setTimeout(() => {
                        fs.unlinkSync(fileInputPath);
                        fs.unlinkSync(fileOutputPath);
                    }, 30000);
                });
            });
        } else {
            await bocchi.reply(from, eng.wrongFormat(), id);
        }
        break;

            // Bot
case 'menu':
case 'help':
case 'menü':
    const registeredUsers = _registered.length;
    const levelMenu = level.getLevelingLevel(sender.id, _level);
    const xpMenu = level.getLevelingXp(sender.id, _level);
    const reqXpMenu = 5 * Math.pow(levelMenu, 2) + 50 * 1 + 100;
    if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id);
    switch (args[0]) {
        case '1':
        case 'Bot':
        case 'bot':
            await bocchi.sendText(from, eng.menuBot());
            break;
        case '2':
        case 'Misc':
        case 'misc':
            await bocchi.sendText(from, eng.menuMisc());
            break;
        case '3':
        case 'Sticker':
        case 'sticker':
            await bocchi.sendText(from, eng.menuSticker());
            break;
        case '4':
        case 'Weeaboo':
        case 'weeaboo':
            await bocchi.sendText(from, eng.menuWeeaboo());
            break;
        case '5':
        case 'Fun':
        case 'fun':
            await bocchi.sendText(from, eng.menuFun());
            break;
        case '6':
        case 'Moderation':
        case 'moderation':
            await bocchi.sendText(from, eng.menuModeration());
            break;
        case '7':
        case 'Owner':
        case 'owner':
            if (!isOwner) return await bocchi.reply(from, eng.ownerOnly());
            await bocchi.sendText(from, eng.menuOwner());
            break;
        case '8':
        case 'Leveling':
        case 'leveling':
            if (!isGroupMsg) return await bocchi.reply(from, eng.groupOnly(), id);
            await bocchi.sendText(from, eng.menuLeveling());
            break;
        case '9':
        case 'AI':
        case 'ai':
            await bocchi.sendText(from, eng.menuAi());
            break;
        case '10':
        case 'NSFW':
        case 'nsfw':
            await bocchi.sendText(from, eng.menuNsfw());
            break;
        default:
            await bocchi.sendText(from, eng.menu(registeredUsers, levelMenu, xpMenu, role, pushname, reqXpMenu, isPremium ? 'YES' : 'NO'));
    }
    break;
            case 'rules':
            case 'rule':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                await bocchi.sendText(from, eng.rules())
                break;
            case 'status':
            case 'stats':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
				if (!isOwner) return await bocchi.reply(from, eng.ownerOnly(), id)
                await bocchi.sendText(from, `*RAM*: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB / ${Math.round(os.totalmem / 1024 / 1024)} MB\n*CPU*: ${os.cpus()[0].model}`)
                break;
            case 'listblock':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                let block = eng.listBlock(blockNumber)
                for (let i of blockNumber) {
                    block += `@${i.replace('@c.us', '')}\n`
                }
                await bocchi.sendTextWithMentions(from, block)
                break;
            case 'ownerbot':
			case 'owner':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                await bocchi.sendContact(from, ownerNumber)
                break;
            case 'runtime': // BY HAFIZH
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                const formater = (seconds) => {
                    const pad = (s) => {
                        return (s < 10 ? '0' : '') + s
                    }
                    const hrs = Math.floor(seconds / (60 * 60))
                    const mins = Math.floor(seconds % (60 * 60) / 60)
                    const secs = Math.floor(seconds % 60)
                    return ' ' + pad(hrs) + ':' + pad(mins) + ':' + pad(secs)
                }
                const uptime = process.uptime()
                await bocchi.reply(from, `*── 「 BOT UPTIME 」 ──*\n\n❏${formater(uptime)}`, id)
                break;
            case 'ping':
            case 'p':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                await bocchi.sendText(from, `Pong!\nSpeed: ${processTime(t, moment())} ms`)
                break;
            case 'delete':
            case 'del':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (!quotedMsg) return await bocchi.reply(from, eng.wrongFormat(), id)
                if (isGroupMsg) {
                    if (!isBotGroupAdmins) return await bocchi.reply(from, eng.botNotAdmin(), id)
                    if (isGroupAdmins) {
                        await bocchi.deleteMessage(quotedMsgObj.chatId, quotedMsgObj.id, false)
                    } else {
                        if (!quotedMsgObj.fromMe) return await bocchi.reply(from, eng.wrongFormat(), id)
                        await bocchi.deleteMessage(quotedMsgObj.chatId, quotedMsgObj.id, false)
                    }
                } else {
                    if (!quotedMsgObj.fromMe) return await bocchi.reply(from, eng.wrongFormat(), id)
                    await bocchi.deleteMessage(quotedMsgObj.chatId, quotedMsgObj.id, false)
                }
                break;
			 // Report Edited by User
            case 'report':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (!q) return await bocchi.reply(from, eng.emptyMess(), id)
                //if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                //limit.addLimit(sender.id, _limit, isPremium, isOwner)
                const lastReport = daily.getLimit(sender.id, _daily)
                if (lastReport !== undefined && cd - (Date.now() - lastReport) > 0) {
                    const time = ms(cd - (Date.now() - lastReport))
                    await bocchi.reply(from, eng.daily(time), id)
                } else {
                    if (isGroupMsg) {
                        await bocchi.sendText(ownerNumber, `*── 「 REPORT 」 ──*\n\n*From*: ${pushname}\n*ID*: ${sender.id}\n*Group*: ${(name || formattedTitle)}\n*Message*: ${q}`)
                        await bocchi.reply(from, eng.received(pushname), id)
                    } else {
                        await bocchi.sendText(ownerNumber, `*── 「 REPORT 」 ──*\n\n*From*: ${pushname}\n*ID*: ${sender.id}\n*Message*: ${q}`)
                        await bocchi.reply(from, eng.received(pushname), id)
                    }
                    daily.addLimit(sender.id, _daily)
                }
                break;
            case 'tos':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                await bocchi.sendLinkWithAutoPreview(from, 'https://github.com/SlavyanDesu/BocchiBot', eng.tos(ownerNumber))
                break;
            case 'join':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (!isUrl(url) && !url.includes('chat.whatsapp.com')) return await bocchi.reply(from, eng.wrongFormat(), id)
                const checkInvite = await bocchi.inviteInfo(url)
                if (isOwner) {
                    await bocchi.joinGroupViaLink(url)
                    await bocchi.reply(from, eng.ok(), id)
                    await bocchi.sendText(checkInvite.id, `Hello! I was invited by ${pushname}`)
                } else {
                    const getGroupData = await bocchi.getAllGroups()
                    if (getGroupData.length >= groupLimit) {
                        await bocchi.reply(from, `Invite refused. Max group is: ${groupLimit}`, id)
                    } else if (getGroupData.size <= memberLimit) {
                        await bocchi.reply(from, `Invite refused. Minimum member is: ${memberLimit}`, id)
                    } else {
                        if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                        limit.addLimit(sender.id, _limit, isPremium, isOwner)
                        await bocchi.joinGroupViaLink(url)
                        await bocchi.reply(from, eng.ok(), id)
                        await bocchi.sendText(checkInvite.id, `Hello! I was invited by ${pushname}`)
                    }
                }
                break;
            case 'premiumcheck':
            case 'checkpremium':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (!isPremium) return await bocchi.reply(from, eng.notPremium(), id)
                const cekExp = ms(premium.getPremiumExpired(sender.id, _premium) - Date.now())
                await bocchi.reply(from, `*── 「 PREMIUM EXPIRED 」 ──*\n\n➸ *ID*: ${sender.id}\n➸ *Premium left*: ${cekExp.days} day(s) ${cekExp.hours} hour(s) ${cekExp.minutes} minute(s)`, id)
                break;
			// Edited by User
            case 'premiumlist':
            case 'listpremium':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                //if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                //limit.addLimit(sender.id, _limit, isPremium, isOwner)
                let listPremi = '*── 「 PREMIUM USERS 」 ──*\n\n'
                const deret = premium.getAllPremiumUser(_premium)
                const arrayPremi = []
                for (let i = 0; i < deret.length; i++) {
                    const checkExp = ms(premium.getPremiumExpired(deret[i], _premium) - Date.now())
                    arrayPremi.push(await bocchi.getContact(premium.getAllPremiumUser(_premium)[i]))
                    listPremi += `${i + 1}. wa.me/${premium.getAllPremiumUser(_premium)[i].replace('@c.us', '')}\n➸ *Name*: ${arrayPremi[i].pushname}\n➸ *Expired*: ${checkExp.days} day(s) ${checkExp.hours} hour(s) ${checkExp.minutes} minute(s)\n\n`
                }
                await bocchi.reply(from, listPremi, id)
                break;
// Getpic Edited by User
case 'getpic':
    if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
    if (mentionedJidList.length !== 0 || args.length !== 0) {
        const targetJid = mentionedJidList[0] || args[0] + '@c.us'
        const userPic = await bocchi.getProfilePicFromServer(targetJid).catch(() => undefined)
        //if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
        //limit.addLimit(sender.id, _limit, isPremium, isOwner)
        const picToSend = userPic || errorImg
        await bocchi.sendFileFromUrl(from, picToSend, 'pic.jpg', '', id)
    } else {
        await bocchi.reply(from, eng.wrongFormat(), id)
    }
    break;
            case 'serial':
                if (!isRegistered) return await bocchi.reply(from, eng.registered(), id)
                if (isGroupMsg) return await bocchi.reply(from, eng.pcOnly(), id)
                if (args.length !== 1) return await bocchi.reply(from, eng.wrongFormat(), id)
                const serials = args[0]
                if (register.checkRegisteredUserFromSerial(serials, _registered)) {
                    const name = register.getRegisteredNameFromSerial(serials, _registered)
                    const time = register.getRegisteredTimeFromSerial(serials, _registered)
                    const id = register.getRegisteredIdFromSerial(serials, _registered)
                    await bocchi.sendText(from, eng.registeredFound(name, time, serials, id))
                } else {
                    await bocchi.sendText(from, eng.registeredNotFound(serials))
                }
                break;
			// Edited by User
            case 'limit':
                if (isPremium || isOwner) return await bocchi.reply(from, '⤞ Limit left: ∞ (UNLIMITED)', id)
                await bocchi.reply(from, `⤞ Limit left: ${limit.getLimit(sender.id, _limit, limitCount)} / 25\n\n*_Limits are reset at 12:00 AM (Europe/Berlin)_*`, id)
                break;
			// GPT Limit by User
            case 'gptlimit':
                if (isPremium || isOwner) return await bocchi.reply(from, '⤞ GPT Limit left: ∞ (UNLIMITED)', id)
                await bocchi.reply(from, `⤞ GPT Limit left: ${limit.getLimit(sender.id, _gptlimit, gptlimitCount)} / 20\n\n*_GPT Limits are reset at 12:00 AM (Europe/Berlin_*`, id)
                break;
				
            // Weeb zone
            case 'neko':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                limit.addLimit(sender.id, _limit, isPremium, isOwner)
                //await bocchi.reply(from, eng.wait(), id)
                console.log('Get neko image...')
                await bocchi.sendFileFromUrl(from, (await neko.neko()).url, 'neko.jpg', '', null, null, true)
                    .then(() => console.log('Success sending neko image!'))
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, 'Error!', id)
                    })
                break;
            case 'wallpaper':
            case 'wp':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                limit.addLimit(sender.id, _limit, isPremium, isOwner)
                //await bocchi.reply(from, eng.wait(), id)
                console.log('Get wallpaper image...')
                await bocchi.sendFileFromUrl(from, (await neko.wallpaper()).url, 'wallpaper.jpg', '', null, null, true)
                    .then(() => console.log('Success sending wallpaper image!'))
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, 'Error!', id)
                    })
                break;
            case 'wait':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (isMedia && isImage || isQuotedImage) {
                    if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                    limit.addLimit(sender.id, _limit, isPremium, isOwner)
                    await bocchi.reply(from, eng.wait(), id)
                    const encryptMedia = isQuotedImage ? quotedMsg : message
                    const mediaData = await decryptMedia(encryptMedia)
                    const imageLink = await uploadImages(mediaData, sender.id)
                    weeaboo.wait(imageLink)
                        .then(async (data) => {
                            if (!data.result.length) {
                                await bocchi.reply(from, 'Anime not found!', id)
                            } else {
                                let text = ''
                                if (data.result[0].similarity < 0.90) {
                                    text += 'Low similarity... 🤔\n\n'
                                }
                                text += `*Title*: ${data.result[0].anilist.title.native}\n*Romaji*: ${data.result[0].anilist.title.romaji}\n*Episode*: ${data.result[0].episode}\n*Frames*: ${data.result[0].from} to ${data.result[0].to}\n*Similarity*: ${(data.result[0].similarity * 100).toFixed(1)}%\n*MyAnimeList*: https://myanimelist.net/anime/${data.result[0].anilist.idMal}`
                                await bocchi.sendFileFromUrl(from, `${data.result[0].video}&size=l`, `${data.result[0].anilist.title.romaji}.mp4`, text, id)
                            }
                        })
                        .catch(async (err) => {
                            console.error(err)
                            await bocchi.reply(from, 'Error!', id)
                        })
                } else {
                    await bocchi.reply(from, eng.wrongFormat(), id)
                }
                break;
            case 'source':
            case 'sauce':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (isMedia && isImage || isQuotedImage) {
                    if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                    limit.addLimit(sender.id, _limit, isPremium, isOwner)
                    await bocchi.reply(from, eng.wait(), id)
                    const encryptMedia = isQuotedImage ? quotedMsg : message
                    const mediaData = await decryptMedia(encryptMedia)
                    try {
                        const imageLink = await uploadImages(mediaData, `sauce.${sender.id}`)
                        console.log('Searching for source...')
                        const results = await saus(imageLink)
                        for (let i = 0; i < results.length; i++) {
                            let teks = ''
                            if (results[i].similarity < 80.00) {
                                teks = 'Low similarity... 🤔\n\n'
                            } else {
                                teks += `*Link*: ${results[i].url}\n*Site*: ${results[i].site}\n*Author name*: ${results[i].authorName}\n*Author link*: ${results[i].authorUrl}\n*Similarity*: ${results[i].similarity}%`
                                await bocchi.sendLinkWithAutoPreview(from, results[i].url, teks)
                                    .then(() => console.log('Source found!'))
                            }
                        }
                    } catch (err) {
                        console.error(err)
                        await bocchi.reply(from, 'Error!', id)
                    }
                } else {
                    await bocchi.reply(from, eng.wrongFormat(), id)
                }
                break;
            case 'waifu':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                limit.addLimit(sender.id, _limit, isPremium, isOwner)
                //await bocchi.reply(from, eng.wait(), id)
                weeaboo.waifu(false)
                    .then(async ({ url }) => {
                        await bocchi.sendFileFromUrl(from, url, 'waifu.png', '', id)
                            .then(() => console.log('Success sending waifu!'))
                    })
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, 'Error!', id)
                    })
                break;

// nsfw by staffFF6773 // Edited by User (Better NSFW System)
case 'nsfw':
case 'hentai':
    if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id);
	if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)

    //await bocchi.reply(from, eng.wait(), id);
	
    limit.addLimit(sender.id, _limit, isPremium, isOwner);
    if (isGroupMsg) {
		const nsfwData = JSON.parse(fs.readFileSync('./database/group/nsfw.json'));
        const isNsfwOn = nsfwData.includes(groupId);
		if (!isNsfwOn) return await bocchi.reply(from, eng.nsfwNotEnabled(), id);
        }
	
    weeaboo.waifu(true)
        .then(async ({ url }) => {
            await bocchi.sendFileFromUrl(from, url, 'waifuNsfw.png', '', id)
                .then(() => console.log('Success sending Nsfw!'));
            })
            .catch(async (err) => {
                console.error(err);
                await bocchi.reply(from, 'Error!', id);
            });
    break;

case 'nsfwon':
    if (!isGroupMsg) return bocchi.reply(from, eng.groupOnly(), id)
	if (!isGroupAdmins) return bocchi.reply(from, eng.adminOnly(), id)
	
    let nsfwDataOn = JSON.parse(fs.readFileSync('./database/group/nsfw.json'));
    if (!nsfwDataOn.includes(groupId)) {
        nsfwDataOn.push(groupId);
        fs.writeFileSync('./database/group/nsfw.json', JSON.stringify(nsfwDataOn));
        await bocchi.reply(from, 'NSFW has been *enabled*.', id);
    } else {
        await bocchi.reply(from, 'NSFW is already enabled!', id);
    }
    break;

case 'nsfwoff':
    if (!isGroupMsg) return bocchi.reply(from, eng.groupOnly(), id)
	if (!isGroupAdmins) return bocchi.reply(from, eng.adminOnly(), id)
	
    let nsfwDataOff = JSON.parse(fs.readFileSync('./database/group/nsfw.json'));
    const nsfwindex = nsfwDataOff.indexOf(groupId);
    if (nsfwindex !== -1) {
        nsfwDataOff.splice(nsfwindex, 1);
        fs.writeFileSync('./database/group/nsfw.json', JSON.stringify(nsfwDataOff));
        await bocchi.reply(from, 'NSFW has been *disabled*.', id);
    } else {
        await bocchi.reply(from, 'NSFW is already disabled!', id);
    }
    break;

// Lolion + Lolioff for Gelbooru by User
case 'lolion':
    if (!isGroupMsg) return bocchi.reply(from, eng.groupOnly(), id)
	if (!isGroupAdmins) return bocchi.reply(from, eng.adminOnly(), id)
	
    let gelbooruDataOn = JSON.parse(fs.readFileSync('./database/group/gelbooru.json'));
    if (!gelbooruDataOn.includes(groupId)) {
        gelbooruDataOn.push(groupId);
        fs.writeFileSync('./database/group/gelbooru.json', JSON.stringify(gelbooruDataOn));
        await bocchi.reply(from, 'Gelbooru loli tag search is now *enabled*.', id);
    } else {
        await bocchi.reply(from, 'Gelbooru loli tag search is already enabled!', id);
    }
    break;

case 'lolioff':
    if (!isGroupMsg) return bocchi.reply(from, eng.groupOnly(), id)
	if (!isGroupAdmins) return bocchi.reply(from, eng.adminOnly(), id)
	
    let gelbooruDataOff = JSON.parse(fs.readFileSync('./database/group/gelbooru.json'));
    const gelbooruindex = gelbooruDataOff.indexOf(groupId);
    if (gelbooruindex !== -1) {
        gelbooruDataOff.splice(gelbooruindex, 1);
        fs.writeFileSync('./database/group/gelbooru.json', JSON.stringify(gelbooruDataOff));
        await bocchi.reply(from, 'Gelbooru loli tag search is now *disabled*.', id);
    } else {
        await bocchi.reply(from, 'Gelbooru loli tag search is already disabled!', id);
    }
    break;

// Rbon + Rboff for Realbooru by User
case 'rbon':
    if (!isGroupMsg) return bocchi.reply(from, eng.groupOnly(), id)
	if (!isGroupAdmins) return bocchi.reply(from, eng.adminOnly(), id)
	
    let rbDataOn = JSON.parse(fs.readFileSync('./database/group/realbooru.json'));
    if (!rbDataOn.includes(groupId)) {
        rbDataOn.push(groupId);
        fs.writeFileSync('./database/group/realbooru.json', JSON.stringify(rbDataOn));
        await bocchi.reply(from, 'Realbooru has been *enabled*.', id);
    } else {
        await bocchi.reply(from, 'Realbooru is already enabled!', id);
    }
    break;

case 'rboff':
    if (!isGroupMsg) return bocchi.reply(from, eng.groupOnly(), id)
	if (!isGroupAdmins) return bocchi.reply(from, eng.adminOnly(), id)
	
    let rbDataOff = JSON.parse(fs.readFileSync('./database/group/realbooru.json'));
    const rbindex = rbDataOff.indexOf(groupId);
    if (rbindex !== -1) {
        rbDataOff.splice(rbindex, 1);
        fs.writeFileSync('./database/group/realbooru.json', JSON.stringify(rbDataOff));
        await bocchi.reply(from, 'Realbooru has been *disabled*.', id);
    } else {
        await bocchi.reply(from, 'Realbooru is already disabled!', id);
    }
    break;

// Gelbooru by User
    case 'gelbooru':
    case 'gel':
        if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id);
		if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
		
        limit.addLimit(sender.id, _limit, isPremium, isOwner);
        if (isGroupMsg) {
			const nsfwData = JSON.parse(fs.readFileSync('./database/group/nsfw.json'));
            const isNsfwOn = nsfwData.includes(groupId);
			if (!isNsfwOn) return await bocchi.reply(from, eng.nsfwNotEnabled(), id);
			
            const gelbooruData = JSON.parse(fs.readFileSync('./database/group/gelbooru.json'));
            const isGelbooruOn = gelbooruData.includes(groupId);
            if (!isGelbooruOn) args.push('-loli');
        }

        const gelbooruTags = args.join('+');
        await gelbooruCommand(gelbooruTags, from, id);
        break;

// Rule34 by User
    case 'rule34':
    case 'r34':
        if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id);
        if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)

		limit.addLimit(sender.id, _limit, isPremium, isOwner);
		if (isGroupMsg) {
            const nsfwData = JSON.parse(fs.readFileSync('./database/group/nsfw.json'));
            const isNsfwOn = nsfwData.includes(groupId);
			if (!isNsfwOn) return await bocchi.reply(from, eng.nsfwNotEnabled(), id);
        }
		
        const rule34Tags = args.join('+');
        await rule34Command(rule34Tags, from, id);
        break;
		
// Realbooru by User
    case 'realbooru':
    case 'rb':
        if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id);
		if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)

		limit.addLimit(sender.id, _limit, isPremium, isOwner);
		if (isGroupMsg) {
            const nsfwData = JSON.parse(fs.readFileSync('./database/group/nsfw.json'));
            const isNsfwOn = nsfwData.includes(groupId);
			if (!isNsfwOn) return await bocchi.reply(from, eng.nsfwNotEnabled(), id);
			
			const realbooruData = JSON.parse(fs.readFileSync('./database/group/realbooru.json'));
            const isRealbooruOn = realbooruData.includes(groupId);
			if (!isRealbooruOn) return await bocchi.reply(from, eng.rbNotEnabled(), id);
        }
		
        const realbooruTags = args.join('+');
        await realbooruCommand(realbooruTags, from, id);
        break;
	
	// ThisPersonDoesNotExist by User
case 'thispersondoesnotexist':
case 'tpdne':
    if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id);
	if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)

    limit.addLimit(sender.id, _limit, isPremium, isOwner);
	
    //await bocchi.reply(from, eng.wait(), id);

    try {
        const imageUrl = await weeaboo.thisPersonDoesNotExist();
        await bocchi.sendFileFromUrl(from, imageUrl, 'thispersondoesnotexist_image.jpg', '', id);
    } catch (error) {
        console.error(error);
        await bocchi.reply(from, 'An error has occurred! Please try again.', id);
    }
    break;
				
            // Fun
			// Profile // Edited by User
case 'profile':
case 'me':
    if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
    if (quotedMsg) {
        const getQuoted = quotedMsgObj.sender.id
        const profilePic = await bocchi.getProfilePicFromServer(getQuoted).catch(() => undefined)
        const username = quotedMsgObj.sender.name || '?'
        const statuses = await bocchi.getStatus(getQuoted).catch(() => undefined)
        const benet = _ban.includes(getQuoted) ? 'Yes' : 'No'
        const adm = groupAdmins.includes(getQuoted) ? 'Yes' : 'No'
        const premi = premium.checkPremiumUser(getQuoted, _premium) ? 'Yes' : 'No'
        const levelMe = level.getLevelingLevel(getQuoted, _level) || '?'
        const xpMe = level.getLevelingXp(getQuoted, _level) || '?'
        const req = 5 * Math.pow(levelMe, 2) + 50 * 1 + 100
        const { status } = statuses || {}
        const pfp = profilePic || errorImg
        await bocchi.sendFileFromUrl(from, pfp, `${username}.jpg`, eng.profile(username, status || '?', premi, benet, adm, levelMe, req, xpMe), id)
    } else {
        const profilePic = await bocchi.getProfilePicFromServer(sender.id).catch(() => undefined)
        const username = pushname || '?'
        const statuses = await bocchi.getStatus(sender.id).catch(() => undefined)
        const benet = isBanned ? 'Yes' : 'No'
        const adm = isGroupAdmins ? 'Yes' : 'No'
        const premi = isPremium ? 'Yes' : 'No'
        const levelMe = level.getLevelingLevel(sender.id, _level) || '?'
        const xpMe = level.getLevelingXp(sender.id, _level) || '?'
        const req = 5 * Math.pow(levelMe, 2) + 50 * 1 + 100
        const { status } = statuses || {}
        const pfps = profilePic || errorImg
        await bocchi.sendFileFromUrl(from, pfps, `${username}.jpg`, eng.profile(username, status || '?', premi, benet, adm, levelMe, req, xpMe), id)
    }
    break;
// Edited by User
case 'triggered':
    if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id);
    if (isMedia && isImage || isQuotedImage) {
        if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id);
        limit.addLimit(sender.id, _limit, isPremium, isOwner);
        await bocchi.reply(from, eng.wait(), id);
        const encryptMedia = isQuotedImage ? quotedMsg : message;
        console.log(color('[WAPI]', 'green'), 'Downloading and decrypting media...');
        const mediaData = await decryptMedia(encryptMedia);
        const temp = './temp';
        const name = new Date() * 1;
        const fileInputPath = path.join(temp, `${name}.gif`);
        const fileOutputPath = path.join(temp, 'video', `${name}.mp4`);
        canvas.Canvas.trigger(mediaData)
            .then((buffer) => {
                canvas.write(buffer, fileInputPath);
                const args = [
                    '-i', fileInputPath,
                    '-movflags', 'faststart',
                    '-pix_fmt', 'yuv420p',
                    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
                    fileOutputPath
                ];
                runFfmpegSilently(args, async (err) => {
                    if (err) return console.error(err);
                    console.log(color('[FFmpeg]', 'green'), 'Processing finished!');
                    fs.readFile(fileOutputPath, { encoding: 'base64' }, async (err, data) => {
                        if (err) return console.error(err);
                        const videoBase64 = `data:video/mp4;base64,${data}`;
                        await bocchi.sendMp4AsSticker(from, videoBase64, null, {
                            stickerMetadata: true,
                            author: authorWm,
                            pack: packWm,
                            keepScale: true,
                            fps: 30,
                            startTime: '00:00:00.0',
                            endTime: '00:00:05.0',
                            crop: true,
                            loop: 0
                        });
                        console.log(color('[WAPI]', 'green'), 'Success sending GIF!');
                        setTimeout(() => {
                            fs.unlinkSync(fileInputPath);
                            fs.unlinkSync(fileOutputPath);
                        }, 30000);
                    });
                });
            });
    } else {
        await bocchi.reply(from, eng.wrongFormat(), id);
    }
    break;
            case 'kiss':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                try {
                    if (isMedia && isImage || isQuotedImage) {
                        if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                        limit.addLimit(sender.id, _limit, isPremium, isOwner)
                        await bocchi.reply(from, eng.wait(), id)
                        const encryptMedia = isQuotedImage ? quotedMsg : message
                        const ppRaw = await bocchi.getProfilePicFromServer(sender.id)
                        const ppSecond = await decryptMedia(encryptMedia)
                        if (ppRaw === undefined) {
                            var ppFirst = errorImg
                        } else {
                            ppFirst = ppRaw
                        }
                        canvas.Canvas.kiss(ppFirst, ppSecond)
                            .then(async (buffer) => {
                                canvas.write(buffer, `${sender.id}_kiss.png`)
                                await bocchi.sendFile(from, `${sender.id}_kiss.png`, `${sender.id}_kiss.png`, '', id)
                                fs.unlinkSync(`${sender.id}_kiss.png`)
                            })
                    } else {
                        await bocchi.reply(from, eng.wrongFormat(), id)
                    }
                } catch (err) {
                    console.error(err)
                    await bocchi.reply(from, 'Error!', id)
                }
                break;

            // Sticker
            case 'stickernobg': // by: VideFrelan
			case 'stcnobg':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (isMedia && isImage || isQuotedImage) {
                    if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                    limit.addLimit(sender.id, _limit, isPremium, isOwner)
                    await bocchi.reply(from, eng.wait(), id)
                    const encryptMedia = isQuotedImage ? quotedMsg : message
                    const mediaData = await decryptMedia(encryptMedia)
                    await bocchi.sendImageAsSticker(from, mediaData, { author: authorWm, pack: packWm, removebg: true })
                    console.log(`Sticker processed for ${processTime(t, moment())} seconds`)
                } else {
                    await bocchi.reply(from, eng.wrongFormat(), id)
                }
                break;
            case 'stickerwm': // By Slavyan
            case 'stcwm':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (!isPremium) return await bocchi.reply(from, eng.notPremium(), id)
                if (!q.includes('|')) return await bocchi.reply(from, eng.wrongFormat(), id)
                if (isMedia && isImage || isQuotedImage) {
                    if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                    limit.addLimit(sender.id, _limit, isPremium, isOwner)
                    await bocchi.reply(from, eng.wait(), id)
                    const packname = q.substring(0, q.indexOf('|') - 1)
                    const author = q.substring(q.lastIndexOf('|') + 2)
                    const encryptMedia = isQuotedImage ? quotedMsg : message
                    const mediaData = await decryptMedia(encryptMedia)
                    const _mimetype = isQuotedImage ? quotedMsg.mimetype : mimetype
                    const imageBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`
                    await bocchi.sendImageAsSticker(from, imageBase64, { author: authorWm, pack: packWm, keepScale: true })
                    console.log(`Sticker processed for ${processTime(t, moment())} seconds`)
                } else {
                    await bocchi.reply(from, eng.wrongFormat(), id)
                }
                break;
            case 'stickermeme': // Chika Chantexx
            case 'stcmeme':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (!q.includes('|')) return await bocchi.reply(from, eng.wrongFormat(), id)
                if (isMedia && isImage || isQuotedImage) {
                    if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                    limit.addLimit(sender.id, _limit, isPremium, isOwner)
                    await bocchi.reply(from, eng.wait(), id)
                    const top = q.substring(0, q.indexOf('|') - 1)
                    const topp = top.replace('', '_').replace('\n', '%5Cn').replace('?', '~q').replace('%', '~p').replace('#', '~h').replace('/', '~s')
                    const bottom = q.substring(q.lastIndexOf('|') + 2)
                    const bottomm = bottom.replace('', '_').replace('\n', '%5Cn').replace('?', '~q').replace('%', '~p').replace('#', '~h').replace('/', '~s')
                    const encryptMedia = isQuotedImage ? quotedMsg : message
                    const mediaData = await decryptMedia(encryptMedia)
                    const getUrl = await uploadImages(mediaData, `meme.${sender.id}`)
                    const create = `https://api.memegen.link/images/custom/${topp}/${bottomm}.png?background=${getUrl}`
                    await bocchi.sendStickerfromUrl(from, create, null, { author: authorWm, pack: packWm, keepScale: true })
                } else {
                    await bocchi.reply(from, eng.wrongFormat(), id)
                }
                break;
            case 'takestick': // By: VideFrelan // Edited by User
            case 'take':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (!q.includes('|')) return await bocchi.reply(from, eng.wrongFormat(), id)
                if (quotedMsg && quotedMsg.type == 'sticker') {
                    //if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                    //limit.addLimit(sender.id, _limit, isPremium, isOwner)
                    await bocchi.reply(from, eng.wait(), id)
                    const mediaDataTake = await decryptMedia(quotedMsg)
                    const packname = q.substring(0, q.indexOf('|') - 1)
                    const author = q.substring(q.lastIndexOf('|') + 2)
                    const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaDataTake.toString('base64')}`
                    await bocchi.sendImageAsSticker(from, imageBase64, { author: author, pack: packname })
                } else {
                    await bocchi.reply(from, eng.wrongFormat(), id)
                }
                break;
            case 'sticker':
            case 'stiker':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (isMedia && isImage || isQuotedImage) {
                    await bocchi.reply(from, eng.wait(), id)
                    const encryptMedia = isQuotedImage ? quotedMsg : message
                    const mediaData = await decryptMedia(encryptMedia)
                    const _mimetype = isQuotedImage ? quotedMsg.mimetype : mimetype
                    const imageBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`
                    await bocchi.sendImageAsSticker(from, imageBase64, { author: authorWm, pack: packWm, keepScale: true })
                    console.log(`Sticker processed for ${processTime(t, moment())} seconds`)
                } else {
                    await bocchi.reply(from, eng.wrongFormat(), id)
                }
                break;
			// Edited by User
            case 'stickergif':
            case 'stikergif':
            case 'sgif':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (isMedia && isVideo || isGif || isQuotedVideo || isQuotedGif) {
                    //if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                    //limit.addLimit(sender.id, _limit, isPremium, isOwner)
                    await bocchi.reply(from, eng.wait(), id)
                    try {
                        const encryptMedia = isQuotedGif || isQuotedVideo ? quotedMsg : message
                        const mediaData = await decryptMedia(encryptMedia)
                        const _mimetype = isQuotedVideo || isQuotedGif ? quotedMsg.mimetype : mimetype
                        const videoBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`
                        await bocchi.sendMp4AsSticker(from, videoBase64, null, { stickerMetadata: true, author: authorWm, pack: packWm, keepScale: true, fps: 30, startTime: '00:00:00.0', endTime: '00:00:05.0', crop: true, loop: 0 })
                            .then(() => {
                                console.log(`Sticker processed for ${processTime(t, moment())} seconds`)
                            })
                    } catch (err) {
                        console.error(err)
                        await bocchi.reply(from, eng.videoLimit(), id)
                    }
                } else {
                    await bocchi.reply(from, eng.wrongFormat(), id)
                }
                break;
			// Edited by User
            case 'stickertoimg':
            case 'stikertoimg':
            case 'toimg':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (isQuotedSticker) {
                    //if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                    //limit.addLimit(sender.id, _limit, isPremium, isOwner)
                    await bocchi.reply(from, eng.wait(), id)
                    try {
                        const mediaData = await decryptMedia(quotedMsg)
                        const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                        await bocchi.sendFile(from, imageBase64, 'sticker.jpg', '', id)
                    } catch (err) {
                        console.error(err)
                        await bocchi.reply(from, 'Error!', id)
                    }
                } else {
                    await bocchi.reply(from, eng.wrongFormat(), id)
                }
                break;
// Repost by User
case 'repost':
case 're':
    if (!isRegistered) return bocchi.reply(from, eng.notRegistered(), id);
    if (!isGroupMsg) return bocchi.reply(from, eng.groupOnly(), id);
    if (!isQuotedImage && !isQuotedVideo && !isQuotedGif && !isQuotedAudio && !isQuotedVoice) return bocchi.reply(from, eng.extractMediaOnly(), id);

    await bocchi.reply(from, eng.wait(), id);

    let mediaData = null;
    let mediaType = null;

    if (isQuotedImage || isQuotedVideo || isQuotedGif || isQuotedAudio || isQuotedVoice) {
        mediaData = await decryptMedia(quotedMsg);
        mediaType = quotedMsg.mimetype;
    }

    if (isQuotedImage) {
        await bocchi.sendFile(from, `data:${mediaType};base64,${mediaData.toString('base64')}`, 'image.' + mediaType.split('/')[1], '', id)
    } else if (isQuotedAudio || isQuotedVoice) {
        await bocchi.sendFile(from, `data:${mediaType};base64,${mediaData.toString('base64')}`, 'audio.' + mediaType.split('/')[1], '', id)
    } else if (isQuotedVideo || isQuotedGif) {
		
		try {
            await bocchi.sendFile(from, mediaData, 'video.mp4', '', id);
        } catch (error) {
            console.error('Error sending video directly:', error);
            console.log('Trying to compress the video...');
		
            try {
                const tempVideoPath = './temp/video/video.mp4';
                await saveFile(mediaData, tempVideoPath);

                const compressedVideoPath = './temp/video/compressed_video.mp4';
                const ffmpegCommand = ['-i', tempVideoPath, '-vf', 'scale=-2:720', '-c:v', 'libx264', '-preset', 'slow', '-crf', '28', '-c:a', 'aac', '-b:a', '128k', compressedVideoPath];
                await runFfmpegSilently2(ffmpegCommand);

                await bocchi.sendFile(from, compressedVideoPath, 'compressed_video', '', id);

                await Promise.all([
                    deleteFile(tempVideoPath),
                    deleteFile(compressedVideoPath)
                ]);
            } catch (error) {
                console.error('Error reposting the video:', error);
                await bocchi.reply(from, 'An error has occurred! Please try again.', id);
            }
        }
    } else {
        await bocchi.reply(from, eng.extractMediaOnly(), id);
    }
    console.log(`Media extracted for ${processTime(t, moment())} seconds`);
    break;
            // Moderation command
			// Edited by User
            case 'revoke':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (!isGroupMsg) return await bocchi.reply(from, eng.groupOnly(), id)
                if (!isGroupAdmins) return bocchi.reply(from, eng.adminOnly(), id)
                if (!isBotGroupAdmins) return bocchi.reply(from, eng.botNotAdmin(), id)
                //if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                //limit.addLimit(sender.id, _limit, isPremium, isOwner)
                await bocchi.revokeGroupInviteLink(groupId)
                await bocchi.sendTextWithMentions(from, `Group link revoked by @${sender.id.replace('@c.us', '')}`)
                break;
			// Edited by User
            case 'grouplink':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (!isGroupMsg) return await bocchi.reply(from, eng.groupOnly(), id)
                if (!isGroupAdmins) return await bocchi.reply(from, eng.adminOnly(), id)
                if (!isBotGroupAdmins) return await bocchi.reply(from, eng.botNotAdmin(), id)
                //if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                //limit.addLimit(sender.id, _limit, isPremium, isOwner)
                const gcLink = await bocchi.getGroupInviteLink(groupId)
                await bocchi.reply(from, gcLink, id)
                break;
			// Edited by User
            case 'mutegc':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (!isGroupMsg) return bocchi.reply(from, eng.groupOnly(), id)
                if (!isGroupAdmins) return bocchi.reply(from, eng.adminOnly(), id)
                if (!isBotGroupAdmins) return bocchi.reply(from, eng.botNotAdmin(), id)
                if (ar[0] === 'enable') {
                    //if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                    //limit.addLimit(sender.id, _limit, isPremium, isOwner)
                    await bocchi.setGroupToAdminsOnly(groupId, true)
                    await bocchi.sendText(from, eng.gcMute())
                } else if (ar[0] === 'disable') {
                    if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                    limit.addLimit(sender.id, _limit, isPremium, isOwner)
                    await bocchi.setGroupToAdminsOnly(groupId, false)
                    await bocchi.sendText(from, eng.gcUnmute())
                } else {
                    await bocchi.reply(from, eng.wrongFormat(), id)
                }
                break;
			// Edited by User
            case 'add':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (!isGroupMsg) return await bocchi.reply(from, eng.groupOnly(), id)
                if (!isGroupAdmins) return await bocchi.reply(from, eng.adminOnly(), id)
                if (!isBotGroupAdmins) return await bocchi.reply(from, eng.botNotAdmin(), id)
                if (args.length !== 1) return await bocchi.reply(from, eng.wrongFormat(), id)
                try {
                    //if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                    //limit.addLimit(sender.id, _limit, isPremium, isOwner)
                    await bocchi.addParticipant(from, `${args[0]}@c.us`)
                    await bocchi.sendText(from, '🎉 Welcome! 🎉')
                } catch (err) {
                    console.error(err)
                    await bocchi.reply(from, 'Error!', id)
                }
                break;
			// Edited by User
            case 'kick':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (!isGroupMsg) return await bocchi.reply(from, eng.groupOnly(), id)
                if (!isGroupAdmins) return await bocchi.reply(from, eng.adminOnly(), id)
                if (!isBotGroupAdmins) return await bocchi.reply(from, eng.botNotAdmin(), id)
                if (mentionedJidList.length === 0) return await bocchi.reply(from, eng.wrongFormat(), id)
                if (mentionedJidList[0] === botNumber) return await bocchi.reply(from, eng.wrongFormat(), id)
                //if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                //limit.addLimit(sender.id, _limit, isPremium, isOwner)
                await bocchi.sendTextWithMentions(from, `Good bye~\n${mentionedJidList.map(x => `@${x.replace('@c.us', '')}`).join('\n')}`)
                for (let i of mentionedJidList) {
                    if (groupAdmins.includes(i)) return await bocchi.sendText(from, eng.wrongFormat())
                    await bocchi.removeParticipant(groupId, i)
                }
                break;
			// Edited by User
            case 'promote':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (!isGroupMsg) return await bocchi.reply(from, eng.groupOnly(), id)
                if (!isGroupAdmins) return await bocchi.reply(from, eng.adminOnly(), id)
                if (!isBotGroupAdmins) return await bocchi.reply(from, eng.botNotAdmin(), id)
                if (mentionedJidList.length !== 1) return await bocchi.reply(from, eng.wrongFormat(), id)
                if (mentionedJidList[0] === botNumber) return await bocchi.reply(from, eng.wrongFormat(), id)
                if (groupAdmins.includes(mentionedJidList[0])) return await bocchi.reply(from, eng.adminAlready(), id)
                //if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                //limit.addLimit(sender.id, _limit, isPremium, isOwner)
                await bocchi.promoteParticipant(groupId, mentionedJidList[0])
                await bocchi.reply(from, eng.ok(), id)
                break;
			// Edited by User
            case 'demote':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (!isGroupMsg) return await bocchi.reply(from, eng.groupOnly(), id)
                if (!isGroupAdmins) return await bocchi.reply(from, eng.adminOnly(), id)
                if (!isBotGroupAdmins) return await bocchi.reply(from, eng.botNotAdmin(), id)
                if (mentionedJidList.length !== 1) return await bocchi.reply(from, eng.wrongFormat(), id)
                if (mentionedJidList[0] === botNumber) return await bocchi.reply(from, eng.wrongFormat(), id)
                if (!groupAdmins.includes(mentionedJidList[0])) return await bocchi.reply(from, eng.notAdmin(), id)
                //if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                //limit.addLimit(sender.id, _limit, isPremium, isOwner)
                await bocchi.demoteParticipant(groupId, mentionedJidList[0])
                await bocchi.reply(from, eng.ok(), id)
                break;
            case 'leave':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (!isGroupMsg) return await bocchi.reply(from, eng.groupOnly(), id)
                if (!isGroupAdmins) return await bocchi.reply(from, eng.adminOnly(), id)
                await bocchi.sendText(from, 'Bye~ 👋')
                await bocchi.leaveGroup(groupId)
                break;
            case 'everyone':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (!isGroupMsg) return await bocchi.reply(from, eng.groupOnly(), id)
                if (!isGroupAdmins) return await bocchi.reply(from, eng.adminOnly(), id)
                if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                limit.addLimit(sender.id, _limit, isPremium, isOwner)
                const groupMem = await bocchi.getGroupMembers(groupId)
                const lastEveryone = daily.getLimit(sender.id, _daily)
                if (lastEveryone !== undefined && cd - (Date.now() - lastEveryone) > 0) {
                    const time = ms(cd - (Date.now() - lastEveryone))
                    await bocchi.reply(from, eng.daily(time), id)
                } else if (isOwner || isPremium) {
                    let txt = '╔══✪〘 *EVERYONE* 〙✪══\n'
                    for (let i = 0; i < groupMem.length; i++) {
                        txt += '╠➥'
                        txt += ` @${groupMem[i].id.replace(/@c.us/g, '')}\n`
                    }
                    txt += '╚═〘 *B O C C H I  B O T* 〙'
                    await bocchi.sendTextWithMentions(from, txt)
                } else {
                    let txt = '╔══✪〘 *EVERYONE* 〙✪══\n'
                    for (let i = 0; i < groupMem.length; i++) {
                        txt += '╠➥'
                        txt += ` @${groupMem[i].id.replace(/@c.us/g, '')}\n`
                    }
                    txt += '╚═〘 *B O C C H I  B O T* 〙'
                    await bocchi.sendTextWithMentions(from, txt)
                    daily.addLimit(sender.id, _daily)
                }
                break;
			// Edited by User
            case 'groupicon':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (!isGroupMsg) return await bocchi.reply(from, eng.groupOnly(), id)
                if (!isGroupAdmins) return await bocchi.reply(from, eng.adminOnly(), id)
                if (!isBotGroupAdmins) return bocchi.reply(from, eng.botNotAdmin(), id)
                if (isMedia && isImage || isQuotedImage) {
                    //if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                    //limit.addLimit(sender.id, _limit, isPremium, isOwner)
                    await bocchi.reply(from, eng.wait(), id)
                    const encryptMedia = isQuotedImage ? quotedMsg : message
                    const _mimetype = isQuotedImage ? quotedMsg.mimetype : mimetype
                    const mediaData = await decryptMedia(encryptMedia)
                    const imageBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`
                    await bocchi.setGroupIcon(groupId, imageBase64)
                    await bocchi.sendText(from, eng.ok())
                } else {
                    await bocchi.reply(from, eng.wrongFormat(), id)
                }
                break;
			// Edited by User
            case 'antilink':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (!isGroupMsg) return await bocchi.reply(from, eng.groupOnly(), id)
                if (!isGroupAdmins) return await bocchi.reply(from, eng.adminOnly(), id)
                if (!isBotGroupAdmins) return await bocchi.reply(from, eng.botNotAdmin(), id)
                if (ar[0] === 'enable') {
                    if (isDetectorOn) return await bocchi.reply(from, eng.detectorOnAlready(), id)
                    //if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                    //limit.addLimit(sender.id, _limit, isPremium, isOwner)
                    _antilink.push(groupId)
                    fs.writeFileSync('./database/group/antilink.json', JSON.stringify(_antilink))
                    await bocchi.reply(from, eng.detectorOn(name, formattedTitle), id)
                } else if (ar[0] === 'disable') {
                    //if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                    //limit.addLimit(sender.id, _limit, isPremium, isOwner)
                    _antilink.splice(groupId, 1)
                    fs.writeFileSync('./database/group/antilink.json', JSON.stringify(_antilink))
                    await bocchi.reply(from, eng.detectorOff(), id)
                } else {
                    await bocchi.reply(from, eng.wrongFormat(), id)
                }
                break;
	// Leveling // Edited by User
    case 'leveling':
        if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
        if (!isGroupMsg) return await bocchi.reply(from, eng.groupOnly(), id)
        if (!isGroupAdmins) return await bocchi.reply(from, eng.adminOnly(), id)
        if (ar[0] === 'enable') {
            if (_levelingmedia.includes(groupId)) {
                return await bocchi.reply(from, '*levelingmedia* is already enabled for this group! Please *disable* it first.', id)
            } else if (_leveling.includes(groupId)) {
                return await bocchi.reply(from, '*Leveling* is already *enabled* for this group!', id)
            }
            //if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
            //limit.addLimit(sender.id, _limit, isPremium, isOwner)
            _leveling.push(groupId)
            fs.writeFileSync('./database/group/leveling.json', JSON.stringify(_leveling))
            await bocchi.reply(from, eng.levelingOn(), id)
        } else if (ar[0] === 'disable') {
            //if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
            //limit.addLimit(sender.id, _limit, isPremium, isOwner)
            _leveling.splice(groupId, 1)
            fs.writeFileSync('./database/group/leveling.json', JSON.stringify(_leveling))
            await bocchi.reply(from, eng.levelingOff(), id)
        } else {
            await bocchi.reply(from, eng.wrongFormat(), id)
        }
        break;
    // Levelingmedia by User
    case 'levelingmedia':
    case 'levelmedia':
    case 'lvlmedia':
        if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
        if (!isGroupMsg) return await bocchi.reply(from, eng.groupOnly(), id)
        if (!isGroupAdmins) return await bocchi.reply(from, eng.adminOnly(), id)
        if (ar[0] === 'enable') {
            if (_levelingmedia.includes(groupId)) return await bocchi.reply(from, '*Levelingmedia* is already *enabled* for this group!', id)
            if (_leveling.includes(groupId)) return await bocchi.reply(from, '*Leveling* is already enabled for this group! Please *disable* it first.', id)
            _levelingmedia.push(groupId)
            fs.writeFileSync('./database/group/levelingmedia.json', JSON.stringify(_levelingmedia))
            await bocchi.reply(from, '*Levelingmedia* feature was successfully *enabled*!', id)
        } else if (ar[0] === 'disable') {
            if (!_levelingmedia.includes(groupId)) return await bocchi.reply(from, '*Levelingmedia* is already *disabled* for this group!', id)
            _levelingmedia.splice(groupId, 1)
            fs.writeFileSync('./database/group/levelingmedia.json', JSON.stringify(_levelingmedia))
            await bocchi.reply(from, '*Levelingmedia* feature was successfully *disabled*!', id)
        } else {
            await bocchi.reply(from, eng.wrongFormat(), id)
        }
        break;
// Welcome Edited by User (Welcome Set)
case 'welcome':
    if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
    if (!isGroupMsg) return await bocchi.reply(from, eng.groupOnly(), id)
    if (!isGroupAdmins) return await bocchi.reply(from, eng.adminOnly(), id)
    if (!ar[0]) return await bocchi.reply(from, eng.wrongFormat(), id)
    if (ar[0] === 'enable') {
        if (_welcome.some(group => group.groupId === groupId)) return await bocchi.reply(from, eng.welcomeOnAlready(), id)
        _welcome.push({ groupId: groupId, message: '' }) // No default message
        fs.writeFileSync('./database/group/welcome.json', JSON.stringify(_welcome))
        await bocchi.reply(from, eng.welcomeOn(), id)
    } else if (ar[0] === 'disable') {
        const welcome = _welcome.findIndex(group => group.groupId === groupId)
        if (welcome === -1) return await bocchi.reply(from, eng.welcomeOffAlready(), id)
        _welcome.splice(welcome, 1)
        fs.writeFileSync('./database/group/welcome.json', JSON.stringify(_welcome))
        await bocchi.reply(from, eng.welcomeOff(), id)
    } else if (ar[0] === 'set') {
        if (ar.length < 2) return await bocchi.reply(from, eng.wrongFormat(), id)
        const welcome = _welcome.findIndex(group => group.groupId === groupId)
        if (welcome !== -1) {
            _welcome[welcome].message = args.slice(1).join(' ')
            fs.writeFileSync('./database/group/welcome.json', JSON.stringify(_welcome))
            await bocchi.reply(from, eng.welcomeSet(args.slice(1).join(' ')), id)
        } else {
            await bocchi.reply(from, eng.welcomeNotSet(), id)
        }
    } else {
        await bocchi.reply(from, eng.wrongFormat(), id)
    }
    break;
            case 'autosticker':
            case 'autostiker':
            case 'autostik':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (!isGroupMsg) return await bocchi.reply(from, eng.groupOnly(), id)
                if (!isGroupAdmins) return await bocchi.reply(from, eng.adminOnly(), id)
                if (ar[0] === 'enable') {
                    if (isAutoStickerOn) return await bocchi.reply(from, eng.autoStikOnAlready(), id)
                    //if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                    //limit.addLimit(sender.id, _limit, isPremium, isOwner)
                    _autosticker.push(groupId)
                    fs.writeFileSync('./database/group/autosticker.json', JSON.stringify(_autosticker))
                    await bocchi.reply(from, eng.autoStikOn(), id)
                } else if (ar[0] === 'disable') {
                    //if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                    //limit.addLimit(sender.id, _limit, isPremium, isOwner)
                    _autosticker.splice(groupId, 1)
                    fs.writeFileSync('./database/group/autosticker.json', JSON.stringify(_autosticker))
                    await bocchi.reply(from, eng.autoStikOff(), id)
                } else {
                    await bocchi.reply(from, eng.wrongFormat(), id)
                }
                break;
            case 'antinsfw':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (!isGroupMsg) return await bocchi.reply(from, eng.groupOnly(), id)
                if (!isGroupAdmins) return await bocchi.reply(from, eng.adminOnly(), id)
                if (!isBotGroupAdmins) return await bocchi.reply(from, eng.botNotAdmin(), id)
                if (ar[0] === 'enable') {
                    if (isDetectorOn) return await bocchi.reply(from, eng.antiNsfwOnAlready(), id)
                    //if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                    //limit.addLimit(sender.id, _limit, isPremium, isOwner)
                    _antinsfw.push(groupId)
                    fs.writeFileSync('./database/group/antinsfw.json', JSON.stringify(_antinsfw))
                    await bocchi.reply(from, eng.antiNsfwOn(name, formattedTitle), id)
                } else if (ar[0] === 'disable') {
                    //if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                    //limit.addLimit(sender.id, _limit, isPremium, isOwner)
                    _antinsfw.splice(groupId, 1)
                    fs.writeFileSync('./database/group/antinsfw.json', JSON.stringify(_antinsfw))
                    await bocchi.reply(from, eng.antiNsfwOff(), id)
                } else {
                    await bocchi.reply(from, eng.wrongFormat(), id)
                }
                break;
            case 'badwords':
            case 'badword':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                if (!isGroupMsg) return await bocchi.reply(from, eng.groupOnly(), id)
                if (!isGroupAdmins) return await bocchi.reply(from, eng.adminOnly(), id)
                if (!isBotGroupAdmins) return await bocchi.reply(from, eng.botNotAdmin(), id)
                if (ar[0] === 'enable') {
                    if (isAntiBadWords) return await bocchi.reply(from, eng.antiBadWordsOnAlready(), id)
                    //if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                    //limit.addLimit(sender.id, _limit, isPremium, isOwner)
                    _badwords.push(groupId)
                    fs.writeFileSync('./database/group/badwords.json', JSON.stringify(_badwords))
                    await bocchi.reply(from, eng.antiBadWordsOn(name, formattedTitle), id)
                } else if (ar[0] === 'disable') {
                    console.log(ar.splice(1).toString())
                    //if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                    //limit.addLimit(sender.id, _limit, isPremium, isOwner)
                    _badwords.splice(groupId, 1)
                    fs.writeFileSync('./database/group/badwords.json', JSON.stringify(_badwords))
                    await bocchi.reply(from, eng.antiBadWordsOff(), id)
                } else if (ar[0] === 'add') {
                    const newBadwords = ar.splice(1)
                    if (newBadwords.length === 0) return await bocchi.reply(from, eng.wrongFormat(), id)
                    //if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                    //limit.addLimit(sender.id, _limit, isPremium, isOwner)
                    badwords.addWords(...newBadwords)
                    await bocchi.reply(from, eng.ok(), id)
                } else if (ar[0] === 'remove') {
                    const newBadwords = ar.splice(1)
                    if (newBadwords.length === 0) return await bocchi.reply(from, eng.wrongFormat(), id)
                    //if (limit.isLimit(sender.id, _limit, limitCount, isPremium, isOwner)) return await bocchi.reply(from, eng.limit(), id)
                    //limit.addLimit(sender.id, _limit, isPremium, isOwner)
                    badwords.removeWords(...newBadwords)
                    await bocchi.reply(from, eng.ok(), id)
                } else {
                    await bocchi.reply(from, eng.wrongFormat(), id)
                }
                break;

            // Owner command
			// Restart by User (Only PM2, not NPM)
			case 'restart':
				if (!isOwner) return await bocchi.reply(from, eng.ownerOnly(), id)
				await bocchi.reply(from, 'Restarting...', id);
				process.exit(0);
				break;
            case 'xp':
                if (!isOwner) return await bocchi.reply(from, eng.ownerOnly(), id)
                if (mentionedJidList.length !== 0 && typeof Number(ar[1]) === 'number') {
                    level.addLevelingXp(mentionedJidList[0], Number(ar[1]), _level)
                    await bocchi.reply(from, eng.ok(), id)
                } else {
                    await bocchi.reply(from, eng.wrongFormat(), id)
                }
                break;
            case 'block':
            case 'blok':
                if (!isOwner) return await bocchi.reply(from, eng.ownerOnly(), id)
                if (mentionedJidList.length !== 0) {
                    for (let blok of mentionedJidList) {
                        if (blok === botNumber) return await bocchi.reply(from, eng.wrongFormat(), id)
                        await bocchi.contactBlock(blok)
                    }
                    await bocchi.reply(from, eng.ok(), id)
                } else if (args.length === 1) {
                    await bocchi.contactBlock(args[0] + '@c.us')
                    await bocchi.reply(from, eng.ok(), id)
                } else {
                    await bocchi.reply(from, eng.wrongFormat(), id)
                }
                break;
            case 'unblock':
            case 'unblok':
                if (!isOwner) return await bocchi.reply(from, eng.ownerOnly(), id)
                if (mentionedJidList.length !== 0) {
                    for (let blok of mentionedJidList) {
                        if (blok === botNumber) return await bocchi.reply(from, eng.wrongFormat(), id)
                        await bocchi.contactUnblock(blok)
                    }
                    await bocchi.reply(from, eng.ok(), id)
                } else if (args.length === 1) {
                    await bocchi.contactUnblock(args[0] + '@c.us')
                    await bocchi.reply(from, eng.ok(), id)
                } else {
                    await bocchi.reply(from, eng.wrongFormat(), id)
                }
                break;
            case 'bc':
                if (!isOwner) return await bocchi.reply(from, eng.ownerOnly(), id)
                if (!q) return await bocchi.reply(from, eng.emptyMess(), id)
                const chats = await bocchi.getAllChatIds()
                for (let bcs of chats) {
                    let cvk = await bocchi.getChatById(bcs)
                    if (!cvk.isReadOnly) await bocchi.sendText(bcs, `${q}\n\n- Bot Admin\n_Broadcasted message_`)
                }
                await bocchi.reply(from, eng.ok(), id)
                break;
            case 'clearall':
                if (!isOwner) return await bocchi.reply(from, eng.ownerOnly(), id)
                const allChats = await bocchi.getAllChats()
                for (let delChats of allChats) {
                    await bocchi.deleteChat(delChats.id)
                }
                await bocchi.reply(from, eng.ok(), id)
                break;
            case 'leaveall':
                if (!isOwner) return await bocchi.reply(from, eng.ownerOnly(), id)
                if (!q) return await bocchi.reply(from, eng.emptyMess(), id)
                const allGroup = await bocchi.getAllGroups()
                for (let gclist of allGroup) {
                    await bocchi.sendText(gclist.contact.id, q)
                    await bocchi.leaveGroup(gclist.contact.id)
                }
                await bocchi.reply(from, eng.ok())
                break;
            case 'getses':
                if (!isOwner) return await bocchi.reply(from, eng.ownerOnly(), id)
                const ses = await bocchi.getSnapshot()
                await bocchi.sendFile(from, ses, 'session.png', eng.ok())
                break;
            case 'ban':
                if (!isOwner) return await bocchi.reply(from, eng.ownerOnly(), id)
                if (ar[0] === 'add') {
                    if (mentionedJidList.length !== 0) {
                        for (let benet of mentionedJidList) {
                            if (benet === botNumber) return await bocchi.reply(from, eng.wrongFormat(), id)
                            _ban.push(benet)
                            fs.writeFileSync('./database/bot/banned.json', JSON.stringify(_ban))
                        }
                        await bocchi.reply(from, eng.ok(), id)
                    } else {
                        _ban.push(args[1] + '@c.us')
                        fs.writeFileSync('./database/bot/banned.json', JSON.stringify(_ban))
                        await bocchi.reply(from, eng.ok(), id)
                    }
                } else if (ar[0] === 'del') {
                    if (mentionedJidList.length !== 0) {
                        if (mentionedJidList[0] === botNumber) return await bocchi.reply(from, eng.wrongFormat(), id)
                        _ban.splice(mentionedJidList[0], 1)
                        fs.writeFileSync('./database/bot/banned.json', JSON.stringify(_ban))
                        await bocchi.reply(from, eng.ok(), id)
                    } else {
                        _ban.splice(args[1] + '@c.us', 1)
                        fs.writeFileSync('./database/bot/banned.json', JSON.stringify(_ban))
                        await bocchi.reply(from, eng.ok(), id)
                    }
                } else {
                    await bocchi.reply(from, eng.wrongFormat(), id)
                }
                break;
            case 'eval':
            case 'ev':
                if (!isOwner) return await bocchi.reply(from, eng.ownerOnly(), id)
                if (!q) return await bocchi.reply(from, eng.wrongFormat(), id)
                try {
                    let evaled = await eval(q)
                    if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
                    await bocchi.sendText(from, evaled)
                } catch (err) {
                    console.error(err)
                    await bocchi.reply(from, err, id)
                }
                break;
            case 'shutdown':
                if (!isOwner) return await bocchi.reply(from, eng.ownerOnly(), id)
                await bocchi.sendText(from, 'Good bye~ 👋')
                    .then(async () => await bocchi.kill())
                    .catch(() => new Error('Target closed.'))
                break;
            case 'premium':
                if (!isOwner) return await bocchi.reply(from, eng.ownerOnly(), id)
                if (ar[0] === 'add') {
                    if (mentionedJidList.length !== 0) {
                        for (let prem of mentionedJidList) {
                            if (prem === botNumber) return await bocchi.reply(from, eng.wrongFormat(), id)
                            premium.addPremiumUser(prem, args[2], _premium)
                            await bocchi.reply(from, `*── 「 PREMIUM ADDED 」 ──*\n\n➸ *ID*: ${prem}\n➸ *Expired*: ${ms(toMs(args[2])).days} day(s) ${ms(toMs(args[2])).hours} hour(s) ${ms(toMs(args[2])).minutes} minute(s)`, id)
                        }
                    } else {
                        premium.addPremiumUser(args[1] + '@c.us', args[2], _premium)
                        await bocchi.reply(from, `*── 「 PREMIUM ADDED 」 ──*\n\n➸ *ID*: ${args[1]}@c.us\n➸ *Expired*: ${ms(toMs(args[2])).days} day(s) ${ms(toMs(args[2])).hours} hour(s) ${ms(toMs(args[2])).minutes} minute(s)`, id)
                    }
                } else if (ar[0] === 'del') {
                    if (mentionedJidList.length !== 0) {
                        if (mentionedJidList[0] === botNumber) return await bocchi.reply(from, eng.wrongFormat(), id)
                        _premium.splice(premium.getPremiumPosition(mentionedJidList[0], _premium), 1)
                        fs.writeFileSync('./database/bot/premium.json', JSON.stringify(_premium))
                        await bocchi.reply(from, eng.ok(), id)
                    } else {
                        _premium.splice(premium.getPremiumPosition(args[1] + '@c.us', _premium), 1)
                        fs.writeFileSync('./database/bot/premium.json', JSON.stringify(_premium))
                        await bocchi.reply(from, eng.ok(), id)
                    }
                } else {
                    await bocchi.reply(from, eng.wrongFormat(), id)
                }
                break;
            case 'setstatus':
            case 'setstats':
            case 'setstat':
                if (!isOwner) return await bocchi.reply(from, eng.ownerOnly(), id)
                if (!q) return await bocchi.reply(from, eng.emptyMess(), id)
                await bocchi.setMyStatus(q)
                await bocchi.reply(from, eng.ok(), id)
                break;
            case 'mute':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(pushname), id)
                if (!isGroupMsg) return await bocchi.reply(from, eng.groupOnly(), id)
                if (!isGroupAdmins) return await bocchi.reply(from, eng.adminOnly(), id)
                if (ar[0] === 'enable') {
                    if (isMute) return await bocchi.reply(from, eng.muteChatOnAlready(), id)
                    _mute.push(groupId)
                    fs.writeFileSync('./database/bot/mute.json', JSON.stringify(_mute))
                    await bocchi.reply(from, eng.muteChatOn(), id)
                } else if (ar[0] === 'disable') {
                    _mute.splice(groupId, 1)
                    fs.writeFileSync('./database/bot/mute.json', JSON.stringify(_mute))
                    await bocchi.reply(from, eng.muteChatOff(), id)
                } else {
                    await bocchi.reply(from, eng.wrongFormat(), id)
                }
                break;
            case 'setname':
                if (!isOwner) return await bocchi.reply(from, eng.ownerOnly(), id)
                if (!q || q.length > 25) return await bocchi.reply(from, eng.wrongFormat(), id)
                await bocchi.setMyName(q)
                await bocchi.reply(from, eng.nameChanged(q), id)
                break;
            case 'grouplist':
                if (!isRegistered) return await bocchi.reply(from, eng.notRegistered(), id)
                const getGroups = await bocchi.getAllGroups()
                let txtGc = '*── 「 GROUP LIST 」 ──*\n'
                for (let i = 0; i < getGroups.length; i++) {
                    txtGc += `\n\n❏ *Name*: ${getGroups[i].name}\n❏ *Unread messages*: ${getGroups[i].unreadCount} messages`
                }
                await bocchi.sendText(from, txtGc)
                break;
            //case 'reset':
                //if (!isOwner) return await bocchi.reply(from, eng.ownerOnly(), id)
                //_limit = []
                //console.log('Hang tight, it\'s time to reset usage limits...')
                //fs.writeFileSync('./database/user/limit.json', JSON.stringify(_limit))
                //await bocchi.reply(from, eng.ok(), id)
                //console.log('Success!')
                //break;
            default:
                if (isCmd) {
                    await bocchi.reply(from, eng.cmdNotFound(command), id)
                }
                break;
        }
    } catch (err) {
        console.error(color('[ERROR]', 'red'), err)
    }
}
/********** END OF MESSAGE HANDLER **********/
