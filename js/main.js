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

var STATE = {
    entries: []
};

/*
 * Program logic
 */

function main()
{
    fetch('sleepData.csv')
        .then(processResponse)
        .then(processData)
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
    console.log(STATE.entries);
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
    var lines = csv.split('\n');

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
    else if (matches.index != 0 || matches.length != 7)
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