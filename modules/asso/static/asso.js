/*
var info1 = { 
    photo : "Démo/logo.png",
    nom : "CMB",
    membres : [
        {nom : "Malou" , prenom : "Eddy" , surnom : "str" , poste : "Prez d'honneur" , photo:"Démo/eddy.jpg"},
        {nom:"Haguenauer" , prenom :"Timothée" , surnom :"Konje" , poste : "Admin" , photo :"Démo/kong.jpg"},
        {nom :"Bargain" , prenom :"Thomas" , surnom :"Kwanthum" , poste : "Modo" , photo :"Démo/kwanthum.jpg"},
        {nom:"Valero" , prenom :"Pablo", surnom:"Toro" , poste : "Modo" , photo :"Démo/toro.jpg"},
        {nom:"Morgavi", prenom:"Romain", surnom:"Nioc", poste:"Modo", photo:"Démo/nioc.jpg"}
    ],
    medias : {
        mail:"timothee.haguenauer@ecl16.ec-lyon.fr",
        facebook :"https://www.facebook.com/groups/CMBSTRCMB/"
    },
    galerie:["static/galerie/absurd.png","logo.png","POP.png"],
    modules : [
        {nom:"Module 1",lien:"jskjkdkjsd.fr"},
        {nom:"Module 2",lien:"jskjkdkjsd.fr"},
        {nom:"Module 3",lien:"jskjkdkjsd.fr"}
    ],
    description : 
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
};

/* eslint-env jquery, browser */

function init(infos){
    $('.image-profile').html('<img id="image" src="' + infos.photo + '" alt="Logo asso" width="100%"/>');
    $('#descripton').html(infos.description);


    var modules = infos.modules;
    var tuiles = '<div class="row">';
    for (let i in modules){
        var module = modules[i];
        tuiles += '<div class="tuile-asso col-xs-4"><p><a href="' + module['lien'] + '"><b>' + module['nom'] + '</b> </br></a></p></div>';
        if (i%3 == 3){
            tuiles += '</div><div class="row">';
        }
    }
    tuiles += '</div>';
    $('#modules').html(tuiles);


    var membres = infos.membres;
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

    var photos = infos.galerie;
    var ajout = '';
    var ajout1 = '<div class=\'item active\'>';
    for (let i in photos){
        if (i == 0){
            ajout += '<li data-target=\'#myCarousel\' data-slide-to=\'0\' class=\'active\'></li>';
            ajout1 += '<img src=' + photos[i] + '></div>';
        }
        else{
            ajout += '<li data-target=\'#myCarousel\' data-slide-to=\'' + i.toString() + '\'></li>';
            ajout1 += '<div class=\'item\'><img src=' + photos[i] + '></div>';
        }
    }
    $('#carousel-indicators').html(ajout);
    $('#carousel-inner').html(ajout1);

    var medias = infos.medias;
    $('#medias').html('<a id = "fb" class="fa fa-facebook-official" style = " font-size : 30px ; color : #3B5998 " href = "' + medias['facebook'] +'" target="_blank"></a><br><a  class="btn btn-default"  href ="mailto:'+ medias['mail'] +'"><i id = "mail" class="fa fa-envelope-o"></i> Contacter</a><br><br>');

    $('#asso').html('<b>' + infos.nom + '</b>');
}

$(document).ready(function(){
    $.getJSON('/modules/asso/data', function(data){
        init(data);	
    });
});

/* eslint-disable no-unused-vars */
function openNav() {
    document.getElementById('myNav').style.width = '100%';
}

/* Close when someone clicks on the "x" symbol inside the overlay */
function closeNav() {
    document.getElementById('myNav').style.width = '0%';
} 
/* eslint-enable no-unused-vars */
