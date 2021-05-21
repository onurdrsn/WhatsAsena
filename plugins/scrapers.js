/* Copyright (C) 2020 Yusuf Usta.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
WhatsAsena - Yusuf Usta
*/

const Asena = require('../events');
const {MessageType,Mimetype} = require('@adiwajshing/baileys');
const translatte = require('translatte');
const config = require('../config');
const StoreDB = require("axios");
//============================== CURRENCY =============================================
const { exchangeRates } = require('exchange-rates-api');
const ExchangeRatesError = require('exchange-rates-api/src/exchange-rates-error.js')
//============================== TTS ==================================================
const fs = require('fs');
const https = require('https');
const googleTTS = require('google-translate-tts');
//=====================================================================================
//============================== YOUTUBE ==============================================
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const yts = require( 'yt-search' )
const got = require("got");
const ID3Writer = require('browser-id3-writer');
const SpotifyWebApi = require('spotify-web-api-node');
const req = require('request');

const spotifyApi = new SpotifyWebApi({
    clientId: 'acc6302297e040aeb6e4ac1fbdfd62c3',
    clientSecret: '0e8439a1280a43aba9a5bc0a16f3f009'
});
//=====================================================================================
const Language = require('../language');
const Lang = Language.getString('scrapers');
const bix = Language.getString('unvoice');

const wiki = require('wikijs').default;
var gis = require('g-i-s');

Asena.addCommand({pattern: 'trt(?: |$)(\\S*) ?(\\S*)', desc: Lang.TRANSLATE_DESC, usage: Lang.TRANSLATE_USAGE, fromMe: true}, (async (message, match) => {
    if (!message.reply_message) {
        return await message.client.sendMessage(message.jid,Lang.NEED_REPLY,MessageType.text);
    }

    ceviri = await translatte(message.reply_message.message, {from: match[1] === '' ? 'auto' : match[1], to: match[2] === '' ? config.LANG : match[2]});
    if ('text' in ceviri) {
        return await message.reply('*▶️ ' + Lang.LANG + ':* ```' + (match[1] === '' ? 'auto' : match[1]) + '```\n'
        + '*◀️ ' + Lang.FROM + '*: ```' + (match[2] === '' ? config.LANG : match[2]) + '```\n'
        + '*🔎 ' + Lang.RESULT + ':* ```' + ceviri.text + '```');
    } else {
        return await message.client.sendMessage(message.jid,Lang.TRANSLATE_ERROR,MessageType.text)
    }
}));

Asena.addCommand({pattern: 'currency(?: ([0-9.]+) ([a-zA-Z]+) ([a-zA-Z]+)|$|(.*))', fromMe: true}, (async (message, match) => {
    if(match[1] === undefined || match[2] == undefined || match[3] == undefined) {
        return await message.client.sendMessage(message.jid,Lang.CURRENCY_ERROR,MessageType.text);
    }
    let opts = {
        amount: parseFloat(match[1]).toFixed(2).replace(/\.0+$/,''),
        from: match[2].toUpperCase(),
        to: match[3].toUpperCase()
    }
    try {
        result = await exchangeRates().latest().symbols([opts.to]).base(opts.from).fetch()
        result = parseFloat(result).toFixed(2).replace(/\.0+$/,'')
        await message.reply(`\`\`\`${opts.amount} ${opts.from} = ${result} ${opts.to}\`\`\``)
    }
    catch(err) {
        if (err instanceof ExchangeRatesError) 
            await message.client.sendMessage(message.jid,Lang.INVALID_CURRENCY,MessageType.text)
        else {
            await message.client.sendMessage(message.jid,Lang.UNKNOWN_ERROR,MessageType.text)
            console.log(err)
        }
    }
}));

Asena.addCommand({pattern: 'tts (.*)', fromMe: true, desc: Lang.TTS_DESC}, (async (message, match) => {
    if(match[1] === undefined || match[1] == "")
        return;
    
    let 
        LANG = config.LANG.toLowerCase(),
        ttsMessage = match[1],
        SPEED = 1.0

    if(langMatch = match[1].match("\\{([a-z]{2})\\}")) {
        LANG = langMatch[1]
        ttsMessage = ttsMessage.replace(langMatch[0], "")
    } 
    if(speedMatch = match[1].match("\\{([0].[0-9]+)\\}")) {
        SPEED = parseFloat(speedMatch[1])
        ttsMessage = ttsMessage.replace(speedMatch[0], "")
    }
    
    var buffer = await googleTTS.synthesize({
        text: ttsMessage,
        voice: LANG
    });
    
    await message.client.sendMessage(message.jid, buffer, MessageType.audio, {mimetype: Mimetype.ogg, ptt: true});
       
}));

Asena.addCommand({pattern: 'song ?(.*)', fromMe: true, desc: Lang.SONG_DESC}, (async (message, match) => { 
    if (match[1] === '') return await message.client.sendMessage(message.jid,Lang.NEED_TEXT_SONG,MessageType.text);    
    let arama = await yts(match[1]);
    arama = arama.all;
    if(arama.length < 1) return await message.client.sendMessage(message.jid,Lang.NO_RESULT,MessageType.text);
    var reply = await message.client.sendMessage(message.jid,Lang.DOWNLOADING_SONG,MessageType.text);

    let title = arama[0].title.replace(' ', '+');
    let stream = ytdl(arama[0].videoId, {
        quality: 'highestaudio',
    });
    
    got.stream(arama[0].image).pipe(fs.createWriteStream(title + '.jpg'));
    ffmpeg(stream)
        .audioBitrate(320)
        .save('./' + title + '.mp3')
        .on('end', async () => {
            const writer = new ID3Writer(fs.readFileSync('./' + title + '.mp3'));
            writer.setFrame('TIT2', arama[0].title)
                .setFrame('TPE1', [arama[0].author.name])
                .setFrame('APIC', {
                    type: 3,
                    data: fs.readFileSync(title + '.jpg'),
                    description: arama[0].description
                });
            writer.addTag();

            reply = await message.client.sendMessage(message.jid,Lang.UPLOADING_SONG,MessageType.text);
            await message.client.sendMessage(message.jid,Buffer.from(writer.arrayBuffer), MessageType.audio, {mimetype: Mimetype.mp4Audio, ptt: false});
        });
}));

Asena.addCommand({pattern: 'video ?(.*)', fromMe: true, desc: Lang.VIDEO_DESC}, (async (message, match) => { 
    if (match[1] === '') return await message.client.sendMessage(message.jid,Lang.NEED_VIDEO,MessageType.text);    
    
    try {
        var arama = await yts({videoId: ytdl.getURLVideoID(match[1])});
    } catch {
        return await message.client.sendMessage(message.jid,Lang.NO_RESULT,MessageType.text);
    }

    var reply = await message.client.sendMessage(message.jid,Lang.DOWNLOADING_VIDEO,MessageType.text);

    var yt = ytdl(arama.videoId, {filter: format => format.container === 'mp4' && ['720p', '480p', '360p', '240p', '144p'].map(() => true)});
    yt.pipe(fs.createWriteStream('./' + arama.videoId + '.mp4'));

    yt.on('end', async () => {
        reply = await message.client.sendMessage(message.jid,Lang.UPLOADING_VIDEO,MessageType.text);
        await message.client.sendMessage(message.jid,fs.readFileSync('./' + arama.videoId + '.mp4'), MessageType.video, {mimetype: Mimetype.mp4, caption: 'Made for Founder'});
    });
}));

Asena.addCommand({pattern: 'yt ?(.*)', fromMe: true, desc: Lang.YT_DESC}, (async (message, match) => { 
    if (match[1] === '') return await message.client.sendMessage(message.jid,Lang.NEED_WORDS,MessageType.text);    
    var reply = await message.client.sendMessage(message.jid,Lang.GETTING_VIDEOS,MessageType.text);

    try {
        var arama = await yts(match[1]);
    } catch {
        return await message.client.sendMessage(message.jid,Lang.NOT_FOUND,MessageType.text);
    }
    
    var mesaj = '';
    arama.all.map((video) => {
        mesaj += '*' + video.title + '* - ' + video.url + '\n'
    });

    await message.client.sendMessage(message.jid,mesaj,MessageType.text);
    await reply.delete();
}));

Asena.addCommand({pattern: 'wiki ?(.*)', fromMe: true, desc: Lang.WIKI_DESC}, (async (message, match) => { 
    if (match[1] === '') return await message.client.sendMessage(message.jid,Lang.NEED_WORDS,MessageType.text);    
    var reply = await message.client.sendMessage(message.jid,Lang.SEARCHING,MessageType.text);

    var arama = await wiki({ apiUrl: 'https://' + config.LANG + '.wikipedia.org/w/api.php' })
        .page(match[1]);

    var info = await arama.rawContent();
    await message.client.sendMessage(message.jid, info, MessageType.text);
    await reply.delete();
}));

Asena.addCommand({pattern: 'img ?(.*)', fromMe: true, desc: Lang.IMG_DESC}, (async (message, match) => { 
    if (match[1] === '') return await message.client.sendMessage(message.jid,Lang.NEED_WORDS,MessageType.text);
    gis(match[1], async (error, result) => {
        for (var i = 0; i < (result.length < 5 ? result.length : 5); i++) {
            var get = got(result[i].url, {https: {rejectUnauthorized: false}});
            var stream = get.buffer();
                
            stream.then(async (image) => {
                await message.client.sendMessage(message.jid,image, MessageType.image);
            });
        }

        message.reply(Lang.IMG.format((result.length < 5 ? result.length : 5), match[1]));
    });
}));
const deda = "Plugin mağazasında arama yapar."

if (config.WORKTYPE == 'private') {

    Asena.addCommand({pattern: 'store ?(.*)', fromMe: true, desc: deda }, (async (message, match) => { 

        if (config.LANG == 'TR' || config.LANG == 'AZ') {
            if (match[1] === '') {

                await message.client.sendMessage(
                    message.jid,
                    '_Mağazada En Son Eklenen Pluginler Aranıyor.._',
                    MessageType.text
                );
                await new Promise(r => setTimeout(r, 1800));
           
                const messages = await message.client.loadConversation('905511384572-1616840790@g.us', 3)
                const message = messages[0]
                await message.forwardMessage('905511384572-1616840790@g.us', message)
            }
            else {

                await new Promise(r => setTimeout(r, 1100));

                const messages = await message.client.loadConversation('905511384572-1616840790@g.us', 1)
                const message = messages[0].includes(`${match[1]}`)
                await message.forwardMessage('905511384572-1616840790@g.us', message)

            }
        }
        else {
            if (match[1] === '') {

                await message.client.sendMessage(
                    message.jid,
                    '_Searching for the Latest Plugins in the Store.._',
                    MessageType.text
                );
                await new Promise(r => setTimeout(r, 1800));

                await StoreDB.get('https://gist.githubusercontent.com/Xenon67/ff744e3713004fbaf48fcc97ec24b5cb/raw/2c023a649ac9b4fc7cc88d59ff3e58270578b365/Store.json').then(async (store) => {

                    const { plug1en, plug2en, plug3en } = store.data.result

                    const payload = `\n\n *==============================* \n\n${plug1en} \n\n *==============================* \n\n${plug2en} \n\n *==============================* \n\n${plug3en} \n\n *==============================*`
   
                    await message.client.sendMessage(message.jid,'```Here are the Latest Plugins Uploaded to the Store:```' + payload, MessageType.text);
                });
            }
            else {
                await message.client.sendMessage(
                    message.jid,
                    'Hmm',
                    MessageType.text
                );
            }
        }
    }));
}
else if (config.WORKTYPE == 'public') {

    Asena.addCommand({pattern: 'store ?(.*)', fromMe: false, desc: deda }, (async (message, match) => { 

        if (config.LANG == 'TR' || config.LANG == 'AZ') {
            if (match[1] === '') {

                await message.client.sendMessage(
                    message.jid,
                    '_Mağazada En Son Eklenen Pluginler Aranıyor.._',
                    MessageType.text
                );
                await new Promise(r => setTimeout(r, 1800));

                await StoreDB.get('https://gist.githubusercontent.com/Xenon67/ff744e3713004fbaf48fcc97ec24b5cb/raw/2c023a649ac9b4fc7cc88d59ff3e58270578b365/Store.json').then(async (store) => {

                    const { plug1tr, plug2tr, plug3tr } = store.data.result

                    const payload = `\n\n *==============================* \n\n${plug1tr} \n\n *==============================* \n\n${plug2tr} \n\n *==============================* \n\n${plug3tr} \n\n *==============================*`
   
                    await message.client.sendMessage(message.jid,'```İşte Mağazaya Yüklenen Son Pluginler:```' + payload, MessageType.text);
                });
            }
            else {
                await message.client.sendMessage(
                    message.jid,
                    'Hmm',
                    MessageType.text
                );
            }
        }
        else {
            if (match[1] === '') {

                await message.client.sendMessage(
                    message.jid,
                    '_Searching for the Latest Plugins in the Store.._',
                    MessageType.text
                );
                await new Promise(r => setTimeout(r, 1800));

                await StoreDB.get('https://gist.githubusercontent.com/Xenon67/ff744e3713004fbaf48fcc97ec24b5cb/raw/2c023a649ac9b4fc7cc88d59ff3e58270578b365/Store.json').then(async (store) => {

                    const { plug1en, plug2en, plug3en } = store.data.result

                    const payload = `\n\n *==============================* \n\n${plug1en} \n\n *==============================* \n\n${plug2en} \n\n *==============================* \n\n${plug3en} \n\n *==============================*`
   
                    await message.client.sendMessage(message.jid,'```Here are the Latest Plugins Uploaded to the Store:```' + payload, MessageType.text);
                });
            }
            else {
                await message.client.sendMessage(
                    message.jid,
                    'Hmm',
                    MessageType.text
                );
            }
        }
    }));
}
const sh = "Yanıtlanan ses dosyasının içindeki müziği bulur."

Asena.addCommand({pattern: 'shazam', fromMe: true, desc: sh }, (async (message, match) => { 

    if (message.reply_message === false) return await message.client.sendMessage(message.jid, bix.UV_REPLY, MessageType.text);

    var location = await message.client.downloadAndSaveMediaMessage({
        key: {
            remoteJid: message.reply_message.jid,
            id: message.reply_message.id
        },
        message: message.reply_message.data.quotedMessage
    });

    ffmpeg(location)
        .format('mp3')
        .save('lyr.mp3')
        .on('end', async () => {

            var data = { 'api_token': '6a03ebccfc18bb19e3fb7bb5280a51ab', 'file': fs.createReadStream('./lyr.mp3'), 'return': 'apple_music,spotify' };
            req ({ uri: 'https://api.audd.io/', form: data, method: "POST" }, async (err, res, body) => {
                return await message.client.sendMessage(message.jid, body, MessageType.text);
            })
        })
}));
