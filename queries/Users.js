var util = require('util');

/* register mysql queries */
module.exports = {
  selectAllUsers : function(){
    var query = [];
        query.push('SELECT ');
        query.push('* ');
        query.push('FROM tb_users ');
    return query.join('');
  }
};
