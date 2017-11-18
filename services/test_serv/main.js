/*
 * Nom : test_serv
 * Desciption :
 * Service d'exemple
 */

// Imports
// const une_dependance = require('unedep');
module.exports = function(context){
    var srv = new Object();
    srv.say_hello = function(){
        context.log.info('Hello !');
    };
    
    srv.value = 'A service value';
    return srv;
};
