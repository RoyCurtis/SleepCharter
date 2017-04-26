/**
 * Sleep charter, utility methods
 * Roy Curtis, MIT license, 2017
 */

/**
 * Gets how many minutes have passed in the entire day, of the given date
 *
 * @param {Date} date
 */
function getMinutesOfDay(date)
{
    return (date.getHours() * 60) + date.getMinutes();
}

/**
 * Sorts sleep events by earliest from-time to latest from-time
 *
 * @param {SleepEvent} a
 * @param {SleepEvent} b
 * @return {number}
 */
function sortByFromTimes(a, b)
{
    var from = a[0].getTime(),
        to   = b[0].getTime();

    if      (from > to) return 1;
    else if (from < to) return -1;
    else                return 0;
}