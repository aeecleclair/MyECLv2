/*
 * Charge les moteurs de templates avec une interface commune
 * Les moteurs seront déclaré dans des fichiers séparé
 * Pour ajouter un moteur il suffira de créer un fichier interface qui le
 * déclare en créant un ensemble de fonctions que l'on retrouvera a chaque fois
 */

const fs = require('fs');
const path = require('path');

// render : template string, values -> html string
// renderFile : template file, values, (err, html string -> 0) -> 0
// compile : template string -> (values -> html string)
// compileFile : template file, (err, (values -> html string) -> 0) -> 0

module.exports = function(context){
    context.engine = new Object();

    var engines = fs.readdirSync(context.template_engine_path);
    var promises = new Array();
    for(let key in engines){
        let file_name = path.join(context.template_engine_path, engines[key]);
        if(file_name.slice(-3) == '.js'){
            let prom = new Promise(function(res){
                var engine = require(file_name);
                context.engine[engine.name] = engine;
                res();
            });
            promises.push(prom);
        }
    } 
    return Promise.all(promises);
};

