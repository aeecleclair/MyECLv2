$(document).ready(function(){
    load_studies();
});

function load_studies(){
    $.get("/modules/je_studies/get_all", function(result){
        html = "";

        if(result.studies.length > 0){
            for(let i in result.studies){
                html += "<div class='study align-" + (i % 2).toString() + "'>";
                html += "<span class='study-title'>" + result.studies[i].title + "</span>";
                html += "<span class='study-description'>" + result.studies[i].description + "</span>";

                html += "<hr class='study-hr'>";

                html += "<span class='study-number'>";
                if(result.studies[i].appliants_number == 0){
                    html += "Pas encore d'intéressé";
                } else if(result.studies[i].appliants_number == 1) {
                    html += "1 intéressé";
                } else {
                    html += result.studies[i].appliants_number + " intéressés";
                }
                html += "</span>";
                html += "<br>";

                if(result.studies[i].is_in){
                    html += "<span class='study-operation study-quit'>";
                    html += "<button class='btn btn-warning quit' id='" + result.studies[i].id + "'>Plus intéressé</button>"
                    html += "</span>";
                } else {
                    html += "<span class='study-operation study-join'>";
                    html += "<button class='btn btn-primary join' id='" + result.studies[i].id + "'>Intéressé</button>"
                    html += "</span>";
                }
                html += "</div>";
            }
        }

        $("#available_offers").html(html);
    });
}

$(document).on('click', '.join', function(){
    $.post('/modules/je_studies/apply', {id:$(this).attr('id')}, function(result){
        $("#available_offers").fadeOut(300);
        load_studies();
        $("#available_offers").fadeIn(300);
    });
});

$(document).on('click', '.quit', function(){
    $.post('/modules/je_studies/quit', {id:$(this).attr('id')}, function(result){
        $("#available_offers").fadeOut(300);
        load_studies();
        $("#available_offers").fadeIn(300);
    });
});