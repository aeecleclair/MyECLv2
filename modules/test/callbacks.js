exports.main_cb = function(req, res){
    res.send('Hello');
};

exports.load_file = function(req, res){
    console.log(req.file);
    res.redirect('/home');
};

exports.log = function(req, res){
    console.log(req.body);
    res.redirect('/home');
};
