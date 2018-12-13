function load_my_team(){
    $.get("/modules/wei/get_team", {id:0}, function(res){
        var html = "";

        html += "<div class='row'>";
        html += "<div class='col-md-offset-1 col-md-1'>";
        html += "<img src='/modules/wei/static/logo_wei.png' height='300px' id='logo'>";
        html += "</div>";
        html += "<div class='col-md-offset-2 col-md-4'>";
        html += "<br><br>";
        html += "<div class='row text-center lead'>Equipe " + res['team'].number + " - " + res['team'].name + "</div>";
        if(res['team'].phrase != null){
            html += "<div class='row'><div class='col-md-12 text-center' id='editable_phrase'><h4><i>" + res['team'].phrase + "</i></h4></div></div>";
        } else {
            html += "<div class='row'><div class='col-md-12 text-center'><i>Pas encore de slogan</i></div></div>";
        }
        

        if(res['members'].length <= 0){
            html += "<div class='row'><i>Inscris-toi d'abord dans une équipe !<i></div>";
        } else {
            // html += "<div class='row'>";
            // for(let key in res['members']){
            //     var current = res['members'][key];

            //     html += "<div class='col-md-3'>";
            //     html += "<div class='row'><div class=col-md-12'><b>" + current.nick + "</b></div></div>";
            //     html += "<div class='row'><div class=col-md-12'>" + current.name + " " + current.firstname + "</div></div>";
            //     html += "</div>";
            // }
            // html += "</div>";

            html += "<br><br><br><div class='row'><div class='col-md-12 text-center lead'><span id='my_rank'></span>e - Score : " + res['team'].score + "</div></div>"
        }

        html += "</div>";
        html += "</div>";

        html += "<hr>";

        html += "<div class='row'>";
        html += "<div class='col-md-6 col-md-offset-3'>";
        html += "<h3 class='text-center lead'>Détail du score</h3>";
        html += "<table class='table table-bordered'>";
        html += "<thead>";
        html += "<tr>";
        html += "<th>Raison</th>";
        html += "<th>Bonus</th>";
        html += "</tr>";
        html += "</thead>";
        html += "<tbody>";
        for(key in res['score']){
            html += "<tr>";
            html += "<td>" + res['score'][key].event + "</td>";
            html += "<td>" + res['score'][key].score + "</td>";
            html += "</tr>"
        }
        html += "</tbody>";
        html += "</table>";
        html += "</div>";
        html += "</div>";

        html += "<hr>";

        html += "<form class='form-horizontal' action='/modules/wei/update_team' method='post'>";

        html += "<div class='form-group'>";
        html += "<label class='control-label col-sm-5' for='name'>Nom de l'équipe</label>";
        html += "<div class='col-sm-7'>";
        html += "<input type='text' id='name' name='name' class='form-control'/>";
        html += "</div>";
        html += "</div>";

        html += "<div class='form-group'>";
        html += "<label class='control-label col-sm-5' for='phrase'>Slogan</label>";
        html += "<div class='col-sm-7'>";
        html += "<input type='text' id='phrase' name='phrase' class='form-control'/>";
        html += "</div>";
        html += "</div>";

        html += "<div class='form-group'>";
        html += "<div class='col-sm-4'>";
        html += "<button class='btn btn-primary btn-block' type='submit' id='add_member'>Modifier</button>";
        html += "</div>";
        html += "</div>";

        html += "<input type='hidden' name='id' value='" + res['team'].id + "'>";
        html += "<input type='hidden' name='source' value='user'>";

        html += "</form>";

        $("#my_team").html(html);

        load_all_teams(res['team'].id);
    });
    
}

function load_all_teams(my_id){
    var my_rank = 0;

    function custom_sort(a, b){
        return b.score - a.score
    }

    $.get("/modules/wei/get_all_teams", function(res){
        var teams = res.teams;
        teams.sort(custom_sort);
        
        html = "<table class='table'>";
        html += "<tr>";
        html += "<th>Rang</th>";
        html += "<th>Numéro</th>";
        html += "<th>Nom</th>";
        html += "<th>Score</th>"; // nombre de membres, phrase ?
        html += "</tr>";

        var rank = 0;
        var last_score = Infinity;

        for(let key in teams){

            if(teams[key].score < last_score){
                rank += 1;
            }

            if(teams[key].id == my_id){
                my_rank = rank;
                html += "<tr id='my_ranking'>";
            } else {
                html += "<tr>";
            }

            html += "<td>" + rank.toString() + "</td>";
            html += "<td>" + teams[key].number + "</td>";
            html += "<td>" + teams[key].name + "</td>";
            html += "<td>" + teams[key].score + "</td>";
            html += "</tr>";

        }

        html += "</table>";

        $("#all_teams").html(html);
        $("#my_rank").html(my_rank);
    })
}

$(document).ready(function(){
    load_my_team();
})