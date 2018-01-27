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
const multer = require('multer');

exports.myecl = function(context){
    // Modules nodes locaux
    require('./logger')(context);
    require('./crypto')(context);

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
    context.bodyParser = bodyParser;
    context.multer = multer;
 
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
        // context.log.info('Asking for ' + req.url + '.');

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

    app.get(['/home', '/home/*'], authorise('user'), function(req, res){
        res.sendFile('myecl_base.html', {root : context.private_root});
    });

    app.get('/menu', authorise('user'), function(req, res){

        var menus = new Array();
        var promises = new Array();
        for(let key in context.menu_list){
            let menu = context.menu_list[key];
            if(menu.authorisation == 'user' || menu.authorisation == 'public'){
                menus.push(menu);
            } else {
                let checker = authorise.authorisation_checker(menu.authorisation);
                promises.push(new Promise(function(resolve){
                    checker(req.session.user, function(is_auth){
                        if(is_auth){
                            menus.push(menu);
                        }
                        resolve();
                    });
                }));
            }
        }
        Promise.all(promises).then(function(){
            res.json({ list : menus });
        });
    });

    app.get('/header', authorise('user'), function(req, res){

        var headers = new Array();
        var promises = new Array();
        for(let key in context.header_list){
            let header = context.header_list[key];
            if(header.authorisation == 'user' || header.authorisation == 'public'){
                headers.push(header);
            } else {
                let checker = authorise.authorisation_checker(header.authorisation);
                promises.push(new Promise(function(resolve){
                    checker(req.session.user, function(is_auth){
                        if(is_auth){
                            headers.push(header);
                        }
                        resolve();
                    });
                }));
            }
        }
        Promise.all(promises).then(function(){
            res.json({ list : headers });
        });
    });
    
    // acces aux tiles
    
    app.get('/tiles', authorise('user'), function(req, res){

        var tiles = new Array();
        var promises = new Array();
        for(let key in context.tiles_list){
            let tile = context.tiles_list[key];
            if(tile.authorisation == 'user'){
                tiles.push(tile);
            } else {
                // On met ces appels dans un pool
                let checker = authorise.authorisation_checker(tile.authorisation);
                promises.push(new Promise(function(resolve){
                    checker(req.session.user, function(is_auth){
                        if(is_auth){
                            tiles.push(tile);
                        }
                        resolve();
                    });
                }));
            }
        }
        // On lance les appels et quand ils seront finit
        // on appelera le callback
        Promise.all(promises).then(function(){
            // console.log('Pool call count :', call_nb);
            res.json({ list : tiles });
        });
    });
    
    app.get('/heads/primary/tiles', function(req, res){
        res.json({'scripts' : ['/tiles.js'], 'styles' : ['/tiles.css']});
    });
    // app.get('/user/tiles', authorise('user'), function(req, res){
    //      res.send(GET USER TILES PREFERENCES)
    // });

    app.get('/body/primary/tiles', authorise('user'), function(req, res){
        res.redirect('/tiles.html');
    });
    
    // Utiliser un compte existant
    
    var simple_user_check = authorise.authorisation_checker('user');
    app.use('/login.html', function(req, res, next){
        simple_user_check(req.session.user, function(connected){
            if(connected){  // si l'utilisateur est déjà connecté
                res.redirect('/home');  // on le renvoie vers la page principale
            } else {
                next();
            }
        });
    });

    app.post('/login', bodyParser.urlencoded(), authenticate.check_password);

    // Passer par le cas puis creer un compte
    app.get('/logcas', authenticate.bounce, authenticate.new_account);

    // on utilise multer pour charger l'image
    const upload = multer({'dest': context.user_upload});
    app.post('/create_account', /*authenticate.bounce,*/ upload.single('picture'), authenticate.create_account);

    // Chargement des différents modules
    context.log.info('Loading modules...');
    load_mod(app);
    context.log.info('Modules loaded successfully.');

    // si aucun body ne match on renvoie une 404
    app.use('/body/*', function(req, res){
        res.status(404);
        res.send('erreur 404');
    });

    // Si rien n'a catché la requete on cherche un fichier statique
    app.use(serveStatic(context.public_root, context.default_static_options));
    // si on ne trouve pas de fichier statique publique qui match on cherche dans
    // les fichiers privé a condition que l'utilisateur soit connecté
    // sinon on renvoie une 404

    var error_404 = function(req, res){
        res.status(404);
        res.sendFile('error_404.html', {root : context.public_root});
    };


    app.use(
        authorise('user', error_404),
        serveStatic(context.private_root, context.default_static_options)
    );
    
    // En dernière option on envoie une 404
    app.use(error_404);

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
