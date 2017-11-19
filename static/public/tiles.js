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
function handle_tiles(box, tiles){
    tiles.sort(function(a,b){
        return a.index - b.index;
    })

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
            box.append(tile_html);
        });
    }
}

function insert_tiles(tiles_box){
    $.getJSON('/tiles', function(data){
        var tiles = data.list;
        handle_tiles(tiles_box, tiles);
        tiles_box.sortable({
            handle : '.panel-heading',  // Partie saisisable
            update : function(){
                $('.panel', panelList).each(function(index, elem){
                    var listItem = $(elem),
                        newIndex = listItem.index();
                });
                // $.post('/user/save_tiles')
            },
            stop : function(event, ui) {
                var id = ui.item.attr("id");
                var index_new = ui.item.index();
                var index_old = 0; // Pour récupérer l'ancien indice de l'élément déplacé
                for(i = 0; i < tiles.length; i++){
                    if (tiles[i].tile == tile){
                        index_old = tuiles[i].index;
                        i = tiles.length; // break
                    }
                }

                //On met à jour les indices

                if(index_old < index_new){
                    for(i = 0; i < tiles.length; i++){
                        var index_old_el = tuiles[i].index;
                        if(index_old < index_old_el <= index_new){
                            tiles[i].index -= 1;
                        }
                    }
                }

                if(index_old > index_new){
                    for(i = 0; i < tiles.length; i++){
                        var index_old_el = tiles[i].index;
                        if(index_new <= index_old_el < index_old){
                            tiles[i].index += 1;
                        }
                    }
                }

                tiles[index_old].index = index_new; // On met à jour l'index
                console.log(tiles);
            }
        });
    });
}

$(document).ready(function() {
    var panelList = $('#draggablePanelList');
    insert_tiles(panelList);
});

