// var http = require('http');
var express = require('express');
var session = require('express-session');
var CasAuth = require('cas-authentication');
var app = express();
// var servStatic = require('./servStatic').servStaticFile;

app.use(express.static(__dirname + '/public'));

// ------Parametrage du CAS---------
app.use(session({
    secret      : 'dats a fuckin good secret',
    resave      : false,
    saveUninitialized : true
}));

var cas = new CasAuth({
    cas_url         : 'https://cas.ec-lyon.fr/cas',
    service_url     : 'http://localhost:8080',
    cas_version     : '2.0'
});

app.use(cas.bounce)

//-----------------------------------



app.get("/",function(req, res){
    console.log(__dirname);
    res.render("header.ejs");
});

app.get("/private",cas.block,function(req,res){
    res.send("You accessed the private content!");
})


app.listen(8080, "localhost",function(){
    console.log("Server started");
});

