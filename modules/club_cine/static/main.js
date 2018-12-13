$(document).ready(function() {
    $.get('/modules/club_cine/print_movies', function(res) {
        for (let i in res.movies) {
            let day = res.movies[i].date.split("T")[0].split("-")[2];
            let month = res.movies[i].date.split("T")[0].split("-")[1];
            let hour = res.movies[i].date.split("T")[1].split(":")[0];
            let html = '<section id="affiche' + res.movies[i].id + '" class="download-section content-section text-center">';
            html += '<style>#affiche' + res.movies[i].id + '{background: url("/user_uploads/' + res.movies[i].image + '") no-repeat center center scroll;}</style>'; //Workaround
            html += '<div class="container">';
            html += '<div class="row">';
            html += '<div class="col-md-8 col-md-offset-2">';
            html += '<h1>' + res.movies[i].titre + '</h1>';
            html += '<p>' + res.movies[i].infos + ', le ' + day + '/' + month + ' à ' + hour + 'h.</p>';
            html += '<a id="btn' + res.movies[i].id + '" href="#synop' + res.movies[i].id + '" class="btn btn-default btn-lg btn-synop">Synopsis</a>';
            html += '</div>';
            html += '</div>';
            html += '</div>';
            html += '</section>';

            html += '<section id="synop' + res.movies[i].id + '" class="content-section text-center synop">';
            html += '<div class="container">';
            html += '<div class="row">';
            html += '<div class="col-md-8 col-md-offset-2">';
            html += '<h2>Synopsis</h2>';
            html += '<p>' + res.movies[i].synopsis + '</p>';
            html += '</div>';
            html += '</div>';
            html += '</div>';
            html += '</section>';
            $('#main-content-wrapper').append(html);

            $('#btn' + res.movies[i].id).on('click', function() {
                $('#synop' + res.movies[i].id).toggle();
            });
        }
        $('.synop').hide();
    });
});