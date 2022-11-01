import {Router} from 'express'
import bodyParser from 'body-parser'
import aws from 'aws-sdk';
import fs from 'fs';
import Config from '../models/config'
import ensureAdmin from '../middlewares/ensure-admin'

import {invalidCache} from '../db-config'

const r = new Router()
var cors = require('cors');
var multer  = require('multer')
const { Readable } = require('stream');


r.use(ensureAdmin)
r.use(bodyParser.json())
r.use(cors())

aws.config.setPromisesDependency();
aws.config.update({
accessKeyId: 'AKIARVGPJVYVJWPKFRI3',
secretAccessKey: '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',
region: 'eu-west-1',
});
const s3 = new aws.S3();

	
function s3upload(req, res) {
	var filename = String(Date.now()) +req.file.originalname
	var params = {
	ACL: 'public-read',
	Bucket: 'bucketeer-a30efe07-0cca-46a0-8186-8bc37fc960aa',
    Body: fs.createReadStream(req.file.path),
    Key: `userImages/${filename}`
	};
    s3.upload(params, (err, data) => {
      if (err) {
        console.log('Error occured while trying to upload to S3 bucket', err);
      }

      if (data) {
        fs.unlinkSync(req.file.path); // Empty temp folder
        const locationUrl = data.Location;
        //console.log(locationUrl);
		res.status(200).send();
      }
    });
 }

r.get('/', async (req, res) => {
  const configs = await Config.fetchAll()
  res.json(configs)
})

r.put('/', async (req, res) => {
  invalidCache()
  const {name, value} = req.body
  await Config.where({name}).save({value}, {patch: true})
  const configs = await Config.fetchAll()
  res.json(configs)
})

r.post('/postImages', multer({ dest: 'temp/'}).single('file'), s3upload);


 
 
r.get('/userImages', async (req, res) => {
	const params = {
		Bucket: 'bucketeer-a30efe07-0cca-46a0-8186-8bc37fc960aa',
		Delimiter: '',
		Prefix: 'userImages/',
	};
    s3.listObjectsV2(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
      } else {
        
		var parsedData = data.Contents.map(function(file){
			var f2 = 'https://bucketeer-a30efe07-0cca-46a0-8186-8bc37fc960aa.s3.eu-west-1.amazonaws.com/' + file.Key
			return f2
		})
		//console.log(parsedData);
		res.status(200).send(JSON.stringify(parsedData))
      }
    });
})

export default r
