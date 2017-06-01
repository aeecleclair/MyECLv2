var http = require('http');
var express = require('express');
var session = require('express-session');
var CasAuth = require('cas-authentication');

// var servStatic = require('./servStatic').servStaticFile;

var app = express();

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

app.get("/index",function(req, res){
    res.sendFile("../Front End/index.html");
});

app.get("/private",cas.block,function(req,res){
    res.send("You accessed the private content!");
})


app.listen(8080, "localhost",function(){
    console.log("Server started");
});

