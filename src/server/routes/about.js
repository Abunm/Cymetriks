import {Router} from 'express'
import {getConfig} from '../db-config'

const r = new Router()

r.get('/', async (req, res) => {
  const config = await getConfig()
  res.json({
    'Envoyer un commentaire': config['Envoyer un commentaire'],
    'Confidentialité': config['Confidentialité'],
    'Termes générales': config['Termes générales'],
    'Aide': config['Aide'],
    'Licenses': config['Licenses'],
  })
})

export default r
