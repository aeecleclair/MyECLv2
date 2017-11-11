module.exports = function(context){

    function check_authorisation(user, module_auth, callback){
        // Compare les autorisations de user à module_auth et renvoie true si 
        // l'utilisateur peux acceder aux ressources
        // Ici on considère que module_auth est une requete sql qui renvoie une 
        // liste d'utilisateurs autorisés :
        // SELECT login FROM user JOIN member ON member.user = user.id ... 
        // callback prend un seul argument booléen 'authorised'
        context.database.query(module_auth, function(err, res){
            // Executer la requete
            if(err){
                // Il faut que l'on soit informé des erreurs car elles viennent 
                // probablement du codeur du module
                context.log.error('Unable to check authorisation with this request : ' + module_auth);
                context.log.error(err);
            } else {
                // On cherche l'id de notre user dans la resultat
                for(var i in res){
                    if(res[i].login == user.login){
                        callback(true);
                        return;
                    }
                }
            }
            callback(false);
            return;
        });
    }

    var main_func = function (module_auth){
        // fonction principale du module
        // renvoie un middleware qui test si l'utilisateur peut accéder à 
        // une ressource
        var middleware;
        if(module_auth == 'public'){
            middleware = function(req, res, next){ next(); };
        } else {
            if(module_auth[0] == '#'){
                module_auth = context.alias[module_auth];
            } else if(module_auth.substring(0, 6) != 'SELECT'){
                // On permet au codeur du module de mettre des autorisations du 
                // type : 
                // WHERE membership.position = 'prez' 
                // AND membership.group = 'ECLAIR';
                // ou même de rajouter des JOIN avant le WHERE
                module_auth = 'SELECT user.login FROM user JOIN membership ' +
                    'ON membership.id_user = user.id ' + module_auth;
            }
            middleware = function (req, res, next){
                // middleware qui va permettre les utilisateurs autorisés et 
                // refouler les autres
                if(req.session.user){
                    check_authorisation(req.session.user, module_auth, function(authorised){
                        if(authorised){
                            next();
                        } else {
                            context.log.warning('Accès non autorisé à ' + req.url);
                            res.status(401);
                            res.sendFile('unauthorized.html', {'root' : context.public_root});
                        }
                    });
                } else {
                    context.log.warning('Accès non autorisé à ' + req.url);
                    res.status(401);
                    res.sendFile('unauthorized.html', {'root' : context.public_root});
                }
            };
        }
        return middleware;
    };
    main_func.simple_check = function (user, module_auth, callback){
        if(module_auth == 'public'){
            callback(true);
        } else {
            if(module_auth[0] == '#'){
                module_auth = context.alias[module_auth];
            } else if(module_auth.substring(0, 6) != 'SELECT'){
                module_auth = 'SELECT user.login FROM user JOIN membership ' +
                    'ON membership.id_user = user.id ' + module_auth;
            }
            check_authorisation(user, module_auth, callback);
        }
    };
    return main_func;
};
