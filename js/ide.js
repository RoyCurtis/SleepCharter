/**
 * Sleep charter, IDE JSDoc definitions
 * Roy Curtis, MIT license, 2017
 *
 * This file is simply for IDEs (e.g. WebStorm). It defines types using JSDoc, to improve
 * autocompletion, warnings, etc.
 */

/*
 * Chart types
 */

/**
 * Hierarchical container for the day bars that make up the graph. Structured as:
 *
 * * Integer index to a year's DIV element (e.g. `dayBars[2017]`)
 * * Integer index to a month's DIV element (e.g. `dayBars[2017][2]`)
 * * Integer index to a day's DIV element (e.g. `dayBars[2017][2][26]`)
 *
 * @typedef {Object.<number, DayBars~Month>} DayBars
 */

/**
 * A DIV element held by a year container, that contains day bars.
 *
 * @typedef {HTMLDivElement} DayBars~Month
 */

/**
 * A DIV element that represents a sleep event on the chart
 *
 * @typedef {HTMLDivElement} SleepBar
 * @prop {Date} from Gets the start date and time of this sleep bar's event
 * @prop {Date} to Gets the end date and time of this sleep bar's event
 */

/**
 * A tuple for a sleep event. First and second elements are start and end dates.
 *
 * @typedef {[Date, Date]} SleepEvent
 */

/*
 * Vendor types
 */

// The following is necessary because WebStorm cannot correctly analyse fetch.js

/** Begins an asynchronous fetch for an external resource */
var fetch   = function() {};
/** Chains a callback to execute after the fetch, or a prior callback, is done */
fetch.then  = function() {};
/** Chains a callback to execute if the fetch, or any callbacks, throw an error */
fetch.catch = function() {};