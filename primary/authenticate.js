/*
 * Pour que ce module marche il faut que la table user contienne au moins un champ login et un champ password
 */

const ejs = require('ejs');

module.exports = function(context){
    function get_user(login, callback){
        // interroge la bdd pour savoir si le couple login, password est vallable
        context.database.select('user', 'login = ?', [login], callback);
    }

    exports.check_password = function(req, res){
        // Valide ou non le mot de passe de l'utilisateur
        var password = req.body.password;
        var login = req.body.login;
        get_user(login, function (err, results){
            if(!err && results.length > 0){
                var user = results[0];
                context.crypto.compare(password, user['password'], function(err2, valid){
                    if(err2){
                        context.log.error('Unable to check password.');
                        context.log.error(err2);
                    }
                    if(!valid){
                        context.log.info(login + ' used wrong password.');
                        res.redirect('/login.html?invalid=4');
                    } else {
                        delete user['password'];
                        req.session.user = user;
                        req.database.query("UPDATE user SET online = '1' WHERE id = ?;", [req.session.user.id], function(err, result){
                            if(err){
                                req.log.warning(err);
                                res.sendStatus(500);
                            } else {
                                if(req.session.rejected_on){
                                    res.redirect(req.session.rejected_on);
                                    req.session.rejected_on = undefined;
                                } else {
                                    res.redirect('/home');
                                }
                            }
                        });
                    }
                });
            } else {
                if(err){
                    context.log.error(err);
                } else {
                    context.log.warning('Bad login ' + login);
                }
                res.redirect('/login.html?invalid=3');
            }
        });
    };

    const CasAuth = require('cas-authentication');
    const cas = new CasAuth(context.cas_config);

    exports.bounce = cas.bounce;
    exports.new_account = function(req, res){
        const login = req.session.login_dsi;
        context.csrf.newToken(login, function(err, token){
            if(err){
                context.log.error('Unable to generate a CSRF token');
                res.status(500).send('Fail');
            } else {
                const data = {
                    'token' : token,
                    'login' : login
                    // TODO d'autres infos ?
                };
                ejs.renderFile(context.ejs_root + '/register.ejs', data, function(err, str){
                    if(err){
                        context.log.error(err);
                        res.status(500).send('Une erreur est survenue.');
                    } else {
                        res.send(str);
                    }
                });
            }
        });
    };
    exports.create_account = function(req, res){

        if(req.body.login && req.body.password && req.body.password == req.body['conf-password']){
            context.database.query("SELECT COUNT(*) AS c FROM user WHERE login = ?", [req.body.login], function(err_count, res_count){
                if (!err_count){
                    if(parseInt(res_count[0]['c']) > 0){
                        // le login est déjà utilisé
                        return res.redirect('/login.html?invalid=0');
                    } else {
                        // le login est libre
                        context.crypto.hash(req.body.password, function(err, hash){
                            if(!err){
                                req.body.login = req.body.login;
                                var user = new Object();
                
                                // validation
                                if(
                                    !context.validator.isAlpha(req.body.login) ||
                                    !context.validator.matches(req.body.promo, '[0-9]{4}[Ee]?') ||
                                    !context.validator.matches(req.body.floor.toLowerCase(), '([abcdxtuv][0-9]+)|(adoma)') ||
                                    !context.validator.isNumeric(req.body.picselector)
                                ){
                                    return res.redirect('/login.html?invalid=1');
                                }
                                // sanitization
                                context.validator.escape(req.body.name);
                                context.validator.escape(req.body.firstname);
                                context.validator.escape(req.body.nick);
                
                                user['login'] = req.body.login;
                                user['password'] = hash;
                                user['name'] = req.body.name;
                                user['firstname'] = req.body.firstname;
                                user['nick'] = req.body.nick;
                                // user['birth'] = req.body.birth; // TODO à formater en date YYYY-MM-DD
                                user['promo'] = req.body.promo;
                                user['floor'] = req.body.floor;
                                user['online'] = '1';
                                user['last_seen'] = new Date();
                
                                req.log.info(req.file);
                                if(req.body.picselector == '1'){
                                    user['picture'] = req.file.filename;
                                } else {
                                    // TODO ameliorer le choix les photos par defaut
                                    user['picture'] = '';
                                }
                
                                context.database.save('user', user, function(err){
                                    if(!err){
                                        req.session.user = user;
                                        res.redirect('/home');
                                        context.database.select('user', ['id'], 'login = ?', [user.login], function(err2, res){
                                            if(!err2 && res[0]){
                                                context.database.save('membership',
                                                    {
                                                        'id_user' : res[0]['id'],
                                                        'id_group' : 2, // ecl
                                                        'position' : 'eleve', // TODO améliorer avec les infos du CAS
                                                        'term' : user.promo
                                                    },
                                                    function(err3){
                                                        if(err3){
                                                            context.log.error('Unable to set ' + user.login + ' ecl membership :');
                                                            context.log.error(err3);
                                                        }
                                                    }
                                                );
                                            } else {
                                                context.log.error('Unable to get ' + user.login + ' id :');
                                                context.log.error(err2);
                                            }
                                        });
                                    } else {
                                        context.log.error('Unable to save user');
                                        context.log.info(user);
                                        context.log.error(err);
                                        res.status(500);
                                        res.send('<meta http-equiv="refresh" content="5; URL=/login.html"> DB Fail');
                                    }
                                });
                            } else {
                                // TODO
                                context.log.error('Unable to hash password');
                                context.log.error(err);
                                res.status(500);
                                res.send('<meta http-equiv="refresh" content="5; URL=/login.html"> Hash Fail');
                            }
                        });
                    }
                }
            });
        } else {
            // TODO faire une page pour signaler a l'utilisateur qu'il a mal remplie le formulaire
            // res.redirect('/wrong_datas.html');
            res.redirect('/login.html?invalid=2');
        }
    } 
    return exports;
};
