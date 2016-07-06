var express = require('express');
var router = express.Router();
var Auth   = Commons.Auth;

/*
var Mysql  = COMMONS.MysqlWrapper
    ,Query = QUERIES.Users;
    */

router.post('/login', function(req, res, next) {
  var body = req.body;
  console.log(req.headers);
  console.log(body);
  var token = Auth.encode(body);

  res.status(200).send({token:token});
});

module.exports = router;
