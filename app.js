/*eslint-env node*/
const HOST = '0.0.0.0';
const PORT = 8080;

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');
const url = require('url');
const quertstring = require('querystring');
const bodyParser = require('body-parser');

// create a new express server
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/',(req, res, next) => {
  res.sendFile(__dirname + '/public/background.jpg');
});

app.get('/img/:filename', async (req, res) => {
  console.log("get an image. params: ",req.params);
  var result = await image_lookup(req.params); 
  res.write(result);
  res.end();
});

app.get('/img/:project/:filename', async (req, res) => {
  console.log("get an image. params: ",req.params);
  var result = await image_lookup(req.params); 
  res.write(result);
  res.end();
});

// this matches all routes and all methods i.e a centralized error handler
app.use((req, res, next) => {
  var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  console.log("Invalid URL: ",fullUrl);
  var errorText = "Invalid URL: " + fullUrl;
  var errorMsg2 = "Valid URLs for the image-server are in the format: " + req.protocol + '://' + req.get('host') + "/img/<project>/<image-filename>";
  res.status(404).send({
  status: 404,
  error: errorText,
  errorMsg2: errorMsg2
  })
 });

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

//start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`server listening on port: ${port}`);
});


async function image_lookup(params){
  // establish connection to IBM Cloud Object Storage (COS)
  const COS = require('ibm-cos-sdk');
  let s3Options;
  s3Options = {
      accessKeyId: "07b3e5aaa9c640aa9e8dd8a88307c99a",
      secretAccessKey: "ae6d93bc53524143b23e30224fad7b88778110820690f51e",
      region: 'ibm',
      endpoint: new COS.Endpoint("s3.us-east.cloud-object-storage.appdomain.cloud"),
  };
  const cos = new COS.S3(s3Options);
  console.log("connected to Cloud Object Storage");
  var bucket = "img-server-cos-cos-standard-fza";
  var prefix = params.project;
  var filename = params.filename;
  var fileKey;
  if (prefix == null){
    fileKey = filename;
  }
  else {
    fileKey =   prefix + "/" + filename;
  }
  console.log("Key: " + fileKey);

  let response;
  try {
    response = await cos.getObject({ Bucket: bucket, Key: fileKey }).promise();
    console.log("retrieved file: " + fileKey);
  } catch (err) {
    console.log(err.message);
    var resBody = "No such file was found in the image storage: " + fileKey;
    return resBody;
  }
  
  return response.Body;
}