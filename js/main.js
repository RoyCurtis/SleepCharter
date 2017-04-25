/**
 * Sleep charter, main program
 * Roy Curtis, MIT license, 2017
 */

/*
 * Global state
 */

/**
 * Regex pattern for Google Sheets default date/time format (DD/MM/YYYY HH:mm:ss).
 *
 * Capture groups:
 * 1: DD (day)
 * 2: MM (month)
 * 3: YYYY (year)
 * 4: HH (24 hour)
 * 5: mm (minute)
 * 6: ss (second)
 * @type {RegExp}
 */
var GOOGLE_DATETIME_REGEX =
    /(\d{2}).(\d{2}).(\d{4}) (\d{2}):(\d{2}):(\d{2})/;

var DOM = {
    /** @type HTMLElement */
    sleepChart: null,
    dayBars:    {}
};

var STATE = {
    entries:  [],
    earliest: new Date(),
    latest:   new Date()
};

/*
 * Program logic
 */

function main()
{
    DOM.sleepChart = document.querySelector("#sleepChart");

    fetch('sleepData.csv')
        .then(processResponse)
        .then(processData)
        .then(generateDOM)
        .catch(processError);
}

function processResponse(response)
{
    if (!response.ok)
        throw new Error("Response is not OK", response);
    else
        return response.text();
}

function processData(data)
{
    STATE.entries = parseCSV(data);

    // Ensure entries are sorted by earliest from-time to latest from-time
    STATE.entries.sort( function(a, b)
    {
        var from = a[0].getTime(),
            to   = b[0].getTime();

        if      (from > to) return 1;
        else if (from < to) return -1;
        else                return 0;
    });

    console.log(STATE.entries);
}

function generateDOM()
{
    for (var i = 0, len = STATE.entries.length; i < len; i++)
    {
        var sleep = STATE.entries[i],
            from  = sleep[0],
            to    = sleep[1];

        getDOMForDay(from);
        getDOMForDay(to);

        var bar = document.createElement("div");
        bar.className = "day";
    }

    console.log(DOM.dayBars);
}

/**
 * @param {Date} date
 */
function getDOMForDay(date)
{
    var year  = date.getFullYear(),
        month = date.getMonth(),
        day   = date.getDate();

    if ( !DOM.dayBars[year] )
        DOM.dayBars[year] = new Array(12);

    if ( !DOM.dayBars[year][month] )
        DOM.dayBars[year][month] = new Array(31);

    if ( !DOM.dayBars[year][month][day] )
    {
        var bar = DOM.dayBars[year][month][day] = document.createElement("div");
        bar.className = "day";
        bar.dataset.year  = year;
        bar.dataset.month = month;
        bar.dataset.day   = day;

        DOM.sleepChart.appendChild(bar);
    }

    return DOM.dayBars[year][month][day];
}

function processError(error)
{
    console.error(error);
}

/*
 * Data parsing
 */

/** @param {string} csv */
function parseCSV(csv)
{
    var lines  = csv.split('\n');

    // Remove CSV header
    lines.shift();
    return lines.map(parseCSVLine);
}

/** @param {string} line */
function parseCSVLine(line)
{
    var ends  = line.split(','),
        begin = parseDate(ends[0]),
        end   = parseDate(ends[1]);

    // Validate date pair
    if (end.getTime() - begin.getTime() <= 0)
        throw new Error("End time is before begin time: " + line);

    return [begin, end];
}

/**
 * Parse Google Sheets default date format (DD/MM/YYYY HH:mm:ss) into Date object
 *
 * @param {string} date
 * @return {Date}
 */
function parseDate(date)
{
    var matches = date.match(GOOGLE_DATETIME_REGEX);

    if (!matches)
        throw new Error("Date/time failed to parse: " + date);
    else if (matches.index !== 0 || matches.length !== 7)
        throw new Error("Date/time parsed incorrectly: " + date);

    return new Date(
        matches[3], matches[2], matches[1],
        matches[4], matches[5], matches[6]
    );
}

/*
 * Program entry
 */

main();