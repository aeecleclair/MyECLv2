module.exports = function(context){

    exports.info = function(msg){
        // Affiche des message informatifs
        console.log(msg);
    };
    exports.warning = function(msg){
        // Affiche des message d'alerte
        console.log('[WARN] ' + msg);
    };
    exports.error = function(msg){
        // Signale une erreur
        console.log('[ERR] ' + msg);
    };
    
    return exports;
};