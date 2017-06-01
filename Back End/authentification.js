var http = require('http');
var express = require('express');
var session = require('express-session');
var CasAuth = require('cas-authentication');

var servStatic = require('./servStatic').servStaticFile;

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

app.use("/auth", cas.bounce);
app.get("/", function(req, res){
    res.send('OK');
});

app.use("/private", cas.block);
app.get("/private", function(req, res){
    res.send('Only god can judge.');
});

app.listen(8080, "localhost");

