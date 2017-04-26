**SleepCharter** is a custom web app, that generates a sleep chart based on my sleep data.
[You can see it live by clicking this link][4].

Every time I go to sleep (e.g. for a nap, or full, etc.), I note down when I go to bed and
when I wake up. The times are not accurate; I snap them to the nearest quarter hour and I
don't exactly account for laying in bed sleeplessly, etc.

I have been manually recording this data since July 5th 2016. I was manually charting it
with Inkscape for a few months.

![Screenshot of my sleep chart][1]

# Data format

I record my sleep and wake times simply on a Google Sheet. There are two columns; "Sleep"
and "Wake". [Both columns use the Date/time format][2]. To use this data in SleepCharter,
[I export the sheet to CSV][3].

# Issues

* Using JS to manually scale the sleep bars is not ideal. I've tried my best to use CSS
for this purpose (e.g. percentages, relative positioning) but I couldn't figure it out.
* Sleep bar (re)sizing is very slow on Firefox; probably due to flexbox use

[1]: http://i.imgur.com/f4Vmla7.png
[2]: http://i.imgur.com/gWCZpfT.png
[3]: http://i.imgur.com/NeJjtJS.png
[4]: https://roycurtis.github.io/SleepCharter/