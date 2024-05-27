Based on BocchiBot (1.5.0): https://github.com/SlavyanDesu/BocchiBot

|----------------------------------------------------------------------------------------------------|
|        Installation Guide          |    BocchiBot-1.6.0      |    Manager-1.0.0     |    by User   |
|----------------------------------------------------------------------------------------------------|
|  Option 0: Install BocchiBot       | Note:		  Just click next until it's finished        |
|----------------------------------------------------------------------------------------------------|
|  Option 1: Configure BocchiBot     |                                                               |
|----------------------------------------------------------------------------------------------------|
|  Option 2: Start BocchiBot         | Note:		     Scan the QR code on first start         |
|----------------------------------------------------------------------------------------------------|
|  Option 3: Stop BocchiBot          |                                                               |
|----------------------------------------------------------------------------------------------------|
|  Option 4: Open PM2 Monitor        |                                                               |
|----------------------------------------------------------------------------------------------------|
|  Option 5: Logout from WhatsApp    |                                                               |
|----------------------------------------------------------------------------------------------------|
|  Option 6: Uninstall BocchiBot     |                                                               |
|----------------------------------------------------------------------------------------------------|
|  Option 7: Open BocchiBot Folder   | Note:		      Where BocchiBot is installed           |
|----------------------------------------------------------------------------------------------------|
| Option 8: Open Database Folder     | Note:		Contains bot-data, group-data, user-data     |
|----------------------------------------------------------------------------------------------------|
| Option 9: Clear Temp Folder        | Note:			 Delete temporary files              |
|----------------------------------------------------------------------------------------------------|
| Option 10: Backup Database         | Note:		   Creates a backup on your desktop          |
|----------------------------------------------------------------------------------------------------|
| Option 11: Restart BocchiBot       |                                                               |
|----------------------------------------------------------------------------------------------------|
| Option 12: Force Stop PM2          | Note:		   Deletes/Closes all PM2 Instances          |
|----------------------------------------------------------------------------------------------------|
| Option 13: Backup Database         | Note:	   !!! Uninstalls everything that was installed !!!  |
|----------------------------------------------------------------------------------------------------|
| Option 14: Update                  | Note:			  Updates all Packages               |
|----------------------------------------------------------------------------------------------------|
| Option 15: Reinstall Node Modules  |                                                               |
|----------------------------------------------------------------------------------------------------|
| Option 16: Update by User	     | Note:	    Updates BocchiBot by User to current version     |
|----------------------------------------------------------------------------------------------------|

[BocchiBot 1.6.0 by User] Update History:

- Removed Menu 1 [Downloader]
- Removed Commands: ocr, genshin, toptt, translate, quizizz, kemono, trash, hitler
- Added command: gelbooru
- Added command: rule34
- Added command: realbooru
- Added command: thispersondoesnotexist
- Changed message: removed from menu: "Note: The bot has a cooldown for 5 seconds every time you use it."
- Changed function: cooldown time from 5 seconds to 0 second
- Bug fix: ping command
- Default timezone set to Europe/Berlin
- New: Specific menu can now be accessed by typing "menu index_name" too
- Fixed issues with commands: triggered, bass, nightcore, tomp3: "error: not a valid input format"
- Changed command: bass value 100 is now used automatically
- Changed message: welcome + left
- Changed message: register
- Changed message: user "notPremium"
- Added command: levelingmedia enable/disable (xp only for image/video/gif)
- Changed function: leveling & levelingmedia
- Changed commands: leveling & level
- Added commands: lolion / lolioff: enables or disables loli tag search for gelbooru command
- Changed function: better nsfw system
- Bug fix command: profile and getpic
- Added function:  anti large files (max. 1GB)
- Changed command: stickergif can now be used in private chat too
- Changed welcome system: added command: welcome set [message] to set your custom welcome message
- Removed command: say
- Added command: restart: restart the bot (ONLY WHEN RUNNING IN PM2, NOT NPM)
- Changed commands: autosticker video, stickergif: crop:true
- Removed message: neko, wallpaper, waifu, nsfw, gelbooru, rule34, realbooru: reply "Please wait a moment..."
- Changed command: ai can only be used 20 times per day by users (premium users & owner unlimited)
- Changed command: img can only be used 20 times per day by premium users (premium users & owner unlimited)
- Added command: gptreset all/@user/49xxxxxxxxxxx
- Added command: limitreset all/@user/49xxxxxxxxxxx
- Added commands: rbon / rboff: enables or disables realbooru command
- Removed command: reset
- Added function: run ffmpeg silent in background
- Changed commands: tomp3, bass, nightcore, triggered: run ffmpeg silent in background
- Added function: banned checker: auto remove participant if listed in banned.json
- Added command: gptlimit
- Added command: repost: repost mentioned image, video, gif, audio (temp system for large videos)
- Fixed function: gelbooru (temp system for large videos)
- Added command: ZORG ChatGPT 3.5 Jailbreak
- Changed function: anti virtext: commands are not affected
