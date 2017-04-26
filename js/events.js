/**
 * Sleep charter, event handlers
 * Roy Curtis, MIT license, 2017
 */

/** @param {MouseEvent} evt */
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

function onSleepChartResize()
{
    // This is necessary, because making fixed elements work with em/vh heights whilst
    // accounting for scrollbar offset, is just too difficult...
    DOM.timeAxis.style.height = DOM.sleepBars[0].parentNode.clientHeight + "px";
    STATE.rescaleIdx = 0;

    if (!STATE.rescaling)
        rescaleSleeps();
}