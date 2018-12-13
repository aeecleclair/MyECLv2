// UTILS
function give_price(products, req){
    var price = 0;

    var promises = new Array();
    for(let i in products){
        promises.push(new Promise(function(resolve, reject){
            req.database.query("SELECT price FROM ProduitAmap WHERE id = ?", [i], function(err, data){
                if(err){
                    req.log.error(err);
                    reject();
                } else {
                    price += products[i] * data[0]['price'];
                    resolve(price);
                }
            });
        }));
    }

    return Promise.all(promises);
}


// /modules/amap/update_cash
exports.update_cash = function(req, res){
    var id = req.body.id;
    var amount = req.body.amount;
    req.database.save('SoldeAmap', {user_id:id, amount:amount}, function(err, data){
        if(err){
            req.log.error(err);
        } else {
            res.redirect('/home/amap/admin');
        }
    });
}

// /modules/amap/add_product
exports.add_product = function(req, res){
    var name = req.body.name;
    var price = req.body.price;
    req.database.save('ProduitAmap', {name:name, price:price}, function(err, data){
        if(err){
            req.log.error(err);
        } else {
            res.redirect('/home/amap/admin')
        }
    })
}

// /modules/amap/remove_product
exports.remove_product = function(req, res){
    var id = req.body.id;
    req.database.query("DELETE FROM ProduitAmap WHERE id=?", [id], function(err, data){
        if(err){
            req.log.error(err);
        } else {
            res.redirect('/home/amap/admin');
        }
    })
}

// /modules/amap/toggle_week
exports.toggle_week = function(req, res){
    if(Object.prototype.hasOwnProperty.call(req.body, 'start') && Object.prototype.hasOwnProperty.call(req.body, 'end')){
        req.database.save("SemaineAmap", {start : req.body['start'], end : req.body['end']}, function(err, data){
            if(err){
                req.log.error(err);
            } else {
                res.redirect('/home/amap/admin');
            }
        });
    } else {
        req.database.query("DELETE FROM SemaineAmap WHERE id=?", [req.body.id], function(err, data){
            if(err){
                req.log.error(err);
            } else {
                res.redirect('/home/amap/admin');
            }
        });
    }    
}

// /modules/amap/compute_price
exports.compute_price = function(req, res){
    var products = JSON.parse(req.query.products);
    give_price(products, req).then(function(result){
        var price = 0;
        if(result.length){
            price = Math.max(...result);
        }
        res.send({price:price});
    });  
}

// /modules/amap/search_user
exports.search_user = function(req, res){
    var name = req.query.name;
    req.serv.user.searchUser(name, function(err, data){
        if(err){
            req.log.error(err);
        } else {
            res.send(data);
        }
    })
}

// /modules/amap/update_order
exports.update_order = function(req, res){
    var user_id = req.session.user.id;
    var week = req.body.week;
    var new_products = JSON.parse(req.body.products);

    var id = 0;
    var old_products = new Object();
    var old_price = 0;
    var new_price = 0;
    var cash = 0;

    var old = new Promise(function(resolve){
        req.database.query("SELECT * FROM CommandeAmap WHERE user_id = ? AND week = ?", [user_id, week], function(err, data){
            if(err){
                req.log.error(err);
            } else {
                if(data.length){
                    id = data[0]['id']
                    old_products = JSON.parse(data[0]['products']);
                }
                resolve();
            }
        });
    });

    old.then(function(){
        give_price(old_products, req).then(function(result){
            if(result.length){
                old_price = Math.max(...result);
            }
        });

        give_price(new_products, req).then(function(result){
            if(result.length){
                new_price = Math.max(...result);
            } 
        });

        var possible = new Promise(function(resolve){
            req.database.query("SELECT amount FROM SoldeAmap WHERE user_id = ?", [user_id], function(err, data){
                if(err){
                    req.log.error(err);
                } else {
                    if(data.length){
                        cash = data[0]['amount'];
                    }
                    resolve();
                }
            });
        });
    
        possible.then(function(){
            if(cash + old_price < new_price){
                res.send(false);
            } else {
                var promises = new Array();
                promises.push(new Promise(function(resolve){
                    if(id > 0){
                        var params = {id:id, user_id:user_id, week:week, products:JSON.stringify(new_products)};
                    } else {
                        var params = {user_id:user_id, week:week, products:JSON.stringify(new_products)};
                    }
                    req.database.save('CommandeAmap', params, function(err, data){
                        if(err){
                            req.log.error(err);
                        }
                        resolve();
                    });
                }));

                promises.push(new Promise(function(resolve){
                    req.database.query("UPDATE SoldeAmap SET amount = ? WHERE user_id = ?", [cash + old_price - new_price, user_id], function(err, data){
                        if(err){
                            req.log.error(err);
                        }
                        resolve();
                    });
                }));
                
                Promise.all(promises).then(function(){
                    res.send(true);
                })
            }
        })
    });    
}

// /modules/amap/remove_order
exports.remove_order = function(req, res){
    var user_id = req.body.id;
    var week = req.body.week;

    req.database.query('DELETE FROM CommandeAmap WHERE user_id=? AND week=?', [user_id, week], function(err, data){
        if(err){
            req.log.error(err);
        } else {
            res.redirect('/home/amap/home');
        }
    });
}

// /modules/amap/get_orders
exports.get_orders = function(req, res){
    var id = req.query.id;
    req.database.query("SELECT u.name AS name, u.firstname AS firstname, ca.products AS products FROM CommandeAmap AS ca JOIN user AS u ON u.id=ca.user_id WHERE week = ? ", [id], function(err, data){
        if(err){
            req.log.error(err);
        } else {
            var promises = new Array();

            var orders = new Array();
            for (let order in data){
                promises.push(new Promise(function(resolve){
                    var obj = new Object();
                    obj.firstname = data[order]['firstname'];
                    obj.name = data[order]['name'];
                    obj.products = JSON.parse(data[order]['products']);
                    obj.price = 0;
                    give_price(obj.products, req).then(function(result){
                        if(result.length){
                            obj.price = Math.max(...result);
                        }
                        orders.push(obj);
                        resolve();
                    });
                    obj.descr = new Object();
                }));
                
            }
            Promise.all(promises).then(function(){
                res.send(orders);
            });   
        }
    });
}

// /modules/amap/get_cash
exports.get_cash = function(req, res){
    req.database.query("SELECT * FROM SoldeAmap WHERE user_id = ?", [req.query.id], function(err, data){
        if(err){
            req.log.error(err);
        } else {
            var o = new Object();
            o.cash = 0;
            if(data.length){
                o.cash = data[0]['amount'];
            }
            res.send(o);
        }
    });
}

// /modules/amap/get_products
exports.get_products = function(req, res){
    req.database.query('SELECT * FROM ProduitAmap', function(err, data){
        if(err){
            req.log.error(err);
        } else {
            var products = new Array();
            for (let i in data){
                var product = new Object();
                product.name = data[i]['name'];
                product.price = data[i]['price'];
                product.id = data[i]['id'];
                products.push(product);
            }
            res.send(products);
        }
    });
}

// /modules/amap/get_weeks
exports.get_weeks = function(req, res){
    req.database.query("SELECT id, DATE_FORMAT(start, GET_FORMAT(DATE, 'EUR')) AS start, DATE_FORMAT(end, GET_FORMAT(DATE, 'EUR')) AS end FROM SemaineAmap", function(err, data){
        if(err){
            req.log.error(err);
        } else {
            var weeks = new Array();
            for (let i in data){
                var week = new Object();
                week.start = data[i]['start'];
                week.end = data[i]['end'];
                week.id = data[i]['id'];
                weeks.push(week);
            }
            res.send(weeks);
        }
    }); 
}

// /modules/amap/get_account
exports.get_account = function(req, res){
    var id = req.session.user.id;
    var week = req.query.week;
    var result = new Object();
    result.cash = "0";
    result.products = new Object();

    // PRODUCTS
    var p_products = new Promise(function(resolve, reject){
        req.database.query("SELECT * FROM ProduitAmap", function(err, data){
            if(err){
                req.log.error(err);
                reject();
            } else {
                var promises_d = new Array();
                for(let i in data){
                    promises_d.push(new Promise(function(resolve_d){
                        result.products[data[i].id] = {id:data[i].id, name:data[i].name, price:data[i].price, quantity:"0"};
                        resolve_d();
                    }));
                }
                Promise.all(promises_d).then(function(){
                    resolve();
                });
            }
        });
    });

    p_products.then(function(){
        var p_order = new Promise(function(resolve, reject){
            req.database.query("SELECT * FROM CommandeAmap WHERE user_id=? AND week=?", [id, week], function(err, data){
                if(err){
                    req.log.error(err);
                    reject();
                } else {
                    if(data.length){
                        var products = JSON.parse(data[0]['products']);
                        var promises_d = new Array();
                        for(let i in products){
                            promises_d.push(new Promise(function(resolve_d){
                                result.products[i].quantity = products[i];
                                resolve_d();
                            }));
                        }
                        Promise.all(promises_d).then(function(){
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                }
            });
        });

        p_order.then(function(){
            p_cash = new Promise(function(resolve, reject){
                req.database.query("SELECT amount FROM SoldeAmap WHERE user_id=?", [id], function(err, data){
                    if(err){
                        req.log.error(err);
                        reject();
                    } else {
                        if(data.length){
                            result.cash = data[0]['amount']; 
                        }
                        resolve();
                    }
                });
            });

            p_cash.then(function(){
                res.send(result);
            })
        });
    });
}