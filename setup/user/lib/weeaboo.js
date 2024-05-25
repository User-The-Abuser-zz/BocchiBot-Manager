const { fetchJson } = require('../tools/fetcher');
const { parseStringPromise } = require('xml2js');
const xml2js = require('xml2js');
const cheerio = require('cheerio');
const axios = require('axios');

/**
 * Get random waifu image.
 * @param {boolean} [nsfw=false]
 * @returns {Promise<object>}
 */
const waifu = (nsfw) => new Promise((resolve, reject) => {
    if (nsfw === true) {
        console.log('Get NSFW waifu image...')
        fetchJson('https://waifu.pics/api/nsfw/waifu')
            .then((result) => resolve(result))
            .catch((err) => reject(err))
    } else {
        console.log('Get SFW waifu image...')
        fetchJson('https://waifu.pics/api/sfw/waifu')
            .then((result) => resolve(result))
            .catch((err) => reject(err))
    }
})

/**
 * Get anime source from image.
 * @param {string} url
 * @returns {Promise<object>}
 */
const wait = (url) => new Promise((resolve, reject) => {
    console.log('Searching for source...')
    fetchJson(`https://api.trace.moe/search?anilistInfo&url=${encodeURIComponent(url)}`)
        .then((result) => resolve(result))
        .catch((err) => reject(err))
})

const parseXmlResponse = (xmlResponse) => {
    return new Promise((resolve, reject) => {
        const parser = new xml2js.Parser({ explicitArray: false });
        parser.parseString(xmlResponse, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};


/**
 * ExtractImageUrls by User
 */
const extractImageUrls = (xmlData) => {
    const posts = xmlData.posts.post;
    const imageUrls = posts.map(post => post.$.file_url);
    return imageUrls;
};

/**
 * Gelbooru by User
 */
const gelbooru = (tags) => {
    console.log(`Get media from gelbooru with tags: ${tags}`);
    const apiUrl = `https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&tags=${tags}`;
    return fetchJson(apiUrl);
};

/**
 * Rule34 by User
 */
const rule34 = async (rtags) => {
    try {
        console.log(`Get media from rule34 with tags: ${rtags}`);
        const apiUrl = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&limit=1000&pid=0&tags=${rtags}`;
        const response = await axios.get(apiUrl);
        const xmlData = await parseXmlResponse(response.data);
        const imageUrls = extractImageUrls(xmlData);
        if (imageUrls.length === 0) {
            throw new Error('No files found for the specified tags.');
        }
        const randomIndex = Math.floor(Math.random() * imageUrls.length);
        return imageUrls[randomIndex];
    } catch (error) {
        console.error('Error fetching file from Rule34:', error);
        throw new Error('An error occurred while fetching file from Rule34.');
    }
};

/**
 * Realbooru by User
 */
const realbooru = async (rbtags) => {
    try {
        console.log(`Get media from realbooru with tags: ${rbtags}`);
        const apiUrl = `https://realbooru.com/index.php?page=dapi&s=post&q=index&limit=1000&pid=0&tags=${rbtags}`;
        const response = await axios.get(apiUrl);
        const xmlData = await parseXmlResponse(response.data);
        const imageUrls = extractImageUrls(xmlData);
        if (imageUrls.length === 0) {
            throw new Error('No files found for the specified tags.');
        }
        const randomIndex = Math.floor(Math.random() * imageUrls.length);
        return imageUrls[randomIndex];
    } catch (error) {
        console.error('Error fetching file from Realbooru:', error);
        throw new Error('An error occurred while fetching file from Realbooru.');
    }
};

/**
 * ThisPersonDoesNotExist by User
 */
const thisPersonDoesNotExist = async () => {
    try {
        console.log('Get image from thispersondoesnotexist.com...');
        const response = await axios.get('https://thispersondoesnotexist.com', { responseType: 'arraybuffer' });
        const base64Image = Buffer.from(response.data, 'binary').toString('base64');
        return `data:image/jpeg;base64,${base64Image}`;
    } catch (error) {
        console.error('Error fetching image from thispersondoesnotexist.com:', error);
        throw new Error('An error occurred while fetching image from thispersondoesnotexist.com.');
    }
};

module.exports = {
    waifu,
    wait,
    gelbooru,
    rule34,
    realbooru,
    thisPersonDoesNotExist
};
