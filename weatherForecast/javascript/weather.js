	var weather = {	
		initialize: function() {
			this.indicator = $('#indicator');
			this.indicator.show();
			this.pics = {
				'clear sky': 0,
				'sunny': 1, 
				'partly cloudy': 2,
				'sunny intervals': 3,
				'foggy': 6,				
				'cloudy': 8,
				'light rain drizzle': 9,
				'light showers': 10,
				'drizzle': 11,
				'light rain': 12,
				'heavy showers': 14, 
				'heavy rain': 15,
				'sleet showers night': 16,
				'sleet showers': 17,
				'sleet': 18,
				'hail showers': 20,
				'light snow': 24,
				'heavy snow': 27,
				'thundery showers night': 28,
				'thundery showers': 29
			};
			this.language = widget.preferenceForKey('language');
			this.days_french = {'Monday': 'Lundi', 'Tuesday': 'Mardi', 'Wednesday': 'Mercredi', 'Thursday': 'Jeudi', 'Friday': 'Vendredi', 'Saturday': 'Samedi', 'Sunday': 'Dimanche'};
			this.location = widget.preferenceForKey('location');
			if (this.location == 'Lausanne') {
				this.locationId = '4537';
				this.queryWeatherServer();
			} else {				
				this.getLocationIdAndQuery();
			}
		}, 
		
		/* http://www.bbc.co.uk/cgi-perl/weather/search/new_search.pl?search_query=geneva */
		/*
		<table dir="ltr" summary="Non UK results" border="0" cellpadding="0" cellspacing="0">
			<tbody>
			<!-- loop results -->			
			<tr>
				<td bgcolor="#e7f3dd" valign="top"><div class="padding:5px;"><a href="/weather/5day.shtml?world=0040" class="seasonlink"><strong>Paris</strong></a></div></td>
				<td bgcolor="#e7f3dd" valign="top"><img src="/f/t.gif" alt="" border="0" height="1" width="5"></td>
				<td bgcolor="#e7f3dd" valign="top"><div class="padding:5px;"><a href="/weather/world/country_guides/country.shtml?tt=TT003590" class="seasonlink">France</a></div></td>
				<td bgcolor="#e7f3dd" valign="top"><img src="/f/t.gif" alt="" border="0" height="1" width="5"></td>

				<td bgcolor="#e7f3dd" valign="top"><div class="padding:5px;">City</div></td>
				<td bgcolor="#e7f3dd" valign="top"><img src="/f/t.gif" alt="" border="0" height="1" width="5"></td>
				<td bgcolor="#e7f3dd" valign="top"><div class="padding:5px;"><a href="http://www.bbc.co.uk/weather/travel/city_guides/city.shtml?tt=TT003570" class="seasonlink">Average Conditions for Paris</a></div></td>
			</tr>
		*/
		
		/* Get the location ID in function of the city name */
		getLocationIdAndQuery: function() {
			var query = 'http://www.bbc.co.uk/cgi-perl/weather/search/new_search.pl?search_query='+encodeURI(this.location);
			var that = this;
			var locationId = '4537';  /* Not found => Lausanne */
			try {
				var ajax = widget.httpGet(query, null,
					function(data){
						var found = false;
						$(data).find('table').each(function() {
							var table = $(this);
							if ((!found) && (table.attr('summary') == 'Non UK results')) {
								var tbody = $('tbody:eq(0)', table);
								var tr = $('tr:eq(0)', tbody);
								var td = $('td:eq(0)', tr);
								var div = $('div:eq(0)', td);
								var a = $('a:eq(0)', div);
								var href = a.attr('href');
								locationId = href.split("?world=")[1];
								found = true;
							}
						});
						if (!found) {
							that.location = "Lausanne";
						}
						that.locationId = locationId;
						that.queryWeatherServer();						
					}
				);		
			} catch(e) { 
				alert(e.message);
			}
		},
		
		/* Send the weather query to the server */
		queryWeatherServer: function() {
			var query = 'http://feeds.bbc.co.uk/weather/feeds/rss/5day/world/'+this.locationId+'.xml';
			var that = this;
			var ajax = widget.httpGet(query, null,
				function(data){
					$('#location').append(document.createTextNode(that.location));
					var i = 0;
					$(data).find('item').each(function() {
						var item = $(this);
						var link = $('link:eq(0)', item).text();
						var title = $('title:eq(0)', item).text();
						var description = $('description:eq(0)', item).text();
						/* Title = Tuesday: sunny, Max Temp: 19°C (66°F), Min Temp: 11°C (52°F)" */
						var parts = title.split(", ");
						var part1 = parts[0].split(": ");
						var part2 = parts[1].split(": ");
						var part3 = parts[2].split(": ");
						var day = part1[0];
						var weather = part1[1];
						var maxTemp = part2[1].split(" (")[0];
						var minTemp = part3[1].split(" (")[0];
						/* Picture */
						var pic = document.createElement("img");
						pic.setAttribute("src", 'images/weather/'+that.pics[weather]);
						pic.setAttribute("alt", weather);
						pic.setAttribute("border", "1");
						$('#day'+i+'_main').append(pic);
						/* Day name */
						if (that.language == 'fr') {
							day = that.days_french[day];
						}
						if (i == 0) {
							if (that.language == 'fr') {
								day = "Aujourd'hui";
							} else {
								day = "Today";
							}
						}
						$('#day'+i+'_info').append(document.createTextNode(day));
						/* Max temp */
						$('#day'+i+'_max_temp').append(document.createTextNode(maxTemp));
						/* Min temp */
						$('#day'+i+'_min_temp').append(document.createTextNode(minTemp));
						i++;
					});
					that.indicator.hide();
				}
			);							
		}
	}