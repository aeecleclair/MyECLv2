/* eslint-disable no-unused-vars */
/* eslint-env jquery */
$('#save_fields').click(function(){
    // enregistre sur le serveur le nom et la description d'un groupe
    var name = $('#input_name')[0].value;
    var desc = $('#input_desc')[0].value;
    var id = $('#hidden_id')[0].value;

    $.post('/modules/admin/alter_group/' + id, {name : name, description : desc});
});
