// var http = require('http');
var express = require('express');
var app = express();
var session = require('express-session');
// var mongoose=require("mongoose");
// var User = require("./models/user");
var authentify = require("./primary/authentification.js")

app.use(express.static(__dirname + '/public')); // Definition du repertoire statique

// ------Initialization de la connection--------
app.use(session({
    secret      : 'dats a fuckin good secret',
    resave      : false,
    saveUninitialized : true
}));
//---------------------------------------------



app.get("/",function(req, res){
    res.render("welcome.ejs",{user:req.session.cas_user});
});

app.get("/private",authentify,function(req,res){
    res.send("You accessed the private content!");
})


app.listen(8080, "localhost",function(){
    console.log("Server started");
});

