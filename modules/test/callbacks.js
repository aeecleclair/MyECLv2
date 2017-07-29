exports.main_cb = function(req, res){
    res.send("Hello");
};

exports.annuaire = function(req, res){
    
    film = new req.app.database.test.Film({title : req.query.name})  //Ici req.app fait reference à l'app Express
    film.save(function(err){
        if(err){
                console.log('Error while creating new user:' + err);  
        } else {
            req.app.database.test.Film.find(function(err,result){
                res.send(result);
            });
        }
    })
};
