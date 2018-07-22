
const fs = require('fs');

// /modules/bde_calendar/get_all
exports.get_all = function(req, res){
    
	var start_calendar = new Date(parseInt(req.query.start)*1000);
	var end_calendar = new Date(parseInt(req.query.end)*1000);
	
	var start_year = start_calendar.getFullYear();
	var start_month = start_calendar.getMonth() + 1;
	var start_date = start_calendar.getDate();
	
	start_calendar = start_year + '-' + start_month + '-' + start_date + ' 00:00:00';
	
	var end_year = end_calendar.getFullYear();
	var end_month = end_calendar.getMonth() + 1;
	var end_date = end_calendar.getDate();
	
	end_calendar = end_year + '-' + end_month + '-' + end_date + ' 00:00:00';
	
    req.database.query('SELECT * FROM bde_calendar_database WHERE start < ? OR end > ?', [end_calendar, start_calendar], function(error, result){
        if (error) {
            req.log.error('Erreur lors de la requête');
            res.json({});
        } else {
            var data = new Object();
            data.events = new Array();

            for (let key in result){
                let event = new Object();
                event.id = result[key]['id'];
                event.start = result[key]['start'];
                event.end = result[key]['end'];
                event.allDay = false;
                event.title = result[key]['title'];
                event.description = result[key]['description'];
                event.location = result[key]['location'];
                event.organisation = result[key]['organisation'];
                event.target = result[key]['target'];
                event.className = event.organisation;
                data.events.push(event);
            }
            res.send(data.events);
        }
    });
};


// /modules/bde_calendar/add
exports.add = function(req,res){
	data = req.body;
	req.database.save("bde_calendar_database", data, function(error, result){
        if(error){
            req.log.error(error);
            res.json({}); 
        }
    });
    res.redirect('/home/bde_calendar/admin');
}

// /modules/bde_calendar/delete
exports.delete = function(req, res){
    var id = parseInt(req.body.id);
    req.database.query("DELETE FROM bde_calendar_database WHERE id = ?;", [id], function(error, result){
        if (error){
            req.log.error(error);
        }
    });
    res.redirect('/home/bde_calendar/admin');
};
