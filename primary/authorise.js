/*
 * Propose un générateur de middleware pour filtrer les utilisateurs
 * en fonction de leurs droits personnels et d'une règle fournie
 *
 */

/*
 * TODO Ce module a vraiment besoin d'etre refactorisé !
 */

module.exports = function(context){


    function authorisation_checker(module_auth){
        // Génère la fonction minimale pour comparer les
        // authorisations de user à la règle module_auth
        // La fonction retourné appel callback(true) si l'utilisateur
        // est authorisé
        
        if(module_auth == 'public'){
            return function(user, callback){
                callback(true);
            };
        } else if(module_auth == 'user'){
            return function(user, callback){
                callback(user != null);
            };
        } else {
            // Cas par défaut :
            // Requete SQL (ou alias de requete ou requete partielle)
            if(module_auth[0] == '#'){
                module_auth = context.alias[module_auth];
            } else if(module_auth.substring(0, 6) != 'SELECT'){
                module_auth = 'SELECT user.login FROM user JOIN membership ' +
                    'ON membership.id_user = user.id ' + module_auth;
            }
            return function(user, callback){
                // Ici on considère que module_auth est une requete sql qui renvoie une 
                // liste d'utilisateurs autorisés :
                // SELECT login FROM user JOIN membership ON membership.id_user = user.id ... 
                context.database.query(module_auth, function(err, res){
                    // Executer la requete
                    if(err){
                        context.log.error('Unable to check authorisation with this request : ' + module_auth);
                        context.log.error(err);
                    } else {
                        // On cherche l'id de notre user dans le resultat
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
            };
        }
    }

    var main_func = function(module_auth, reject){
        // créer un middleware qui verifie l'autorisation de l'utilisateur
        // passe a la suite en cas de succes et appel reject (optionel) en cas
        // d'echec
        if(!reject){
            reject = function(req, res){
                if(req.session.user){  // utilisateur connecté
                    res.sendFile('unauthorized.html', {'root' : context.public_root});
                    context.log.warning('[CON] Accès non autorisé à ' + req.url);
                } else {
                    if(!req.session.rejected_on){
                        req.session.rejected_on = req.originalUrl;
                    }
                    res.sendFile('not_connected.html', {'root' : context.public_root});
                    context.log.warning('Accès non autorisé à ' + req.url);
                }
            };
        }
        var middleware;
        // On teste les cas public et user a l'avance pour
        // produire un middleware minimale
        if(module_auth == 'public'){
            middleware = function(req, res, next){
                next();
            };
        } else if(module_auth == 'user'){
            middleware = function(req, res, next){
                if(req.session.user){
                    next();
                } else {
                    res.status(401);
                    reject(req, res);
                }
            };
        } else if(module_auth instanceof Function){
            middleware = function(req, res, next){
                var query = module_auth(req);
                context.database.query(query, function(err, dbres){
                    // Executer la requete
                    if(err){
                        context.log.error('Unable to check authorisation with this request : ' + query);
                        context.log.error(err);
                    } else {
                        // On cherche l'id de notre user dans le resultat
                        for(var i in res){
                            if(dbres[i].login == req.user.login){
                                next();
                                return;
                            }
                        }
                    }
                    reject(req, res);
                });
            };
        } else {
            // On créer le checker une fois et il est réutilisé a chaque requete
            var checker = authorisation_checker(module_auth);
            middleware = function(req, res, next){
                checker(req.session.user, function(valid){
                    if(valid){
                        next();
                    } else {
                        res.status(401);
                        reject(req, res);
                    }
                });
            };
        }
        return middleware;        
    };

    main_func.authorisation_checker = authorisation_checker;
    
    return main_func;
};

