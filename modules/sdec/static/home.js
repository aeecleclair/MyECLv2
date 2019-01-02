$("#quantity").TouchSpin({
    min: 1,
    max:1000,
    step: 1
});

$("#pages").TouchSpin({
    min: 1,
    max:1000,
    step: 1
});

function load_my_orders(){
    $.get('/modules/sdec/get_user_orders', function(res){
        if (res.list.length == 0){
            $("#my_orders").html("<p>Aucune commande active pour le moment.</p>");
        } else {
            var to_append = "<div class='panel-group' id='accordion'>";
            

            var k = 0;
            Array.prototype.forEach.call(res.list, function(order){
                k += 1;
                db_id.push(order.id);

                var text_state;
                switch(order.state){
                    case '0':
                        text_state = "Pas commencé</div><div class='col-md-6'><span class='pull-right'><i class='fa fa-trash'></i> <a href='#' class='delete' id='delete" + k.toString() + "'>Annuler</a></span>";
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

                to_append += "<div class='panel panel-default' id='order" + k.toString() + "'>";
                to_append += "<div class='panel-heading'>";
                to_append += "<h4 class='panel-title'>"
                to_append += "<a data-toggle='collapse' data-parent='#accordion' href='#accordion" + k.toString() + "' id='link" + k.toString() + "'>Commande " + k.toString() + " <i class='fa fa-angle-down pull-right'></i><i class='fa fa-angle-up pull-right'></i></a>";
                to_append += "</h4>";
                to_append += "</div>";
                if (k == 1){
                    to_append += "<div id='accordion" + k.toString() + "' class='panel-collapse collapse in'>";
                } else {
                    to_append += "<div id='accordion" + k.toString() + "' class='panel-collapse collapse'>";
                }

                to_append += "<div class='panel-body'>";
                
                to_append += "<div class='row'>";
                to_append += "<div class='col-md-6'><i class='fa fa-calendar'></i> " + text_state + "</div>";
                to_append += "</div><br>";

                if (order.file_path != null){
                    to_append += "<div class='row'>";
                    to_append += "<div class='col-md-12'><a href='/user_uploads/" + order.file_path + "'>Voir mon document</a></div>";
                    to_append += "</div><br>";
                }

                to_append += "<div class='row'>"
                to_append += "<div class='col-md-8'>"

                to_append += "<div class='row'>";
                if (order.color && order.recto_verso){
                    to_append += "<div class='col-md-6'><i class='fa fa-pencil'></i> Couleur</div><div class='col-md-6'><i class='fa fa-files-o'></i> Recto verso</div></p>";
                } else if (order.color){
                    to_append += "<div class='col-md-6'><i class='fa fa-pencil'></i> Couleur</div><div class='col-md-6'><i class='fa fa-files-o'></i> Recto seul</div></p>";
                } else if (order.recto_verso){
                    to_append += "<div class='col-md-6'><i class='fa fa-pencil'></i> Noir et blanc</div><div class='col-md-6'><i class='fa fa-files-o'></i> Recto verso</div></p>";
                } else {
                    to_append += "<div class='col-md-6'><i class='fa fa-pencil'></i> Noir et blanc</div><div class='col-md-6'><i class='fa fa-files-o'></i> Recto seul</div></p>";
                }
                to_append += "</div>";
                
                to_append += "<div class='row'>";
                to_append += "<div class='col-md-6'><i class='fa fa-list-ol'></i> " + order.quantity.toString() + " exemplaires</div>";
                to_append += "<div class='col-md-6'><i class='fa fa-file-o'></i> " + order.format + " <i class='fa fa-times'></i> " + order.pages + " pages </div>";
                to_append += "</div>";
                
                to_append += "</div>";
            
                to_append += "<div class='col-md-4' id='price_container_2'>";
                to_append += "<span class='pull-right lead' id='price_value_2'>" + order.price.toFixed(2).toString() + " <i class='fa fa-eur'></i></span>";
                to_append += "</div>";
                to_append += "</div>";

                if (order.comment != 0){
                    to_append += "<div class='row'><div class='col-md-12'><i class='fa fa-comment'></i> " + order.comment + "</div></div>";
                }

                to_append += "</div>";
                to_append += "</div>";
                to_append += "</div>";
            });

            to_append += "</div>";
            $("#my_orders").hide().html(to_append).fadeIn(500);
        }
    });
}

function compute_price(){
    var quantity = parseInt($("#quantity").val());
    var pages = parseInt($("#pages").val());
    var format = ($("#format").val() != "default") ? parseInt($("#format").val().substr(1)) : -1;
    var rv = $("#recto_verso").prop('checked');
    var color = $("#color").prop('checked');

    var black_single_price = [0.8, 0.4, 0.2, 0.1, 0.05, 0.02];
    var color_single_price = [1.6, 0.8, 0.4, 0.2, 0.1, 0.05];

    if (quantity > 0 && pages > 0 && format >= 0){
        if(rv){
            pages = Math.floor(pages / 2) + pages % 2;
        }

        var price;
        if(color){
            price = quantity * pages * color_single_price[format];
        } else {
            price = quantity * pages * black_single_price[format];
        }

        $("#price_value").html("Prix : " + price.toFixed(2).toString() + " <i class='fa fa-eur'></i>");
        $("#price").val(price.toFixed(2));
    } else {
        $("#price_value").html("Prix : 0.00 <i class='fa fa-eur'></i>");
        $("#price").val(0.00);
    }
}

var db_id = new Array();
$(document).ready(function(){
    load_my_orders();
});

$(document).on('click', '.delete', function(){
    var id = this.id;
    var k = parseInt(id.substr(6));
    order_id = db_id[k-1];

    $.post('/modules/sdec/delete_order', {order_id:order_id});

    load_my_orders();
});

$("#quantity").change(function(){
    compute_price();
});

$("#pages").change(function(){
    compute_price();
});

$("#format").change(function(){
    compute_price();
});

$("#color").change(function(){
    compute_price();
});

$("#recto_verso").change(function(){
    compute_price();
});

    