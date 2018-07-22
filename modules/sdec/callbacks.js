
const fs = require('fs');

// /modules/sdec/get_user_orders
exports.get_user_orders = function(req, res){
    req.database.query('SELECT * FROM CommandeSdec JOIN user ON CommandeSdec.user_id=user.id WHERE user.login=?;',[req.session.user.login],function(error, result){
        if (error){
            req.log.error(error);
            res.json({});
        } else{
            var data = new Object();
            data.list = new Array();
            for(let key in result){
                let order = new Object();
                order.id = result[key]['order_id'];
                order.format = result[key]['format'];
                order.quantity = result[key]['quantity'];
                order.pages = result[key]['pages'];
                order.color = result[key]['color'] == 1;
                order.recto_verso = result[key]['recto_verso'] == 1;
                order.price = result[key]['price'];
                order.file_path = result[key]['file_path'];
                order.comment = result[key]['comment'];
                order.state = result[key]['state'];
                data.list.push(order);
            }
            res.json(data);
        }
    });
        
};


// /modules/sdec/get_all_orders
exports.get_all_orders = function(req, res){
    req.database.query('SELECT * FROM CommandeSdec JOIN user ON CommandeSdec.user_id = user.id;', function(error, result){
        if (error) {
            req.log.error('Erreur lors de la requête');
            res.json({});
        } else {
            var data = new Object();
            data.new = new Array();
            data.pending = new Array();
            data.waiting = new Array();
            data.other = new Array();

            for (let key in result){
                let order = new Object();
                order.id = result[key]['order_id'];
                order.format = result[key]['format'];
                order.quantity = result[key]['quantity'];
                order.pages = result[key]['pages'];
                order.color = result[key]['color'] == 1;
                order.recto_verso = result[key]['recto_verso'] == 1;
                order.file_path = result[key]['file_path'];
                order.comment = result[key]['comment'];
                order.price = result[key]['price'];

                order.name = result[key]['name'];
                order.firstname = result[key]['firstname'];
                order.nick = result[key]['nick'];
                order.email = result[key]['email'];

                order.state = result[key]['state'];
                switch (order.state){
                    case '0':
                        data.new.push(order);
                        break;
                    case '1':
                        data.pending.push(order);
                        break;
                    case '2':
                        data.waiting.push(order);
                        break;
                    default:
                        data.other.push(order);
                        break;
                }
            }
            res.json(data);
        }
    });
};


// /modules/sdec/new_order
exports.new_order = function(req, res){
    data = req.body;
    data.color = (data.color == 'on') ? 1 : 0;
    data.recto_verso = (data.recto_verso == 'on') ? 1 : 0;
    data.quantity = parseInt(data.quantity);
    data.pages = parseInt(data.pages);
    data.user_id = req.session.user.id;
    data.state = 0;
    data.file_path = req.file.path;

    var extension = req.file.originalname.split('.');
    extension = extension[extension.length - 1];

    if (['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tif', 'tiff', 'ico'].indexOf(extension) > -1){    
        if (data.quantity >= 1 && data.format != 'default'){
            req.database.save("CommandeSdec", data, function(error, result){
                if(error){
                    req.log.error(error);
                    res.json({}); 
                }
            });
        } else {
            console.log('Quantity must be nonnegative and format not default');
        }
    } else {
        console.log('Incorrect format');
    }
    res.redirect("/home/sdec/home");
}


// .module/sdec/update_order
exports.update_order = function(req, res){
    req.database.save("CommandeSdec", req.body, function(error, result){
        if (error){
            req.log.error(error);
        }
    });
    res.send('updated order');
};


// /modules/sdec/delete_order
exports.delete_order = function(req, res){
    var id = parseInt(req.body.order_id);
    var file_path = "";
    req.database.query("SELECT file_path FROM CommandeSdec WHERE order_id = ?;", [id.toString()], function(error, result){
        if (error){
            req.log.error(error);
        }
        if (result.length > 0){
            file_path = result[0]['file_path'];
            fs.stat(file_path, function (err, stats) {
                if (err) {
                    console.error(err);
                }
             
                fs.unlink(file_path, function(err){
                     if(err) console.log(err);
                });  
             });
        }
    });
    req.database.query("DELETE FROM CommandeSdec WHERE order_id = ?;", [id.toString()], function(error, result){
        if (error){
            req.log.error(error);
        }
    });

    res.send('deleted order');
};