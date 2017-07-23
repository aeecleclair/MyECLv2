// Modules nodes officiels
//var http = require('http');
const express = require('express');
const session = require('express-session');
const serveStatic = require('serve-static');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

exports.myecl = function(context){
    // Modules nodes locaux
    const log = require('./logger')(context);
    const modloader = require('./module_loader')(context);
    const authorise = require('./authorise')(context);
    const authenticate = require('./authenticate')(context);
    

    // Chargement de la bdd
   
    mongoose.connect("mongodb://localhost/MyECL");
    const User = require("./models/user");
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'Connection error:'));
    db.once('open', function(){
        console.log('Connection success');
    }
    );

    // Initialisation de l'application
    var app = express();
    app.use(session(context.session_config));

    app.menu_list = new Array();
    app.header_list = new Array();
    app.myecl_map = '';

    // Chargement des différents modules
    log.info('Loading modules...');
    modloader.load_enabled(app);
    log.info('Modules loaded successfully.');

    /*
    app.use(function(req, res, next){
        log.info('Asking for ' + req.url + '.');
        next();
    });
    //*/
    
    app.use(function(req, res, next){
        res.setHeader('x-powered-by', 'MyECL');
        next();
    });

    app.get('/', function(req, res){
        res.redirect(context.default_route);
    });

    app.get('/home', authorise('ecl'), function(req, res){
        res.sendFile('myecl_base.html', {root : context.private_root});
    });


    app.get('/menu', authorise('ecl'), function(req, res){
        res.json({ list : app.menu_list });
    });

    app.get('/header', authorise('ecl'), function(req, res){
        res.json({ list : app.header_list });
    });


    //Test BDD
    app.get('/new_user', function(req, res){
        user = new User({name : req.query.name})
        console.log('Query is' + req.query.name);
        user.save(function(err){
            if(err){
                console.log('Error while creating new user:' + err);  
            } else {
                User.find(function(err,result){
                    console.log(result);
                });
            }
        })
       
    }
    );


    // Utiliser un compte existant
    app.get('/login', authenticate.password);

    // Passer par le cas puis creer un compte
    app.get('/logcas', authenticate.bounce, authenticate.new_account);

    // app.use('/create_account', bodyParser.json(context.body_json_config));
    // app.post('/create_account', authenticate.create_account);

    // Si rien n'a catché la requete
    app.use(serveStatic(context.public_root, context.default_static_options));
    app.use(authorise('ecl'), serveStatic(context.private_root, context.default_static_options));






    // Lancement du serveur
    app.listen(context.port, context.url, function(){
        log.info('Listening ' + context.url + ' on port ' + context.port.toString() + '.');
        log.info(app.myecl_map);
    });

    // Fermeture propre du système en cas d'erreur ou d'interuption volontaire
    process.on('uncaughtException', function(err){
        log.error('Uncaught exception : ' + err.msg);
        process.exit();
    });
    process.on('SIGINT', () => {
        log.warning('SIGINT received.');
        process.exit();
    });
};
