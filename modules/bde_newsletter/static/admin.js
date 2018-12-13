$(document).ready(function(){
    $(".summernote").summernote({});
    $("#list").hide();
    loadNews();
});

function loadNews(){
    $.get('/modules/bde_newsletter/get_all', function(result){
        var html = "";
        html += "<table class='table'>";
        html += "<tr>";
        html += "<th>Date</th>"
        html += "<th></th>";
        html += "<th></th>";
        html += "</tr>";
        
        if (!result.hasOwnProperty('newsletters')){
            html += "<tr><td>Pas encore de newsletter</td><td></td><td></td></tr>";
        } else {
            $("#list").slideUp(500);
            var newsletters = result.newsletters;
            for(let i in newsletters){
                html += "<tr>";
                var date = newsletters[i].date.split('-');
                var year = date[0];
                var month = date[1];
                var months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
                month = months[parseInt(month)-1];
                var day = date[2].split(' ')[0];
                html += "<td>Semaine du " + day + " " + month + " " + year + "</td>";
                html += "<td><button class='btn btn-primary edit' id='" + newsletters[i].id + "'>Editer</button></td>";
                html += "<td><button class='btn btn-danger delete' id='" + newsletters[i].id + "'>Supprimer</button></td>";
                html += "</tr>";
            }
        }
        html += "</table>";
        $("#list").html(html).slideDown(500);
    });
}

$(document).on('click', '.delete', function(){
    var id = $(this).attr('id');
    $.post('/modules/bde_newsletter/delete', {id:id}, function(result){
        $(".summernote").code('<p><br></p>');
        $("#current").val(-1);
        loadNews();
    });
});

$(document).on('click', '.edit', function(){
    var id = $(this).attr('id');
    $.get('/modules/bde_newsletter/get', {id:id}, function(result){
        $("#current").val(id);
        $(".summernote").code(result.content);
    });
});

$("#add").click(function(e){
    e.preventDefault();

    var id = 0;
    if(parseInt($("#current").val()) > 0){
        id = $("#current").val();
    }
    var content = $(".summernote").code();

    if(id > 0){
        $.post('/modules/bde_newsletter/update', {content:content, id:id});
        $("#current").val(-1);
    } else {
        $.post('/modules/bde_newsletter/add', {content:content}); 
    }
    $(".summernote").code('<p><br></p>');
    loadNews();
});