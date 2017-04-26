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
var GOOGLE_DATETIME_REGEX = /(\d{2}).(\d{2}).(\d{4}) (\d{2}):(\d{2}):(\d{2})/;

/** Global container for DOM element references */
var DOM = {
    /** @type HTMLElement */
    sleepChart: null,
    /** @type HTMLElement */
    timeAxis:   null,
    /** @type HTMLElement */
    alertBox:   null,
    /** @type DayBars */
    dayBars:    {},
    /** @type SleepBar[] */
    sleepBars:  []
};

/** Global container for program state */
var STATE = {
    /**
     * Array of sleep events, processed from an external CSV file
     *
     * @type Array.<SleepEvent>
     */
    entries: [],

    /** Current progress of chart's rescaling process */
    rescaleIdx: 0,

    /** Whether or not a rescale is in progress */
    rescaling: false,

    /**
     * Currently selected (e.g. hovered over) sleep bar
     *
     * @type SleepBar
     */
    selected: null
};

/*
 * Program logic
 */

function main(file, selector)
{
    DOM.sleepChart = document.querySelector(selector);

    if (DOM.sleepChart === null)
        throw new Error("No element found with given selector: " + selector);

    fetch(file)
        .then(processResponse)
        .then(processData)
        .then(processDOM)
        .then(finalize)
        .catch(processError);
}

function processResponse(response)
{
    if (!response.ok)
        throw new Error("Response is not OK: " + response);
    else
        return response.text();
}

/** Note: data comes from what processResponse returns, in the fetch promise chain */
function processData(data)
{
    STATE.entries = parseCSV(data);
    STATE.entries.sort(sortByFromTimes);
}

function processDOM()
{
    DOM.sleepChart.onmouseover = onSleepChartMouseOver;
    DOM.sleepChart.onwheel     = onSleepChartMouseWheel;
    DOM.sleepChart.onclick     = onSleepChartClick;
    document.body.onresize     = onSleepChartResize;

    // Remove default error message
    DOM.sleepChart.innerHTML = "";
    DOM.sleepChart.classList.remove("nojs");

    generateAlertBox();
    generateTimeAxis();
    generateSleepBars();
}

function finalize()
{
    console.log("Logging STATE and DOM globals. . .", STATE, DOM);
    onSleepChartResize();
}

/** @param {Error} error */
function processError(error)
{
    if (DOM.alertBox)
    {
        DOM.alertBox.classList.remove("hidden");
        DOM.alertBox.innerHTML = "Error: " + error.message;
    }

    console.error(error);
}
