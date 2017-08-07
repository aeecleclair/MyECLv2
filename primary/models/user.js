//Model User

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const SALT_WORK_FACTOR = 10;

var UserSchema = new mongoose.Schema({
    login : {type : String, required : true, index : {unique : true}},
    password : {type : String, required : true},
    name : String,
    firstname : String,
    surname : String,
    birth : Date,
    gender : Boolean,
    floor : String,
    sport : String,
    picture : String,
    tdgroup : String,
    asso : []
});  //Ce schema definit la structure de la collection mongoDB "User"

// On encrypt le mdp quand il est modifié
UserSchema.pre('save', function(next){
    var user = this;
    if(!user.isModified('password')) return next();
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

// On ajoute une méthode pour comparer un mot de passe en clair avec la version stockée
UserSchema.methods.comparePassword = function(candidate, callback){
    bcrypt.compare(candidate, this.password, function(err, match){
        if(err) return callback(err, 0);
        callback(null, match);
    });
};


module.exports = mongoose.model('User',UserSchema);  //On exporte le model construit à partir du Schema UserSchema (Qui est une classe)
// Ainsi le Schema definit la collection et le model permet 
// d'instancier des objets qui seront ensuite enregistrés dans la collection
// Le premier argument doit faire reference au nom de la collection tel qu'il apparait dans le bdd mongoDB
// Par convention les models seront en majuscule et les instances de models en minuscule
