exports.main_cb = function(req, res){
    res.send("Hello");
};

exports.annuaire = function(req, res){
    
    user = new req.app.database.User({name : req.query.name})  //Ici req.app fait reference à l'app Express
    user.save(function(err){
        if(err){
                console.log('Error while creating new user:' + err);  
        } else {
            req.app.database.User.find(function(err,result){
                res.send(result);
            });
        }
    })
};
