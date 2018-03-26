/*
 * Module relatif au cryptage
 */

const bcrypt = require('bcrypt');
const crypt = require('crypto'); // module node standard

module.exports = function(context){

    var crypto = new Object();
    
    crypto.hash = function(password, callback){  // callback = function(err, hash)
        // encrypt password
        bcrypt.hash(password, 10, callback);
    };

    crypto.compare = function(password, hash, callback){  // callback = function(err, result)
        // verifie si hash correspond à password
        bcrypt.compare(password, hash, callback);
    };

    crypto.createToken = function(callback){
        crypt.randomBytes(512, function(err, buffer){
            if(err){
                callback(err);
            } else {
                callback(null, buffer.toString('base64'));
            }
        });
    };


    context.crypto = crypto;
    return crypto;
};
