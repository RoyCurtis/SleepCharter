/**
 * Sleep charter, event handlers
 * Roy Curtis, MIT license, 2017
 */

/**
 * Handles mousing over of sleep bars. Uses the entire sleep chart element, so that we can
 * avoid attaching an event listener to every single sleep bar.
 *
 * @param {MouseEvent} evt
 */
function onSleepChartMouseOver(evt)
{
    /** @type HTMLElement|EventTarget */
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
    if (selected.tagName === "SLEEP")
    {
        STATE.selected       = selected;
        STATE.selected.title = getSleepBarMessage(selected);
        selected.classList.add("selected");

        if (STATE.selected.pairedBar)
            STATE.selected.pairedBar.classList.add("selected");
    }
}

/** @param {WheelEvent} evt */
function onSleepChartMouseWheel(evt)
{
    if (evt.ctrlKey || evt.shiftKey)
        return;

    // Chrome uses deltaMode 0 (pixels)
    // Firefox uses deltaMode 1 (lines)
    DOM.sleepChart.scrollLeft += evt.deltaMode === 0
        ? evt.deltaY
        : evt.deltaY * 33;
    evt.preventDefault();
}

function onSleepChartClick(evt)
{
    /** @type SleepBar|EventTarget */
    var selected = evt.target;

    // Handle only sleep bars
    if (selected.tagName !== "SLEEP")
        return;

    window.alert( getSleepBarMessage(selected) );

    if (STATE.selected.pairedBar)
        STATE.selected.pairedBar.classList.add("selected");
}

function onSleepChartResize()
{
    layoutSleepBars();
    layoutTimeAxis();

    STATE.rescaleIdx = 0;

    if (!STATE.rescaling)
        rescaleSleeps();
}