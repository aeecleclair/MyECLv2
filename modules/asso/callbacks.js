
// Y a encore beaucoup de taff sur ce module !
// TODO :
// - Finir le callback d'édition
// - Remplacer les selection par id de groupe par une selection par nom d'asso
// - Faire correspondre les test de sécurité avec ce changement
// - Permettre la création d'une nouvelle asso par les admins


// /module/asso/data
exports.get_data = function(req, res){
    req.database.select(
        'asso',
        ['nom', 'photo', 'galerie', 'description', 'group'],
        'id = ?',
        [req.params['id']],
        function(err, rows){
            if(err){
                req.log.warning('Error loading asso data.');
                req.log.warning(err);
                res.error(500);
                return;
            }
            var row = rows[0];
            var galerie = row['galerie'];
            var group = row['group'];
            var prom_photo = new Promise(function(succ, fail){
                req.database.select('asso_photos', ['url'], 'galerie_id = ?', [galerie], function(err, rows){
                    if(err){
                        fail(err);
                    } else {
                        succ({'photos' : rows});
                    }
                });
            });

            var prom_members = new Promise(function(succ, fail){
                req.database.select(
                    'SELECT name, firstname, nick, position, picture_url \
                    FROM user JOIN membership \
                    ON membership.id_user = user.id \
                    WHERE membership.id_group = ?',
                    [group],
                    function(err, rows){
                        if(err){
                            fail(err);
                        } else {
                            var users = new Array();
                            for(let key in rows){
                                row = rows[key];
                                let user = {
                                    'nom' : row['name'],
                                    'prenom' : row['firstname'],
                                    'surnom' : row['nick'],
                                    'poste' : row['position'],
                                    'photo' : row['picture_url']
                                };
                                users.push(user);
                            }
                            succ({'membres' : users});
                        }
                    }
                );
            });

            var data = { 
                'photo' : row['photo'],
                'nom' : row['nom'],
                'medias' : {
                    'mail' : row['mail'],
                    'facebook' : row['facebook'],
                },
                modules : [
                ],
                'description' : row['description']
            };
                

            var prom = new Promise([prom_photo, prom_members]);
            prom.all(function(result){
                
                for(let key in result){
                    if(result[key].membres){
                        data.membres = result[key].membres;
                    } else if(result[key].photos){
                        data.galerie = result[key].photos;
                    }
                }

                res.send(data);
                
            });
        }
    );
};


// /body/asso/edit_asso/:id
// /module/asso/edit/:id
module.exports.authorise_edit = function(req){
    var id = req.params['id'];
    if(req.validator.isInt(id)){
        return `\
            SELECT user.login \
            FROM user \
            JOIN membership \
                ON user.id = membership.id_user \
            WHERE membership.id_group = '${id}';`;
    } else {
        return 'SELECT login WHERE 1 = 0;';
    }
};


// POST /module/asso/edit/:id
module.exports.edit = function(req, res){
    var id = req.params['id'];
    var files = req.files;

    res.redirect(`/home/asso/main/${id}`);
};

