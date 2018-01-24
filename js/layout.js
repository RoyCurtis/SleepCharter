/**
 * Sleep charter, layout engine
 * Roy Curtis, MIT license, 2017
 */

/*
 * This script, for the most part, implements a custom layout engine for the graph. Why?
 * Because I just can't figure out how to correctly use CSS to make a graph like this.
 *
 * Previously, I used flexbox. That worked OK on Chrome, but nested flexbox layouts caused
 * major lag on Firefox, Safari and mobile devices.
 */

/** Calculate metrics for the time axis */
function layoutTimeAxis()
{
    var timeAxis = DOM.timeAxis;
    var height, left, top;

    if (document.body.clientHeight > 550)
    {
        height = document.body.clientHeight
            - 20   // 20px top margin
            - 128; // 128px bottom margin

        left = DOM.sleepChart.offsetLeft
            + 16; // 16px left margin;

        top = DOM.sleepChart.offsetTop
            + 20; // 20px top margin;
    }
    else
    {
        height = document.body.clientHeight
            - 20   // 20px top margin
            - 72; // 72px bottom margin

        left = DOM.sleepChart.offsetLeft
            + 16; // 16px left margin;

        top = DOM.sleepChart.offsetTop
            + 20; // 20px top margin;
    }

    timeAxis.style.height = height + "px";
    timeAxis.style.left   = left + "px";
    timeAxis.style.top    = top + "px";
}

function layoutSleepBars()
{
    DOM.sleepChart.style.height = document.body.clientHeight + "px";

    /** @type HTMLElement */
    var lastYear = null;

    for (var yearNum in DOM.dayBars)
    {
        if ( !DOM.dayBars.hasOwnProperty(yearNum) )
            continue;

        layoutYear(DOM.dayBars[yearNum], lastYear);
        lastYear = DOM.dayBars[yearNum];
    }
}

function layoutYear(year, lastYear)
{
    year.style.height = document.body.clientHeight + "px";

    /** @type HTMLElement */
    var lastMonth = null;
    var yearWidth = 0;

    if (lastYear)
    {
        var left = lastYear.offsetLeft
            + lastYear.offsetWidth;

        year.style.left = left + "px";
    }

    for (var monthNum in year)
    {
        if ( !year.hasOwnProperty(monthNum) )
            continue;

        layoutMonth(year[monthNum], lastMonth);
        lastMonth  = year[monthNum];
        yearWidth += year[monthNum].offsetWidth;
    }

    year.style.width = yearWidth + "px";
}

function layoutMonth(month, lastMonth)
{
    month.style.height = document.body.clientHeight + "px";

    /** @type HTMLElement */
    var lastDay  = null;
    var dayCount = 0;

    if (lastMonth)
    {
        var left = lastMonth.offsetLeft
            + lastMonth.offsetWidth;

        month.style.left = left + "px";
    }

    for (var dayNum in month)
    {
        if ( !month.hasOwnProperty(dayNum) )
            continue;

        layoutDay(month[dayNum], lastDay);
        lastDay = month[dayNum];

        dayCount++;
    }

    month.style.width = (16 * dayCount) + "px";
}

function layoutDay(day, lastDay)
{
    var height;

    if (document.body.clientHeight > 550)
        height = document.body.clientHeight
            - 16   // 16px top margin
            - 128; // 128px bottom margin
    else
        height = document.body.clientHeight
            - 16   // 16px top margin
            - 72; // 72px bottom margin

    day.style.height = height + "px";
}