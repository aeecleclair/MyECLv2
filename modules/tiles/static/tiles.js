const TILE_TEMPLATE = '\
<div class="panel-box panel-box-##SIZE## col-xs-##SIZE##" id="##ID##">\
    <div class="panel panel-default">\
        <div class="panel-heading">\
            ##TITLE##\
            <div class="boutons-droite">\
                <a href="#" onclick="suppr()">\
                    <span class="fa fa-times"></span>\
                </a>\
            </div>\
        </div>\
        <div class="panel-body">\
            ##BODY##\
        </div>\
    </div>\
</div>\
';


function suppr(e){
    console.log(e);
}

function handle_tiles(box, tiles){
    tiles.sort(function(a,b){ // On trie en fonction de l'index
        return a.index - b.index
    }); 
     
    // TODO Faire un meilleur système pour initiliser les indices
    // $.getJSON('/user/get_tiles');
    for(let i in tiles){
        let tile = tiles[i];
        if(!tile.size){
            tile.size = '4';
        }
        if(!tile.title){
            tile.title = '';
        }

        tile.index = i;

        $.get(tile.route, function(data){
            var tile_html = TILE_TEMPLATE
                .replace(/##SIZE##/g, tile.size)
                .replace(/##ID##/g, tile.tile)
                .replace(/##TITLE##/g, tile.title)
                .replace(/##BODY##/g, data);
            panelList.append(tile_html);
        });
    }
}

function insert_tiles(tiles_box, tiles){

    tiles_box.sortable({
        handle: '.panel-heading', // Partie à saisir pour drag
        update: function() {
            $('.panel', tiles_box).each(function(index, elem) {
                var listItem = $(elem),
                    newIndex = listItem.index();
                // TODO
                // $.post('/user/save_tiles');

            });
        },
        stop: function(event, ui) {
            var tile = ui.item.attr('id');
            var index_new = ui.item.index();
            var index_old = 0; // Pour récupérer l'ancien indice de l'élément déplacé
            for(i = 0; i < tiles.length; i++){
                if(tiles[i].tile == tile){
                    index_old = tiles[i].index;
                    i = tiles.length; // break
                }
            }

            //On met à jour les indices

            if(index_old < index_new){
                for(i = 0; i < tiles.length; i++){
                    var index_old_el = tiles[i].index;
                    if(index_old < index_old_el <= index_new){
                        tiles[i].index -= 1;
                    }
                }
            }

            if(index_new < index_old){
                for(i = 0; i < tiles.length; i++){
                    var index_old_el = tiles[i].index;
                    if(index_new <= index_old_el < index_old){
                        tiles[i].index += 1;
                    }
                }
            }

            tiles[index_old].index = index_new; // On met à jour l'index
        }
    });
}

$(document).ready(function() {
    var panelList = $('#draggablePanelList');
    $.getJSON('/tiles', function(data){
        var tiles = data.list;
        // TODO traitement sur tiles
        // Les deux fonctions agissent directement sur les objets
        // donc pas besoin de valeures de retour
        handle_tiles(panelList, tiles);
        insert_tiles(panelList, tiles);
    });
});
