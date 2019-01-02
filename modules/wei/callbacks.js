// /modules/wei/create_team
exports.create_team = function(req, res){
    var name = req.body.name;
    var number = req.body.number;
    req.database.query('INSERT INTO EquipeWei (name, number, score) VALUES (?, ?, 0);', [name, number], function(error, result){
        if(error){
            req.log.error(error);
        } else {
            res.redirect("/home/wei/admin");
        }
    });
}

// /modules/wei/update_team
exports.update_team = function(req, res){
    var id = req.body.id;
    var name = req.body.name;
    var phrase = req.body.phrase;
    var source = req.body.source;
    var redirect = "";
    if(source != undefined){
        redirect = "home";
    } else {
        redirect = "admin"
    }

    if(name != "" && phrase != ""){
        req.database.query("UPDATE EquipeWei SET name = ?, phrase = ? WHERE id = ?;", [name, phrase, id], function(error, result){
            if(error){
                req.log.error(error);
            }
            res.redirect("/home/wei/" + redirect);
        });
    } else if(name != "") {
        req.database.query("UPDATE EquipeWei SET name = ? WHERE id = ?;", [name, id], function(error, result){
            if(error){
                req.log.error(error);
            }
            res.redirect("/home/wei/" + redirect);
        });
    } else if(phrase != ""){
        req.database.query("UPDATE EquipeWei SET phrase = ? WHERE id = ?;", [phrase, id], function(error, result){
            if(error){
                req.log.error(error);
            }
            res.redirect("/home/wei/" + redirect);
        });
    } else {
        res.redirect("/home/wei/" + redirect);
    }

    
    
}

// /modules/wei/build_team
exports.get_all_teams = function(req, res){
    req.database.query('SELECT id, name, number, phrase, score, \
                        COUNT(*) AS members \
                        FROM EquipeWei AS e \
                        LEFT JOIN MembreEquipeWei AS me ON e.id = me.id_team \
                        GROUP BY id_team \
                        ORDER BY number;', function(error, result){
        if(error){
            req.log.error(error);
            res.json({});
        } else {
            var data = new Object();
            data.teams = new Array();
            for(let team in result){
                var cur = new Object();
                cur.id = result[team]['id'];
                cur.number = result[team]['number'];
                cur.name = result[team]['name'];
                cur.phrase = result[team]['phrase'];
                cur.score = result[team]['score'];
                cur.members = result[team]['members'];
                data.teams.push(cur);
            }
            res.json(data);
        }
    });
}

// /modules/wei/get_team_members
exports.get_team_members = function(req, res){
    var id = req.query.id;
    var data = new Object();
    data.members = new Array();

    function complete_members(id, data){
        req.database.query('SELECT nick, firstname, name \
                        FROM user AS u \
                        JOIN MembreEquipeWei AS me ON u.id = me.id_member \
                        WHERE me.id_team = ?', [id], function(error, result){
            if(error){
                req.log(error);
            } else {
                for(let key in result){
                    var cur = new Object();
                    cur.nick = result[key]['nick'];
                    cur.firstname = result[key]['firstname'];
                    cur.name = result[key]['name'];
                    data.members.push(cur);
                }
            }
            res.json(data);
        });
    }

    function get_id(id){
        if (id <= 0) {
            req.database.query('SELECT id_team \
                            FROM MembreEquipeWei AS me \
                            JOIN user AS u ON u.id = me.id_member \
                            WHERE u.login=?;', [req.session.user.login], function(error, result){
                if(error){
                    req.log.error(error);
                } else {
                    if(result.length > 0){
                        id = result[0]['id_team'];
                        complete_members(id, data);
                    }
                }
            });
        } else {
            complete_members(id, data);
        }   
    }

    get_id(id);
    
}

// /modules/wei/get_team
exports.get_team = function(req, res){
    var id = req.query.id;
    var data = new Object();
    get_id(id);

    function get_id(id){
        if (id <= 0) {
            req.database.query('SELECT id_team \
                            FROM MembreEquipeWei AS me \
                            JOIN user AS u ON u.id = me.id_member \
                            WHERE u.login=?;', [req.session.user.login], function(error, result){
                if(error){
                    req.log.error(error);
                } else {
                    if(result.length > 0){
                        id = result[0]['id_team'];
                        complete_members(id, data);
                    }
                }
            });
        } else {
            complete_members(id, data);
        }   
    }

    function complete_members(id, data){
        data.members = new Array();
        req.database.query('SELECT id, nick, firstname, name \
                            FROM user AS u \
                            JOIN MembreEquipeWei AS me ON u.id = me.id_member \
                            WHERE me.id_team = ?', [id], function(error, result){
            for(let key in result){
                var cur = new Object();
                cur.id = result[key]['id'];
                cur.nick = result[key]['nick'];
                cur.firstname = result[key]['firstname'];
                cur.name = result[key]['name'];
                data.members.push(cur);
            }
            complete_team(id, data);
        });  
    } 

    function complete_team(id, data){
        data.team = new Object();
        req.database.query('SELECT name, phrase, number, score \
                            FROM EquipeWei WHERE id=?', [id], function(error, result){
            data.team.id = id;
            data.team.name = result[0]['name'];
            data.team.phrase = result[0]['phrase'];
            data.team.number = result[0]['number'];
            data.team.score = result[0]['score'];
            complete_score(id, data);
        });
    }

    function complete_score(id, data){
        data.score = new Array();
        req.database.query('SELECT event, bonus FROM ScoreEquipeWei WHERE team_id=?', [id], function(error, result){
            for(key in result){
                var cur = new Object();
                cur.event = result[key]['event'];
                cur.score = result[key]['bonus'];
                data.score.push(cur);
            }
            res.json(data);
        });
    }
}

// /modules/wei/delete_team
exports.delete_team = function(req, res){
    var id = req.body.id;
    req.database.query("DELETE FROM EquipeWei WHERE id = ?", [id]);
    req.database.query("DELETE FROM MembreEquipeWei WHERE id_team = ?", [id]);
    res.send('/home/wei/admin');
}

function update_all_scores(req, res){
    function get_sum(id){
        req.database.query("SELECT SUM(bonus) AS s FROM ScoreEquipeWei WHERE team_id = ?", [id], function(error, result){
            if(error){
                req.log.error(error)
            }
            var scoree = result[0]['s'];
            console.log(scoree);
            set_sum(id, scoree);
        });
    }

    function set_sum(id, score){
        req.database.query("UPDATE EquipeWei set score = ? WHERE id = ?", [score, id]);
    }

    req.database.query("SELECT id FROM EquipeWei", function(error, result){
        if(error){
            req.log.error(error);
        }
        for(let key in result){
            console.log(result[key]['id'])
            get_sum(result[key]['id']);
        }
    });
}

//modules/wei/add_score
exports.add_score = function(req, res){
    var event = req.body.event;
    var team = req.body.team;
    var score = req.body.score;
    req.database.query("SELECT id FROM EquipeWei WHERE number = ?", [team], function(error, result){
        if(error){
            req.log.error(error);
        }
        update_score(result[0]['id']);
    });

    function update_score(id_team){
        req.database.query("INSERT INTO ScoreEquipeWei (team_id, event, bonus) VALUES (?, ?, ?)", [id_team, event, score], function(error, result){
            if(error){
                req.log.error(error);
            }
            update_all_scores(req, res);
            res.send('ok');
        });
    }
}

// /modules/wei/add_member
exports.add_member = function(req, res){
    var login = req.body.login;
    var number = req.body.team;
    get_member_id(login, number);

    function get_member_id(login){
        req.database.query("SELECT id FROM user WHERE login=?", [login], function(error, result){
            if(error){
                req.log.error(error);
            } else if(result.length <= 0){
                res.json({message:"Membre introuvable"});
            } else {
                var id_member = result[0]['id'];
                get_team_id(id_member, number);
            }
        });
    }

    function get_team_id(id_member, number){
        req.database.query("SELECT id FROM EquipeWei WHERE number=?", [number], function(error, result){
            if(error){
                req.log.error(error);
            } else if(result.length <= 0){
                res.json({message:"Equipe introuvable"});
            } else {
                var id_team = result[0]['id'];
                check_all_ready(id_member, id_team);
            }
        });
    }

    function check_all_ready(id_member, id_team){
        req.database.query("SELECT COUNT(*) AS c FROM MembreEquipeWei WHERE id_member=?", [id_team, id_member], function(error, result){
            if(error){
                req.log.error(error);
            } else {
                var count = result[0]['c'];
                if(count > 0){
                    res.json({message:"Pas dans deux équipes à la fois !"});
                } else {
                    add_relationship(id_member, id_team)
                }
            }
        });
    }

    function add_relationship(id_member, id_team){
        req.database.query("INSERT INTO MembreEquipeWei (id_member, id_team) VALUES (?, ?);", [id_member, id_team], function(error, result){
            if(error){
                req.log.error(error);
            }
            res.json({message:"C'est bon !"});
        })
    }
}

// /modules/wei/delete_member
exports.delete_member = function(req, res){
    var id = req.body.id;
    req.database.query("DELETE FROM MembreEquipeWei WHERE id_member = ?", [id], function(error, result){
        if(error){
            req.log.error(error);
        }
        res.send('ok');
    });
}
