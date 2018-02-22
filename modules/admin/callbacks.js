
// show_group
exports.show = function(req, res){
    req.database.query('SELECT user_group.name, description, user.name, firstname, nick, position FROM membership JOIN user_group ON user_group.id = membership.id_group JOIN user ON user.id = membership.id_user WHERE user_group.id = ?;', [req.query.id], function(err, rows){
        if(err){
            req.log.warning(err);
            res.error('500');
        } else {
            var values = new Object();
            values.name = rows[0]['user_group.name'];
            values.description = rows[0]['description'];
            values.members = new Array();
            for(let key in rows){
                let row = rows[key];
                values.members.push({
                    'name' : row['user.name'],
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
