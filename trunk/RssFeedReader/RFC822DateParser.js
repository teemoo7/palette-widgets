// You could tell me : Hey Jérôme ! Why don't you use the Date.parse() method to parse your date strings ?
// The answer is : Because the ECMAScript standard does not specify the way Date.parse() behaves :D !

function RFC822DateParser(dateString)
{
	this.dateString = dateString;
}

RFC822DateParser.prototype.parse = function(force2k)
{
	var pattern = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s([0-9]{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s([0-9]{2,4})\s([0-9]{2})\:([0-9]{2})(?:\:([0-9]{2}))*\s(?:(UT|CET|GMT|EST|EDT|CST|CDT|MST|MDT|PST|PDT|Z|A|M|N|Y)|(?:(\+|-)([0-9]{4})))/i;
	var result = pattern.exec(this.dateString);
	
	if (result)
	{
	
		var year, month, day, hour, minute, second, timeOffset;
	
		// The only thing that could be missing, regarding the basic time is the 'ss' value.
		if (result[7]) second = result[7]; else second = '0';
			
		// Maybe the year is in the 2DIGITS format, if force 2k enabled we set it in the 4DIGITS format.
		year 	= (result[4].length == 2 && force2k) ? '20' + result[4] : result[4];
		month 	= this.verboseMonthToNumeric(result[3]);
		day 	= result[2];
		hour	= result[5];
		minute	= result[6];
		ms		= 0;
		
		// Timezone detection.
		if (result[8])
			timeOffset = this.computeOffsetFromZone(result[8]);
		else
			timeOffset = this.computeOffsetFromTime(result[9], result[10]);
		
		// We simply transform strings as integer before the Date object instanciation.
		// Month was already transformed as an integer in the RFC822DateParser.verboseMonthToNumeric method.
		year 	= parseInt(year);
		day		= parseInt(day);
		hour	= parseInt(hour);
		minute	= parseInt(minute);
		second	= parseInt(second);
		
		return new Date(year, month, day, hour, minute, second, ms);
	}
	else
		return null;
}

RFC822DateParser.prototype.verboseMonthToNumeric = function(verboseMonth)
{
	var numericMonth;
	
	switch(verboseMonth)
	{
		case 'Jan':
			numericMonth = 0;
		break;
		
		case 'Feb':
			numericMonth = 1;
		break;
		
		case 'Mar':
			numericMonth = 2;
		break;
		
		case 'Apr':
			numericMonth = 3;
		break;
		
		case 'May':
			numericMonth = 4;
		break;
		
		case 'Jun':
			numericMonth = 5;
		break;
		
		case 'Jul':
			numericMonth = 6;
		break;
		
		case 'Aug':
			numericMonth = 7;
		break;
		
		case 'Sep':
			numericMonth = 8;
		break;
		
		case 'Oct':
			numericMonth = 9;
		break;
		
		case 'Nov':
			numericMonth = 10;
		break;
		
		case 'Dec':
			numericMonth = 11;
		break;
	}
	
	return numericMonth;
}

RFC822DateParser.prototype.computeOffsetFromZone = function(timeZone)
{
	var offset = 0;

	switch (timeZone)
	{
		case 'EST':
			offset -= 300;
		break;
		
		case 'EDT':
			offset -= 240;
		break;
		
		case 'CST':
			offset -= 360
		break;
		
		case 'CDT':
			offset -= 300;
		break;
		
		case 'MST':
			offset -= 420;
		break;
		
		case 'MDT':
			offset -= 360;
		break;
		
		case 'PST':
			offset -= 480;
		break;
		
		case 'PDT':
			offset -= 420;
		break;
		
		case 'A':
			offset -= 60;
		break;
		
		case 'M':
			offset -= 720;
		break;
		
		case 'N':
			offset += 60;
		break;
		
		case 'Y':
			offset += 720;
		break;
	}
	
	return offset;
}

RFC822DateParser.prototype.computeOffsetFromTime = function(operator, timeString)
{
	var hours 	= timeString.substring('0','2');
	var minutes = timeString.substring('2','4');
	var offset;
	
	hours 	= parseInt(hours);
	minutes = parseInt(minutes);
	
	offset = hours * 60 + minutes;
	
	return (operator == '+') ? offset : offset *= -1;
}