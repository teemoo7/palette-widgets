	var translation = {	
		/* Construction of the widget */
		initialize: function() {
			this.queriesSent = 0;
			this.setDragAndDrop();
			this.sourceLanguage = widget.preferenceForKey('sourceLanguage') || 'en';
			this.targetLanguage = widget.preferenceForKey('targetLanguage') || 'fr';			
			this.updateLanguageSelectors();
		}, 
		
		/* Puts default values in the HTML <select> tags for languages */
		updateLanguageSelectors: function() {
			$("#sl > option").each(function() {
				var option = $(this)[0];
				if (option.value == translation.sourceLanguage) {
					option.setAttribute("selected", "");
				}
			});
			$("#tl > option").each(function() {
				var option = $(this)[0];
				if (option.value == translation.targetLanguage) {
					option.setAttribute("selected", "");
				}
			});
		},
		
		/* Enable the drag and drop functionalities */
		setDragAndDrop: function() {
			widget.addWidgetEventListener('http://palette.ercim.org/ns/dnd/rss-feed', this.onDrop, null);		
			if (widget.bindWidgetToDropType) {
				widget.bindWidgetToDropType ('http://palette.ercim.org/ns/dnd/rss-feed');
			}		
			
		},		
		
		/* Treat the received (dropped) information and place it in the widget */
		onDrop: function(event) {
			var data = event.eventData;			
			/* In function of the received data type, define variables */
			if (translation.isString(data)) {
				/* A string is given */
				translation.displayTranslatedText(data);
			} else if (translation.isMap(data)) {
				/* A map is given, containing at least the link and the title of the RSS item */
				var title = data['title'];
				var link = data['link'];
				var description = data['description'];
				translation.displayTranslatedRSSItem(title, link, description);
			} else {
				/* Data type is not recognized */
				alert('ERROR: bad data type sent from source widget.');
			}
		},		
		
		/* Display text */
		displayTranslatedText: function(text) {
			$('#results').empty();
			var translatedText = translation.translateText(text, $('#results'));
		},
		
		/* Display RSS feed */
		displayTranslatedRSSItem: function(title, link, description) {
			$('#results').empty();
			$('#results').hide();
			var titleContainer = document.createElement("div");
			titleContainer.setAttribute("class", "title");
			$('#results').append(titleContainer);
			var descriptionContainer = document.createElement("div");
			descriptionContainer.setAttribute("class", "description");
			$('#results').append(descriptionContainer);
			var linkContainer = document.createElement("div");
			linkContainer.setAttribute("class", "link");
			$('#results').append(linkContainer);
			var alink = document.createElement("a");
			alink.setAttribute("href", "http://translate.google.ch/translate?ie=UTF-8&u="+encodeURI(link)+"&sl="+$('#sl').val()+"&tl="+$('#tl').val()+"");
			alink.setAttribute("target", "_blank");
			$(alink).append("Read full article");
			$(linkContainer).append(alink);
			translation.translateText(title, $(titleContainer));
			translation.translateText(description, $(descriptionContainer));
		},
		
		/* Use Google Translation tool to translate given text */
		translateText: function(text, insertionPoint) {
			$('#indicator').show();
			translation.queriesSent++;
			var query = "http://translate.google.ch/translate_t";
			var ajax = widget.httpPost(query, {sl: $('#sl').val(), tl: $('#tl').val(), 'text': text},
				function(data){
					$(insertionPoint).empty();
					var results = $(data).find('div#result_box');
					var result = results[0];
					var resultText = result.firstChild.nodeValue;
					$(insertionPoint).append(resultText);
					translation.queriesSent--;
					if (translation.queriesSent == 0) {
						$('#results').show();
						$('#indicator').hide();
					}
				}
			);
		},	

		/* Determine if the given object is a string */
		isString: function(object) {
			return typeof object == 'string';
		}, 
		
		/* Determine if the given object is a hashmap */
		isMap: function(object) {
			return ((typeof object == 'object') && (object['link']) && (object['title']));
		}		
	}