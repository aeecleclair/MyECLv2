var tuiles = [
    {"id" : "calendrier", "html" : '<div class="panel-box panel-box-12 col-xs-12" id="calendrier"><div class="panel panel-default"><div class="panel-heading">Calendrier associatif<div class="boutons-droite"><a href="#" onclick="suppr()"><span class="fa fa-times"></span></a></div></div><div class="panel-body"></div></div></div>', "index" : 2},
    {"id" : "photo", "html" : '<div class="panel-box panel-box-4 col-xs-4" id="photo"><div class="panel panel-default"><div class="panel-heading">Club photo<div class="boutons-droite"><a href="#"><span class="fa fa-times"></span></a></div></div><div class="panel-body"></div></div></div>', "index" : 0},
    {"id" : "chatons", "html" : '<div class="panel-box panel-box-4 col-xs-4" id="chatons"><div class="panel panel-default"><div class="panel-heading">Club chatons<div class="boutons-droite"><a href="#"><span class="fa fa-times"></span></a></div></div><div class="panel-body"></div></div></div>', "index" : 3},
    {"id" : "eclair", "html" : '<div class="panel-box panel-box-4 col-xs-4" id="eclair"><div class="panel panel-default"><div class="panel-heading">Eclair<div class="boutons-droite"><a href="#"><span class="fa fa-times"></span></a></div></div><div class="panel-body"></div></div></div>', "index" : 4},
    {"id" : "bled", "html" : '<div class="panel-box panel-box-8 col-xs-8" id="bled"><div class="panel panel-default"><div class="panel-heading">B.L.E.D<div class="boutons-droite"><a href="#"><span class="fa fa-times"></span></a></div></div><div class="panel-body"></div></div></div>', "index" : 1},
    {"id" : "piscine", "html" : '<div class="panel-box panel-box-4 col-xs-4" id="piscine"><div class="panel panel-default"><div class="panel-heading">Club piscine<div class="boutons-droite"><a href="#"><span class="fa fa-times"></span></a></div></div><div class="panel-body"></div></div></div>', "index" : 5},
    ];

var panelList = $('#draggablePanelList');

function init(){

    tuiles.sort(function(a,b){ // On trie en fonction de l'index
        return a.index-b.index
    })

    var html = "";

    for (i=0;i<tuiles.length;i++){
        html += tuiles[i].html;
    }

    panelList.html(html);
}

function suppr(e){
    console.log(e);
}

$(document).ready(function() {

    init();

    jQuery(function($) {

        panelList.sortable({
            handle: '.panel-heading', // Partie à saisir pour drag
            update: function() {
                $('.panel', panelList).each(function(index, elem) {
                    var $listItem = $(elem),
                        newIndex = $listItem.index();

                    // Persist the new indices.
                });
            },
            stop: function(event, ui) {
                var id = ui.item.attr("id");
                var index_new = ui.item.index();
                var index_old = 0; // Pour récupérer l'ancien indice de l'élément déplacé
                for (i=0;i<tuiles.length;i++){
                    if (tuiles[i].id == id){
                        index_old = tuiles[i].index;
                    }
                }

                //On met à jour les indices

                if (index_old<index_new){
                    for (i=0;i<tuiles.length;i++){
                        var index_old_el = tuiles[i].index;
                        if (index_old<index_old_el && index_old_el<=index_new){
                            tuiles[i].index -= 1;
                        }
                    }
                }

                if (index_new<index_old){
                    for (i=0;i<tuiles.length;i++){
                        var index_old_el = tuiles[i].index;
                        if (index_new<=index_old_el && index_old_el<index_old){
                            tuiles[i].index += 1;
                        }
                    }
                }

                tuiles[index_old].index = index_new; // On met à jour l'index
            }
        });
    });
});