
exports.get_reservations = function(req, res){
    var data = new Object();
    var resources_id = new Array();

    var promise = new Promise(function(resolve, reject) {
        req.database.query("SELECT resources_reservationBDE.id FROM resources_reservationBDE " +
        "JOIN authorisations_reservationbde ON resources_reservationbde.id = authorisations_reservationbde.resource_id " +
        "JOIN membership ON membership.id_group = authorisations_reservationbde.group_id " +
        "WHERE membership.id_user = ?", [req.session.user.id], function(error, result) {
            if (error) {
                req.log.error("Error: unable to get 'resource_ids'");
                reject();
            }
            else {
                for (let i in result) {
                    resources_id.push(result[i].id);
                }

                resolve(resources_id);
            }
        });
    });

    promise.then(function(value) {

        var promises = new Array(2);
        
        promises[0] = new Promise(function(resolve, reject) {
            req.database.query("SELECT id, resource FROM resources_reservationBDE WHERE id IN (?)", [value], function(error, result) {
                if (error) {
                    req.log.error("Error: unable to get 'resources'");
                    reject();
                }
                else {

                    console.log(result);
                    data.resources = new Array();

                    for (let i in result) {
                        let row = new Object();

                        row.id = result[i].id;
                        row.resource = result[i].resource;

                        data.resources.push(row);

                        resources_id.push(result[i].id);

                        resolve();
                    }
                }
            });
        });

        promises[1] = new Promise(function(resolve, reject) {
            req.database.query("SELECT id, beginning, ending, title, resource, description, user_id FROM reservations_reservationbde " +
            "WHERE beginning BETWEEN ? AND ? AND " +
            "resource IN (?) " +
            "ORDER BY beginning",
            [req.query.monday, req.query.nextMonday, resources_id], function(error, result) {
                if (error) {
                    req.log.error("Error: unable to get 'reservations'");
                    reject();
                }
                else {
                    console.log(result);
                    data.reservations = new Array();
                    data.user_id = req.session.user.id;
    
                    for (let i in result) {
                        let row = new Object();
        
                        row.id = result[i].id;
                        row.beginning = result[i].beginning;
                        row.ending = result[i].ending;
                        row.title = result[i].title;
                        row.resource = result[i].resource;
                        row.description = result[i].description;
                        row.user_id = result[i].user_id;
        
                        data.reservations.push(row);
                    }

                    resolve();
                }
            });
        });

        Promise.all(promises).then(function() {
            res.json(data);
        })
    });
};

exports.new_reservation = function(req, res) {
    console.log('New reservation');
    let data = [req.body.beginning, req.body.ending, req.body.title, req.body.resource, req.body.description, req.session.user.id];

    req.database.query("INSERT INTO reservations_reservationBDE (beginning, ending, title, resource, description, user_id) VALUES (?,?,?,?,?,?)", data, function(error, result) {
        if (error) {
            req.log.error("Error: unable to book / " + error);
        } else {
            console.log('Booked');
        }
    });
    res.json({});
}

exports.update_reservation = function(req, res) {
    console.log('Update reservation');
    let data = [req.body.beginning, req.body.ending, req.body.title, req.body.description, req.body.id];

    req.database.query("UPDATE reservations_reservationBDE SET beginning=?, ending=?, title=?, description=? WHERE id=?", data, function(error, result) {
        if (error) {
            req.log.error("Error: unable to update / " + error);
        } else {
            console.log('Updated');
        }
    });
    res.json({});
}
