/**
 * Sleep charter, main program
 * Roy Curtis, MIT license, 2017
 */

/*
 * Global state
 */

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

    generateSleepBars();
    generateAlertBox();
    generateTimeAxis();
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
