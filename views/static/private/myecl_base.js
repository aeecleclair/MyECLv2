const body_404 = '\
<div class="row">\
    <div id="connexion" class="col-xs-4 col-xs-offset-4">\
        <div>\
            <center>\
            Erreur 404</br>La page demandé n\'existe pas.\
            </center>\
        </div>\
    </div>\
</div>';

$("#logout").on('click', function(){
    var loc = window.location.href.split('/');
    var dest = 'logout.html';
    console.log(dest);
    window.location.href = loc[0] + '/' + dest;
})


function handle_menu(menu, data){
    for(let i in data){
        let item = data[i];
        if(item.body){
            // Liens internes
            let html = '<li><a href=';
            html += '"javascript:insert_body(\'' + item.module + '\', \'' + item.body + '\')">';
            if(item.icon){
                html += item.icon;
            }
            html += '<span class="text">' + item.name + '</span></a></li>';
            menu.append(html);
        } else if(item.link){
            // Liens externes
            let html = '<li><a href=';
            html += '\'' + item.link + '\'>';
            if(item.icon){
                html += item.icon;
            }
            html += '<span class="text">' + item.name + '</span></a></li>';
            menu.append(html);
        } else if(item.sub){
            // Sous menus
            let submenu = $('<ul class="sub-menu open"></ul>');
            handle_menu(submenu, item.sub);
            let ul = $('<li><a class="js-sub-menu-toggle"><span class="text">' + item.name + '</span><i class="toggle-icon fa fa-angle-down"></i></a></li>');
            ul.append(submenu);
            menu.append(ul);
        }
    }
}

function handle_header(header, data){
    for(let i in data){
        let item = data[i];
        if(item.body){
            // Liens internes
            let html = '<div class="icone"><a href=';
            html += '"javascript:insert_body(\'' + item.module + '\', \'' + item.body + '\')">';
            html += item.icon;
            if(item.name){
                html += item.name;
            }
            html += '</a></div>';
            header.append(html);
        } else if(item.link){
            let html = '<div class="icone"><a href=';
            html += '"' + item.link + '">';
            html += item.icon;
            if(item.name){
                html += item.name;
            }
            html += '</a></div>';
            header.append(html);
        } 
    }
}

function insert_menu(){
    var menu = $('.main-menu');
    $.getJSON('/menu', function(data){
        handle_menu(menu, data.list);        
    });
}

function insert_header(){
    var header = $('.top-bar-right');
    $.getJSON('/header', function(data){
        handle_header(header, data.list);        
    });
}

function insert_body(module_name, body_name){
    var body = $('#main-content-wrapper');
    var contact = $("#contact-content-wrapper");
    var styles = $('head');
    // supprimer les scripts et styles ajoutÃ© prÃcedement
    $('.dyn-content').remove();
    // récupérer le body demandé
    $.ajax({
        url : '/body/' + module_name + '/' + body_name,
        type : 'get',
        success : function(data){
            body.html(data);
        },
        error : function(){
            body.html(body_404);
        }
    });

    // récupérer le contact de l'asso
    $.ajax({
        url : '/contact/' + module_name,
        type : 'get',
        success : function(data){
            contentHTML = "<p>Contact asso : ";
            if(data.name){
                contentHTML += data.name;
            }
            if(data.phone){
                contentHTML += " - " + data.phone;
            }
            if(data.mail){
                contentHTML += " - " + data.mail;
            }
            contentHTML += "</p>";
            contact.html(contentHTML);
        },
        error : function(){
            contentHTML = "<p>Contact asso : Non renseigné</p>";
            contact.html(body_404);
        }
    });

    // récupérer les scripts et styles associÃs
    $.getJSON('/heads/' + module_name + '/' + body_name, function(data){
        var styles_html = '';

        for(let key in data.styles){
            let r = data.styles[key];
            styles_html += '<link class="dyn-content" href="' +
                r +
                '" rel="stylesheet" type="text/css">\n';
        }

        for(let key in data.scripts){
            var script   = document.createElement('script');
            script.type  = 'text/javascript';
            script.src   = data.scripts[key];
            script.class  = 'dyn-content';
            document.body.appendChild(script);  // On est obligé d'utiliser directement le DOM
            // pour les scripts a cause d'un comportement spéciale de jQuery avec les scripts
        }
        styles.append(styles_html);
    });
}

$(document).ready(function(){
    insert_menu();
    insert_header();
    var url = window.location.href.split('/');
    while(url.length > 0 && url[0] != 'home'){
        url.shift();
    }
    url.shift();
    if(url.length < 2){
        // Adresse mal formé
        insert_body('tiles', 'main');
    } else {
        var module = url[0];
        url.shift();
        insert_body(module, url.join('/'));
    }
});


