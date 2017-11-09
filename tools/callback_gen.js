/*
 * Générateur automatique de fichiers de callback pour les modules
 * Doit être exécuté à la racine du projet MyECL pour fonctionner
 */
const fs = require('fs');
const path = require('path');
const util = require('util');

const argc = process.argv.length;

if(argc <= 2){
    console.log('node tools/callback_gen.js MODULENAME');
    process.exit(0);
}

var glob_conf;

try {
    glob_conf = JSON.parse(fs.readFileSync('myecl_config.json'));
} catch(err) {
    console.log('Unable to load global config file');
    throw err;
}

const cb_filename = glob_conf.module_callbacks_file;
const conf_filename = glob_conf.module_config_file;

const dirname = process.argv[2];
var mod_conf;
try {
    const filename = path.join('./', 'modules', dirname, conf_filename);
    mod_conf = JSON.parse(fs.readFileSync(filename));
} catch(err) {
    console.log('Unable to load module config file');
    throw err;
}

var cb = new Object();
try {
    const filename = path.join('../', 'modules', dirname, cb_filename);
    cb = require(filename);
} catch(err) {
    console.log(err);
}

var src = '';

const template_cb = 
    '\n// %s\n' + // route
    '// %s\n' + // description
    'exports.%s = function(req, res){\n' +
    '    // res.send(\'ok\');\n' +
    '};\n'
;
const template_md = 
    '\n// %s\n' + // route
    '// %s\n' + // description
    'exports.%s = function(req, res, next){\n' +
    '    next();\n' +
    '};\n'
;


for(let key in mod_conf.rules){
    let rule = mod_conf.rules[key];
    if(rule.callback && ! cb[rule.callback]){
        let route = rule.body || rule.tile || rule.route;
        let comment = rule.description ? rule.description : 'no description';
        let name = rule.callback;
        src += util.format(template_cb, route, comment, name);
    } else if(rule.middleware && ! cb[rule.middleware]){
        let route = rule.body || rule.tile || rule.route;
        let comment = rule.description ? rule.description : 'no description';
        let name = rule.middleware;
        src += util.format(template_md, route, comment, name);
    }
}

fs.appendFile(path.join('./', 'modules', dirname, cb_filename), src, function(err){
    if(err){
        console.log('Error during writing the callbacks file.');
        throw err;
    }
});



