exports.main_cb = function(req, res){
    res.send("Hello");
};

exports.annuaire = function(req, res){
    
    var db = req.app.database //Ici req.app fait reference à l'app Express
    db.save('film',{titre:"'lalaland'",realisateur:"'damien chazelle'"},function(err){
        if(err){
            console.log(err);
        } else {
            // console.log(db.select('film'));            
            db.query('SELECT * FROM film',function(error,result,fields){
                console.log(error);
                console.log(result);
                console.log(fields);
            }
            );
            
        }
    });
};
