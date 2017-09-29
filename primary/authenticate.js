/*
 * Pour que ce module marche il faut que la table user contienne au moins un champ login et un champ password
 */

module.exports = function(context){
    function get_user(login, callback){
        // interroge la bdd pour savoir si le couple login, password est vallable
        context.database.select('user', 'login = "' + login + '"', callback);
    }

    exports.password = function(req, res){
        // Valide ou non le mot de passe de l'utilisateur
        var password = req.query.password;
        var login = req.query.login;
        get_user(login, function (err, results, fields){
            if(!err && results.length > 0){
                var user = results[0];
                context.database.compare(password, user['password'], function(err2, valid){
                    if(err2){
                        context.log.error(err2);
                    }
                    if(!valid){
                        context.log.info(login + ' used wrong password.');
                        res.redirect('/login.html?wrong=1');
                    } else {
                        req.session.user = user;
                        res.redirect('/home');
                    }
                });
            } else {
                if(err){
                    context.log.error(err);
                } else {
                    context.log.warning('Bad login ' + login);
                }
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
        // TODO Tester la validité des informations fournies

        if(req.body.login && req.body.password){
            context.database.hash(req.body.password, function(err, hash){
                if(!err){
                    var user = new Object();
                    user['login'] = req.body.login;
                    user['password'] = hash;
                    user['name'] = req.body.name;
                    user['firstname'] = req.body.firstname;
                    user['nick'] = req.body.nick;
                    // user['birth'] = req.body.birth; // TODO à formater en date YYYY-MM-DD
                    user['gender'] = req.body.gender == 'Femme' ? 'F' : 'H';
                    user['promo'] = req.body.promo;
                    user['floor'] = req.body.floor;
                    user['groups'] = '';  // TODO
                    context.database.save('user', user, function(err, results, fields){
                        if(!err){
                            req.session.user = user;
                            res.redirect('/home');
                        } else {
                            // TODO
                            context.log.error(err);
                            res.status(500);
                            res.send('DB Fail');
                        }
                    });
                } else {
                    // TODO
                    context.log.error(err);
                    res.status(500);
                    res.send('Hash Fail');
                }
            });
            /*
                "id" : "INT PRIMARY KEY NOT NULL",
                "login" : "VARCHAR(255)",
                "password" : "VARCHAR(255)",
                "name" : "VARCHAR(255)",
                "firstname" : "VARCHAR(255)",
                "nick" : "VARCHAR(255)",
                "birth" : "DATE",
                "gender" : "VARCHAR(1)",
                "promo" : "INT",
                "floor" : "VARCHAR(3)",
                "groups" : "TEXT"
            */
        } else {
            // TODO faire une page pour signaler a l'utilisateur qu'il a mal remplie le formulaire
            // res.redirect('/wrong_datas');
            res.send(400);
            res.send('User Fail');
        }
    };
    return exports;
};
