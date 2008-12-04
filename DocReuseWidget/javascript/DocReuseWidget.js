	var docReuseWidget = {
		/* Construction of the widget */
		initialize: function() {
			/* Load preferences */
			this.docReuseLocation = widget.preferenceForKey('docreuselocation') || 'http://docreuse.epfl.ch:8050';
			this.extractionLocation = widget.preferenceForKey('extractionlocation') || 'http://docreuse.epfl.ch:8090/extracts/';
			this.setDragAndDrop();
		},
		
		/* Enable the drag and drop functionalities */
		setDragAndDrop: function() {
			widget.addWidgetEventListener('http://palette.ercim.org/ns/dnd/file/xtiger-template', this.onDrop, null);		
			if (widget.bindWidgetToDropType) {
				widget.bindWidgetToDropType ('http://palette.ercim.org/ns/dnd/file/xtiger-template');
			}		
		},
		
		/* Treat the received (dropped) information and place it in the widget */
		onDrop: function(event) {
			var data = event.eventData;			
			var fileURL;
			var fileTitle;
			/* In function of the received data type, define variables */
			if (docReuseWidget.isString(data)) {
				/* A string is given, corresponding to the URL of the file */
				fileURL = data;
				fileTitle = fileURL;
			} else if (docReuseWidget.isMap(data)) {
				/* A map is given, containing at least the link and possibly the title of the file */
				fileURL = data['link'];
				if (data['title']) {
					/* Title is set */
					fileTitle = data['title'];
				} else {
					fileTitle = fileURL;
				}				
			} else {
				/* Data type is not recognized */
				alert('ERROR: bad data type sent from source widget.');
			}
			if ((fileURL) && (fileTitle)) {
				docReuseWidget.setTemplate(fileURL, fileTitle);
			}
		},

		/* Set the template */
		setTemplate: function(fileURL, fileTitle) {
			this.template = fileURL;
			$('#template_name').text(fileTitle);
			$('#basket').show();			
			$('#extract_button').hide();			
			$('#import_button').show();
		}, 
		
		/* Rempove the template */
		removeTemplate: function() {
			this.template = null;
			$('#template_name').text('');
			$('#basket').hide();		
			$('#extract_button').hide();			
			$('#import_button').show();
		},
		
		/* Do import the template into DocReuse */
		importTemplate: function() {
			var that = this;
			var resource_id = this.template.match(/([^\/]+?)$/, 'gi')[1];
			var respository_url = this.template.match(/^(.*\/)+?/, 'gi')[1];
			var parameters = {
						'import_repository_url': respository_url, 
						'import_template_url': resource_id,
						'import_instances': "true"
					};	
			this.showIndicator();
			var ajax = widget.httpPost(this.docReuseLocation+'/communications/import_template', parameters, 
				function(data) {
					var message = eval('('+data+')');
					var status = message.status;
					if (status == 'success') {
						that.template_id = message.id;
						$('#import_button').hide();
						$('#extract_button').show();
					} else {
						alert('Import failed!');
					}
					that.hideIndicator();
				}, 
				this.queryError
			);
		},
		
		/* Display wait panel */
		showIndicator: function() {
			$('#input_import_button').attr('disabled', 'disabled');
			$('#input_extract_button').attr('disabled', 'disabled');
			$('#indicator').show();					
		},
		
		/* Hide wait panel */
		hideIndicator: function() {
			$('#input_import_button').attr('disabled', null);
			$('#input_extract_button').attr('disabled', null);
			$('#indicator').hide();							
		},
		
		/* Redriect to the eXtraction of the given template */
		extractTemplate: function() {
			window.open(this.extractionLocation+this.template_id, 'DocReuse');
		},
		
		/* Open the DocReuse portal */
		openDocReuse: function() {
			window.open(this.docReuseLocation, 'DocReuse');
		}, 
		
		/* Determine if the given object is a string */
		isString: function(object) {
			return typeof object == 'string';
		}, 
		
		/* Determine if the given object is a hashmap */
		isMap: function(object) {
			return ((typeof object == 'object') && (object['link']));
		}, 
		
		/* Display the error detail when query fails */
		queryError: function(xhrObject, status, errorThrown) {
			console.log("ERROR >> "+status+" >> "+errorThrown);
		}
	}