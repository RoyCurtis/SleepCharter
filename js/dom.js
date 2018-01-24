/**
 * Sleep charter, DOM handlers
 * Roy Curtis, MIT license, 2017
 */

/** Generates the left-side axis of hours */
function generateTimeAxis()
{
    var timeAxis = DOM.timeAxis = document.createElement("div");

    timeAxis.className = "axis";

    for (var h = 23; h >= 0; h--)
    {
        var hourBox = document.createElement("div");

        hourBox.className = "hour";
        hourBox.innerHTML = h < 10
            ? "0" + h // Single digit hours (e.g. 01, 02)
            : h;      // Double digit hours (e.g. 11, 12)

        hourBox.innerHTML += ":00";

        timeAxis.appendChild(hourBox);
    }

    DOM.sleepChart.appendChild(timeAxis);
}

/** Generates the top-of-page alert box */
function generateAlertBox()
{
    var alertBox = DOM.alertBox = document.createElement("div");

    alertBox.className = "alert";
    alertBox.classList.add("hidden");

    DOM.sleepChart.appendChild(alertBox);
}

function generateSleepBars()
{
    for (var i = 0, len = STATE.entries.length; i < len; i++)
    {
        var sleep   = STATE.entries[i],
            from    = sleep[0],
            to      = sleep[1],
            fromDOM = getDOMForDay(from),
            toDOM   = getDOMForDay(to);

        // Split sleeps that span across days
        if ( from.getDate() !== to.getDate() )
        {
            /** @type SleepBar */
            var bar1 = document.createElement("sleep"),
                bar2 = document.createElement("sleep");

            bar1.className = bar2.className = "broken";
            bar1.from      = bar2.from      = from;
            bar1.to        = bar2.to        = to;
            bar1.isTopBar  = true;
            bar2.isTopBar  = false;
            bar1.pairedBar = bar2;
            bar2.pairedBar = bar1;

            fromDOM.appendChild(bar1);
            toDOM.appendChild(bar2);
            DOM.sleepBars.push(bar1, bar2);
        }
        else
        {
            // Split day bar into minute segments
            /** @type SleepBar */
            var bar = document.createElement("sleep");

            bar.from = from;
            bar.to   = to;

            fromDOM.appendChild(bar);
            DOM.sleepBars.push(bar);
        }
    }
}

/**
 * Fetches day bar element for a given date. Automatically generates missing DOM elements.
 *
 * @param {Date} date
 * @returns {DayBars~Day}
 */
function getDOMForDay(date)
{
    var year  = date.getFullYear(),
        month = date.getMonth(),
        day   = date.getDate();

    // Generates object and DOM for missing year
    if ( !DOM.dayBars[year] )
    {
        var yearDiv = DOM.dayBars[year] = document.createElement("year");

        yearDiv.innerHTML = "<label>" + year + "</label>";

        DOM.sleepChart.appendChild(yearDiv);
    }

    // Generates object and DOM for missing month
    if ( !DOM.dayBars[year][month] )
    {
        var monthDiv  = DOM.dayBars[year][month] = document.createElement("month"),
            monthText = date.toLocaleString("en-us", {month: 'long'});

        monthDiv.innerHTML = "<label>" + monthText + "</label>";

        DOM.dayBars[year].appendChild(monthDiv);
    }

    // Generates object and DOM for missing day
    if ( !DOM.dayBars[year][month][day] )
    {
        var dayBar = DOM.dayBars[year][month][day] = document.createElement("day");

        dayBar.innerHTML = "<label>" + day + "</label>";

        DOM.dayBars[year][month].appendChild(dayBar);
    }

    return DOM.dayBars[year][month][day];
}

/**
 * Rescales sleep bars to the current height of the chart. Necessary because I don't know
 * how to properly use CSS for this task. This calls itself using requestAnimationFrame
 * and batches a few sleep events per frame. This prevents locking up the page.
 *
 * Note: Uses of "| 0" forces calculation into integer (rounded down)
 */
function rescaleSleeps()
{
    // Halt if we've rescaled all bars in this run
    if (STATE.rescaleIdx >= DOM.sleepBars.length)
    {
        DOM.alertBox.classList.add("hidden");
        STATE.rescaling = false;
        return;
    }
    else
    {
        STATE.rescaling = true;
        requestAnimationFrame(rescaleSleeps);
    }

    // Beginning a new run
    if (STATE.rescaleIdx === 0)
        DOM.alertBox.classList.remove("hidden");

    for (var i = 0; i < 10; i++)
        rescaleSingleSleep();

    DOM.alertBox.innerHTML = "Redrawing chart ("
        + STATE.rescaleIdx
        + "/" + DOM.sleepBars.length
        + ")...";
}

function rescaleSingleSleep()
{
    // TODO: Is there a more DRY way of doing this?
    if (STATE.rescaleIdx >= DOM.sleepBars.length)
        return;

    var bar          = DOM.sleepBars[STATE.rescaleIdx],
        from         = bar.from,
        to           = bar.to,
        height       = 0,
        minuteHeight = bar.parentNode.clientHeight / 1440;

    // Handle sleep event that spans across days
    // Note: Safe to assume a sleep event will never span more than two days
    if ( from.getDate() !== to.getDate() )
    {
        if (bar.isTopBar)
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

    STATE.rescaleIdx++;
}