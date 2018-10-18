var ldays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
var lmonths = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
var lressources = ['Salle ciné', 'Barbecue', 'Salle de réunion', 'Terrain de tennis 1', 'Terrain de tennis 2', 'Terrain de tennis 3', 'Terrain de tennis Adoma'];
var minHour = new H(6, 0);
var maxHour = new H(0, 0);
var focusDate = new Date(); //Détermine la semaine à afficher ()
focusDate = new Date(focusDate.getFullYear(), focusDate.getMonth(), focusDate.getDate());

$(document).ready(function() {
    chargementMain(focusDate);
});

$('#previous-month').on('click', function() {
    focusDate.setDate(1);
    focusDate.setMonth(focusDate.getMonth() - 1);
    focusDate.setDate(1 + (8 - focusDate.getDay()) % 7);
    chargementMain();
})

$('#next-month').on('click', function() {
    focusDate.setDate(1);
    focusDate.setMonth(focusDate.getMonth() + 1);
    focusDate.setDate(1 + (8 - focusDate.getDay()) % 7);
    chargementMain();
})

function chargementMain() {

    let focusMonth = focusDate.getMonth();

    //$('#previous-month').html(lmonths[(focusMonth + 10) % 12]);
    //$('#next-month').html(lmonths[(focusMonth + 2) % 12]);

    let someDay = new Date(focusDate);
    someDay.setDate(1);
    someDay.setMonth(someDay.getMonth() - 1);

    printCalendar(someDay, 'previous');
    printCalendar(someDay, 'actual');
    printCalendar(someDay, 'next');

    printSchedule();
}

function printCalendar(someDay, name) {
    let monday = new Date(focusDate);
    monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
    let nextMonday = new Date(monday);
    nextMonday.setDate(nextMonday.getDate() + 7);
    let year = someDay.getFullYear();
    let month = someDay.getMonth();
    let today = new Date();

    someDay.setDate(1);
    someDay.setDate(1 - ((someDay.getDay() + 6) % 7));

    $('#month-' + name).html(lmonths[month]);

    if (name == 'actual') {
        $('#month-' + name).append(' ' + year.toString());
    }

    var html = '';
    while (someDay.getMonth() != (month + 1) % 12) {
        if (someDay.getMonth() == (month + 11) % 12) {
            html += '<tr date="1">';
        }
        else {
            html += '<tr date="' + someDay.getDate() + '">';
        }
        /*html += '<tr onclick="reSchedule(' + someDay.getDate().toString();
        //html += ', ' + someDay.getMonth().toString();
        html += /*', ' + someDay.getFullYear().toString() + ')"'>';*/

        for (let day = 0; day < 7; day++) {
            html += '<td class="calendar-' + ((someDay.getMonth() == month) ? 'enabled' : 'disabled');
            html += (someDay.getDate() == today.getDate() && someDay.getMonth() == today.getMonth()) ? ' calendar-today' : '';
            html += (day == 6) ? ' calendar-sunday' : '';
            html += ((monday <= someDay && someDay < nextMonday) ? ' calendar-focus' : '') + '">';
            html += someDay.getDate().toString() + '</td>';
            someDay.setDate(someDay.getDate() + 1);
        }

        html += '</tr>';
    }

    $('#calendar-' + name).html(html);

    $('table.calendar tbody tr').on('click', function() {
        if ($(this).parents("table.calendar tbody").attr("id") == "calendar-previous") {
            focusDate.setDate(1);
            focusDate.setMonth(focusDate.getMonth() - 1);
        }
        else if ($(this).parents("table.calendar tbody").attr("id") == "calendar-next") {
            focusDate.setDate(1);
            focusDate.setMonth(focusDate.getMonth() + 1);
        }

        focusDate.setDate(parseInt($(this).attr('date')));
        chargementMain();
    });
}

function printSchedule() {
    let monday = new Date(focusDate);
    monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
    let nextMonday = new Date(monday);
    nextMonday.setDate(nextMonday.getDate() + 7);
    $.get("/modules/reservations/get_reservations", {monday: monday.toISOString(), nextMonday: nextMonday.toISOString()}, function(res) {
        var someday = new Date(monday);


        //Tableau à deux dimensions.
        //Contiendra la liste des réservations effectuées sur une ressource un certain jour.
        //(sert pour éviter une nouvelle requête lors de la redirection)
        var schedule = new Array(lressources.length);
        var heights = new Array(lressources.length);

        //Contient le header et le body du tableau (chaque élément de l'Array est une ligne du tableau)
        var htmlHead = '';
        var htmlBody = new Array(lressources.length);

        //Initialisation des tableaux
        for (let i_ressources = 0; i_ressources < lressources.length; i_ressources++) {
            schedule[i_ressources] = new Array(7);
            heights[i_ressources] = {length: 0, empty: new Array(7)};
            htmlBody[i_ressources] = '';

            for (let day = 0; day < 7; day++) {
                schedule[i_ressources][day] = new Array();
                heights[i_ressources].empty[day] = 0;
            }
        }

        //Attribution du mois et de l'année au schedule-body
        $('#schedule-body').attr('date', someday.toISOString());


        //Remplissage de schedule avec les réservations
        res.reservations.forEach(function(reservation) {
            let dateBeg = new Date(reservation.beginning);
            let dateEnd = new Date(reservation.ending);
            reservation.beginning = new Hour(dateBeg.getHours(), dateBeg.getMinutes());
            reservation.ending = new Hour(dateEnd.getHours(), dateEnd.getMinutes());

            let lreservations = schedule[parseInt(reservation.ressource)][dateBeg.getDay()];

            if (lreservations.length == 0 && !reservation.beginning.equal(minHour)) {
                lreservations.push(undefined);
            }
            else if (lreservations.length > 0 && !reservation.beginning.equal(lreservations[lreservations.length - 1].ending)) {
                lreservations.push(undefined);
            }

            lreservations.push(reservation);
        });

        for (let i_ressources = 0; i_ressources < lressources.length; i_ressources++) {
            for (let i_day = 0; i_day < 7; i_day++) {

                let lreservations = schedule[i_ressources][i_day];

                if (lreservations.length == 0 || lreservations.length > 0 && !lreservations[lreservations.length - 1].ending.equal(maxHour)) {
                    lreservations.push(undefined);
                }

                heights[i_ressources].length = Math.max(heights[i_ressources].length, lreservations.length);

                for (let i_reservation = 0; i_reservation < lreservations.length; i_reservation++) {
                    if (lreservations[i_reservation] == undefined) {
                        heights[i_ressources].empty[i_day]++;
                    }
                }
            }
        }

        //Génération du code html

        let lreservations;

        for (let day = 1; day < 8; day++) {
            let date = someday.getDate().toString();

            //Création du header
            htmlHead += '<th>' + ldays[day % 7] + ' ' + date + '</th>';

            //Création du body
            for (let i_ressources in schedule) {
                lreservations = schedule[i_ressources][day % 7];

                htmlBody[i_ressources] += '<td day=' + (day % 7).toString() + ' date=' + date + '>';

                for (let i_reservation = 0; i_reservation < lreservations.length; i_reservation++) {
                    if (lreservations[i_reservation] == undefined) {
                        let h = 3 * (1 + (heights[i_ressources].length - lreservations.length) / heights[i_ressources].empty[day % 7]);
                        htmlBody[i_ressources] += '<div class="empty-period" n="' + i_reservation + '" style="height:' + h + 'rem">';
                        htmlBody[i_ressources] += '<span class="center">Réserver</span></div>';
                    }
                    else {
                        htmlBody[i_ressources] += htmlReservation(lreservations[i_reservation], i_reservation, res.user_id);
                    }
                }
                
                htmlBody[i_ressources] += '</td>';
            }

            someday.setDate(someday.getDate() + 1);
        }


        //Affichage du header
        $('#schedule-head').html('<tr><th></th>' + htmlHead + '</tr>');

        //Génération du code html du tableau
        html = ''
        for (let i_ressources in htmlBody) {
            html += '<tr ressource="' + i_ressources.toString() + '">';
            html += '<td>' + lressources[i_ressources] + '</td>' + htmlBody[i_ressources] + '</tr>';
        }
        
        //Affichage du tableau
        $('#schedule-body').html(html);

        //Gestion du click sur une zone libre
        $('table.schedule .empty-period').on('click', function() {
            redirection_reservation($(this), schedule);
        });

        $('table.schedule .reservation').on('click', function() {
            redirection_reservation($(this), schedule, res.user_id)
        })
    });
}

function redirection_reservation(clickedElement, schedule, user_id) {
    let reservation = {title: '', description: ''};
    reservation.ressource = clickedElement.parents("tr").attr('ressource');
    let reservationDate = new Date($('#schedule-body').attr('date'));
    reservationDate.setDate(reservationDate.getDate() + ((parseInt(clickedElement.parents('td').attr('day')) + 6) % 7));
    let n = parseInt(clickedElement.attr('n'));

    let lreservations = schedule[reservation.ressource][reservationDate.getDay()];


    if (clickedElement.attr('class').split(' ')[0] == 'reservation' && lreservations[n].user_id == user_id) {
        reservation.id = lreservations[n].id;
        reservation.title = lreservations[n].title;
        reservation.description = lreservations[n].description;
        reservation.hbeg = lreservations[n].beginning;
        reservation.hend = lreservations[n].ending;

        reservation.update = true;
        
        if (n == 0) {
            lreservations.splice(0, 1);
        }
        else {
            lreservations.splice(n, 2);
        }
    }
    else if (clickedElement.attr('class') == 'empty-period') {
        let hmin = (n == 0) ? new Hour(minHour.hours, minHour.minutes) : lreservations[n - 1].ending;
        let hmax = (n + 1 == lreservations.length) ? new Hour(maxHour.hours, maxHour.minutes) : lreservations[n + 1].beginning;

        reservation.hbeg = hmin;
        reservation.update = false;
        
        if (hmax.minus(hmin).isSup(new H(1, 0))) {
            reservation.hend = new Hour(hmin.hours + 1, hmin.minutes);
        }
        else {
            reservation.hend = hmax;
        }
    }
    else {
        return;
    }

    // Récupération de la nouvelle page
    $.ajax({
        url : '/body/reservations/reservation',
        type : 'get',
        success : function(data) {
            $.when($('#main-content-wrapper').html(data)).done(function(data) {
                print_otherReservations(lreservations, reservationDate);
                chargement_reservation(lreservations, reservationDate, reservation);
            });
        },
        error : function(){
            $('#main-content-wrapper').html(body_404);
        }
    });
}

function print_otherReservations(lreservations, reservationDate) {

    // Affichage du header
    $('#reservation-head').html('<th colspan=2>' + ldays[reservationDate.getDay()] + ' ' + reservationDate.getDate().toString()) + '</th>';

    htmlReservationBody(); // Affichage du body

    for (n in lreservations) {
        if (lreservations[n] != undefined) {
            $('#reservation-elements').append(htmlReservation(lreservations[n], n)); // Affichage des réservations
        }
    }

    // Modification du positionnement des réservations
    for (i_reservation in lreservations) {
        if (lreservations[i_reservation] != undefined) {
            let reservation = lreservations[i_reservation];

            let positionTop = reservation.beginning.position();
            let positionBottom = reservation.ending.position();

            $('#reservation-elements div.reservation[n="' + i_reservation.toString() + '"]').css({
                top : positionTop
            }).height(positionBottom - positionTop);
        }
    }
}

function chargement_reservation(lreservations, reservationDate, reservation) {
    
    let superposed = false;

    $('input#titlex').val(reservation.title);
    $('input#description').val(reservation.description);
    $('input#beginning').val(reservation.hbeg.toString());
    $('input#ending').val(reservation.hend.toString());

    $('#reservation-elements').append('<div id="new-reservation"><span class="center">' + (reservation.title == '' ? 'Titre' : reservation.title) + '<br>' + reservation.hbeg.toString() + ' - ' + reservation.hend.toString() + '</span></div>');

    let positionTop = reservation.hbeg.position();
    let positionBottom = reservation.hend.position();

    $('#new-reservation').css({top: positionTop}).height(positionBottom - positionTop);


    $('input#titlex').on('change', function() {
        reservation.title = $(this).val();
        $('#new-reservation span').html((reservation.title == '' ? 'Titre' : reservation.title) + '<br>' + reservation.hbeg.toString() + ' - ' + reservation.hend.toString());
    })

    $('input#description').on('change', function() {
        reservation.description = $(this).val();
        $('#new-reservation span').html((reservation.title == '' ? 'Titre' : reservation.title) + '<br>' + reservation.hbeg.toString() + ' - ' + reservation.hend.toString());
    })

    $('#beginning').on('change', function() {
        reservation.hbeg = new Hour($('#beginning').val());
        reservation.hend = new Hour($('#ending').val());

        if (!reservation.hbeg.isInBounds) {
            reservation.hbeg = new Hour(minHour.hours, minHour.minutes);
        }
        else if (reservation.hbeg.isSup(reservation.hend)) {
            reservation.hend = reservation.hbeg.plus(new H(1, 0));
        }

        let positionBeg = reservation.hbeg.position();
        let positionEnd = reservation.hend.position();
        
        $('#new-reservation span').html((reservation.title == '' ? 'Titre' : reservation.title) + '<br>' + reservation.hbeg.toString() + ' - ' + reservation.hend.toString());

        $('#beginning').val(reservation.hbeg.toString());
        $('#ending').val(reservation.hend.toString());
        $('#new-reservation').css({
            top : positionBeg
        }).height(positionEnd - positionBeg);

        superposed = superposition(lreservations, reservation);
        
        if (superposed) {
            $('#new-reservation').css("background-color","firebrick");
        } else {
            $('#new-reservation').css("background-color","darkolivegreen");
        }
    });
            
    $('#ending').on('change', function() { 
        reservation.hbeg = new Hour($('#beginning').val());
        reservation.hend = new Hour($('#ending').val());
                
        if (!reservation.hend.isInBounds) {
            reservation.hend = new Hour(maxHour.hours, maxHour.minutes);
        }
        else if (reservation.hend.isInf(reservation.hbeg)) {
            reservation.hend = reservation.hbeg.plus(new H(0, 15));
        }

        let positionBeg = reservation.hbeg.position();
        let positionEnd = reservation.hend.position();

        $('#ending').val(reservation.hend.toString());
        $('#new-reservation').height(positionEnd - positionBeg);
        
        $('#new-reservation span').html((reservation.title == '' ? 'Titre' : reservation.title) + '<br>' + reservation.hbeg.toString() + ' - ' + reservation.hend.toString());

        superposed = superposition(lreservations, reservation);
        
        if (superposed) {
            $('#new-reservation').css("background-color","firebrick");
        } else {
            $('#new-reservation').css("background-color","darkolivegreen");
        }
    });

    $('#submit').on('click', function() {

        if (superposed) {
            $('#error-message').html("Le créneau de réservation n'est pas valide");
        }
        else if (reservation.title == '') {
            $('#error-message').html("La réservation doit contenir un titre")
        }
        else {

            let dateBeg = new Date(reservationDate.getFullYear(), reservationDate.getMonth(), reservationDate.getDate(), reservation.hbeg.hours, reservation.hbeg.minutes);
            let dateEnd = new Date(reservationDate.getFullYear(), reservationDate.getMonth(), reservationDate.getDate(), reservation.hend.hours, reservation.hend.minutes);

            let data = {
                id: reservation.id,
                title: reservation.title,
                description: reservation.description,
                beginning: dateBeg.toISOString(),
                ending: dateEnd.toISOString(),
                ressource: reservation.ressource
            }

            function callbackReservation() {
                $.ajax({
                    url : '/body/reservations/main',
                    type : 'get',
                    success : function(data) {
                        $.when($('#main-content-wrapper').html(data)).done(chargementMain());
                    },
                    error : function(){
                        $('#main-content-wrapper').html(body_404);
                    }
                });
            }

            if (reservation.update) {
                $.post('/modules/reservations/update_reservation', data, callbackReservation);
            }
            else {
                $.post('/modules/reservations/new_reservation', data, callbackReservation)
            }
        }
    });
}

function superposition(lreservations, newReservation) {

    let new_hbeg = parseInt(newReservation.hbeg.toString().split(':')[0]) + parseInt(newReservation.hbeg.toString().split(':')[1])/60;
    
    let new_hend = parseInt(newReservation.hend.toString().split(':')[0]) + parseInt(newReservation.hend.toString().split(':')[1])/60;
    
    let i_hbeg = 0;
    let i_hend = 0;

    for (let i_reservation = 0; i_reservation < lreservations.length; i_reservation++) {

        if (lreservations[i_reservation] != undefined) {
            i_hbeg = parseInt(lreservations[i_reservation].beginning.toString().split(':')[0]) + parseInt(lreservations[i_reservation].beginning.toString().split(':')[1])/60;
            i_hbeg = parseInt(lreservations[i_reservation].ending.toString().split(':')[0]) + parseInt(lreservations[i_reservation].ending.toString().split(':')[1])/60;
            
            if ((new_hbeg < i_hbeg && i_hbeg < new_hend) || (new_hbeg < i_hend && i_hend < new_hend)) {
                return true;
            }
        }
    }
    return false;
}

function htmlReservation(reservation, n, user_id) {
    let html = '<div class="reservation editable';
    html += '" n=' + n + '><span class="center">' + reservation.title + '<br>' + reservation.beginning + ' - ' + reservation.ending + '</span></div>';

    return html;
}

function htmlReservationBody() {
    var html = '';

    for (let h = 6; h < 24; h++) {
        html += '<tr><td class="hour">';
        html += h.toString() + ':00';
        html += '</td><td></td></tr>';

        html += '<tr><td class=hour></td><td></td></tr>';
    }

    $('#reservation-body').html(html);
}


function Hour(hours, minutes = 0) {

    H.call(this, hours, minutes);

    if (this.isInf(minHour)) {
        this.hours += 24;
    }

    if (minHour.isInf(maxHour)) {
        this.isInBounds = !this.isSup(maxHour);
    }
    else {
        this.isInBounds = !this.isSup(new H(maxHour.hours + 24, maxHour.minutes));
    }

    this.toString = function() {
        let hours = this.hours % 24;
        let h = (hours < 10) ? '0' + hours.toString() : hours.toString();
        let m = (this.minutes < 10) ? '0' + this.minutes.toString() : this.minutes.toString();
        return h + ':' + m;
    }

    this.position = function() {
        if (this.equal(maxHour)) {
            return $('#reservation-body').parents('div').height();
        }
        else {
            let pos = $('#reservation-body tr:nth-child(' + (2*(this.hours - 6) + 1) + ') td').position().top;
            pos += this.minutes / 60 * ($('#reservation-body tr:nth-child(' + (2*(this.hours - 6) + 2) + ') td').height() + $('#reservation-body tr:nth-child(' + (2*(this.hours - 6) + 2) + ') td').position().top - pos);
    
            return pos;
        }
    }

    this.plus = function(duration) {
        return new Hour(this.hours + duration.hours, this.minutes + duration.minutes);
    }
}

function H(hours, minutes) {

    if (typeof hours == 'string') {
        let time = hours.split(':');
        this.hours = parseInt(time[0]);
        this.minutes = parseInt(time[1]);
    }
    else {
        this.hours = hours + Math.trunc(minutes / 60);
        this.minutes = minutes % 60;
    }

    this.isInf = function(time) {
        return this.hours < time.hours || (this.hours == time.hours && this.minutes < time.minutes);
    }

    this.isSup = function(time) {
        return this.hours > time.hours || (this.hours == time.hours && this.minutes > time.minutes);
    }

    this.minus = function(time) {
        return new H(this.hours - time.hours, this.minutes - time.minutes);
    }

    this.equal = function(time) {
        return (this.hour % 24 == time.hour % 24 && this.minutes == time.minutes);
    }
}
