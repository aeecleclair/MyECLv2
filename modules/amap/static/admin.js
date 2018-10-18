var products_names = new Object();
$(document).ready(function(){
    load_weeks();
    load_products();
    load_select();
    
    $.get("/modules/amap/get_products", function(data){
        for(let i in data){
            products_names[data[i].id] = {name:data[i].name, price:data[i].price, quantity:0};
        }
    });
});

function load_weeks(){
    $.get('/modules/amap/get_weeks', function(res){
        var html = "";
        html += "<table class='table'>";
        html += "<thead><tr>";
        html += "<th>Début</th>";
        html += "<th>Fin</th>";
        html += "<th></th>";
        html += "</tr></thead>";

        for(let i in res){
            html += "<tr>";
            var start = res[i].start.replace('.', '/').replace('.', '/');
            var end = res[i].end.replace('.', '/').replace('.', '/');

            html += "<td>" + start + "</td>";
            html += "<td>" + end + "</td>";
            html += "<td><button class='btn btn-danger remove_week' type='button' id='" + res[i].id + "'>Supprimer</button></td>";
            html += "</tr>";
        }
        html += "</table>";
        $("#list_weeks").html(html);
    });
}

$(document).on('click', '.remove_week', function(){
    var id = $(this).attr('id');
    $.post('/modules/amap/toggle_week', {id:id}, function(res){
        load_weeks();
    })
});

function load_products(){
    $.get('/modules/amap/get_products', function(res){
        var html = "";
        html += "<table class='table'>";
        html += "<thead><tr>";
        html += "<th>Nom</th>";
        html += "<th>Prix</th>";
        html += "<th></th>";
        html += "</tr></thead>";

        for(let i in res){
            html += "<tr>";

            html += "<td>" + res[i].name + "</td>";
            html += "<td>" + res[i].price + "</td>";
            html += "<td><button class='btn btn-danger remove_product' type='button' id='" + res[i].id + "'>Supprimer</button></td>";
            html += "</tr>";
        }
        html += "</table>";
        $("#list_products").html(html);
    });
}

$(document).on('click', ".remove_product", function(){
    var id = $(this).attr('id');
    $.post('/modules/amap/remove_product', {id:id}, function(){
        load_products();
    });
});

$("#search").change(function(){
    update_search();
});

function update_search(){
    $.get('/modules/amap/search_user', {name:$("#search").val()}, function(res){
        var html = "";
        html += "<table class='table'>";
        html += "<thead><tr>";
        html += "<th>Nom</th>";
        html += "<th>Surnom</th>";
        html += "<th>Solde</th>";
        html += "<th></th>";
        html += "</tr></thead>";
        html += "<tbody>";

        var promises = new Array();

        for(let i in res){
            promises.push(new Promise(function(resolve){
                var user = res[i];
                $.get('/modules/amap/get_cash', {id:user.id}, function(data){   
                    html += "<tr>";
                    html += "<td>" + user.name + " " + user.firstname + "</td>";
                    html += "<td>" + user.nick + "</td>";
                    html += "<td>" + data.cash + "</td>";
                    html += "<td><a class='update_cash btn btn-custom-secondary' id='" + user.id + "' class='btn btn-custom-secondary'>Mettre à jour</a></td>";
                    html += "</tr>";
                    resolve();
                });
            }));
        }

        Promise.all(promises).then(function(){
            html += "</tbody>";
            html += "</table>";
            $("#found_members").html(html);
        });
    });
}

$(document).on('click', '.update_cash', function(){
    $.post('/modules/amap/update_cash', {id:$(this).attr('id'), amount:$("#amount").val()}, function(){
        update_search();
    });
});

function load_select(){
    $.get('/modules/amap/get_weeks', function(data){
        var html = "";
        html += "<select name='week_id' id='week_id'>";
        html += "<option value='0' selected>Choisir une semaine</option>";
        for(let i in data){
            var date = data[i];
            html += "<option value='" + date.id + "'>" + date.start + "</option>";
        }
        html += "</select>";
        $("#select_week").html(html);
    });
}

$(document).on('change', '#week_id', function(){
    load_orders();
});

function load_orders(){

    $.get('/modules/amap/get_orders', {id:$("#week_id").val()}, function(data){
        var total = new Object();
        // DETAIL
        var html = "";
        html += "<table class='table'>";
        html += "<thead><tr>";
        html += "<th>Nom</th>";
        html += "<th>Commande</th>";
        html += "<th>Prix</th>";
        html += "</tr></thead>";
        html += "<tbody>";
        if(data.length){
            for(let i in data){
                html += "<tr>";
                html += "<td>" + data[i].name + " " + data[i].firstname + "</td>";
                html += "<td><ul>";
                for(let j in data[i].products){
                    html += "<li>" + products_names[j].name + " x " + data[i].products[j] + "</li>";

                    if(Object.prototype.hasOwnProperty.call(total, j)){
                        total[j].quantity += parseInt(data[i].products[j]);
                    } else {
                        total[j] = {name:products_names[j].name, quantity:parseInt(data[i].products[j])}
                    }
                }
                html += "</ul></td>";
                html += "<td>" + data[i].price + "</td>";
                html += "</tr>";
            }
            html += "</tbody>";
            html += "</table>";
            $("#list_orders").html(html);

            // RESUME
            var html = "";
            html += "<table class='table'>";
            html += "<thead><tr>";
            html += "<th>Article</th>";
            html += "<th>Quantité</th>";
            html += "</tr></thead>";
            for(let i in total){
                if (total[i].quantity > 0){
                    html += "<tr>";
                    html += "<td>" + total[i].name + "</td>";
                    html += "<td>" + total[i].quantity + "</td>";
                    html +="</tr>";
                }
            }
            html += "</tbody>";
            html += "</table>";
            $("#summary").html(html);
            
        } else {
            html = "Pas encore de commande pour cette semaine";
            $("#list_orders").html(html);
            $("#summary").html(html);
        }
    });

}