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

function is_empty(obj){
    // renvoie rtue si obj n'as aucune propriétés
    for(let prop in obj){
        return false;
    }
    return true;
}

function insert_tiles(tiles_box, tiles){

    tiles_box.sortable({
        'handle' : '.panel-heading', // Partie à saisir pour drag
        'update' : function() {
            $('.panel', tiles_box).each(function(index, elem) {
                var listItem = $(elem),
                    newIndex = listItem.index();
            });
        },
        'stop' : function(event, ui) {
            var tile = ui.item.attr('id');
            var index_new = ui.item.index();
            var index_old = 0; // Pour récupérer l'ancien indice de l'élément déplacé
            var I = 0; // Pour récupérer la position dans la liste de l'élément déplacé
            
            for(let i in tiles){
                if(tiles[i].tile = tile){
                    I = i;
                    index_old = tiles[i].index;
                    break;
                }
            }
            
            if(index_old < index_new){
                for(let i in tiles){
                    if(index_old < tiles[i].index <= index_new){
                        tiles[i].index -= 1;
                    }
                }
            } else if(index_old != index_new){
                for(let i in tiles){
                    if(index_new <= tiles[i].index < index_old){
                        tiles[i].index += 1;
                    }
                }
            }
            tiles[I].index = index_new;
            
            indexList = {};
            for(i = 0; i < tiles.length; i++){
                indexList[tiles[i].tile] = tiles[i].index;
            }
            $.ajax('/modules/tiles/save', {
                data : JSON.stringify(indexList),
                contentType : 'application/json',
                type : 'POST',
            });
        }
    });
}

function handle_tiles(box, tiles){
    tiles.sort(function(a,b){ // On trie en fonction de l'index
        return a.index - b.index
    }); 
    
    $.getJSON('/modules/tiles/get', function(data){
        var default_conf = is_empty(data);
        for(let i in tiles){
            let tile = tiles[i];
            if(!tile.size){
                tile.size = '4';
            }
            if(!tile.title){
                tile.title = '';
            }
            
            if(default_conf){
                tile.index = parseInt(i);
            } else {
                if(!data.hasOwnProperty(tile.tile)){
                    tiles.pop(i);
                    continue;
                } else {
                    tile.index = parseInt(data[tile.tile]);
                }
            }

            $.get(tile.route, function(data){
                var tile_html = TILE_TEMPLATE
                    .replace(/##SIZE##/g, tile.size)
                    .replace(/##ID##/g, tile.tile)
                    .replace(/##TITLE##/g, tile.title)
                    .replace(/##BODY##/g, data);
                box.append(tile_html);
            });
        }
        insert_tiles(box, tiles);
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
    });
});
