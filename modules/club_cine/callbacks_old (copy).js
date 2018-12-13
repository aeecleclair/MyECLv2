exports.get_active_movies = function(req, res) {
    req.database.query('SELECT id, titre, date FROM club_cine WHERE active', function(error, result) {
        if (error) {
            req.log.error("Movies request error: unable to retrieve active movies' list from film database --> empty response");
            res.json({});
        } else {
            var data = new Object();
            data.movies = new Array();

            for (let i in result) {
                let movie = new Object();

                movie.id = result[i].id;
                movie.titre = result[i].titre;
                movie.date = result[i].date;

                data.movies.push(movie);
            }
            res.json(data);
            console.log('Active movies request handled');
        }
    });
};

exports.get_inactive_movies = function(req, res) {
    req.database.query('SELECT id, titre, date FROM club_cine WHERE NOT active', function(error, result) {
        if (error) {
            req.log.error("Movies request error: unable to retrieve movies' list from film database --> empty response");
            res.json({});
        } else {
            var data = new Object();
            data.movies = new Array();

            for (let i in result) {
                let movie = new Object();

                movie.id = result[i].id;
                movie.titre = result[i].titre;
                movie.date = result[i].date;

                data.movies.push(movie);
            }
            res.json(data);
            console.log('Inactive movies request handled');
        }
    });
};

exports.print_movies = function(req, res) {
    req.database.query("SELECT id, image, titre, infos, date, synopsis FROM club_cine WHERE active", function(error, result) {
        if (error) {
            req.log.error("Movie posters request error: unable to retrieve movie posters' list from film database --> empty response");
            res.json({});
        } else {
            var data = new Object();
            data.movies = new Array();

            for (let i in result) {
                let movie = new Object();

                movie.id = result[i].id;
                movie.image = result[i].image;
                movie.titre = result[i].titre;
                movie.infos = result[i].infos;
                movie.date = result[i].date;
                movie.synopsis = result[i].synopsis;

                data.movies.push(movie);
            }
            res.json(data);
            console.log('Movie posters request handled');
        }
    });
};

exports.enable_movie = function(req, res) {
    req.database.query("UPDATE club_cine SET active='1' WHERE id='" + req.body.id + "'", function(error, result) {
        if (error) {
            req.log.error("Error: unable to enable movie --> overriding");
        } else {
            console.log('Movie enabled');
        }
    });
};

exports.disable_movie = function(req, res) {
    req.database.query("UPDATE club_cine SET active='0' WHERE id='" + req.body.id + "'", function(error, result) {
        if (error) {
            req.log.error("Error: unable to disable movie --> overriding");
        } else {
            console.log('Movie disabled');
        }
    });
};

exports.get_movie = function(req, res) {
    req.database.query("SELECT image, titre, infos, date, synopsis FROM club_cine WHERE id='" + req.body.id + "'", function(error, result) {
        if (error) {
            req.log.error("Movie request error: unable to retrieve movie from film database --> empty response");
            res.json({});
        } else {
            var data = new Object();
            data.image = result[0].image;
            data.titre = result[0].titre;
            data.infos = result[0].infos;
            data.date = result[0].date;
            data.synopsis = result[0].synopsis;
            res.json(data);
            console.log('Single movie request handled');
        }
    });
};

exports.suppress_movie = function(req, res) {
    req.database.query("DELETE FROM club_cine WHERE id='" + req.body.id + "'", function(error, result) {
        if (error) {
            req.log.error("Error: unable to discard movie --> overriding");
        } else {
            console.log('Movie discarded');
        }
    });
};

exports.create_movie = function(req, res) {
    console.log(req.file);
    var extension = req.file.originalname.split('.');
    extension = extension[extension.length - 1];

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tif', 'tiff', 'ico'].indexOf(extension) > -1) {
        req.database.query("INSERT INTO club_cine VALUES (NULL, '" + req.file.path + "', '" + req.body.titre + "', '" + req.body.infos + "', '" + req.body.date + "', '" + req.body.synopsis + "', '0')", function(error, result) {
            if (error) {
                req.log.error("Error: unable to create movie --> overriding");
            } else {
                console.log('Movie created');
            }
        });
    } else {
        req.log.error('Error: unable to upload image file, wrong type');
    }
}