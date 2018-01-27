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
    var styles = $('head');
    var scripts = $('body');
    // supprimer les scripts et styles ajout√© pr√cedement
    $('.dyn-content').remove();
    // r√cup√©re le body demand√©
    $.get('/body/' + module_name + '/' + body_name, function(data){
        body.html(data);
    });
    // r√cup√rer les scripts et styles associ√s
    $.getJSON('/heads/' + module_name + '/' + body_name, function(data){
        var styles_html = '';
        var scripts_html = '';

        for(let key in data.styles){
            let r = data.styles[key];
            styles_html += '<link class="dyn-content" href="' +
                r +
                '" rel="stylesheet" type="text/css">\n';
        }

        for(let key in data.scripts){
            let r = data.scripts[key];
            scripts_html += '<script class="dyn-content" src="' +
                r + '"></script>\n';
        }
        styles.append(styles_html);
        scripts.append(scripts_html);
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
        // Adresse mal formÈ
        insert_body('tiles', 'main');
    } else {
        insert_body(url[0], url[1].split('&')[0]);
    }
});


