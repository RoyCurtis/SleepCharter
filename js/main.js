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
    /** @type HTMLElement */
    selected: null
};

/*
 * Program logic
 */

function main()
{
    DOM.sleepChart = document.querySelector("#sleepChart");

    DOM.sleepChart.onmouseover = function (evt)
    {
        /** @type HTMLElement */
        var selected = evt.target;

        // Do nothing if already hovering over same bar
        if (STATE.selected === selected)
            return;

        // Remove selection class from previously selected bar
        if (STATE.selected !== null)
        {
            STATE.selected.classList.remove("selected");

            if (STATE.selected.pairedBar)
                STATE.selected.pairedBar.classList.remove("selected");

            STATE.selected = null;
        }

        // If started hovering over a(nother) bar
        if ( selected.classList.contains("bar") )
        {
            STATE.selected = selected;
            selected.classList.add("selected");

            if (STATE.selected.pairedBar)
                STATE.selected.pairedBar.classList.add("selected");

            console.log(selected.from, selected.to);
        }
    };

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
        var sleep        = STATE.entries[i],
            from         = sleep[0],
            to           = sleep[1],
            fromDOM      = getDOMForDay(from),
            toDOM        = getDOMForDay(to),
            minuteHeight = fromDOM.clientHeight / 1440;

        // Split sleeps that span across days
        if ( from.getDate() !== to.getDate() )
        {
            var bar1  = document.createElement("div"),
                bar2  = document.createElement("div"),
                from1 = new Date(from),
                to1   = new Date(from),
                from2 = new Date(to),
                to2   = new Date(to);

            to1.setHours(23, 59);
            from2.setHours(0, 0);

            // Split day bar into minute segments
            var height1 = 1440 - getMinutesOfDay(from1),
                height2 = getMinutesOfDay(to2);

            bar1.className = bar2.className = "bar broken";
            bar1.from      = bar2.from      = from;
            bar1.to        = bar2.to        = to;
            bar1.pairedBar = bar2;
            bar2.pairedBar = bar1;

            bar1.style.top    = "0px";
            bar1.style.height = (height1 * minuteHeight) + "px";
            bar2.style.bottom = "0px";
            bar2.style.height = (height2 * minuteHeight) + "px";

            fromDOM.appendChild(bar1);
            toDOM.appendChild(bar2);
        }
        else
        {
            // Split day bar into minute segments
            var bar    = document.createElement("div"),
                height = getMinutesOfDay(to) - getMinutesOfDay(from);

            bar.className = "bar";
            bar.from      = from;
            bar.to        = to;

            bar.style.bottom = (getMinutesOfDay(from) * minuteHeight) + "px";
            bar.style.height = (height * minuteHeight) + "px";
        }

        fromDOM.appendChild(bar);
    }

    console.log(DOM.dayBars);
}

/**
 * @param {Date} date
 * @returns {HTMLElement}
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
        var dayBar = DOM.dayBars[year][month][day] = document.createElement("div");
        dayBar.className     = "day";
        dayBar.dataset.year  = year;
        dayBar.dataset.month = month;
        dayBar.dataset.day   = day;

        DOM.sleepChart.appendChild(dayBar);
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
 * Utility
 */

/**
 * @param {Date} date
 */
function getMinutesOfDay(date)
{
    return (date.getHours() * 60) + date.getMinutes();
}

/*
 * Program entry
 */

main();