
// /modules/tiles/save
exports.bodyParser = require('body-parser').json();

// /modules/tiles/save
exports.save_user = function(req, res){
    // enregistre les indices des tiles de l'utilisateur
    req.log.info(req.body);
    req.database.save('user_tiles', {'user_id' : req.session.user.id, 'tiles' : JSON.stringify(req.body)}, function(err){
        if(err){
            req.log.error(err);
            res.status(500).send('Unable to save user configuration');
        } else {
            res.send('OK');
        }
    });
};

// /modules/tiles/get
exports.get_user = function(req, res){
    req.database.select('user_tiles', 'user_id = ?', [req.session.user.id], function(err, rows){
        if(err){
            req.log.error(err);
            res.status(500).send('Unable to read user configuration');
        } else {
            if(rows.length == 0){
                res.json({}); // utilisation de la config par defaut
            } else {
                res.json(JSON.parse(rows[0]['tiles']));
            }
        }
    });        
};


