/*
 * init.js
 * Fichier d'initialisation du site
 * Prépare les routes, les modules etc
 *
 */
// Modules nodes officiels
//var http = require('http');
const express = require('express');
const session = require('express-session');
const serveStatic = require('serve-static');
const bodyParser = require('body-parser');

exports.myecl = function(context){
    // Modules nodes locaux
    require('./logger')(context);
    require('./crypto')(context);

    const myUtils = require('./utils')(context);
    const load_serv = require('./service_loader')(context);
    const load_mod = require('./module_loader')(context);
    const authorise = require('./authorise')(context);
    const authenticate = require('./authenticate')(context);

    // Initialisation de l'application
    var app = express();
    app.use(session(context.session_config));

    context.menu_list = new Array();
    context.header_list = new Array();
    context.tiles_list = new Array();
    context.myecl_map = '';
 
    // Chargement de la bdd
   
    context.database = require('./shortersql')(context);  // accessible dans le context pour le core
    
    if(Array.isArray(context.tables)){
        for(let i in context.tables){
            let item = context.tables[i];
            context.database.create(item['table'], item['schema']);
            if(item['init']){
                context.database.query(item['init'], function(err){
                    if(err){
                        context.log.error('L\'initialisation n\'as pas fonctionné.');
                        context.log.error(err, true);
                    }
                });
            }
        }
    } else {
        context.log.warning('No tables have been defined in config file !');
    }

    // Chargement des services
    context.log.info('Loading services...');
    load_serv();  // créer context.serv et le remplie
    context.log.info('Services loaded successfully.');


    // Premier middleware pour toutes les routes
    app.use('/*', function(req, res, next){
        // Log des requetes
        //context.log.info('Asking for ' + req.url + '.');

        // Surcharge de la requete
        req.database = context.database;
        req.log = context.log;
        req.serv = context.serv;

        // Surcharge de la réponse
        res.setHeader('x-powered-by', 'MyECL');
        next();
    });


    app.get('/', function(req, res){
        res.redirect(context.default_route);
    });

    app.get('/home', authorise('user'), function(req, res){
        res.sendFile('myecl_base.html', {root : context.private_root});
    });

    app.get('/menu', authorise('user'), function(req, res){

        var menus = new Array();
        var pool = new myUtils.CallPool();
        for(let key in context.menu_list){
            let menu = context.menu_list[key];
            if(menu.authorisation == 'user'){
                menus.push(menu);
            } else {
                // On met ces appels dans un pool
                pool.add(authorise.simple_check, [
                    req.session.user,
                    menu.authorisation,
                    function(is_auth){
                        if(is_auth){
                            menus.push(menu);
                        }
                        pool.finish();
                    }
                ]);
            }
        }
        // On lance les appels et quand ils seront finit
        // on appelera le callback
        pool.call(function(call_nb){
            res.json({ list : menus });
        });
    });

    app.get('/header', authorise('user'), function(req, res){
        res.json({ list : app.header_list });
    });
    
    // acces aux tiles
    
    app.get('/tiles', authorise('#ecl'), function(req, res){

        var tiles = new Array();
        var pool = new myUtils.CallPool();
        for(let key in context.tiles_list){
            let tile = context.tiles_list[key];
            if(tile.authorisation == '#ecl'){
                tiles.push(tile);
            } else {
                // On met ces appels dans un pool
                pool.add(authorise.simple_check, [
                    req.session.user,
                    tile.authorisation,
                    function(is_auth){
                        if(is_auth){
                            tiles.push(tile);
                        }
                        pool.finish();
                    }
                ]);
            }
        }
        // On lance les appels et quand ils seront finit
        // on appelera le callback
        pool.call(function(call_nb){
            console.log('Pool call count :', call_nb);
            res.json({ list : tiles });
        });
    });
    
    app.get('/heads/primary/tiles', function(req, res){
        res.json({'script' : ['/tiles.js'], 'style' : ['/tiles.css']});
    });
    // app.get('/user/tiles', authorise('user'), function(req, res){
    //      res.send(GET USER TILES PREFERENCES)
    // });

    app.get('/body/primary/tiles', authorise('#ecl'), function(req, res){
        res.redirect('/tiles.html');
    });
    
    // Utiliser un compte existant
    
    app.use('/login.html', function(req, res, next){
        authorise.simple_check(req.session.user, 'user', function(connected){
            if(connected){  // si l'utilisateur est déjà connecté
                res.redirect('/home');  // on le renvoie vers la page principale
            } else {
                next();
            }
        });
    });

    app.get('/login', authenticate.password);

    // Passer par le cas puis creer un compte
    app.get('/logcas', authenticate.bounce, authenticate.new_account);

    app.post('/create_account', bodyParser.json(context.body_json_config), authenticate.bounce, authenticate.create_account);

    // Chargement des différents modules
    context.log.info('Loading modules...');
    load_mod(app);
    context.log.info('Modules loaded successfully.');

    // Si rien n'a catché la requete
    app.use(serveStatic(context.public_root, context.default_static_options));
    app.use(authorise('user'), serveStatic(context.private_root, context.default_static_options));

    // Lancement du serveur
    app.listen(context.port, context.url, function(){
        context.log.info('Listening ' + context.url + ' on port ' + context.port.toString() + '.');
        context.log.info(context.myecl_map);
    });

    // Fermeture propre du système en cas d'erreur ou d'interuption volontaire
    process.on('uncaughtException', function(err){
        if(err.msg){
            context.log.error('Uncaught exception : ' + err.msg);
        } else {
            context.log.error('Uncaught exception : ');
            context.log.error(err);
        }
        process.exit();
    });
    process.on('SIGINT', () => {
        context.log.warning('SIGINT received.');
        process.exit();
    });
};
