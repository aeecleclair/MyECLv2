//Model Film

var mongoose=require("mongoose");

var FilmSchema= new mongoose.Schema({
    title: String,
    year : String,
    
});  
module.exports = mongoose.model("Film",FilmSchema);