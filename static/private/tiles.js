const TILE_TEMPLATE = '\
<li class="tile-box ##SIZE_CLASS##"> <!-- SIZE -->\
    <div class="tile">\
        <div class="tile-header">\
        ##TITLE##\
            <div class="boutons-droite">\
                <a href="#"><span class="fa fa-arrows drag"></span></a>\
                <a href="#"><span class="fa fa-times"></span></a>\
            </div>\
        </div>\
        <div class="tile-body">\
            ##BODY##\
        </div>\
    </div>\
</div>\
';

function handle_tiles(box, tiles){
    for(let i in tiles){
        let tile = tiles[i];
        if(!tile.size_class){
            tile.size_class = 'col-xs-6';
        }
        $.get(tile.route, function(data){
            var tile_html = TILE_TEMPLATE
                .replace('##SIZE_CLASS##', tile.size_class)
                .replace('##TITLE##', tile.title)
                .replace('##BODY##', data);
            box.append(tile_html);
        });
    }
}

function insert_tiles(tiles_box){
    $.getJSON('/tiles', function(data){
        handle_tiles(tiles_box, data.list);
    });
}

$(document).ready(function() {
    //    console.log('Faro c le plu bo');
    var panelList = $('#draggablePanelList');
    insert_tiles(panelList);
    /*
    // Provoque une erreur :
    // sortable is not a function
    panelList.sortable({
        handle: '.drag', 
        update: function() {
            $('.tuile-box', panelList).each(function(index, elem) {
                var $listItem = $(elem),
                    newIndex = $listItem.index();

                // Persist the new indices.
            });
        }
    });
    //*/
});
