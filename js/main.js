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
    /** @type HTMLElement */
    timeAxis:   null,
    /** @type HTMLElement */
    alertBox:   null,
    dayBars:    {},
    sleepBars:  []
};

var STATE = {
    entries:    [],
    /** @type HTMLElement */
    selected:   null,
    rescaleIdx: 0,
    rescaling:  false
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

            STATE.selected.title = "";
            STATE.selected       = null;
        }

        // If started hovering over a(nother) bar
        if ( selected.classList.contains("bar") )
        {
            STATE.selected = selected;
            selected.classList.add("selected");

            var from   = STATE.selected.from,
                to     = STATE.selected.to,
                length = ( to.getTime() - from.getTime() ) / 1000 / 60;

            STATE.selected.title  = "From: " + STATE.selected.from + "\n";
            STATE.selected.title += "To: " + STATE.selected.to + "\n";
            STATE.selected.title += "Length: " + length + " minutes\n";

            if (STATE.selected.pairedBar)
                STATE.selected.pairedBar.classList.add("selected");
        }
    };

    DOM.sleepChart.onwheel = function(e)
    {
        if (e.ctrlKey || e.shiftKey)
            return;

        // Chrome uses deltaMode 0 (pixels)
        // Firefox uses deltaMode 1 (lines)
        DOM.sleepChart.scrollLeft += e.deltaMode === 0
            ? e.deltaY
            : e.deltaY * 33;
        e.preventDefault();
    };

    fetch('sleepData.csv')
        .then(processResponse)
        .then(processData)
        .then(generateDOM)
        .then(finalize)
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
}

function generateDOM()
{
    var timeAxis = DOM.timeAxis = document.createElement("div");

    timeAxis.className = "axis";

    for (var h = 0; h < 24; h++)
    {
        var hourBox = document.createElement("div");

        hourBox.className = "hour";
        hourBox.innerHTML = h < 10
            ? "0" + h
            : h;

        hourBox.innerHTML += ":00";

        timeAxis.appendChild(hourBox);
    }

    DOM.sleepChart.appendChild(timeAxis);

    var alertBox = DOM.alertBox = document.createElement("div");

    alertBox.className = "alert";
    alertBox.classList.add("hidden");

    DOM.sleepChart.appendChild(alertBox);

    for (var i = 0, len = STATE.entries.length; i < len; i++)
    {
        var sleep        = STATE.entries[i],
            from         = sleep[0],
            to           = sleep[1],
            fromDOM      = getDOMForDay(from),
            toDOM        = getDOMForDay(to);

        // Split sleeps that span across days
        if ( from.getDate() !== to.getDate() )
        {
            var bar1 = document.createElement("div"),
                bar2 = document.createElement("div");

            bar1.className = bar2.className = "bar broken";
            bar1.from      = bar2.from      = from;
            bar1.to        = bar2.to        = to;
            bar1.isTopBar  = true;
            bar1.pairedBar = bar2;
            bar2.pairedBar = bar1;

            fromDOM.appendChild(bar1);
            toDOM.appendChild(bar2);
            DOM.sleepBars.push(bar1, bar2);
        }
        else
        {
            // Split day bar into minute segments
            var bar = document.createElement("div");

            bar.className = "bar";
            bar.from      = from;
            bar.to        = to;

            fromDOM.appendChild(bar);
            DOM.sleepBars.push(bar);
        }
    }
}

function finalize()
{
    console.log(STATE, DOM);

    document.body.onresize = function()
    {
        // This is necessary, because making fixed elements work with em/vh heights whilst
        // accounting for scrollbar offset, is just too difficult...
        DOM.timeAxis.style.height = DOM.sleepBars[0].parentNode.clientHeight + "px";
        STATE.rescaleIdx = 0;

        if (!STATE.rescaling)
            rescaleSleeps();
    };

    document.body.onresize();
}

function processError(error)
{
    console.error(error);
}

/*
 * DOM handling
 */

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
    {
        var yearDiv = DOM.dayBars[year] = document.createElement("div");
        yearDiv.className    = "year";
        yearDiv.dataset.year = year;
        yearDiv.innerHTML    = "<label>" + year + "</label>";

        DOM.sleepChart.appendChild(yearDiv);
    }

    if ( !DOM.dayBars[year][month] )
    {
        var monthDiv  = DOM.dayBars[year][month] = document.createElement("div"),
            monthText = date.toLocaleString("en-us", {month: 'long'});
        monthDiv.className     = "month";
        monthDiv.dataset.month = month;
        monthDiv.innerHTML     = "<label>" + monthText + "</label>";

        DOM.dayBars[year].appendChild(monthDiv);
    }

    if ( !DOM.dayBars[year][month][day] )
    {
        var dayBar = DOM.dayBars[year][month][day] = document.createElement("div");
        dayBar.className   = "day";
        dayBar.dataset.day = day;
        dayBar.innerHTML   = "<label>" + day + "</label>";

        DOM.dayBars[year][month].appendChild(dayBar);
    }

    return DOM.dayBars[year][month][day];
}

/**
 * Note: Uses of "| 0" forces calculation into integer (rounded down)
 */
function rescaleSleeps()
{
    if (STATE.rescaleIdx >= DOM.sleepBars.length)
    {
        DOM.alertBox.classList.add("hidden")
        STATE.rescaling = false;
        return;
    }
    else
    {
        STATE.rescaling = true;
        requestAnimationFrame(rescaleSleeps);
    }

    if (STATE.rescaleIdx === 0)
        DOM.alertBox.classList.remove("hidden");

    var bar          = DOM.sleepBars[STATE.rescaleIdx],
        from         = bar.from,
        to           = bar.to,
        height       = 0,
        minuteHeight = bar.parentNode.clientHeight / 1440;

    if ( from.getDate() !== to.getDate() )
    {
        if (bar.isTopBar === true)
        {
            height = 1440 - getMinutesOfDay(from);
            bar.style.top    = "0px";
            bar.style.height = ( (height * minuteHeight) | 0 ) + "px";
        }
        else
        {
            height = getMinutesOfDay(to);
            bar.style.bottom = "0px";
            bar.style.height = ( (height * minuteHeight) | 0 ) + "px";
        }
    }
    else
    {
        height = getMinutesOfDay(to) - getMinutesOfDay(from);
        bar.style.bottom = ( (getMinutesOfDay(from) * minuteHeight) | 0 ) + "px";
        bar.style.height = ( (height * minuteHeight) | 0 ) + "px";
    }

    DOM.alertBox.innerHTML = "Redrawing graph ("
        + STATE.rescaleIdx
        + "/" + DOM.sleepBars.length
        + ")...";
    STATE.rescaleIdx++;
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
        matches[3], matches[2] - 1, matches[1],
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