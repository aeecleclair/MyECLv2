
exports.get_reservations = function(req, res){
    req.database.query("SELECT id, beginning, ending, title, ressource, description, user_id FROM reservations2 WHERE beginning BETWEEN ? AND ? ORDER BY beginning",
        [req.query.monday, req.query.nextMonday], function(error, result) {
            if (error) {
                req.log.error("Error: unable to get reservations");
            } else {
                var data = new Object();
                data.reservations = new Array();
                data.user_id = req.session.user.id;

                for (let i in result) {
                    let row = new Object();

                    row.id = result[i].id;
                    row.beginning = result[i].beginning;
                    row.ending = result[i].ending;
                    row.title = result[i].title;
                    row.ressource = result[i].ressource;
                    row.description = result[i].description;
                    row.user_id = result[i].user_id;

                    data.reservations.push(row);
                }
                res.json(data);
            }
    });
};

exports.new_reservation = function(req, res) {
    console.log('New reservation');
    let data = [req.body.beginning, req.body.ending, req.body.title, req.body.ressource, req.body.description, req.session.user.id];

    req.database.query("INSERT INTO reservations2 (beginning, ending, title, ressource, description, user_id) VALUES (?,?,?,?,?,?)", data, function(error, result) {
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

    req.database.query("UPDATE reservations2 SET beginning=?, ending=?, title=?, description=? WHERE id=?", data, function(error, result) {
        if (error) {
            req.log.error("Error: unable to update / " + error);
        } else {
            console.log('Updated');
        }
    });
    res.json({});
}
