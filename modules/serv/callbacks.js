exports.main_cb = function(req, res){
    req.serv.test_serv.say_hello();
    res.send(req.serv.test_serv.value);
};

