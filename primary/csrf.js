/*
 * Module pour gérer les tokens CSRF
 */

const crypt = require('crypto'); // module node standard
module.exports = function(context){
    var csrf = new Object();
    csrf.newToken = function(login, callback){
        crypt.randomBytes(512, function(err, buffer){
            if(err){
                callback(err);
            } else {
                var token = buffer.toString('base64');
                var data = {
                    'time' : Date.now(),
                    'token' : token,
                    'login' : login
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

    csrf.checkToken = function(login, token, callback){
        context.database.select('csrfToken', 'login = ? AND token = ? AND time > ?', [login, token, Date.now() - context.token_life], function(err, rows){
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
