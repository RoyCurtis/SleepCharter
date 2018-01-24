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
            - 20   // top margin
            - 145; // bottom margin

        left = DOM.sleepChart.offsetLeft
            + 16; // left margin

        top = DOM.sleepChart.offsetTop
            + 20; // top margin
    }
    else
    {
        height = document.body.clientHeight
            - 20  // top margin
            - 64; // bottom margin

        left = DOM.sleepChart.offsetLeft
            + 16; // left margin

        top = DOM.sleepChart.offsetTop
            + 4; // top border
    }

    timeAxis.style.height = height + "px";
    timeAxis.style.left   = left + "px";
    timeAxis.style.top    = top + "px";
}

function layoutSleepBars()
{
    DOM.sleepChart.style.height = document.body.clientHeight + "px";

    // Recursively calculate metrics for year, month, and day bars
    for (var yearNum in DOM.dayBars)
    {
        if ( !DOM.dayBars.hasOwnProperty(yearNum) )
            continue;

        layoutYear(DOM.dayBars[yearNum]);
    }

    // Calculate positions for date labels (because relative positioning doesn't work)
    var yearLabels  = document.querySelectorAll("sleep-chart > year > label");
    var monthLabels = document.querySelectorAll("sleep-chart > year > month > label");
    var yearTop, monthTop;

    if (document.body.clientHeight > 550)
    {
        yearTop = DOM.sleepChart.offsetHeight
            - 44  // text height
            - 52; // bottom margin

        monthTop = DOM.sleepChart.offsetHeight
            - 44  // year text height
            - 37  // text height
            - 56; // bottom margin
    }
    else
    {
        yearTop = DOM.sleepChart.offsetHeight
            - 14  // text height
            - 24; // bottom margin

        monthTop = DOM.sleepChart.offsetHeight
            - 14  // year text height
            - 14  // text height
            - 28; // bottom margin
    }

    for (var i = 0; i < yearLabels.length; i++)
    {
        var yearLabel = yearLabels[i];
        yearLabel.style.top = yearTop + "px";
    }

    for (var j = 0; j < monthLabels.length; j++)
    {
        var monthLabel = monthLabels[j];
        monthLabel.style.top = monthTop + "px";
    }
}

function layoutYear(year)
{
    var yearWidth = 0;

    for (var monthNum in year)
    {
        if ( !year.hasOwnProperty(monthNum) )
            continue;

        layoutMonth(year[monthNum]);
        yearWidth += year[monthNum].offsetWidth;
    }
}

function layoutMonth(month)
{
    var dayCount = 0;

    for (var dayNum in month)
    {
        if ( !month.hasOwnProperty(dayNum) )
            continue;

        layoutDay(month[dayNum]);

        dayCount++;
    }
}

function layoutDay(day)
{
    var height;

    if (document.body.clientHeight > 550)
        height = document.body.clientHeight
            - 16   // top margin
            - 145; // bottom margin
    else
        height = document.body.clientHeight
            - 16  // top margin
            - 64; // bottom margin

    day.style.height = height + "px";
}