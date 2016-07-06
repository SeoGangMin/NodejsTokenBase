var Mysql     = require('mysql')
  ,Q          = require('q')
  ,util       = require('util')
  ,DB_OPTIONS = Configs['DB_OPTIONS'];

console.log('\n/*************** database options ******************/');
console.log(DB_OPTIONS);
console.log('/*************** database options ******************/\n');


var pool  = Mysql.createPool(DB_OPTIONS);
module.exports = {
  getConnection : function(){
    var defer = Q.defer();
    pool.getConnection(function(err, conn){
      if(err){
        conn.release();
        defer.reject(err);
      }else{
        defer.resolve(conn);
      }
    });
    return defer.promise;
  }
  ,execQueryPromise : function( sql, params ){
    var self = this;
    var defer = Q.defer();
    self.getConnection().then(
      function( conn ){
        conn.query({sql:sql, timeout : 30000}, params, function(err, rows){
          conn.release();
          if(err){
            defer.reject(err);
          }else{
            defer.resolve(rows);
          }
        });
      }
      ,function ( err ){
        defer.reject(err);
      }
    );

    return defer.promise;
  }

    ,beginTransaction : function(sqlList){
    var self = this;
    var defer = Q.defer();
    self.getConnection().then(
      function(conn){
        conn.beginTransaction({sql:'START TRANSACTION',timeout:3000},function(err){
          if(err){
            conn.release();
            defer.reject(err);
          }else{

            var promiseGroup = [];

            for(var i=0; i<sqlList.length; i++){
              var sql = sqlList[i];
              var promise = queryPromise(conn, sql);
              promiseGroup.push(promise);
            }

            Q.all(promiseGroup).then(
              function( result ){
                self.endTransaction(conn, null, result)
                .then(
                  function( result ){
                    defer.resolve(result);
                  }
                  ,function( err1 ){
                    defer.reject(err1);
                  }
                )
              }
              ,function( err0 ){
                self.endTransaction(conn, err0)
                .then(
                  function( result ){
                    defer.resolve(result);
                  }
                  ,function( err1 ){
                    defer.reject(err1);
                  }
                );
              }
            );
          }
        });
      },
      function(err){
        defer.reject(err);
      }
    );

    return defer.promise;
  }
  ,endTransaction : function(conn, tranErr, result){
    var defer = Q.defer();
    if(tranErr){
      conn.query({sql:'ROLLBACK', timeout:1000}, null, function(err){
        conn.release();
        if(err){
          defer.reject(err);
        }else{
          defer.reject(tranErr);
        }
      });
    }else{
      conn.query({sql:'COMMIT', timeout:1000}, null, function(err){
        conn.release();
        if(err){
          defer.reject(err);
        }else{
          defer.resolve(result);
        }
      });
    }
    return defer.promise;
  }
}

function queryPromise(conn, sql){
  var defer = Q.defer();
  conn.query({sql:sql,timeout:30000}, null,function(err, result){
    if(err){
      defer.reject(err);
    }else{
      defer.resolve(result);
    }
  });
  return defer.promise;
}
