var mongoose=require("mongoose");

var UserSchema= new mongoose.Schema({
    login: String,
    prenom: String,
    nom: String,
    surnom: String,
    asso:[[String,String]],
    // [Asso,poste]  
    // Query for an Element by the Array Index Position
    // ex: db.users.find( { "asso.1": "tresorier" } )
    solde: Number,
    releveCompte: [{date:String,prix:Number}]

});

module.exports = mongoose.model("User",UserSchema);