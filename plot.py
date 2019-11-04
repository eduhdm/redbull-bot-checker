import datetime
import matplotlib.dates as dates
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import json

dbtext = open("mydb.json")
dbdata = json.load(dbtext)

# build chart data
chartdata = { 'x': list(map(lambda d: dates.datestr2num(d), dbdata.keys())) }
titletovotecount = {}
titletovotemaxdiff = {}
titletovotemindiff = {}
for participantssnapshot in dbdata.values():
    participantsdata = json.loads(participantssnapshot['value'])
    i = 0
    while i < len(participantsdata):
        participantdata = participantsdata[i]
        participanttitle = participantdata['title']
        if participanttitle != 'Estacionamento prioritário':
            if participanttitle == 'Studium':
                if i == 0 or i == 1:
                    participanttitle = 'Studium 1'
                else:
                    participanttitle = 'Studium 2'
            if participanttitle in chartdata:
                titletovotemaxdiff[participanttitle] = max(titletovotemaxdiff[participanttitle], participantdata['vote_count'] - titletovotecount[participanttitle])
                titletovotemindiff[participanttitle] = min(titletovotemindiff[participanttitle], participantdata['vote_count'] - titletovotecount[participanttitle])
                chartdata[participanttitle].append(participantdata['vote_count'])
            else:
                titletovotemaxdiff[participanttitle] = 0
                titletovotemindiff[participanttitle] = 999999999
                chartdata[participanttitle] = [participantdata['vote_count']]
            titletovotecount[participanttitle] = participantdata['vote_count']
        i += 1

# for participanttitle in titletovotecount:
#     print(len(chartdata[participanttitle]), participanttitle)

# build pandas data frame with the chart data
chartdf = pd.DataFrame(chartdata)

# get first 10
def sortbyvotecount(data):
  return data['vote_count']
titlesandvotecounts = list(map(lambda t: { 'title': t, 'vote_count': titletovotecount[t] }, titletovotecount.keys()))
titlesandvotecounts.sort(key=sortbyvotecount)
first10participantitles = list(map(lambda d: d['title'], titlesandvotecounts[-10:]))

# plot data
fig, ax = plt.subplots()

# cursor
# def onmousemove(event):
#   ax.lines = [ax.lines[0]]
#   ax.axvline(x=event.xdata, color="k")
# fig.canvas.mpl_connect('motion_notify_event', onmousemove)


# format the ticks
years = dates.YearLocator()   # every year
months = dates.MonthLocator()  # every month
years_fmt = dates.DateFormatter('%Y')
ax.xaxis.set_major_locator(years)
ax.xaxis.set_major_formatter(years_fmt)
ax.xaxis.set_minor_locator(months)
ax.format_xdata = dates.DateFormatter('%Y-%m-%d %H:%M', tz=datetime.timezone(datetime.timedelta(hours=-3)))
ax.format_ydata = lambda x: '%f' % x  # format the price.
ax.grid(True)

# rotates and right aligns the x labels, and moves the bottom of the
# axes up to make room for them
fig.autofmt_xdate()

for participanttitle in first10participantitles:
    print(participanttitle)
    print('Votos: ', titletovotecount[participanttitle])
    print('Diferenca maxima: ', titletovotemaxdiff[participanttitle])
    print('Diferenca minima: ', titletovotemindiff[participanttitle])
    print('')
    plt.plot('x', participanttitle, data=chartdf, label=participanttitle)

# plt.legend()
plt.show()
