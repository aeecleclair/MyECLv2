exports.main_cb = function(req, res){
    res.send("Hello");
};

exports.annuaire = function(req, res){
    console.log(__dirname);
    console.log(__filename);
    console.log(context)
    const User = require('/media/daniel/Documents/Daniel/Work/Scolaire/ECL 16/Asso/Eclair/MyECL/MyECLv2/primary/models/user');
    user = new User({name : req.query.name})
    user.save(function(err){
        if(err){
                console.log('Error while creating new user:' + err);  
        } else {
            User.find(function(err,result){
                res.send(result);
            });
        }
    })
};
