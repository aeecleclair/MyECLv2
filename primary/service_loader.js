const fs = require('fs');
const path = require('path');

module.exports = function(context){
    return function(){
        context.serv = new Object();

        var enabled_path = path.join(context.service_path, 'services.json');
        var enabled = JSON.parse(fs.readFileSync(enabled_path)).enabled;

        for(let i = 0; i < enabled.length; i++){
            let name = enabled[i];
            let file_name = path.join(context.service_path, name, 'main');
            context.log.info('Loading ' + name + '...');
            context.serv[name] = require(file_name)(context);
        } 
        console.log(context.serv);
    };
};
