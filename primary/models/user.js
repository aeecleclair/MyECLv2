//Model User

var mongoose=require("mongoose");

var UserSchema= new mongoose.Schema({
    name: String,
    firstname: String,
    surname: String,
    birth: Date,
    sex: Boolean,
    floor: String,
    sport: String,
    picture: String,
    tdgroup: String,
    asso: [],   //asso=["nom_asso","poste","annee_mandat"]
});  //Ce schema definit la structure de la collection mongoDB "User"

module.exports = mongoose.model("User",UserSchema);  //On exporte le model construit à partir du Schema UserSchema (Qui est une classe)
// Ainsi le Schema definit la collection et le model permet 
// d'instancier des objets qui seront ensuite enregistrés dans la collection
// Par convention les models seront en majuscule et les instances de models en minuscule
