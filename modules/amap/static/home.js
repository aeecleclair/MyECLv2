$(document).ready(function(){
    load_select();
    $("#valid_order").hide();
    $("#amount").hide();
    $("#order").hide();
})

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
    $.get('/modules/amap/get_account', {week:$("#week_id").val()}, function(data){
        var cash = data.cash;
        $("#amount_left").html(cash.toFixed(2));
        $("#amount").show();

        var products = data.products;
        var html = "";
        html += "<table class='table'>";
        html += "<thead><tr>";
        html += "<th>Article</th>";
        html += "<th>Prix unitaire</th>";
        html += "<th>Quantité</th>";
        html += "<th>Prix total</th>";
        html += "</tr></thead>";
        for(let i in products){
            var product = products[i];
            html += "<tr>";
            html += "<td>" + product.name + "</td>";
            html += "<td>" + product.price.toFixed(2) + "</td>";
            html += "<td><input class='form-control small-input' type='text' name='product_" + product.id + "' id='product_" + product.id + "' value='" + product.quantity + "'/></td>";
            html += "<td>" + (product.quantity * product.price).toFixed(2) + "</td>";
            html += "</tr>";
        }

        html += "</table>";

        // html += "<button class='btn btn-primary' id='valid_order'>Valider la commande</button>";
        $("#list_orders").html(html);
        $("#valid_order").show();
        load_price();
    });
}

$("#valid_order").on('click', function(){
    $(this).prop('disabled', true);
    var week = $("#week_id").val();
    var products = new Object();
    $(".small-input").each(function(){
        if(parseInt($(this).val()) > 0){
            var id = $(this).attr('id').split('_')[1];
            products[id] = $(this).val();
        }
    });

    $.post('/modules/amap/update_order', {week:week, products:JSON.stringify(products)}, function(res){
        load_orders();
        $("#valid_order").prop('disabled', false);
    });
});

function load_price(){
    var products = new Object();
    $(".small-input").each(function(){
        if(parseInt($(this).val()) > 0){
            var id = $(this).attr('id').split('_')[1];
            products[id] = $(this).val();
        }
    });
    console.log(products);

    $.get('/modules/amap/compute_price', {products:JSON.stringify(products)}, function(data){
        $("#amount_order").html(data.price.toFixed(2));
        $("#order").fadeIn();
    })
}

$(document).on('change', '.small-input', function(){var products = new Object();
    load_price();
});