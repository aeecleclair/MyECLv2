$("#calendar").fullCalendar({
    header:
        {
            left:   'month, basicWeek', //agendaWeek
            center: 'title',
            right:  "today prev,next"
        },
    defaultView: 'basicWeek',
    firstDay:1,
    monthNames:
        [
            'Janvier',
            'Février',
            'Mars',
            'Avril',
            'Mai',
            'Juin',
            'Juillet',
            'Août',
            'Septembre',
            'Octobre',
            'Novembre',
            'Décembre'
        ],
    monthNamesShort:
        [
            'Jan',
            'Fév',
            'Mars',
            'Avril',
            'Mai',
            'Juin',
            'Juil',
            'Août',
            'Sept',
            'Oct',
            'Nov',
            'Dec'],
    dayNames:
        [
            'Dimanche',
            'Lundi',
            'Mardi',
            'Mercredi',
            'Jeudi',
            'Vendredi',
            'Samedi'
        ],
    dayNamesShort:
        [
            'Dim',
            'Lun',
            'Mar',
            'Mer',
            'Jeu',
            'Ven',
            'Sam'
        ],
    titleFormat: {
        month: 'MMMM yyyy',
        week: "dd MMMM [ yyyy]{ '&#8212;'dd MMMM yyyy}",
        day: 'dddd, dd MMMM, yyyy'
    },
    columnFormat: {
		month: 'dddd',
		week: 'dddd dd/MM',
		day: 'dddd dd/MM'
    },
    buttonText: {
		today: 'aujourd\'hui',
		month: 'mois',
		week: 'semaine',
		day: 'jour'
    },
    axisFormat: 'HH:mm',
    timeFormat: {
		'': 'HH:mm'
	},
    allDayText: 'Toute la journée',
    allDaySlot:false,
    slotDuration:'01:00:00',
    slotLabelInterval:'01:00',
    height:200,
    events:'/modules/bde_calendar/get_all',
    eventClick: function(calEvent, jsEvent, view) {

        function formatDatetime(d){
            var year = d.getFullYear();
            var month = d.getMonth() + 1;
            var day = d.getDay();
            var hour = d.getHours();
            var minutes = d.getMinutes();
            return [day, month, year].join('/') + ' ' + [hour, minutes].join(':');
        }
        
        html = "<br><div class='col-md-6 col-md-offset-3'>";
        
        html += "<p class='text-center'>";
        html += "<span class='lead'>" + calEvent.title + "</span><br>";
        html += "<span><i>" + calEvent.description + "</i></span>";
        html += "</p>";

        html += "<p class='text-center'>";
        html += "<span>Du " + formatDatetime(calEvent.start) + " au " + formatDatetime(calEvent.end) + "</span><br>";
        html += "<span>Organisateur : " + calEvent.organisation + "&emsp;&ensp;Lieu : " + calEvent.location + "</span>";
        html += "</p>";
        html += "</div>";

        $("#current").html(html);
    }
});
