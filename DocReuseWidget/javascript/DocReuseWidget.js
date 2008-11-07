	var docReuseWidget = {			
		initialize: function() {
			this.docReuseLocation = 'http://docreuse.epfl.ch:8050';
			this.setDragAndDrop();
		},
		
		setDragAndDrop: function() {
			widget.addWidgetEventListener('http://palette.ercim.org/ns/dnd/file/xtiger-template', this.onDrop, null);		
			if (widget.bindWidgetToDropType) {
				widget.bindWidgetToDropType ('http://palette.ercim.org/ns/dnd/file/xtiger-template');
			}		
		},
		
		onDrop: function(event) {
			//var fileURL = event.eventData;
			var data = event.eventData;
			var fileURL = data['link'];
			var fileTitle = data['title'];
			docReuseWidget.setTemplate(fileURL, fileTitle);
		},

		setTemplate: function(fileURL, fileTitle) {
			this.template = fileURL;
			$('#template_name').text(fileTitle);
			$('#template').show();			
		}, 
		
		removeTemplate: function() {
			this.template = null;
			$('#template_name').text('');
			$('#template').hide();			
		},
		
		importTemplate: function() {
			var resource_id = this.template.match(/([^\/]+?)$/, 'gi')[1];
			var respository_url = this.template.match(/^(.*\/)+?/, 'gi')[1];
			var parameters = {
						'authenticity_token': '8e344ac010af0611527b4b5b19adc7fa3c79635a',
						'import_repository_url': respository_url, 
						'import_template_url': resource_id,
						'import_instances': true
					};
			widget.httpPost(this.docReuseLocation+'/communications/import_template', parameters, alert('Exported'));
		},
		
		openDocReuse: function() {
			window.open(this.docReuseLocation, 'DocReuse');
		}
	}