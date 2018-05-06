// show_group
exports.show = function(req, res){
    req.database.query('SELECT name, description FROM user_group WHERE user_group.id = ?;', [req.params.id], function(err, rows){

        if(err){
            req.log.warning(err);
            res.error('500');
        } else if(rows.length < 1){
            res.status(404).send('Unknown');
        } else {
            var values = new Object();
            values.id = req.params.id;
            values.name = rows[0]['name'];
            values.description = rows[0]['description'];
            values.members = new Array();

            req.database.query('SELECT user.id AS uid, user.name AS uname, firstname, nick, position FROM membership JOIN user_group ON user_group.id = membership.id_group JOIN user ON user.id = membership.id_user WHERE user_group.id = ?;', [req.params.id], function(err2, rows){
                if(err2){
                    req.log.warning(err2);
                    res.error('500');
                } else {
                    for(let key in rows){
                        let row = rows[key];
                        values.members.push({
                            'id' : row['uid'],
                            'name' : row['uname'],
                            'firstname' : row['firstname'],
                            'nick' : row['nick'],
                            'position' : row['position']
                        });
                    }
                    req.csrf.newToken(req.session.user.login, function(err, token){
                        if(err){
                            req.log.error(err);
                            res.status(500).send('Server error');
                        } else {
                            values.token = token;
                            req.engine['ejs'].renderFile(req.rel_path('ejs/show.ejs'), values, function(err, template){
                                if(err){
                                    req.log.error(err);
                                    res.status(500).send('Server error');
                                } else {
                                    res.send(template);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};

// list_group
exports.list = function(req, res){
    req.database.select('user_group', ['id', 'name', 'description'], function(err, rows){
        if(err){
            req.log.warning(err);
            res.error('500');
        } else {
            req.engine['ejs'].renderFile(req.rel_path('ejs/list.ejs'), {'groups' : rows}, function(err, result){
                if(err){
                    req.log.error(err);
                    res.status(500).send('Server error');
                } else {
                    res.send(result);
                }
            });
        }
    });
};

// /modules/admin/create_group
exports.create_group = function(req, res){
    if(!req.validator.isAlpha(req.body.name)){
        res.status(404).send('invalid');
        return;
    }
    var group = {
        'name' : req.body.name,
        'description' : req.validator.escape(req.body.description)
    };
    req.csrf.checkToken(req.session.user.login, req.body['__token'], function(err, valid){
        if(err){
            req.log.error('Unable to check a token');
            req.log.error(err);
            return;
        }
        if(!valid){
            res.send('invalid');
            return;
        }
        req.database.save('user_group', group, function(err){
            if(err){
                res.status(500).send('database error');
            } else {
                res.send('ok');
            }
        });
    });
};

// /modules/admin/delete_group/:id
exports.delete_group = function(req, res){
    if(!req.validator.isNumeric(req.params.id)){
        res.status(404).send('invalid');
        return;
    }

    req.csrf.checkToken(req.session.user.login, req.body['__token'], function(err, valid){
        if(err){
            res.status(500).send('token error');
        } else if(!valid){
            res.status(401).send('invalid token');
        } else {
            req.database.delete('user_group', 'id = ?', [req.params.id], function(err){
                if(err){
                    res.status(500).send('database error');
                } else {
                    res.send('ok');
                }
            });
        }
        if(!valid){
            res.send('invalid');
            return;
        }
        req.database.delete('user_group', 'id = ?', [req.params.id], function(err){
            if(err){
                res.status(500).send('database error');
            } else {
                res.send('ok');
            }
        });
    });
};

// POST /modules/admin/add_members/:id
exports.add_members = function(req, res){
    if(!req.validator.isNumeric(req.params.id)){
        res.status(404).send('invalid');
        return;
    }
    // req.body.members_list = [0, 2,...]

    req.csrf.checkToken(req.session.user.login, req.body['__token'], function(err, valid){
        if(err){
            res.status(500).send('token error');
        } else if(!valid){
            res.status(401).send('invalid token');
        } else {
            const members = req.body.members;
            var proms = new Array();
            for(let i in members){
                let mbship = {
                    'id_user' : members[i].id,
                    'id_group' : req.params.id,
                    'position' : members[i].position,
                    'term' : members[i].term
                };
                proms.push(new Promise(function(done, reject){
                    req.database.save('membership', mbship, function(err){
                        if(err){
                            reject(err);
                        } else {
                            done();
                        }
                    });
                }));
            }
            Promise.all(proms).then(function(){ // succes
                res.send('ok');
            }, function(err){ // echec
                req.log.error(err);
                res.send('ko');
            });
        }
    });
};

// /modules/admin/remove_member/:id
exports.remove_member = function(req, res){
    if(!req.validator.isNumeric(req.params.id)){
        res.status(404).send('invalid');
        return;
    }

    req.csrf.checkToken(req.session.user.login, req.body['__token'], function(err, valid){
        if(err){
            res.status(500).send('token error');
        } else if(!valid){
            res.status(401).send('invalid token');
        } else {
            req.database.delete('membership', 'id_group = ? AND id_user = ?', [req.params.id, req.body.user], function(err){
                if(err){
                    res.status(500).send('database error');
                } else {
                    res.send('ok');
                }
            });
        }
    });
};

// /modules/admin/alter_group/:id
exports.alter_group = function(req, res){
    if(!req.validator.isAlpha(req.body.name)){
        res.status(404).send('invalid');
    }
    req.csrf.checkToken(req.session.user.login, req.body['__token'], function(err, valid){
        if(err){
            req.log.error(err);
            res.status(500).send('token error');
        } else if(!valid){
            res.status(401).send('invalid token');
        } else {
            req.database.save('user_group', group, function(err){
                if(err){
                    res.status(500).send('database error');
                } else {
                    res.send('ok');
                }
            });
        }
        var group = {
            'id' : req.params['id'],
            'name' : req.body.name,
            'description' : req.validator.escape(req.body.description)
        };
        req.database.save('user_group', group, function(err){
            if(err){
                res.status(500).send('database error');
            } else {
                res.send('ok');
            }
        });
    });
};
