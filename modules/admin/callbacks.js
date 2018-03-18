
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

            req.database.query('SELECT user.name AS uname, firstname, nick, position FROM membership JOIN user_group ON user_group.id = membership.id_group JOIN user ON user.id = membership.id_user WHERE user_group.id = ?;', [req.params.id], function(err2, rows){
                if(err2){
                    req.log.warning(err2);
                    res.error('500');
                } else {
                    for(let key in rows){
                        let row = rows[key];
                        values.members.push({
                            'name' : row['uname'],
                            'firstname' : row['firstname'],
                            'nick' : row['nick'],
                            'position' : row['position']
                        });
                    }
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
    res.send('ok');
};

// /modules/admin/delete_group/:id
exports.delete_group = function(req, res){
    res.send('ok');
};

// /modules/admin/add_members/:id
exports.add_members = function(req, res){
    res.send('ok');
};

// /modules/admin/remove_members/:id
exports.remove_members = function(req, res){
    res.send('ok');
};

// /modules/admin/alter_group/:id
exports.alter_group = function(req, res){
    if(!req.validator.isAlpha(req.body.name)){
        res.send('invalid');
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
};
