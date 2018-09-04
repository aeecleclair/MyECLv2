/*
 * Module pour gérer les tokens CSRF
 */

const crypt = require('crypto'); // module node standard
module.exports = function(context){
    var csrf = new Object();
    csrf.newToken = function(login, why, callback){
        if(!callback){
            callback = why;
        }
        crypt.randomBytes(192, function(err, buffer){ // 192 bytes -> 256 base64
            if(err){
                callback(err);
            } else {
                var token = buffer.toString('base64');
                var data = {
                    'time' : Date.now(),
                    'token' : token,
                    'login' : login,
                    'why'   : 'any'
                };
                context.database.save('csrfToken', data, function(err){
                    if(err){
                        callback(err);
                    } else {
                        callback(null, token);
                    }
                });
            }
        });
    };

    csrf.checkToken = function(login, token, why, callback){
        if(!callback){
            callback = why;
            why = 'any';
        }
        context.database.select('csrfToken', 'login = ? AND token = ? AND time > ? AND why = ?', [login, token, Date.now() - 1000*context.token_life, why], function(err, rows){
            if(err){
                callback(err);
            } else {
                if(rows.length > 0){
                    callback(null, true);
                    context.database.delete('csrfToken', 'login = ? AND token = ?', [login, token], function(err){
                        if(err){
                            context.log.error(err);
                        }
                    });
                } else {
                    callback(null, false);
                }
            }
        });
    };
    return csrf;
};
