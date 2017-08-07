module.exports = function(context){
    function get_user(login, callback){
        // interroge la bdd pour savoir si le couple login, password est vallable
        // TODO Faire un vrai système de mot de passe
        context.models.user.findOne({'login' : login}, '*', callback);
    }

    exports.password = function(req, res){
        // Valide ou non le mot de passe de l'utilisateur
        var password = req.query.password;
        var login = req.query.login;
        get_user(login, function (err, user){
            if(!err){
                user.comparePassword(password, function(error, match){
                    if(error || !match){
                        req.redirect('/login.html?wrong=1');
                    } else {
                        req.session.user = user;
                        res.redirect('/home');
                    }
                });
            } else {
                res.redirect('/login.html?wrong=1');
            }
        });
    };

    const CasAuth = require('cas-authentication');
    const cas = new CasAuth(context.cas_config);

    exports.bounce = cas.bounce;
    exports.new_account = function(req, res){
        // TODO utiliser les infos contenues dans req.session.user_data si elles existent
        // pour préremplir autant que possible le formulaire
        res.redirect('/new_account.html');
    };
    exports.create_account = function(req, res){
        // doit être utilisé avec POST
        // TODO eviter les doublons
        if(req.body.login_dsi && req.body.password){
            let user = new context.models.user({
                'login' : req.body.login,
                'password' : req.body.password,
                'name' : req.body.name,
                'firstname' : req.body.firstname,
                'surname' : req.body.surname,
                'birth' : req.body.birth ? new Date(req.body.date) : undefined,
                'gender' : req.body.gender == 'female',
                'floor' : req.body.floor,
                'sport' : req.body.sport,
                'picture' : req.body.picture_name,
                'tdgroup' : req.body.tdgroup,
                'asso' : req.body.asso ? req.body.asso.split(' ') : []
            });
            req.session.user = user;
            user.save(function(err){
                if(err){
                    // TODO apocalypse !
                }
            });
            res.redirect('/home');
        } else {
            // TODO faire une page pour demander a l'utilisateur qu'il a mal remplie le formulaire
            // res.redirect('/wrong_datas');
        }
    };
    return exports;
};
