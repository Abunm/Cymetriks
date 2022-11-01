const fs = require('fs')
const emojis = require('./emoji.json')
const axios = require('axios')

const emojiImages = Object.values(emojis)
  .map(emoji => emoji.unicode)
  .map(unicode => `https://raw.githubusercontent.com/Ranks/emojione-assets/master/png/64/${unicode}.png`)

const result = {}
function fetchBase64(image, test = 3) {
  if (test <= 0)
    return Promise.resolve()
  return axios.get(image, {responseType: 'arraybuffer'})
    .then(response => {
      const base64 = "data:" + response.headers["content-type"] + ";base64," + response.data.toString('base64')
      result[image] = base64
      fs.writeFileSync('./emojis.json', JSON.stringify(result))
      console.log(image + ': DONE')
    }).catch(e => {
      console.log(image + ': ERROR')
      return fetchBase64(image, test - 1)
    })
}

const buildEmojiBase64 = emojiImages.map(image => fetchBase64(image))

Promise.all(buildEmojiBase64).then(() => {
  console.log('ALL DONE !')
})
