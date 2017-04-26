/**
 * Sleep charter, DOM handlers
 * Roy Curtis, MIT license, 2017
 */

/** Generates the left-side axis of hours */
function generateTimeAxis()
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
}

/**
 * Generates the top-of-page alert box
 *
 * @return {HTMLElement}
 */
function generateAlertBox()
{
    var alertBox = DOM.alertBox = document.createElement("div");

    alertBox.className = "alert";
    alertBox.classList.add("hidden");

    DOM.sleepChart.appendChild(alertBox);
}

function generateDayBars()
{
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
            /** @type SleepBar */
            var bar = document.createElement("div");

            bar.className = "bar";
            bar.from      = from;
            bar.to        = to;

            fromDOM.appendChild(bar);
            DOM.sleepBars.push(bar);
        }
    }
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