module.exports = function(context){

    exports.info = function(msg){
        // Affiche des message informatifs
        console.log(msg);
    };
    exports.warning = function(msg){
        // Affiche des message d'alerte
        console.log('[WARN] ' + msg);
    };
    exports.error = function(msg, fatal=false){
        // Signale une erreur
        console.log('[ERR] ' + msg);
        if(fatal){
            throw msg;
        }
    };

    context.log = exports;
    
    return exports;
};
