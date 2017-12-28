/* eslint-env jquery, browser */
const TILE_TEMPLATE = '\
<div class="panel-box panel-box-##SIZE## col-xs-##SIZE##" id="##ID##">\
    <div class="panel panel-default">\
        <div class="panel-heading">\
            ##TITLE##\
            <div class="boutons-droite">\
                <a href="#" onclick="suppr(\'##ID##\')">\
                    <span class="fa fa-times "></span>\
                </a>\
            </div>\
        </div>\
        <div class="panel-body">\
            ##BODY##\
        </div>\
    </div>\
</div>\
';

/* eslint-disable no-unused-vars */
function suppr(id){

    $('#' + id).remove();

    var tiles = window.tiles_data;

    for(let i = tiles.length - 1; i >= 0; i--){
        if(tiles[i].tile == id){
            tiles.splice(i, 1);
            break;
        }
    }

    var indexList = {};
    for(let i = 0; i < tiles.length; i++){
        indexList[tiles[i].tile] = tiles[i].sortable_index;
    }
    $.ajax('/modules/tiles/save', {
        data : JSON.stringify(indexList),
        contentType : 'application/json',
        type : 'POST',
    });
}
/* eslint-enable no-unused-vars */

function is_empty(obj){
    // renvoie rtue si obj n'as aucune propriétés
    for(let prop in obj){
        return false;
    }
    return true;
}

function config_tiles_box(tiles_box){

    var tiles = window.tiles_data;

    tiles_box.sortable({
        'handle' : '.panel-heading', // Partie à saisir pour drag
        'update' : function(event, ui) {
            var tile = ui.item.attr('id');
            var index_new = ui.item.index();
            var index_old = 0; // Pour récupérer l'ancien indice de l'élément déplacé
            var I = 0; // Pour récupérer la position dans la liste de l'élément déplacé
            

            for(let i in tiles){
                if(tiles[i].tile == tile){
                    I = i;
                    index_old = tiles[i].sortable_index;
                    break;
                }
            }
            
            if(index_old < index_new){
                for(let i in tiles){
                    if(i != I && index_old < tiles[i].sortable_index && tiles[i].sortable_index <= index_new){
                        tiles[i].sortable_index -= 1;
                    }
                }
            } else if(index_old > index_new){
                for(let i in tiles){
                    if(i != I && index_new <= tiles[i].sortable_index && tiles[i].sortable_index < index_old){
                        tiles[i].sortable_index += 1;
                    }
                }
            }
            tiles[I].sortable_index = index_new;
            
            var indexList = {};
            for(let i = 0; i < tiles.length; i++){
                indexList[tiles[i].tile] = tiles[i].sortable_index;
            }
            $.ajax('/modules/tiles/save', {
                data : JSON.stringify(indexList),
                contentType : 'application/json',
                type : 'POST',
            });
        }
    });
}

function handle_tiles(box){

    var tiles = window.tiles_data;
    
    $.getJSON('/modules/tiles/get', function(data){
        var default_conf = is_empty(data);
        var promises = new Array();
        for(let i = tiles.length - 1; i >= 0; i--){ // préparation de la liste des tiles
            // le décompte se fait depuis la fin pour ne pas être perturbé par d'éventuels retraits d'éléments

            if(default_conf){ // si l'utilisateur n'a pas de config enregistré
                tiles[i].sortable_index = i; // on utilise l'indice par défaut
            } else { // sinon
                if(!data.hasOwnProperty(tiles[i].tile)){ // si la tuile n'apparait pas dans les préférences utilisateur
                    tiles.splice(i, 1); // on retire l'élément de la liste
                    continue;
                } else { // sinon on lui donne l'indice utilisateur
                    tiles[i].sortable_index = parseInt(data[tiles[i].tile]);
                }
            }

            // parametres par defaut
            if(!tiles[i].size){ 
                tiles[i].size = 4;
            }
            if(!tiles[i].title){
                tiles[i].title = '';
            }
            
        }

        tiles.sort(function(a,b){ // On trie en fonction de l'indice
            return a.sortable_index - b.sortable_index;
        }); 

        for(let i = 0; i < tiles.length; i++){
            // on recupère de façon asynchrone les contenu des tiles
            promises.push(new Promise(function(resolve, reject){
                $.get(tiles[i].route).done(function(data){
                    var tile_html = TILE_TEMPLATE
                        .replace(/##SIZE##/g, tiles[i].size)
                        .replace(/##ID##/g, tiles[i].tile)
                        .replace(/##TITLE##/g, tiles[i].title)
                        .replace(/##BODY##/g, data);
                    resolve(tile_html);
                }).fail(function(err){
                    reject(err);
                });
            }));
        }
        // quand tout les appel asynchrones sont terminé on ajoute les contenu a la page dans l'ordre
        Promise.all(promises).then(function(html){
            for(let i = 0; i < html.length; i++){
                box.append(html[i]);
            }
        }, function(err){
            console.log('error', err);
        });
        config_tiles_box(box);
    });
}



$(document).ready(function() {
    var panelList = $('#draggablePanelList');
    $.getJSON('/tiles', function(data){
        window.tiles_data = data.list;
        handle_tiles(panelList);
    });

});
