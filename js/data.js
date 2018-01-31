/**
 * Sleep charter, data handlers
 * Roy Curtis, MIT license, 2017
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
var GOOGLE_DATETIME_REGEX = /(\d{2}).(\d{2}).(\d{4}) (\d{2}):(\d{2}):(\d{2})/;

/**
 * Parses the given raw CSV data into an array of {@link SleepEvent}s
 *
 * @param {string} csv
 * @returns {SleepEvent[]}
 */
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
    else if (matches.index !== 0 || matches.length !== 7)
        throw new Error("Date/time parsed incorrectly: " + date);

    return new Date(
        matches[3], matches[2] - 1, matches[1],
        matches[4], matches[5], matches[6]
    );
}

/**
 * Takes a small amount of the end of the given entries, then timeshifts them by a certain
 * amount of days, and adds them to the end
 *
 * @param {SleepEvent[]} data
 * @return {SleepEvent[]}
 */
function predictEvents(data)
{
    var MAX_PREDICTED_EVENTS = 30;

    /** @type SleepEvent[] */
    var future = data.slice(-MAX_PREDICTED_EVENTS);

    if (future.length < MAX_PREDICTED_EVENTS)
        throw new Error("Not enough events to predict the future...");

    var first = future[0],
        last  = future[MAX_PREDICTED_EVENTS - 1];

    // First, find difference in days between first and last...
    var daysDiff = getDaysSinceEpoch(last[0]) - getDaysSinceEpoch(first[0]);

    for (var i = 0; i < future.length; i++)
    {
        // Make copies of the tuples and dates...
        future[i]    = future[i].slice();
        future[i][0] = new Date( future[i][0].valueOf() );
        future[i][1] = new Date( future[i][1].valueOf() );

        // Shift by difference in dates
        future[i][0].setDate(future[i][0].getDate() + daysDiff);
        future[i][1].setDate(future[i][1].getDate() + daysDiff);

        // Shift by a few hours...
        // TODO: lazily done. smarter way to do this? needs adjusting if MAX changes
        future[i][0].setHours(future[i][0].getHours() + 3);
        future[i][1].setHours(future[i][1].getHours() + 3);

        future[i].isPrediction = true;
        data.push(future[i]);
    }

    return data;
}