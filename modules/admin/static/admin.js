$("#add_group").click(function(){
    var name = $("#name").val(), 
    description = $("#description").val(),
    token = $("#hidden_token").val();
    $.post('/modules/admin/create_group', {name : name, description : description, '__token' : token});
})