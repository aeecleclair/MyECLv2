var ldays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
var lmonths = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
var lressources = ['Salle ciné', 'Barbecue', 'Salle de réunion', 'Local StR', 'Terrain de tennis 1', 'Terrain de tennis 2', 'Terrain de tennis 3', 'Terrain de tennis Adoma'];
var minHour = new H(6, 0);
var maxHour = new H(0, 0);
var focusDate = new Date(); //Détermine la semaine à afficher
focusDate = new Date(focusDate.getFullYear(), focusDate.getMonth(), focusDate.getDate());

$(document).ready(function() {
    chargementMain();
});

function chargementMain() {

    $('#previous-month').on('click', function() {
        focusDate.setDate(1);
        focusDate.setMonth(focusDate.getMonth() - 1);
        focusDate.setDate(1 + (8 - focusDate.getDay()) % 7);
        printMain();
    });

    $('#next-month').on('click', function() {
        focusDate.setDate(1);
        focusDate.setMonth(focusDate.getMonth() + 1);
        focusDate.setDate(1 + (8 - focusDate.getDay()) % 7);
        printMain();
    });

    printMain();
}

function printMain() {
    let focusMonth = focusDate.getMonth();

    $('#previous-month').html(lmonths[(focusMonth + 10) % 12]);
    $('#next-month').html(lmonths[(focusMonth + 2) % 12]);

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

    $('#calendar-' + name + ' tbody').html(html);

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
        printMain();
    });
}

function printSchedule() {
    let monday = new Date(focusDate);
    monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
    let nextMonday = new Date(monday);
    nextMonday.setDate(nextMonday.getDate() + 7);
    $.get("/modules/reservations/get_reservations", {monday: monday.toISOString(), nextMonday: nextMonday.toISOString()}, function(res) {
        var someday = new Date(monday);

        var resources = new Map();
        res.resources.forEach(function(element) {
            resources.set(element.id, element.resource);
        });

        //Tableau à deux dimensions.
        //Contiendra la liste des réservations effectuées sur une ressource un certain jour.
        //(sert pour éviter une nouvelle requête lors de la redirection)
        var schedule = new Map();
        var heights = new Map();

        //Contient le header et le body du tableau (chaque élément de l'Array est une ligne du tableau)
        var htmlHead = '';
        var htmlBody = new Map();

        //Initialisation des tableaux
        for (let resource_id of resources.keys()) {
            var resourceSchedule = new Array(7);
            var resourceEmptyPeriods = new Array(7);

            for (let day = 0; day < 7; day++) {
                resourceSchedule[day] = new Array();
            }
            resourceEmptyPeriods.fill(0);

            schedule.set(resource_id, resourceSchedule);
            heights.set(resource_id, {length: 0, empty: resourceEmptyPeriods});
            htmlBody.set(resource_id, '');
        }

        //Attribution du mois et de l'année au schedule-body
        $('#schedule-body').attr('date', someday.toISOString());


        //Remplissage de schedule avec les réservations
        res.reservations.forEach(function(reservation) {
            let dateBeg = new Date(reservation.beginning);
            let dateEnd = new Date(reservation.ending);
            reservation.beginning = new Hour(dateBeg.getHours(), dateBeg.getMinutes());
            reservation.ending = new Hour(dateEnd.getHours(), dateEnd.getMinutes());


            let lreservations = schedule.get(parseInt(reservation.resource))[dateBeg.getDay()];

            if (lreservations.length == 0 && !reservation.beginning.equal(minHour)) {
                lreservations.push(undefined);
            }
            else if (lreservations.length > 0 && !reservation.beginning.isInf(lreservations[lreservations.length - 1].ending.plus(new H(0, 15)))) {
                lreservations.push(undefined);
            }

            lreservations.push(reservation);
        });

        for (let resource_id of resources.keys()) {
            for (let i_day = 0; i_day < 7; i_day++) {

                let lreservations = schedule.get(resource_id)[i_day];

                if (lreservations.length == 0 || lreservations.length > 0 && !lreservations[lreservations.length - 1].ending.equal(maxHour)) {
                    lreservations.push(undefined);
                }

                heights.get(resource_id).length = Math.max(heights.get(resource_id).length, lreservations.length);

                for (let i_reservation = 0; i_reservation < lreservations.length; i_reservation++) {
                    if (lreservations[i_reservation] == undefined) {
                        heights.get(resource_id).empty[i_day]++;
                    }
                }
            }
        }


        //Génération du code html

        let lreservations, html;

        for (let day = 1; day < 8; day++) {
            let date = someday.getDate().toString();

            //Création du header
            htmlHead += '<th>' + ldays[day % 7] + ' ' + date + '</th>';

            //Création du body --- A revoir
            for (let resource_id of schedule.keys()) {
                lreservations = schedule.get(resource_id)[day % 7];
                html = htmlBody.get(resource_id);

                html += '<td day=' + (day % 7).toString() + ' date=' + date + '>';

                for (let i_reservation = 0; i_reservation < lreservations.length; i_reservation++) {
                    if (lreservations[i_reservation] == undefined) {
                        let h = 3 * (1 + (heights.get(resource_id).length - lreservations.length) / heights.get(resource_id).empty[day % 7]);
                        html += '<div class="empty-period" n="' + i_reservation + '" style="height:' + h + 'rem">';
                        html += '<span>Réserver</span></div>';
                    }
                    else {
                        html += htmlReservationMain(lreservations[i_reservation], i_reservation, res.user_id);
                    }
                }
                
                htmlBody.set(resource_id, html + '</td>');
            }

            someday.setDate(someday.getDate() + 1);
        }


        //Affichage du header
        $('#schedule-head').html('<tr><th></th>' + htmlHead + '</tr>');

        //Génération du code html du tableau
        html = ''
        for (let resource_id of resources.keys()) {
            html += '<tr ressource="' + resource_id + '">';
            html += '<td>' + resources.get(resource_id) + '</td>' + htmlBody.get(resource_id) + '</tr>';
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
    reservation.resource = parseInt(clickedElement.parents("tr").attr('ressource'));
    let reservationDate = new Date($('#schedule-body').attr('date'));
    reservationDate.setDate(reservationDate.getDate() + ((parseInt(clickedElement.parents('td').attr('day')) + 6) % 7));
    let n = parseInt(clickedElement.attr('n'));
    let editable = false;

    let lreservations = schedule.get(reservation.resource)[reservationDate.getDay()];

    if (clickedElement.attr('class').split(' ')[0] == 'reservation') {
        reservation.id = lreservations[n].id;
        reservation.title = lreservations[n].title;
        reservation.description = lreservations[n].description;
        reservation.hbeg = lreservations[n].beginning;
        reservation.hend = lreservations[n].ending;

        reservation.update = true;
        editable = (lreservations[n].user_id == user_id)

        if (editable) {
            if (n == 0 || n == lreservations.length - 1 || lreservations[n - 1] != undefined || lreservations[n + 1] != undefined) {
                lreservations.splice(n, 1);
            }
            else {
                lreservations.splice(n, 2);
            }
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

        editable = true;
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
                chargement_reservation(lreservations, reservationDate, reservation, editable);
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

    htmlTableReservation(); // Affichage du body

    for (n in lreservations) {
        if (lreservations[n] != undefined) {
            $('#reservation-elements').append(htmlReservationReservation(lreservations[n], n)); // Affichage des réservations
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

    $(document).on('click', function(event) {
        if ($(event.target).attr('class') == 'reservation') {
            let reservation = lreservations[$(event.target).closest('div.reservation').attr('n')];

            $('input#title').val(reservation.title).attr('disabled', 'disabled');
            $('input#description').val(reservation.description).attr('disabled', 'disabled');
            $('input#beginning').val(reservation.beginning).attr('disabled', 'disabled');
            $('input#ending').val(reservation.ending).attr('disabled', 'disabled');
            $('#submit').attr('disabled', 'disabled');
        }
    });
}

function chargement_reservation(lreservations, reservationDate, reservation, editable) {

    let superposed = false;

    $('input#title').val(reservation.title);
    $('input#description').val(reservation.description);
    $('input#beginning').val(reservation.hbeg.toString());
    $('input#ending').val(reservation.hend.toString());

    if (!editable) {
        $('input#title').val(reservation.title).attr('disabled', 'disabled');
        $('input#description').val(reservation.description).attr('disabled', 'disabled');
        $('input#beginning').val(reservation.hbeg.toString()).attr('disabled', 'disabled');
        $('input#ending').val(reservation.hend.toString()).attr('disabled', 'disabled');
        $('#submit').attr('disabled', 'disabled');

        return;
    }

    $('#reservation-elements').append('<div id=new-reservation></div>');

    let positionTop = reservation.hbeg.position();
    let positionBottom = reservation.hend.position();

    $('#new-reservation').css({top: positionTop}).height(positionBottom - positionTop);


    $('input#title').on('change', function() {
        reservation.title = $(this).val();
    })

    $('input#description').on('change', function() {
        reservation.description = $(this).val();
    })

    $('#beginning').on('change', function() {
        reservation.hbeg = new Hour($('#beginning').val());
        reservation.hend = new Hour($('#ending').val());


        if (!reservation.hbeg.isInBounds) {
            reservation.hbeg = new Hour(minHour.hours, minHour.minutes);
        }
        else if (reservation.hbeg.plus(new H(0, 15)).isSup(reservation.hend)) {
            reservation.hend = reservation.hbeg.plus(new H(1, 0));
        }

        let positionBeg = reservation.hbeg.position();
        let positionEnd = reservation.hend.position();

        $('#beginning').val(reservation.hbeg.toString());
        $('#ending').val(reservation.hend.toString());
        $('#new-reservation').css({
            top : positionBeg
        }).height(positionEnd - positionBeg);

        superposed = superposition(lreservations, reservation);
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

        superposed = superposition(lreservations, reservation);
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
                resource: reservation.resource
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

    $(document).on('click', function(event) {
        if ($(event.target).attr('class') != 'reservation') {
            $('input#title').val(reservation.title).removeAttr('disabled');
            $('input#description').val(reservation.description).removeAttr('disabled');
            $('input#beginning').val(reservation.hbeg.toString()).removeAttr('disabled');
            $('input#ending').val(reservation.hend.toString()).removeAttr('disabled');
            $('#submit').removeAttr('disabled');
        }
    })
}

function superposition(lreservations, newReservation) {

    let superposed = false;
    $('#new-reservation').html('');

    for (let i_reservation = 0; i_reservation < lreservations.length; i_reservation++) {

        if (lreservations[i_reservation] != undefined) {

            if (lreservations[i_reservation].beginning.isInf(newReservation.hend) &&
            lreservations[i_reservation].ending.isSup(newReservation.hbeg)) {

                let positionTop, positionBottom, positionFather;

                positionFather = newReservation.hbeg.position();
        
                if (lreservations[i_reservation].beginning.isInf(newReservation.hbeg)) {
                    positionTop = newReservation.hbeg.position();
                }
                else {
                    positionTop = lreservations[i_reservation].beginning.position();
                }
        
                if (lreservations[i_reservation].ending.isSup(newReservation.hend)) {
                    positionBottom = newReservation.hend.position();
                }
                else {
                    positionBottom = lreservations[i_reservation].ending.position();
                }
        
                let html = '<div class="superposition"></div>';
    
                $.when($('#new-reservation').append(html)).done(function() {
                $('.superposition:last-child').css({top: positionTop - positionFather}).height(positionBottom - positionTop);
                });

                superposed = true;
            }
        }
    }

    return superposed;
}

function htmlReservationMain(reservation, n, user_id) {
    let html = '<div class="reservation';
    html += (reservation.user_id == user_id) ? ' reservation-editable' : ' reservation-static';
    html += '" n=' + n + '><div class="col-md-3 reservation-period"><div>' + reservation.beginning + '</div>';
    html += '<div>' + reservation.ending + '</div></div>';
    html += '<div class="col-md-9 visible-md visible-lg reservation-title"><span>' + reservation.title + '</span></div></div>';

    return html;
}

function htmlTableReservation() {
    var html = '';

    for (let h = 6; h < 24; h++) {
        html += '<tr><td class="hour">';
        html += h.toString() + ':00';
        html += '</td><td></td></tr>';

        html += '<tr><td class=hour></td><td></td></tr>';
    }

    $('#reservation-body').html(html);
}

function htmlReservationReservation(reservation, n) {
    return '<div class="reservation" n="' + n + '"><span>' + reservation.title + '</span></div>';
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
        return ((this.hours % 24) == (time.hours % 24) && this.minutes == time.minutes);
    }
}