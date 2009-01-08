	/* Extend the RegExp object in order to escape special chars in the expression */
	RegExp.escape = function(text) {
		if (!arguments.callee.sRE) {
			var specials = [
				'/', '.', '*', '+', '?', '|',
				'(', ')', '[', ']', '{', '}', '\\'
			];
			arguments.callee.sRE = new RegExp(
				'(\\' + specials.join('|\\') + ')', 'g'
			);
		}
		return text.replace(arguments.callee.sRE, '\\$1');
	}

	var searchEngine = {	
		initialize: function() {
			this.previousKeyword = "";
			this.keyword = "";
			this.resultsMap = {};
			this.resultsArray = new Array();
			this.lastQuery = 0;
			this.repository = widget.preferenceForKey('repository');
			this.repositoryUrl = widget.preferenceForKey('repositoryurl');
			if (this.repository == "CoRep") {
				this.repositoryUrl = 'http://paletterep.cti.gr/';
			}
			this.queryServer();
			$('#filename').focus();
		}, 
		
		/* Send the search query to the server */
		queryServer: function(forceQuery) {
			/* Avoid useless blank spaces */
			this.keyword = jQuery.trim($('#filename').val());
			this.keywordRegExp = new RegExp("("+RegExp.escape(this.keyword)+")", "gi");					
			/* Query only if keyword is different from the previouw one not null */
			if (((forceQuery) || (this.previousKeyword != this.keyword)) && (this.keyword.length > 0)) {
				/* Remove some displayed items */
				$('#indicator').show();
				$('#noResultFound').hide();									
				$('#resultsList').hide();									
				$('#results').empty();
				/* Reset the results containers */
				/* The map contains pairs like (filename => title) */
				this.resultsMap = {};
				/* The result array contains the filenames and can be sorted */
				this.resultsArray = new Array();				
				this.previousKeyword = this.keyword;
				this.lastQuery++;
				this.sendQuery();
			}
			setTimeout("searchEngine.queryServer();", 1000); 							
		}, 
		
		/* Send the query to the repository */
		sendQuery: function() {
			switch(this.repository) {
				case "CoRep": 
					/* Common Repository */
					/* Buil the query given the preferences */
					this.query = this.repositoryUrl+'?q=and%20filename='+encodeURI(this.keyword);
					var myLastQuery = this.lastQuery;
					var that = this;
					var ajax = widget.httpGet(this.query, null,
						function(data){
							/* Display only the last query sent */
							if (myLastQuery == that.lastQuery) {
								$('#results').empty();
								if ($(data).find('TResultResource').length>0) {
									$(data).find('TResultResource').each(function() {
										var tResultResource = $(this);
										var link = $('link:eq(0)', tResultResource).text();
										var title = $('filename:eq(0)', tResultResource).text();
										/* Repository search bug (found "so" in "Jurrassic_corrected.xhtml"!) */
										if (title.match(that.keywordRegExp)) {
											that.resultsMap[title] = link;
											that.resultsArray.push(title);								
										}
									});
									if (that.resultsArray.length > 0) {
										/* Results are displayed */
										that.organizeResults();
										that.displayResults();								
									} else {
										/* No result found after the search fix */
										that.displayNoResultFound();
									}
								} else {
									/* No result found from the CoRep */
									that.displayNoResultFound();
								}
							}
						}
					);					
					break;
				default:
					/* Other server */
					/* Buil the query given the preferences */
					this.query = this.repositoryUrl;
					var myLastQuery = this.lastQuery;
					var that = this;
					var ajax = widget.httpGet(this.query, null,
						function(data){
							/* Display only the last query sent */
							if (myLastQuery == that.lastQuery) {
								$('#results').empty();
								var files;
				                /* Check that the response contains an html document */									
				                if (data.match(/html/,'i')) {
				                    files = that.extractFilesFromIndex(data,
										function (s) {
											return (s.charAt(s.length - 1) != '/')
										}
									);
								}									
								if (files.length > 0) {
									for (var i=0; i<files.length; i++) {
										var file = files[i];
										var link = file['link'];
										if (!link.match(/^(http|ftp):\/\//, 'gi')) {
											link = this.repositoryUrl+file['link'];										
										}
										var title = file['title'];
										/* Repository search bug (found "so" in "Jurrassic_corrected.xhtml"!) */
										if (title.match(that.keywordRegExp)) {
											that.resultsMap[title] = link;
											that.resultsArray.push(title);								
										}
									}
									if (that.resultsArray.length > 0) {
										/* Results are displayed */
										that.organizeResults();
										that.displayResults();								
									} else {
										/* No result found after the search fix */
										that.displayNoResultFound();
									}
								} else {
									/* No result found from the CoRep */
									that.displayNoResultFound();
								}
							}
						}
					);										
					break;
			}
		},
		
        /* Spots file names in <a href="(url)">(file name)</a> sub-expressions inside data */
        extractFilesFromIndex:function(data, filter) {
			var rext = new RegExp('href\s?=[\'\"](.+?)[\'\"]>(.+?)\<\/a\>','mgi');
			var m;
			var files = [];
			while (null != (m = rext.exec(data))) {
				var link = m[1];
				var title = m[2];				
				if ((! filter) || filter(m[1])) {
					files.push({'link': m[1], 'title': m[2]});
				}
			}
			return files;
        },
		
		/* Display the results in a list */
		displayResults: function() {
			for (var i=0; i<this.resultsArray.length; i++) {
				var title = this.resultsArray[i];
				var link = this.resultsMap[title];
				/* <span/> */
				var htmlLink = document.createElement("span");
				htmlLink.target = "_blank";
				//var htmlLinkText = document.createTextNode(this.highlightText(title));
				htmlLink.innerHTML = this.highlightText(title);
				/* <li/> */
				var htmlLi = document.createElement("li");
				htmlLi.setAttribute("onClick", "window.open('"+link+"');");
				htmlLi.appendChild(htmlLink);
				/* Add Drag and Drop information */
				if (widget.addDragData) {
					var regExpXTD = new RegExp('\.xtd$','mgi');
					var fileType = 'http://palette.ercim.org/ns/dnd/file'
					if (title.match(regExpXTD)) {
						fileType = 'http://palette.ercim.org/ns/dnd/file/xtiger-template';
					}
					widget.addDragData (
						htmlLi, 
						fileType, 
						{link: link, title: title}, 
						title
					);
				}
				/* Append to the list */
				$('#results').append(htmlLi);		
			}
			/* Display the results */
			$('#noResultFound').hide();									
			$('#resultsList').show();
			$('#indicator').hide();			
		}, 
		
		/* Display a no result found message */
		displayNoResultFound: function() {
			$('#resultsList').hide();					
			$('#indicator').hide();
			$('#noResultKeyword').empty();
			$('#noResultKeyword').append(document.createTextNode(this.keyword));
			$('#noResultFound').show();	
		}, 
		
		/* Organize the results in order to display them sorted by index of keyword, i.e. the filenames starting with the keyword are displayed at top */
		organizeResults: function() {
			var positions = new Array();
			this.resultsArray.sort();
			this.resultsArray.reverse();
			for (var i=0; i<this.resultsArray.length; i++) {
				var title = this.resultsArray[i];
				/* Get the position of the keyword in the filename */
				var pos = title.search(this.keywordRegExp);
				var extension = title.substr(title.lastIndexOf(".")+1);				
				/* Filter if "started by" has been checked */
				if (($('#startingBy').attr("checked") == false) || (pos == 0)) {
					/* Filter if "template only" has been checked */
					if (($('#templatesOnly').attr("checked") == false) || (extension == "xtd")) {
						if (positions[pos] == null) {
							positions[pos] = new Array();
						}
						positions[pos].push(title);
					}
				}
			}				
			/* Sort the results in function of the index of the keyword */
			this.resultsArray = new Array();
			for (var i in positions) {
				var group = positions[i];
				while (group.length > 0) {
					var title = group.pop();
					this.resultsArray.push(title);					
				}
			}
		}, 
		
		/* Highlight some keyword in a text */
		highlightText: function(text) {
			return text.replace(this.keywordRegExp, "<b>$1</b>");			
		},
		
		/* Display a message */
		displayMessage: function(message) {
			if (console && console.log) {
				console.log(message);
			} else {
				alert(message);
			}
		}
	}