/*
 *
 * Service user
 * Fournit divers fonctions pour intéroger la base dedonnées des utilisateurs
 *
 */
module.exports = function(context){
    var user_tools = new Object();

    user_tools.getAllUsers = function(login, callback){
        // Renvoie des infos minimums sur l'ensemble des utilisateurs
        context.database.select('user', ['login', 'nick', 'firstname', 'name'], callback);
    };

    user_tools.getUser = function(login, callback){
        context.database.select('user', 'login = ?', [login], function(err, res){
            var user_datas = res;
            if(!err){
                context.database.query(
                    'SELECT * FROM membership JOIN user_group ON membership.id_group = user_group.id WHERE membership.id_user = ? ;',
                    [user_datas.id],
                    function(err2, res2){
                        if(!err2){
                            user_datas.groups = [];
                            for(var key in res2){
                                user_datas.groups[key] = {
                                    'id_group' : res2[key].id_group,
                                    'position' : res2[key].position,
                                    'term' : res2[key].term,
                                    'group' : res2[key].name,
                                    'description' : res2[key].description
                                };
                            }
                            callback(undefined, user_datas);
                        } else {
                            callback(err2);
                        }
                    }
                );
            } else {
                callback(err);
            }
        });
    };

    user_tools.saveUser = function(login, user_datas, callback){
        // /!\ Ne sauve pas les modifs au niveau des groupes
        var tables = context.tables;
        var keys;
        for(let key in tables){
            if(tables[key].table == 'user'){
                keys = Object.keys(tables[key].table.schema);
            }
        }
        for(let key in user_datas){
            if(!keys.includes(key)){
                delete user_datas[key];
            }
        }
        context.database.save('user', user_datas, function(err){
            if(!err){
                callback(undefined);
            } else {
                callback(err);
            }
        });
    };

    user_tools.searchUser = function(input, callback){
        context.database.select(
            'user',
            ['id', 'login', 'name', 'firstname', 'nick'],
            'login LIKE "%' + input + '%" OR name LIKE "%' + input + '%" OR firstname LIKE "%' + input + '%" OR nick LIKE "%' + input + '%"',
            callback  // callback(error, rows)
        );
    };


    return user_tools;
};
