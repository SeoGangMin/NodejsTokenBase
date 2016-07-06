var express = require('express');
var router = express.Router();

var Auth = Commons.Auth;

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('index!');
  res.render('test', null);
});


router.post('/test', Auth.ensureAuthorized, function(req, res, next) {
  var body = req.body;
  console.log(body);
  res.status(200).send(req.access_user);
});

module.exports = router;
