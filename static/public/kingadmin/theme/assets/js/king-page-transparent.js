$(document).ready(function(){

	//*******************************************
	/*  FILE MANAGER
	/********************************************/

	if($('#tree-file-manager').length > 0) {

		// file manager datatable
		var fileTable = $('#datatable-file-manager').DataTable({
			dom: 'T<"clear">',
			scrollY: "500px",
			scrollCollapse: true,
			paging: false,
			bFilter: false,
			bInfo: false,
			tableTools: {
				"sRowSelect": "os",
				"aButtons": [ ]
			},
			"language": {
				"emptyTable": "No file or directory found"
			}
			
		});

		// root directory
		var arrRootDir = [
			['<i class="fa fa-folder"></i> Project 123GO', '53 KB', '17/12/2014', 'Directory', '755'],
			['<i class="fa fa-folder"></i> Web Redesign', '153 KB', '23/02/2015', 'Directory', '755'],
			['<i class="fa fa-folder"></i> Spot Media', '0 KB', '22/12/2014', 'Directory', '755'],
			['<i class="fa fa-folder"></i> Fast E-Commerce', '0 KB', '18/01/2015', 'Directory', '755'],
			['<i class="fa fa-folder"></i> SEO', '0 KB', '05/01/2015', 'Directory', '755'],
			['<i class="fa fa-file-image-o"></i> BigFile-Image.jpg', '12 MB', '14/01/2015', 'Image', '644'],
			['<i class="fa fa-file-word-o"></i> BigFile-Word.docx', '200 MB', '09/01/2015', 'Word', '644'],
		]

		fileTable.clear().rows.add(arrRootDir).draw();

		// directory 1
		var arrDirContents1 = [
			['<i class="fa fa-folder"></i> Child Directory', '41 KB', '23/02/2015', 'Directory', '755'],
			['<i class="fa fa-file-text-o"></i> Notes.txt', '231 KB', '20/02/2015', 'Text', '644'],
			['<i class="fa fa-file-word-o"></i> Proposal.docx', '6 MB', '28/02/2015', 'Word', '644'],
			['<i class="fa fa-file-pdf-o"></i> Proposal.pdf', '2 MB', '29/02/2015', 'PDF', '644']
		]

		// directory 2
		var arrDirContents2 = [
			['<i class="fa fa-folder"></i> Child Directory 1', '62 KB', '23/02/2015', 'Directory', '755'],
			['<i class="fa fa-folder"></i> Child Directory 2', '91 KB', '25/02/2015', 'Directory', '755'],
			['<i class="fa fa-file-text-o"></i> Notes.txt', '544 KB', '20/02/2015', 'Text', '644'],
			['<i class="fa fa-file-word-o"></i> Proposal.docx', '3 MB', '18/02/2015', 'Word', '644'],
			['<i class="fa fa-file-pdf-o"></i> Proposal.pdf', '1 MB', '28/02/2015', 'PDF', '644'],
			['<i class="fa fa-file-image-o"></i> Logo.png', '145 KB', '28/02/2015', 'Image', '644'],
		]

		// file manager tree
		$('#tree-file-manager').jstree({
			'core' : {
				"data" : {
					"url" : "assets/js/plugins/tree/root.json",
				},
				"themes" : {
					"name" : "default-dark",
					"dots" : true,
					"icons": true,
					"url"  : true,
					"dir"  : "assets/js/plugins/tree/themes/"
				},
				"check_callback" : true,
				"multiple" : false
			},
			'plugins' : ["types", "contextmenu"],
			'types' : {
				'default' : {
					'icon' : 'fa fa-folder'
				},
				'text' : {
					'icon' : 'fa fa-file-text-o'
				},
				'pdf' : {
					'icon' : 'fa fa-file-pdf-o'
				},
				'word' : {
					'icon' : 'fa fa-file-word-o'
				},
				'excel' : {
					'icon' : 'fa fa-file-excel-o'
				},
				'ppt' : {
					'icon' : 'fa fa-file-powerpoint-o'
				},
				'img' : {
					'icon' : 'fa fa-file-image-o'
				},
				'zip' : {
					'icon' : 'fa fa-file-zip-o'
				}
			}

		}).on('select_node.jstree', function(e, data) {

			var nodeType = data.instance.get_node(data.selected).type;

			// since multiple selection is disabled, it's ok not to iterate array (data.selected)
			if(data.selected == '0-myprojects') {
				fileTable.clear().rows.add(arrRootDir).draw();
			} else if(data.selected == '00-project123go') {
				fileTable.clear().rows.add(arrDirContents1).draw();
			} else if (data.selected == '01-webredesign') {
				fileTable.clear().rows.add(arrDirContents2).draw();
			} else {
				fileTable.clear().draw();
			}

			if($("#datatable-file-manager td").length > 0) {
				$("#datatable-file-manager td").contextmenu({
					target: '#contextMenuFileManager',
					onItem: function(context, e) {
						alert($(e.target).text() + ': ' + context.text());
					}
				});
			}
		});

		$('#datatable-file-manager tbody').on( 'mousedown', 'tr', function (e) {
			// if right click
			if(e.button == 2) {
				document.oncontextmenu = function() {return false;};

				if($(this).hasClass('DTTT_selected')) {
					$(this).removeClass('DTTT_selected');
				} else {
					fileTable.$('tr.DTTT_selected').removeClass('DTTT_selected');
					$(this).addClass('DTTT_selected');
				}
			}
			// else if left click and ctrl/meta key released
			else if((e.button == 0) && !(e.ctrlKey || e.metaKey) ){
				fileTable.$('tr.DTTT_selected').removeClass('DTTT_selected');
				$(this).addClass('DTTT_selected');
			}

		});
	}

}); // end ready function
