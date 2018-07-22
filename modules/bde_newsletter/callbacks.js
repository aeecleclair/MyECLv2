// /modules/bde_newsletter/get
exports.get = function(req, res){
    req.database.query('SELECT * FROM bde_newsletter WHERE id = ?', [req.query.id], function(error, result){
        if(error){
            req.log.error('Erreur lors de la requête');
            res.json({})
        } else {
            if(result.length > 0){
                res.json({id:result[0]['id'], content:result[0]['content'], date:result[0]['date']});
            } else {
                res.json({});
            }
        }
    });
};

// /modules/bde_newsletter/get_all
exports.get_all = function(req, res){
    req.database.query('SELECT * FROM bde_newsletter ORDER BY date DESC', function(error, result){
        if(error){
            req.log.error('Erreur lors de la requête');
            res.json({})
        } else {
            if(result.length > 0){
                var data = new Object();
                data.newsletters = new Array();
                for(let i in result){
                    var newsletter = new Object();
                    newsletter.id = result[i]['id'];
                    newsletter.date = result[i]['date'];
                    newsletter.content = result[i]['content'];
                    data.newsletters.push(newsletter);
                }
                res.json(data);
            } else {
                res.json({});
            }
        }
    });
};

// /modules/bde_newsletter/add
exports.add = function(req, res){
    req.database.query('INSERT INTO bde_newsletter (content, date) VALUES (?, NOW())', [req.body.content], function(error, result){
        if(error){
            req.log.error('Erreur lors de la requête');
        }
        res.redirect('/home/bde_newsletter/admin');
    });
};

// /modules/bde_newsletter/update
exports.update = function(req, res){
    req.database.query('UPDATE bde_newsletter SET content = ? WHERE id = ?', [req.body.content, req.body.id], function(error, result){
        if(error){
            req.log.error('Erreur lors de la requête');
        }
        res.redirect('/home/bde_newsletter/admin');
    });
};

// /modules/bde_newsletter/delete
exports.delete = function(req, res){
    req.database.query('DELETE FROM bde_newsletter WHERE id = ?', [req.body.id], function(error, result){
        if(error){
            req.log.error('Erreur lors de la requête');
        }
        res.redirect('/home/bde_newsletter/admin');
    });
};
