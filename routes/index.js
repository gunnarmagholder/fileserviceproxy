var express = require('express');
const url = require('url');
const validUrl = require('valid-url');
var request = require('request');

var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'FileService Proxy' });
});
/* POST request with form data */
router.post('/', function(req, res, next) {
  var urlOutput = "";
  console.log('Entering FORM Parsing');
    // checkUrlExists(req.body.urlstring);
  if (validUrl.isUri(req.body.urlstring)) {
    console.log('Found valid URL');
    urlOutput = url.parse(req.body.urlstring).href;
    urlOutput = detectFileService(urlOutput);
    if (urlOutput != null) {
      console.log('reading url: ', url);
      request.head(urlOutput, function(err, respond, body) {
        console.log('content-type: ', respond.headers['content-type']);
        console.log('content-length: ', respond.headers['content-length']);
        request({
          uri: urlOutput,
          followAllRedirects: true
        }).pipe(res).on('close', function() {
          console.log('done');
        })
      })
    }
  } else {
    var errorURL = url.parse(req.body.urlstring).href;
    console.log(errorURL);
    handleErrorForm(res, "URL is invalid", "Can't read from given url", errorURL);
  }
});

function handleErrorForm(res, message, submessage, errorURL) {
  console.log('Invalid URL');
  urlOutput = "URL is invalid";
  res.render('urlerror', {
    message: message,
    submessage: submessage,
    urlOutput: errorURL
  })
}

function detectFileService(urlString) {
  console.log("Url String : " + urlString);
  var urlHost = url.parse(urlString).hostname;
  console.log("Found Hostname:" + urlHost);
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
  if (urlHost.indexOf("1drv.ms") >= 0) {
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
