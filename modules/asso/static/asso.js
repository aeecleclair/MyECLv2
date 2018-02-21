// JavaScript Document
// var info1 = { photo : "Démo/logo.png", nom : "CMB" , membres : [{nom : "Malou" , prenom : "Eddy" , surnom : "str" , poste : "Prez d'honneur" , photo:"Démo/eddy.jpg"}, {nom:"Haguenauer" , prenom :"Timothée" , surnom :"Konje" , poste : "Admin" , photo :"Démo/kong.jpg"}, {nom :"Bargain" , prenom :"Thomas" , surnom :"Kwanthum" , poste : "Modo" , photo :"Démo/kwanthum.jpg"}, {nom:"Valero" , prenom :"Pablo" , surnom:"Toro" , poste : "Modo" , photo :"Démo/toro.jpg"}, {nom:"Morgavi", prenom:"Romain",surnom:"Nioc", poste:"Modo", photo:"Démo/nioc.jpg"}] , medias : {mail:"timothee.haguenauer@ecl16.ec-lyon.fr" , facebook :"https://www.facebook.com/groups/CMBSTRCMB/"}, galerie:"Démo/galerie",photos:["absurd.png","logo.png","POP.png"], modules : [{nom:"Module 1",lien:"jskjkdkjsd.fr"}, {nom:"Module 2",lien:"jskjkdkjsd.fr"}, {nom:"Module 3",lien:"jskjkdkjsd.fr"}] , Description : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut vel fermentum nisl. Duis congue nibh a ipsum bibendum, quis feugiat nisi congue. Fusce pellentesque non arcu a aliquet. Etiam odio ligula, facilisis et purus ut, faucibus dignissim purus. Mauris dictum ornare mi, lobortis condimentum ex aliquam vel. Etiam non porta nisl. Sed ac arcu porttitor, scelerisque erat ut, blandit augue. Sed eu sem viverra, dapibus massa non, lobortis ex. Fusce tortor velit, euismod quis mi vitae, pulvinar venenatis risus. Proin ullamcorper a lorem eu tristique. Sed finibus blandit nulla, eu malesuada enim volutpat sit amet. Duis eleifend velit quis iaculis ultricies."};

/* eslint-env jquery, browser */

function init(inf){
    for (let prop in inf){
        var tuiles;
        switch (prop){
            case 'photo' :
                $('.image-profile').html('<img id="image" src="' + inf[prop] + '" alt="Logo asso" width="100%"/>');
                break;

            case 'Description':
                $('#descripton').html(inf[prop]);
                break;

            case 'modules' :
                var modules = inf[prop];
                tuiles = '<div class="row">';
                for (let i in modules){
                    var module = modules[i];
                    tuiles += '<div class="tuile-asso col-xs-4"><p><a href="' + module['lien'] + '"><b>' + module['nom'] + '</b> </br></a></p></div>';
                    if (i%3 == 3){
                        tuiles += '</div><div class="row">';
                    }
                }
                tuiles += '</div>';
                $('#modules').html(tuiles);
                break;

            case 'membres' :
                var membres = inf[prop];
                tuiles = '<div class=\'row\'>';
                for (let i in membres){
                    var membre = membres[i];
                    tuiles += '<div class="tuile-membre col-xs-3"><img class="logo-asso" src="' + membre['photo'] + '" width="70% " alt="Photo brasseur"><p><b>' + membre['prenom'] +' ' + membre['nom']+ '</b> (' + membre['surnom'] + ')</br>' + membre['poste'] + '</p></div>';
                    if (i%4 == 4){
                        tuiles += '</div><div class="row">';
                    }
                }

                tuiles+= '</div>';
                $('#membres').html(tuiles);
                break;

            case 'galerie' :
                var chemin = inf[prop];
                break;
            
            case 'photos' :
                var galerie = inf[prop];
                var compteur = 0;
                var ajout = '';
                var ajout1 = '<div class=\'item active\'>';
                for (let i in galerie){
                    if (compteur == 0){
                        ajout += '<li data-target=\'#myCarousel\' data-slide-to=\'0\' class=\'active\'></li>';
                        ajout1 += '<img src=' + chemin.toString() + '/' + galerie[i].toString() + '></div>';
                    }
                    else{
                        ajout += '<li data-target=\'#myCarousel\' data-slide-to=\'' + compteur.toString() + '\'></li>';
                        ajout1 += '<div class=\'item\'><img src=' + chemin.toString() + '/' + galerie[i].toString() + '></div>';
                    }
                    compteur += 1;
                }
                $('#carousel-indicators').html(ajout);
                $('#carousel-inner').html(ajout1);
                break;
            
            case 'medias' :
                var medias = inf[prop];
                $('#medias').html('<a id = "fb" class="fa fa-facebook-official" style = " font-size : 30px ; color : #3B5998 " href = "' + medias['facebook'] +'" target="_blank"></a><br><a  class="btn btn-default"  href ="mailto:'+ medias['mail'] +'"><i id = "mail" class="fa fa-envelope-o"></i> Contacter</a><br><br>');
                break;
        }
        
    }
    $('#asso').html('<b>'+inf['nom']+'</b>');

}


$(document).ready(function(){
    $.getJSON('/modules/asso/data', function(data){
        init(data);	
    });
});
		
function openNav() {
    document.getElementById('myNav').style.width = '100%';
}

/* Close when someone clicks on the "x" symbol inside the overlay */
function closeNav() {
    document.getElementById('myNav').style.width = '0%';
} 
