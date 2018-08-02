/* eslint-env jquery, browser */
$('#save_fields').click(function(){
    // enregistre sur le serveur le nom et la description d'un groupe
    const name = $('#input_name')[0].value,
        desc = $('#input_desc')[0].value,
        id = $('#hidden_id')[0].value,
        token = $('#hidden_token')[0].value;
    
    $.post('/modules/admin/alter_group/' + id, {name : name, description : desc, '__token' : token});
});

$('#delete_group').click(function(){
    // supprime un groupe sur le serveur
    const conf = confirm('Attention vous allez supprimer un groupe !');
    if(!conf){
        return;
    }
    const id = $('#hidden_id')[0].value,
        token = $('#hidden_token')[0].value;
    $.post('/modules/admin/delete_group/' + id, {'__token' : token});
});

$('.remove_member').click(function(){
    // retire un utilisateur de la liste des membres
    const id = $('#hidden_id')[0].value,
        user_id = this.id.split('_')[1],
        token = $('#hidden_token')[0].value;
    $.post('/modules/admin/remove_member/' + id, {'__token' : token, user : user_id});
    this.parentElement.remove();
});

$("#search").change(function(){
    $.get('/modules/admin/search_user', {name : $("#search").val()}, function(res){
        var html = "";
        html += "<table class='table'>";
        html += "<thead><tr>";
        html += "<th>Nom</th>";
        html += "<th>Surnom</th>";
        html += "<th></th>";
        html += "</tr></thead>";
        html += "<tbody>";
        for(let i in res){
            var user = res[i];
            html += "<tr>";
            html += "<td>" + user.name + " " + user.firstname + "</td>";
            html += "<td>" + user.nick + "</td>";
            html += "<td><a class='add_member btn btn-custom-secondary' id='" + user.id + "' class='btn btn-custom-secondary'>Ajouter</a></td>";
            html += "</tr>";
        }
        html += "</tbody>";
        html += "</table>";
        $("#results").html(html);
    })
});

$(document).on('click', '.add_member', function(){
    var member = new Array();
    var user_id = $(this).attr('id'), position = $("#position").val(), term = $("#term").val();
    member.push({id:user_id, position:position, term:term});

    const id = $('#hidden_id')[0].value, token = $('#hidden_token')[0].value;
    $.post('/modules/admin/add_members/' + id, {'__token' : token, members : JSON.stringify(member)});
})