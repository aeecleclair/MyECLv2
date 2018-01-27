/*
 * module_loader.js
 * Definie les fonctions qui vont charger tout les modules
 * dans le site
 *
 */
var fs = require('fs');
var path = require('path');

function is_element_of(value, array){
    return array.indexOf(value) >= 0;
}


module.exports = function(context){
    var authorise = require('./authorise')(context);

    function load_callback(modname, cbname){
        // retourne le callback cbname du module modname
        // on recupere le chemin du fichier rassemblant les callbacks
        var callbacks_path = path.join(
            context.module_path,
            modname,
            context.module_callbacks_file
        );
        var cb;
        try{ // on essaie de recuperer la fonction
            cb = require(callbacks_path)[cbname];
        } catch(err) {
            context.log.info('Il y a un catch trop générale ici');
            throw err;
        }
        return cb;
    }

    function enable_static(app, modname, rule){
        // active une regle de fichiers statiques
        var static_path = path.join(context.module_path, modname, rule.static);
        var route = rule.route;
        var stat;
        // On verifir que static_path est un chemin valide
        var err;
        try{
            stat = fs.statSync(static_path);
        } catch (err) {
            if(err.code == 'ENOENT'){
                context.log.warning(static_path + ' does not exists, ignoring rule.');
                return;
            } else {
                // Un autre type d'erreur ne devrait pas arriver ici donc
                // si c'est le cas il vaut mieux qu'elle tue le process
                context.log.warning('Unexpected error');
                throw err;
            }
        }

        // S'il est valide et que l'utilisateur a les bons droits (read & execute)
        if(!err){
            if(stat.isDirectory() && (stat.mode & (fs.constants.R_OK | fs.constants.X_OK))){
                // Sur linux il faut le droit d'execution et de lecture pour parcourir un dossier
                try{
                    app.use(route, authorise(rule.authorisation), function (req, res, next){
                        var file_path = path.join(modname, rule.static, req.params[0]);
                        try{
                            res.sendFile(file_path, {'root' : context.module_path});
                        } catch(err) {
                            next();
                        }
                    });
                    context.myecl_map += route + '\n';
                } catch(err) {
                    context.log.info('Il y a un catch trop large ici');
                    throw err;
                }
            } else if(stat.isFile() && (stat.mode & fs.constants.R_OK) ){
                // Si on a un fichier lisible
                try{
                    app.all(route, authorise(rule.authorisation), function (req, res){
                        try{
                            res.sendFile(path.join(modname, rule.static), {'root' : context.module_path});
                        } catch(err) {
                            res.error(500);
                            context.log.warning('Unable to send static file ' + static_path);
                        }
                    });
                    context.myecl_map += route + '\n';
                } catch(err) {
                    context.log.info('Il y a un catch trop large ici');
                    throw err;
                }
            } else { // sinon on ne sait pas gerer
                context.log.warning(static_path + ' does not exist or is not readable.');
            }
        }
    }

    function enable_callback(app, modname, rule){
        // active un regle de donnes dynamiques 
        var cb = load_callback(modname, rule.callback);
        if(!cb){ // si cb == undefined
            context.log.warning('Unable to load ' + rule.callback);
            return;
        }
        var route = rule.route;

        if(!rule.method){
            rule.method = 'get'; // get est la methode par defaut
        } else {
            rule.method = rule.method.toLowerCase();
            if(!is_element_of(rule.method, ['get', 'head', 'post', 'delete', 'put', 'all'])){
                rule.method = 'get';
            }
        }

        // Traitements particuliers
        
        if(rule.method == 'post' && !rule.no_parse){
            if(!rule.enctype){
                rule.enctype = 'urlencoded';
            }

            if(!rule.post_options){
                rule.post_options = context.body_json_config;
            }

            switch(rule.enctype){
                case 'urlencoded':
                    app.post(rule.route, context.bodyParser.urlencoded(rule.post_options));
                    break;
                case 'json':
                    app.post(rule.route, context.bodyParser.json(rule.post_options));
                    break;
                case 'raw':
                    app.post(rule.route, context.bodyParser.raw(rule.post_options));
                    break;
                /* eslint-disable no-case-declarations */
                case 'multipart':
                    let multer_method = rule.multer_method ? rule.multer_method.name || 'single' : 'single';
                    let multer_field = rule.multer_method ? rule.multer_method.field || 'file' : 'file';
                    let multer_max_count = rule.multer_method ? rule.multer_method.max : null;
                    rule.post_options.dest = context.user_upload;
                    app.post(rule.route,
                        context.multer(rule.post_options)[multer_method](multer_field, multer_max_count));
                    break;
                /* eslint-enable no-case-declarations */
            }
        }

        try{
            app[rule.method](route, authorise(rule.authorisation), function (req, res){
                try{
                    cb(req, res);
                } catch(err) {
                    context.log.warning(`Error from callback ${rule.callback}.`);
                    context.log.warning(err);
                }
            });
            context.myecl_map += route + '\n';
        } catch(err) {
            context.log.warning(`Unable to enable callback ${rule.callback}`);
        }
    }

    function enable_middleware(app, modname, rule){
        // active un regle de middleware
        var cb = load_callback(modname, rule.middleware);
        if(!cb){
            context.log.warning(`Unable to load ${rule.middleware} middleware. This rule is ignored`);
            return;
        }
        // Le middleware doit gérer lui même les methodes et le passage 
        // au callback suivant
        app.use(rule.route, authorise(rule.authorisation), cb);
        context.myecl_map += rule.route + '\n';
    }

    function handle_rule(app, modname, rule){

        if(rule.body){
            rule.route = '/body/' + modname + '/' + rule.body;
            context.myecl_map += '/heads/' + modname + '/' + rule.body + '\n';
            app.get('/heads/' + modname + '/' + rule.body,
                authorise(rule.authorisation),
                function(req, res){
                    res.json(rule.heads);
                }
            );
        } else if(rule.tile){
            context.tiles_list.push(rule);
            rule.route = '/tile/' + modname + '/' + rule.tile;

            context.myecl_map += '/heads/' + modname + '/' + rule.tile + '\n';
            app.get('/heads/' + modname + '/' + rule.tile,
                authorise(rule.authorisation),
                function(req, res){
                    res.json(rule.heads);
                }
            );
            rule.tile = modname + '__' + rule.tile;
        }

        if(rule.route){
            if(rule.static){
                // sert un dossier de fichiers statiques
                enable_static(app, modname, rule);
            } else if(rule.callback) { 
                // appelle une fonction qui va construire la réponse
                enable_callback(app, modname, rule);
            } else if(rule.middleware) {
                // ajoute un middleware (sorte de 'filtre') a la requète
                enable_middleware(app, modname, rule);
            } else {
                return false;
            }
        }
        return true;
    }


    function load_module(app, modname){
        // Charger un module dans l'application
        var config_path = path.join(context.module_path, modname, context.module_config_file);
        var config;
        try{
            config = JSON.parse(fs.readFileSync(config_path));
        } catch(err) {
            context.log.warning('Unable to load configuration for ' + modname + ' at path ' + config_path +'. This module is ignored');
            return;
        }

        // Verification des dépendances
        // TODO : Comment définir des dépendences ?
        // Comment verifier qu'elles sont présentes
        // Quel type de dépendances

        if(!config.authorisation){
            config.authorisation = '#ecl';
        }

        // Chargement des routes
        if(config.rules){
            config.heads = config.heads ? config.heads : { 'styles' : [], 'scripts' : [] };
            config.heads.scripts = config.heads.scripts && Array.isArray(config.heads.scripts) ? config.heads.scripts : [];
            config.heads.styles = config.heads.styles && Array.isArray(config.heads.styles) ? config.heads.styles : [];
            if(Array.isArray(config.rules)){ // si config.rules est une liste de routes
                for(let i in config.rules){

                    let rule = config.rules[i];
                    if(!rule.authorisation){
                        rule.authorisation = config.authorisation;
                    }

                    if(rule.body || rule.tile){
                        rule.heads = rule.heads ? rule.heads : { 'styles' : [], 'scripts' : [] };
                        rule.heads.scripts = config.heads.scripts.concat(rule.heads.scripts && Array.isArray(rule.heads.scripts) ? rule.heads.scripts : []);
                        rule.heads.styles = config.heads.styles.concat(rule.heads.styles && Array.isArray(rule.heads.styles) ? rule.heads.styles : []);
                    }

                    // Activer la regle
                    let success = handle_rule(app, modname, rule);
                    if(!success){
                        context.log.warn('Unable to handle a rule in ' + modname + '. Rule ignored.');
                    }
                }
            } else {
                context.log.warn(context.module_config_file + ' from module ' + modname + ' does not contain a valid rules array.');
            }
        }
        //Chargement des tables pour la BDD

        if(config.database){
            if(Array.isArray(config.database)){
                for(let i in config.database){

                    let item = config.database[i];
                    context.database.create(item['table'],item['schema']);
                }
            } else {
                context.log.error(context.module_config_file + ' from module ' + modname + ' contain a non-array database specification. Ignoring database.');
            }
        }


        // Chargement du header
        console.log('Hey');
        if(config.header){
            console.log('Ho');
            if(Array.isArray(config.header)){
                console.log('Ha');
                for(let i in config.header){
                    let item = config.header[i];
                    // TODO test ? traitements ? quid des autorisations ?
                    item.module = modname;
                    item.authorisation = item.authorisation ? item.authorisation : config.authorisation;
                    context.header_list.push(item);
                }
            } else {
                context.log.error(context.module_config_file + ' from module ' + modname + ' contain a non-array header. Ignoring header.');
            }
        }
     
        // Chargement du menu
        if(config.menu){
            if(Array.isArray(config.menu)){
                let deep_mod = function(menu_list){
                    // Parcours recursif des menu pour appliquer une modification systématique
                    for(let i in menu_list){
                        let item = menu_list[i];
                        if(item.sub){
                            deep_mod(item.sub);
                        } else {
                            item.module = modname;
                        }
                    }
                };
                deep_mod(config.menu);
                for(let i in config.menu){
                    let item = config.menu[i];
                    // TODO test ? traitements ?
                    item.module = modname;
                    item.authorisation = item.authorisation ? item.authorisation : config.authorisation;
                    context.menu_list.push(item);
                }
            } else {
                context.log.error(context.module_config_file + ' from module ' + modname + ' contain a non-array menu. Ignoring menu.');
            }
        }
        // Chargement des notifications
     
    }

    return function(app){
        // Charge l'ensemble des modules dont le nom est dans le fichier modules.json
        
        context.log.info('Listing modules.');
        var enabled = JSON.parse(fs.readFileSync(path.join(context.module_path, 'modules.json'))).enabled;
        for(let i in enabled){
            context.log.info('Loading ' + enabled[i] + '...');
            load_module(app, enabled[i]);
        }
    };
};
