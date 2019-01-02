$(document).ready(function(){

    $('.summernote').summernote({
        height: 150,
        toolbar: [
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']]
        ]
    });

    $("#message").hide();

    load_studies();
});

$("#add_offer_button").click(function(){
    var title = $("#offer_title").val();
    var description = $("#offer_description").code();
    var json = {"ids":[]};
    $.post("/modules/je_studies/add", {title:title, description: description, appliants:JSON.stringify(json)});
    $("#offer_title").val("");
    $("#offer_description").code("");
    $("#message").html("L'étude a bien été ajoutée").fadeIn(500);

    $("#current_offers").fadeOut(300);
    load_studies();
    $("#current_offers").fadeIn(300);
});

function load_studies(){
    $.get('/modules/je_studies/get_all_admin', function(result){
        var html = "";
        html += "<table class='table'>";
        html += "<tr>";
        html += "<th>Titre</th>";
        html += "<th>Description</th>";
        html += "<th>Intéressés</th>";
        html += "<th>Opération</th>";
        html += "</tr>";
        
        for(let i in result.studies){
            var id = result.studies[i].id;
            var title = result.studies[i].title;
            var description = result.studies[i].description;
            var students = result.studies[i].students;
            html += "<tr>";
            html += "<td width='10%'>" + title + "</td>";
            html += "<td width='40%'>" + description + "</td>";
            
            html += "<td>";
            if(students.length > 0){
                for(let j in students){
                    html += students[j].firstname + " " + students[j].name;
                    html += " - " + students[j].nick;
                    html += "<br>";
                }
            } else {
                html += "Pas encore d'intéressé";
            }
            html += "</td>";

            html += "<td><button class='btn btn-danger delete_offer' id='" + id + "' type='button'>Retirer</button></td>";
            html += "</tr>";
        }
        html += "</table>";
        $("#current_offers").html(html);
    });
}

$(document).on('click', '.delete_offer', function(){
    $.post("/modules/je_studies/delete", {id:$(this).attr('id')}, function(){
        $("#current_offers").fadeOut(300);
        load_studies();
        $("#current_offers").fadeIn(300);
    });
})