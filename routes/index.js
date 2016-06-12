var express = require('express');
const url = require('url');
const validUrl = require('valid-url');
var request = require('request');

var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'FileService Proxy' });
});
router.post('/', function(req, res, next) {
  var urlOutput = "";
  console.log('Entering FORM Parsing');
    // checkUrlExists(req.body.urlstring);
  if (validUrl.isUri(req.body.urlstring)) {
    console.log('Found valid URL');
    urlOutput = url.parse(req.body.urlstring).href;
    urlOutput = detectFileService(urlOutput);
    console.log('reading url: ', url);
    request.head(urlOutput, function(err, respond, body) {
      console.log('content-type: ', respond.headers['content-type']);
      console.log('content-length: ', respond.headers['content-length']);
      request(urlOutput).pipe(res).on('close', function() {
        console.log('done');
      })
    })

  } else {
    console.log('Invalid URL');
    urlOutput = "URL ist ungültig";
  }
});

function detectFileService(urlString) {
  var urlHost = url.parse(urlString).hostname
  var returnValue = null;
  if (urlHost.indexOf("dropbox.com") >= 0) {
    console.log("Found DropBox URL String");
    returnValue = urlString;
    returnValue = urlString.replace("dl=0", "dl=1");
  }
  if (urlHost.indexOf("onedrive") >= 0) {
    console.log("Found OneDrive URL String");
    returnValue = urlString;
  }
  if (urlHost.indexOf("google.com") >= 0) {
    console.log("Found Google Drive Link");
    var rx = /(.*)\/d\/(.*)\/(.*)/g;
    var arr = rx.exec(urlString);
    returnValue = "https://drive.google.com/uc?export=download&id=" + arr[2];
    console.log("Catching ", returnValue);
  }
  return returnValue;
}

module.exports = router;
