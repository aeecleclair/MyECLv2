var new_orders, pending_orders, waiting_orders, other_orders;

function load_orders(orders_list, type){
    var html = "";
    if (orders_list.length == 0){
        html += "<p>Aucune commande pour le moment.</p>"
    } else {
        html += "<table id='table_" + type + "' class='table table-sorting table-striped table-hover datatable'>"; 
            
        html += "<thead>";
        html += "<tr>";
        html += "<th>Format</th>";
        html += "<th>Quantité</th>";
        html += "<th>Nombre de pages</th>"
        html += "<th>Couleur</th>";
        html += "<th>Recto-verso</th>";
        html += "<th>Prix</th>";
        html += "</tr>";
        html += "</thead>";

        html += "<tbody>";

        k = 0
        Array.prototype.forEach.call(orders_list, function(order){
            var text_color = order.color ? "Oui" : "Non";
            var text_rv = order.recto_verso ? "Oui" : "Non";
            html += "<tr class='order' id='" + type + "_" + k.toString() + "'>"
            html += "<td>" + order.format + "</td>";
            html += "<td>" + order.quantity + "</td>";
            html += "<td>" + order.pages + "</td>";
            html += "<td>" + text_color + "</td>";
            html += "<td>" + text_rv + "</td>";
            html += "<td>" + order.price.toFixed(2).toString() + "</td>";
            html += "</tr>";

            k += 1;
        });

        html += "</tbody>";
        html += "</table>";
    }

    return html;
};

function load_all_orders(out1=0, out2=0, out3=0, out4=0, in1=500, in2=500, in3=500, in4=500){
    $.get('/modules/sdec/get_all_orders', function(res){
        new_orders = res.new;
        pending_orders = res.pending;
        waiting_orders = res.waiting;
        other_orders = res.other;

        $("#new_orders").hide(out1).fadeOut(500).html(load_orders(res.new, "new", 0)).fadeIn(in1);
        $("#pending_orders").hide(out2).fadeOut(500).html(load_orders(res.pending, "pending")).fadeIn(in2);
        $("#waiting_orders").hide(out3).fadeOut(500).html(load_orders(res.waiting, "waiting")).fadeIn(in3);
        $("#other_orders").hide(out4).fadeOut(500).html(load_orders(res.other, "other")).fadeIn(in4);
    });
}

function load_current(type, id){
    var current;
    switch(type){
        case 'new':
            current = new_orders[id];
            break;
        case 'pending':
            current = pending_orders[id];
            break;
        case 'waiting':
            current = waiting_orders[id];
            break;
        case 'other':
            current = other_orders[id];
            break;
    }

    var html = "<div class='widget'>";
    html += "<div class='widget-header'>";
    html += "<h3><i class='fa fa-bookmark'></i>Commande de " + current.firstname + " " + current.name + "</h3>";
    html += "</div>";
    html += "<div class='widget-content'>";


    var text_state;
    switch(current.state){
        case '0':
            text_state = "Pas commencé";
            break;
        case '1':
            text_state = "En cours";
            break;
        case '2':
            text_state = "Terminé";
            break;
        default:
            text_state = "Inconnu";
            break
    }
    
    html += "<div class='row'>";
    html += "<div class='col-md-6'><i class='fa fa-calendar'></i> " + text_state + "</div>";
    html += "</div><br>";

    if (current.file_path != null){
        html += "<div class='row'>";
        html += "<div class='col-md-12'><a href='file:///" + current.file_path + "'>Voir mon document</a></div>";
        html += "</div><br>";
    }

    html += "<div class='row'>"
    html += "<div class='col-md-8'>"

    html += "<div class='row'>";
    if (current.color && current.recto_verso){
        html += "<div class='col-md-6'><i class='fa fa-pencil'></i> Couleur</div><div class='col-md-6'><i class='fa fa-files-o'></i> Recto verso</div></p>";
    } else if (current.color){
        html += "<div class='col-md-6'><i class='fa fa-pencil'></i> Couleur</div><div class='col-md-6'><i class='fa fa-files-o'></i> Recto seul</div></p>";
    } else if (current.recto_verso){
        html += "<div class='col-md-6'><i class='fa fa-pencil'></i> Noir et blanc</div><div class='col-md-6'><i class='fa fa-files-o'></i> Recto verso</div></p>";
    } else {
        html += "<div class='col-md-6'><i class='fa fa-pencil'></i> Noir et blanc</div><div class='col-md-6'><i class='fa fa-files-o'></i> Recto seul</div></p>";
    }
    html += "</div>";
    
    html += "<div class='row'>";
    html += "<div class='col-md-6'><i class='fa fa-list-ol'></i> " + current.quantity.toString() + " exemplaires</div>";
    html += "<div class='col-md-6'><i class='fa fa-file-o'></i> " + current.format + " <i class='fa fa-times'></i> " + current.pages + " pages </div>";
    html += "</div>";
    
    html += "</div>";

    html += "<div class='col-md-4' id='price_container_2'>";
    html += "<span class='pull-right lead' id='price_value_2'>" + current.price.toFixed(2).toString() + " <i class='fa fa-eur'></i></span>";
    html += "</div>";
    html += "</div>";

    if (current.comment != 0){
        html += "<div class='row'><div class='col-md-12'><i class='fa fa-comment'></i> " + current.comment + "</div></div>";
    }

    if (current.state == '0'){
        html += "<hr class='dotted-hr inner-separator'>";
        html += "<div class='row'>";
        html += "<div class='col-md-12'>Voir le fichier</div>";
        html += "</div>";

        html += "<div class='row'>";
        html += "<div class='form-group'>";
        html += "<label for='pages' class='col-md-4 control-label'>Nombre de pages</label>";
        html += "<div class='col-md-5'>";
        html += "<input type='text' class='form-control' id='pages' name='pages' value='" + current.pages.toString() + "'>";
        html += "<input type='hidden' name='update_id' id='update_id' value='" + id.toString() + "'/>";
        html += "</div>";
        html += "<div class='col-md-3'>";
        html += "<button type='button' class='btn btn-warning' id='update' name='update'>Modifier</button>";
        html += "</div>";
        html += "</div>";
        html += "</div>";
    }

    html += "<hr class='dotted-hr inner-separator'>";
    html += "<div class='row'>"
    html += "<div class='col-md-12'>Commande passée par " + current.firstname + " " + current.name + "</div>";
    html += "</div>";
    html += "<div class='row'>";
    html += "<div class='col-md-3'><i class='fa fa-user'></i> " + current.nick + "</div>";
    html += "<div class='col-md-9'><i class='fa fa-envelope-o'></i> " + current.email + "</div>";
    html += "</div>";

    html += "<hr class='dotted-hr inner-separator'>";

    switch(type){
        case 'new':
            html += "<span class='col-md-6'><button class='btn btn-primary topending' id='topending_" + type + "_" + id + "' type='button'>Marquer en cours</button></span>";
            html += "<span class='col-md-6'><button class='btn btn-danger pull-right toother' id='toother_" + type + "_" + id + "' type='button'>Déplacer dans autres</button></span>";
            break;
        case 'pending':
            html += "<span class='col-md-12'><button class='btn btn-success towaiting' id='towaiting_" + type + "_" + id + "' type='button'>Marquer comme terminée</button></span>";
            break;
        case 'waiting':
            html += "<span class='col-md-12'><button class='btn btn-danger todelete' id='todelete_" + type + "_" + id + "' type='button'>Supprimer</button></span>";
            break;
        case 'other':
            html += "<span class='col-md-6'><button class='btn btn-primary topending' id='topending_" + type + "_" + id + "' type='button'>Marquer en cours</button></span>";
            html += "<span class='col-md-6'><button class='btn btn-danger pull-right todelete' id='todelete_" + type + "_" + id + "'type='button'>Refuser la demande</button></span>";
            break
    }
    html += "<br><br>";

    html += "</div>";
    html += "</div>";

    $("#current_order").html(html);

    $("#pages").TouchSpin({
        min: 1,
        max:1000,
        step: 1
    });
}

$(document).ready(function(){
    load_all_orders();
});

$(document).on('click', '.order', function(){
    var id = this.id;
    var idsplit = id.split("_");
    type = idsplit[0];
    id = idsplit[1];

    load_current(type, id);
});

$(document).on('click', '.topending', function(){
    var id = this.id;
    var splitid = id.split("_");
    var type = splitid[1];
    id = splitid[2];

    var current = (type == 'new') ? new_orders[id] : other_orders[id];

    $.post('/modules/sdec/update_order', {order_id:current.id, state:1});

    load_all_orders(0, 0, 0, 0, (type == 'new') ? 500 : 0, 500, 0, (type != 'new') ? 500 : 0);
});

$(document).on('click', '.toother', function(){
    var id = this.id;
    var splitid = id.split("_");
    id = splitid[2];

    var current = new_orders[id];

    $.post('/modules/sdec/update_order', {order_id:current.id, state:3});

    load_all_orders(0, 0, 0, 0, 500, 0, 0, 500);
});

$(document).on('click', '.towaiting', function(){
    var id = this.id;
    var splitid = id.split("_");
    id = splitid[2];

    var current = pending_orders[id];

    $.post('/modules/sdec/update_order', {order_id:current.id, state:2});

    load_all_orders(0, 0, 0, 0, 0, 500, 500, 0);
});

$(document).on('click', '.todelete', function(){
    var id = this.id;
    var splitid = id.split("_");
    var type = splitid[1];
    id = splitid[2];

    var current = (type == 'waiting') ? waiting_orders[id] : other_orders[id];

    $.post('/modules/sdec/delete_order', {order_id:current.id});

    load_all_orders(0, 0, 0, 0, 500, 500, 500, 500);
});

function compute_price(quantity, pages, format, rv, color){
    var black_single_price = [0.8, 0.4, 0.2, 0.1, 0.05, 0.02];
    var color_single_price = [1.6, 0.8, 0.4, 0.2, 0.1, 0.05];
    if(rv){
        pages = Math.floor(pages / 2) + pages % 2;
    }

    var price;
    if(color){
        price = quantity * pages * color_single_price[format];
    } else {
        price = quantity * pages * black_single_price[format];
    }
    return price
}

$(document).on('click', '#update', function(){
    var id = $("#update_id").val()
    var pages = $("#pages").val();

    var current = new_orders[id];
    var price = compute_price(current.quantity, pages, parseInt(current.format.substr(1)), current.recto_verso, current.color);

    $.post('/modules/sdec/update_order', {order_id:current.id, pages:pages, price:price});

    load_all_orders(0, 0, 0, 0, 500, 0, 0, 500);
});