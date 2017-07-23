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
    $.get('/body/' + module_name + '/' + body_name, function(data){
        body.html(data);
    });
}

$(document).ready(function(){
    insert_menu();
    insert_header();
    insert_body('test', 'main');
});


