// Middleware a appeler pour authentifier le client qui a fait la requete 

var CasAuth = require('cas-authentication');

var cas = new CasAuth({
    cas_url         : 'https://cas.ec-lyon.fr/cas',
    service_url     : 'http://localhost:8080',
    cas_version     : '2.0'
});

module.exports = cas.bounce