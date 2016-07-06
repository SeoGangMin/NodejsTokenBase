var Jwt = require('jwt-simple');
var SECRET = "secret";
module.exports = {
  ensureAuthorized : function(req, res, next){
    var self = this;
    var access_token = req.headers['access_token'];
    var accept       = req.headers['accept'];
    if(access_token){
      try{
          var user = Jwt.decode(access_token, SECRET);
          req.access_user = user;
          next();
      }catch(e){
        var err = new Error();
        err.status = 401;
        res.status(err.status).send(err);
      }
    }else{
      var err = new Error();
      err.status = 401;
      
      if(accept.indexOf("application/json") > -1){
        res.status(err.status).send(err);
      }else{
        res.render('error', err);
      }
    }

  }
};
