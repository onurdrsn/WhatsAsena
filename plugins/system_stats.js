/* Copyright (C) 2020 Yusuf Usta.

Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.

WhatsAsena - Yusuf Usta
Developer & Co-Founder - Phaticusthiccy
*/

const Asena = require('../events');
const {MessageType} = require('@adiwajshing/baileys');
const {spawnSync} = require('child_process');
const Config = require('../config');
const chalk = require('chalk');

const Language = require('../language');
const Lang = Language.getString('system_stats');


if (Config.WORKTYPE == 'private') {

    Asena.addCommand({pattern: 'onr', fromMe: true, desc: Lang.ALIVE_DESC}, (async (message, match) => {

        if (Config.ALIVEMSG == 'default') {
            await message.client.sendMessage(message.jid,'```Tanrı Türk\'ü Korusun. 🐺 Asena Hizmetinde!```\n\n*Version:* ```'+Config.VERSION+'```\n*Branch:* ```'+Config.BRANCH+'```\n*Telegram Group:* https://t.me/AsenaSupport\n*Telegram Channel:* https://t.me/asenaremaster' , MessageType.text);
        }
        else if (Config.ALIVEMSG == 'SELO') {
            await message.client.sendMessage(
            message.jid, 
            fs.readFileSync("/root/WhatsAsena/media/gif/VID-20210228-WA0022.mp4"),
            MessageType.video, 
            { mimetype: Mimetype.mpeg, caption: "```WhatsAsena Founder SELO İçin Çalışıyor!```\n\n*Version:* 0.27.9 - Dev\n*Grade:* Founder\n*AIPackages:* Xteam / Eva / DeepAI / WhatsAsena / RTDA\n*DeepAI Version:* ```1.0.17```\n*XTeam Verison:* ```4.2```" }
        )
        }   
        else if (Config.ALIVEMSG == 'ONUR') {
            await message.client.sendMessage(
            message.jid, 
            fs.readFileSync("/root/WhatsAsena/blob/master/media/gif/VID-20210402-WA0119.mp4"),
            MessageType.video, 
            { mimetype: Mimetype.mpeg, caption: "WhatsAsena Founder R25 İçin Çalışıyor!\n\n*Version:* 0.24.7 - Dev\n*Grade:* Founder\n*AIPackages:*Xteam / Eva / DeepAI / WhatsAsena / RTDA\n*DeepAI Version:* ```1.0.17```\n*XTeam Verison:* ```4.2```" }
        )
        }
        else {
            await message.client.sendMessage(message.jid,Config.ALIVEMSG + '\n*Powered by ONUR 💑 HARİKA*', MessageType.text);
        }
    }));

    Asena.addCommand({pattern: 'system', fromMe: true, desc: Lang.SYSD_DESC}, (async (message, match) => {

        const child = spawnSync('neofetch', ['--stdout']).stdout.toString('utf-8')
        await message.sendMessage(
            '```' + child + '```', MessageType.text
        );
    }));
}
else if (Config.WORKTYPE == 'public') {

    Asena.addCommand({pattern: 'onr', fromMe: false, desc: Lang.ALIVE_DESC}, (async (message, match) => {

       if (Config.ALIVEMSG == 'default') {
            await message.client.sendMessage(message.jid,'```Tanrı Türk\'ü Korusun. 🐺 Asena Hizmetinde!```\n\n*Version:* ```'+Config.VERSION+'```\n*Branch:* ```'+Config.BRANCH+'```\n*Telegram Group:* https://t.me/AsenaSupport\n*Telegram Channel:* https://t.me/asenaremaster' , MessageType.text);
        }
        else if (Config.ALIVEMSG == 'SELO') {
            await message.client.sendMessage(
            message.jid, 
            fs.readFileSync("/root/WhatsAsena/media/gif/VID-20210228-WA0022.mp4"),
            MessageType.video, 
            { mimetype: Mimetype.mpeg, caption: "```WhatsAsena Founder SELO İçin Çalışıyor!```\n\n*Version:* 0.27.9 - Dev\n*Grade:* Founder\n*AIPackages:* Xteam / Eva / DeepAI / WhatsAsena / RTDA\n*DeepAI Version:* ```1.0.17```\n*XTeam Verison:* ```4.2```" }
        )
        }   
        else if (Config.ALIVEMSG == 'ONUR') {
            await message.client.sendMessage(
            message.jid, 
            fs.readFileSync("/root/WhatsAsena/media/gif/VID-20210402-WA0119.mp4"),
            MessageType.video, 
            { mimetype: Mimetype.mpeg, caption: "WhatsAsena Founder R25 İçin Çalışıyor!\n\n*Version:* 0.24.7 - Dev\n*Grade:* Founder\n*AIPackages:*Xteam / Eva / DeepAI / WhatsAsena / RTDA\n*DeepAI Version:* ```1.0.17```\n*XTeam Verison:* ```4.2```" }
        )
        }
        else {
            await message.client.sendMessage(message.jid,Config.ALIVEMSG + '\n*Powered by ONUR 💑 HARİKA*', MessageType.text);
        }
    }));

    Asena.addCommand({pattern: 'sysd', fromMe: false, desc: Lang.SYSD_DESC}, (async (message, match) => {

        const child = spawnSync('neofetch', ['--stdout']).stdout.toString('utf-8')
        await message.sendMessage(
            '```' + child + '```', MessageType.text
        );
    }));
}
