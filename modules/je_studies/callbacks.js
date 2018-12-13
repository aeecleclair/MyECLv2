// /modules/je_studies/get_all_admin
exports.get_all_admin = function(req,res){
    var data = new Object();
    data.studies = new Array();

    var promises = new Array();

	req.database.query('SELECT * FROM je_studies', function(error, result){
        if (error) {
            req.log.error('Erreur lors de la requête');
            res.json({});
        } else {
            if(result.length > 0){
                for(let key in result){
                    promises.push(new Promise(function(resolve){
                        var study = new Object();
                        study.id = result[key]['id'];
                        study.description = result[key]['description'];
                        study.title = result[key]['title'];
                        study.ids = JSON.parse(result[key]['appliants']).ids;
                        study.students = new Array();
    
                        var spromises = new Array();
    
                        for(let id in study.ids){
                            spromises.push(new Promise(function(sresolve){
                                req.database.query("SELECT firstname, name, nick FROM user WHERE id = ?", [study.ids[id]], function(serror, sresult){
                                    if(serror){
                                        req.log.error("Erreur lors de la requête");
                                    } else {
                                        var student = new Object();
                                        student.name = sresult[0]['name'];
                                        student.firstname = sresult[0]['firstname'];
                                        student.nick = sresult[0]['nick'];
                                        study.students.push(student);
                                    }
                                    sresolve();
                                }); 
                            }));
                        }
                        Promise.all(spromises).then(function(){
                            data.studies.push(study);
                            resolve();
                        }); 
                    })); 
                }

                Promise.all(promises).then(function(){
                    res.json(data);
                });
            } else {
                res.json({});
            }
            
        }
    });        
}

// /modules/je_studies/get_all
exports.get_all = function(req, res){
    req.database.query('SELECT * FROM je_studies ;', function(error, result){
        if (error) {
            req.log.error('Erreur lors de la requête');
            res.json({});
        } else {
            var data = new Object();
            data.studies = new Array();
           
            for (let key in result){
                let study = new Object();
                study.id = result[key]['id'];
                study.description = result[key]['description'];
                study.title = result[key]['title'];
                study.appliants_number = JSON.parse(result[key]["appliants"]).ids.length;
                study.is_in = JSON.parse(result[key]['appliants']).ids.includes(req.session.user.id);
                data.studies.push(study);
            }
            res.json(data);
        }
    });
};


// /modules/je_studies/apply
exports.apply = function(req, res){
    req.database.query('SELECT appliants FROM je_studies WHERE id=?;',[req.body.id],function(error,result){
		var appliants = new Object();
		var json = JSON.parse(result[0]["appliants"]);
        appliants.ids = json.ids;
        if(!json.ids.includes(req.session.user.id)){
            appliants.ids.push(req.session.user.id);
            var data = JSON.stringify(appliants);
            req.database.save("je_studies", {"id":req.body.id,"appliants":data});
        }
	})
    res.json({});
}


// /modules/je_studies/quit
exports.quit = function(req, res){
    req.database.query('SELECT appliants FROM je_studies WHERE id=?;',[req.body.id],function(error,result){
		var appliants = new Object();
		var json = JSON.parse(result[0]["appliants"]);
        appliants.ids = json.ids;
        if(json.ids.includes(req.session.user.id)){
            var pos = appliants.ids.indexOf(req.session.user.id);
            appliants.ids.splice(pos,1);
            var data = JSON.stringify(appliants);
            req.database.save("je_studies", {"id":req.body.id,"appliants":data});
        }
	})
    res.json({});
}


// .module/je_studies/update
exports.update = function(req, res){
    req.database.save("je_studies", req.body, function(error, result){
        if (error){
            req.log.error(error);
        }
    });
    res.redirect("/home/je_studies/admin");
};



// .module/je_studies/add
exports.add = function(req, res){
    req.database.save("je_studies", req.body, function(error, result){
        if (error){
            req.log.error(error);
        }
    });
    res.redirect("/home/je_studies/admin");
};


// /modules/je_studies/delete
exports.delete = function(req, res){
    req.database.query("DELETE FROM je_studies WHERE id = ?;", [req.body.id], function(error, result){
        if (error){
            req.log.error(error);
        }
    });
	res.redirect("/home/je_studies/admin");
};
