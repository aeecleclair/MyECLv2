$(document).ready(function(){
    var html = "";
    var months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

    $.get('/modules/bde_newsletter/get_all', function(result){
        html += "<div class='panel-group' id='accordion'>";

        if(result.hasOwnProperty("newsletters")){
            for(let i in result.newsletters){
                html += "<div class='panel panel-default' id='" + result.newsletters[i].id + "'>";
                html += "<div class='panel-heading'>";
                html += "<h4 class='panel-title'>";
                var date = result.newsletters[i].date.split('-');
                var year = date[0];
                var month = date[1];
                month = months[parseInt(month)-1];
                var day = date[2].split(' ')[0];

                html += "<a data-toggle='collapse' data-parent='#accordion' href='#accordion" + result.newsletters[i].id + "' id='link" + result.newsletters[i].id + "'>Newsletter du " + day + " " + month + " " + year + " <i class='fa fa-angle-down pull-right'></i><i class='fa fa-angle-up pull-right'></i></a>"
                html += "</h4>";
                html += "</div>";
                html += "<div id='accordion" + result.newsletters[i].id + "' class='panel-collapse collapse"
                if(i == 0){
                    html += " in";
                }
                html += "'>";
                html += "<div class='panel-body'>";
                html += "<div class='row'>";
                html += "<div class='col-md-10 col-md-offset-1'>";
                html += result.newsletters[i].content;
                html += "</div>";
                html += "</div>";
                html += "</div>"
                html += "</div>";
            }
        }

        html += "</div>";
        console.log(html);
        $("#list").html(html);
    });

    
});