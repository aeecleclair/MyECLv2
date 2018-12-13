function load_teams(){
    $.get("/modules/wei/get_all_teams", function(res){
        var teams = res.teams;
        html = "<table class='table'>";
        html += "<thead>";
        html += "<tr>";
        html += "<th>Numéro</th>";
        html += "<th>Nom</th>";
        html += "<th>Nombre de membres</th>";
        html += "<th>Score</th>";
        html += "</tr>";
        html += "</thead>";
        html += "<tbody>";
        for(let key in teams){
            html += "<tr>";
            html += "<td>" + teams[key].number + "</td>";
            html += "<td><a class='expand' id='" + teams[key].id + "'>" + teams[key].name + "</a></td>";
            html += "<td>" + teams[key].members + "</td>";
            html += "<td>" + teams[key].score + "</td>";
            html += "</tr>";
        }
        html += "</tbody>";
        html += "</table>";
        $("#teams").html(html);
    });
}

$("#add_member").click(function(e){
    e.preventDefault();
    var i_login = $("#login").val();
    var i_team = $("#team").val();
    $.post("/modules/wei/add_member", {login:i_login, team:i_team}, function(res){
        var message = res.message;
        $("#message").html(message);
    })
});

function load_current(id){
    $.get('/modules/wei/get_team', {id:id}, function(res){
        var team = res.team;
        var members = res.members;

        var html = "<div class='widget'>";

        html += "<div class='widget-header'>";
        html += "<h3>Equipe " + team.number + " - " + team.name + "</h3>";
        html += "</div>";

        html += "<div class='widget-content'>";
        if(team.phrase != null){
            html += "<p class='lead'><i>" + team.phrase + "</i></p>";
        }
        html += "<table class='table'>";
        html += "<thead>";
        html += "<tr>";
        html += "<th>Surnom</th>";
        html += "<th>Opération</th>";
        html += "</tr>";
        html += "</thead>";

        html += "<tbody>";
        for(let key in members){
            html += "<tr>";
            html += "<td>" + members[key].nick + "</td>";
            html += "<td><a id='" + team.id + "-" + members[key].id + "' class='deleteMember'>Supprimer</a></td>";
            html += "</tr>";
        }
        html += "</tbody>";

        html += "</table>";
        html += "</div>";

        html += "</div>";
        $("#current").html(html);
    });  
}

$(document).on('click', '.expand', function(){
    var id = $(this).attr('id');
    load_current(id);
});

$(document).on('click', '.deleteMember', function(){
    var ids = $(this).attr('id').split("-");
    var id_team = ids[0];
    var id_member = ids[1];
    $.post('/modules/wei/delete_member', {id:id_member}, function(res){
        load_current(id_team);
    });
});

$("#add_score").click(function(e){
    e.preventDefault();
    var i_event = $("#event").val();
    var i_bonus = $("#bonus").val();
    var i_team = $("#team_iddd").val();
    $.post("/modules/wei/add_score", {event:i_event, team:i_team, score:i_bonus});
});

$(document).ready(function(){
    load_teams();


    // $.get("/modules/wei/get_team_members", {id:1}, function(res){
    //     var members = res.members;
    //     for(let key in members){
    //         console.log(members[key]);
    //     }
    // });
})