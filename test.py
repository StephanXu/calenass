import datetime
import pytz
print(datetime.datetime.now())

a = datetime.datetime.strptime('2018-09-10 12:00','%Y-%m-%d %H:%M')

print(a)

b = datetime.datetime.strptime('2018-09-10 12:00','%Y-%m-%d %H:%M')

c = b.astimezone(tz=pytz.timezone('Asia/Shanghai'))

print(c)

d = c.astimezone(tz=pytz.timezone('UTC'))

print(d)

