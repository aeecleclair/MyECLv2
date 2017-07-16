module.exports = function(context){
    function check_pass(login, password){
        // interroge la bdd pour savoir si le couple login, password est vallable
        // TODO Faire un vrai système de mot de passe
        if(login == 'a' && password == 'b'){
            return true;
        } else {
            return false;
        }
    }

    function get_user(login){
        // TODO Creer l'objet qui correspond à login
        return { 'name' : login };
    }
    
    exports.password = function(req, res){
        // Valide ou non le mot de passe de l'utilisateur
        var password = req.query.password;
        var login = req.query.login;
        if(check_pass(login, password)){
            req.session.user = get_user(login);
            res.redirect('/home');
        } else {
            res.redirect('/login.html?wrong=1');
        }
    };

    const CasAuth = require('cas-authentication');
    const cas = new CasAuth(context.cas_config);

    exports.bounce = cas.bounce;
    exports.new_account = function(req, res){
        res.redirect('/new_account.html');
    };
    exports.create_account = function(req, res){
        // doit être utilisé avec POST
        // TODO utiliser req.body pour creer le compte dans la bdd
        req.session.user = { 'name' : req.session.login_dsi };
        res.redirect('/home');
    };
    return exports;
};
