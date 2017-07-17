// Configuration générale

const fs = require('fs');
//const path = require('path');

// exports est un alias de module.exports
module.exports = function(config_file){
    var conf;
    try{
        conf = JSON.parse(fs.readFileSync(config_file));
    } catch(err) {
        console.log('Unable to load or parse global config file ' + config_file);
        throw err;
    }
    
    conf.public_root = conf.root_path + '/static/public';
    conf.private_root = conf.root_path + '/static/private';
    conf.module_path = conf.root_path + '/modules';

    return conf;
};
