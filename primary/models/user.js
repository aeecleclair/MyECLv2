//Model User

var mongoose=require("mongoose");

var UserName= new mongoose.Schema({
    name: String,
    firstname: String,
    surname: String,
    birth: Date,
    sex: Boolean,
    floor: String,
    sport: String,
    picture: String,
    tdgroup: String,
    asso: [], 
});  //Ce schema definit la structure de la collection mongoDB "User"

module.exports = mongoose.model("User",UserSchema);  //On exporte le model construit à partir du Schema UserSchema (Qui est une classe)
// Ainsi le Schema definit la collection et le model permet 
// d'instancier des objets qui seront ensuite enregistrés dans la collection
// Le premier argument doit faire reference au nom de la collection tel qu'il apparait dans le bdd mongoDB
// Par convention les models seront en majuscule et les instances de models en minuscule
