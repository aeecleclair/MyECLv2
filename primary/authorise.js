module.exports = function(context){

    function check_authorisation(user, module_auth){
        // Compare les autorisations de user à module_auth et renvoie true sir l'utilisateur peux acceder aux ressources
        if(module_auth == 'ecl'){
            return true;
        } else {
            return false;
        }
    }

    return function (module_auth){
        var middleware;  
        if(module_auth == 'public'){
            middleware = function(req, res, next){
                next();
            };
        } else {
            middleware = function (req, res, next){
                // if(req.session.user 
                //     && ( module_auth == 'ecl' 
                //         || check_authorisation(req.session.user, module_auth)
                //     )
                // )
                if( module_auth == 'ecl' 
                        || check_authorisation(req.session.user, module_auth
                        )
                ){
                    next();
                } else {
                    console.log('Accès non autorisé à ' + req.url);
                    res.status(401);
                    res.sendFile('unauthorized.html', {'root' : context.public_root});
                }
            };
        }
        return middleware;
    };
};
