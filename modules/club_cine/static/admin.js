var load_movies = function() {
    $('#active_list').html('');
    $('#inactive_list').html('');
    $.get('/modules/club_cine/get_active_movies', function(res) {
        for (let i in res.movies) {
            let day = res.movies[i].date.split("T")[0].split("-")[2];
            let month = res.movies[i].date.split("T")[0].split("-")[1];
            let hour = res.movies[i].date.split("T")[1].split(":")[0];
            let row = '<div class="form-group container hline">';
            row += '<div class="row">'
            row += '<div class="col-md-4">' + res.movies[i].titre + ' (' + day + '/' + month + ' ' + hour + 'h' + ') </div>';
            row += '<div class="col-md-4 col-md-offset-4"><button class="btn btn-primary pull-center btn-multi" id="disable-' + res.movies[i].id + '">Désactiver</button>';
            row += '<button class="btn btn-primary pull-center  btn-multi" id="modify-' + res.movies[i].id + '">Modifier</button>';
            row += '<button class="btn btn-primary pull-center  btn-multi" id="suppress-' + res.movies[i].id + '">Supprimer</button></div>';
            row += '</div>';
            $('#active_list').append(row);

            $('#disable-' + res.movies[i].id).on('click', function() {
                $.post('/modules/club_cine/disable_movie', { id: res.movies[i].id });
                load_movies();
            });

            alter_actions(res, i);
        }
    });
    $.get('/modules/club_cine/get_inactive_movies', function(res) {
        for (let i in res.movies) {
            let day = res.movies[i].date.split("T")[0].split("-")[2];
            let month = res.movies[i].date.split("T")[0].split("-")[1];
            let hour = res.movies[i].date.split("T")[1].split(":")[0];
            let row = '<div class="form-group container hline">';
            row += '<div class="row">'
            row += '<div class="col-md-4">' + res.movies[i].titre + ' (' + day + '/' + month + ' ' + hour + 'h' + ') </div>';
            row += '<div class="col-md-4 col-md-offset-4"><button class="btn btn-primary pull-center btn-multi" id="enable-' + res.movies[i].id + '">Activer</button>';
            row += '<button class="btn btn-primary pull-center btn-multi" id="modify-' + res.movies[i].id + '">Modifier</button>';
            row += '<button class="btn btn-primary pull-center btn-multi" id="suppress-' + res.movies[i].id + '">Supprimer</button></div>';
            row += '</div>';
            $('#inactive_list').append(row);

            $('#enable-' + res.movies[i].id).on('click', function() {
                $.post('/modules/club_cine/enable_movie', { id: res.movies[i].id });
                load_movies();
            });

            alter_actions(res, i);
        }
    });
}

var alter_actions = function(res, i) {
    $('#modify-' + res.movies[i].id).on('click', function() {
        $.post('/modules/club_cine/get_movie', { id: res.movies[i].id }, function(movie) {
            $('#m_head').html('<i class="fa fa-bookmark"></i>Modifier ' + movie.titre);
            $('#m_image_disp').html(movie.image);
            $('#m_titre').attr('value', movie.titre);
            $('#m_infos').attr('value', movie.infos);
            $('#m_date').attr('value', movie.date.split('T')[0]);
            $('#m_heure').attr('value', movie.date.split('T')[1].substring(0, 5));
            $('#m_synop').html(movie.synopsis);

            $('#modify').show();
            $('#m_image_select_block').hide();

            $('#m_save').off();
            $('#m_save').on('click', function() {
                //
            });

            $('#m_image_btn').off();
            $('#m_image_btn').on('click', function() {
                $('#m_image_select_block').show();
                $('#m_image_disp_block').hide();
            });

            $('#m_cancel').off();
            $('#m_cancel').on('click', function() {
                $('#modify').hide();
            });
        });
    });

    $('#suppress-' + res.movies[i].id).on('click', function() {
        $.post('/modules/club_cine/suppress_movie', { id: res.movies[i].id });
        load_movies();
    });
};

$(document).ready(load_movies);

$(document).ready(function() {
    $('#new, #modify').hide();
    $('#new_btn').on('click', function() {
        $('#new').toggle();
    });
    // $('#create').on('click', function() {
    //     $.post('/modules/club_cine/create_movie', {
    //         image: $('#image').attr('value'),
    //         titre: $('#titre').attr('value'),
    //         infos: $('#infos').attr('value'),
    //         date: $('#date').attr('value') + ' ' + $('heure').attr('value'),
    //         synopsis: $('#synop').attr('value')
    //     });
    //     $('#new').hide();
    // });
    $('#cancel').on('click', function() {
        $('#new').toggle();
    });
});