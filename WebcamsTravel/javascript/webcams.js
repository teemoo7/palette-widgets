	var webcams = {	
		initialize: function() {
			this.webcam = document.getElementById('webcam');
			this.infos = document.getElementById('infos');
			this.photo = document.getElementById('photo');
			this.webcams = document.getElementById('webcams');
			this.indicator = document.getElementById('indicator');
			this.results = document.getElementById('results');
			this.location = widget.preferenceForKey('location');
			this.setDragAndDrop();
			this.isLocked = false;
			this.getWebcamsForCity();			
		}, 
		
		/* Get the location ID in function of the city name */
		getWebcamsForCity: function(city) {
			this.isLocked = true;
			if (city && city.length > 0) {
				this.location = city;
			}
			document.getElementById("locationInput").value = this.location;
			this.indicator.setAttribute("style", "display: block");
			this.webcam.setAttribute("style", "display: none");		
			this.clearElement(this.webcams);
			this.clearElement(this.results);						
			//var query = 'http://api.webcams.travel/rest?method=wct.search.webcams&devid=e72f457198776d58da3b6833be603675&query='+encodeURI(this.location);
			var query = 'http://api.webcams.travel/rest?method=wct.search.webcams&devid=e72f457198776d58da3b6833be603675&query='+encodeURI(this.location);
			var that = this;
			try {
				var ajax = widget.httpGet(query, null,
					function(data){
						var n = 0;
						var webcams = $('webcams:eq(0)', $(data));
						var count = $('count:eq(0)', webcams).text();
						if (count != "0") {
							$(data).find('webcam').each(function() {
								var webcam = $(this);
								n++;
								/* Get webcam data */
								var webcamId = $('webcamid:eq(0)', webcam).text();
								var title= $('title:eq(0)', webcam).text();
								var url= $('url:eq(0)', webcam).text();
								var thumbnailUrl = $('thumbnail_url:eq(0)', webcam).text();
								var image = 'http://images.webcams.travel/webcam/'+webcamId+'.jpg';
								/* Display preview thumbnails */
								var displayImg = document.createElement("img");
								displayImg.setAttribute('src', thumbnailUrl);
								displayImg.setAttribute('alt', title);
								displayImg.setAttribute('title', title);
								displayImg.setAttribute('class', 'thumbnail clickable');
								displayImg.setAttribute('onclick', 'webcams.selectWebcam('+webcamId+', this.title); return false;');
								that.webcams.appendChild(displayImg);
							});						
						}
						/* Display results */
						if (n>0) {
							that.results.appendChild(document.createTextNode(n+" webcam(s) found for '"+that.location+"'."));
						} else {						
							that.results.appendChild(document.createTextNode("No webcam found for '"+that.location+"'."));
						}
						that.indicator.setAttribute("style", "display: none");
						that.webcam.setAttribute("style", "display: block");		
						that.isLocked = false;
					}
				);		
			} catch(e) { 
				this.log(e.message);
			}
		},
		
		/* Display a webcam given its ID */
		selectWebcam: function(webcamId, title) {
			this.clearElement(this.photo);
			var photoImg = document.createElement("img");
			photoImg.setAttribute('src', 'http://images.webcams.travel/webcam/'+webcamId+'.jpg');
			photoImg.setAttribute('width', '320');
			photoImg.setAttribute('height', '240');
			photoImg.setAttribute('alt', title);
			photoImg.setAttribute('title', title);
			photoImg.setAttribute('class', 'thumbnail clickable');
			photoImg.setAttribute('onclick', 'webcams.unSelectWebcam(); return false;');
			this.photo.appendChild(photoImg);
			this.infos.setAttribute("style", "display: none");
			this.photo.setAttribute("style", "display: block");
		}, 
		
		/* Hide the webcam */
		unSelectWebcam: function() {
			this.infos.setAttribute("style", "display: block");
			this.photo.setAttribute("style", "display: none");		
		},
		
		/* Enable the drag and drop functionalities */
		setDragAndDrop: function() {
			var that = this;
			widget.addWidgetEventListener('http://palette.ercim.org/ns/dnd/string', 
				function(event) {
					var data = event.eventData;	
					if (typeof data == 'string') {
						if (that.isLocked == false) {
							that.getWebcamsForCity(data);
						}
					}
				}, null);		
			if (widget.bindWidgetToDropType) {
				widget.bindWidgetToDropType ('http://palette.ercim.org/ns/dnd/string');
			}		
		},
		
		/* Reset the widget display */
		clearWidget: function() {
			this.clearElement($('#location')[0]);
		},
		
		/* Clear a given element */
		clearElement: function(element) {
			if (element) {
				while (element.hasChildNodes()) {
					element.removeChild(element.firstChild);
				}
			}
		}, 
		
		/* Log error */
		log: function(message) {
			alert(message);
		}
	}