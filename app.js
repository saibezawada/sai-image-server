/*eslint-env node*/

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');
const url = require('url');
const quertstring = require('querystring');
const bodyParser = require('body-parser');

const creds = require('./image-store-creds.json');
const cos_config = require('./cos-config.json');

// create a new express server
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

/*
* special route for img urls: get the image out of COS
*/
app.get('/img/:project/:filename', async (req, res) => {
  var params = req.params;
  console.log("get an image. params: ",params);
  var result = await image_lookup(params); 
  res.write(result);
  res.end();
});

//start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`server starting on http://localhost:${port}`);
});

/*
*  image_lookup function 
*/
async function image_lookup(params){
  // establish connection to IBM Cloud Object Storage (COS)
  const COS = require('ibm-cos-sdk');
//  let s3Options;
  let s3Config = {
    accessKeyId: creds.cos_hmac_keys.access_key_id,
    secretAccessKey: creds.cos_hmac_keys.secret_access_key,
    region: 'ibm',
    endpoint: new COS.Endpoint(cos_config.cos_endpoint_url),
  }
/*
  s3Options = {
      accessKeyId: "a4cfad8d201548fea97b1d9a182259c6",
      secretAccessKey: "df4620f1ea1b0fca36fc9222cb954f3d98ecbfeb06e3ed78",
      region: 'ibm',
      endpoint: new COS.Endpoint("s3.us-east.cloud-object-storage.appdomain.cloud"),
  };
  */

  const cos = new COS.S3(s3Config);
  console.log("connected to Cloud Object Storage");

//  var bucket = "image-server-cos-standard-leighs-images";
  var bucket = cos_config.cos_bucket;

  var prefix = params.project;
  var filename = params.filename;
  var fileKey = prefix + "/" + filename;
  console.log("Key: " + fileKey);

  let response;
  try {
    response = await cos.getObject({ Bucket: bucket, Key: fileKey }).promise();
    console.log("retrieved file: " + prefix + "/" + filename);
  } catch (err) {
    console.log(err);
    throw err.message;
  }
  //console.log("file contents:");
  //console.log(response);
  return response.Body;
}