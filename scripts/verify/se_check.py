"""Independent panchang check with Swiss Ephemeris (Moshier mode, no data files).
Computes, for each civil date in Auckland 2026-2028: sunrise, and the tithi/nakshatra/yoga/karana at sunrise with end times."""
import swisseph as swe, json, datetime as dt
from zoneinfo import ZoneInfo
TZ = ZoneInfo('Pacific/Auckland'); LAT, LON = -36.8485, 174.7633
FL = swe.FLG_MOSEPH
swe.set_sid_mode(swe.SIDM_LAHIRI)
def jd(t): return swe.julday(t.year, t.month, t.day, t.hour + t.minute/60 + t.second/3600)
def fromjd(j):
    y, m, d, h = swe.revjul(j); base = dt.datetime(y, m, d, tzinfo=dt.timezone.utc)
    return base + dt.timedelta(hours=h)
def lon(j, body, sid=False):
    return swe.calc_ut(j, body, FL | (swe.FLG_SIDEREAL if sid else 0))[0][0]
def elong(j): return (lon(j, swe.MOON) - lon(j, swe.SUN)) % 360
def nak(j): return lon(j, swe.MOON, True) % 360
def yog(j): return (lon(j, swe.SUN, True) + lon(j, swe.MOON, True)) % 360
def end_of(f, j0, step):
    k = int(f(j0) // step); target = ((k + 1) * step) % 360
    diff = lambda j: ((f(j) - target + 540) % 360) - 180
    a = j0; da = diff(a)
    while True:
        b = a + 1/24; db = diff(b)
        if da < 0 <= db: break
        a, da = b, db
    lo, hi = a, b
    while (hi - lo) * 86400 > 1:
        mid = (lo + hi) / 2
        if diff(mid) < 0: lo = mid
        else: hi = mid
    return hi
out = {}
d = dt.date(2026, 1, 1)
while d <= dt.date(2028, 12, 31):
    mid = dt.datetime(d.year, d.month, d.day, tzinfo=TZ).astimezone(dt.timezone.utc)
    res, t = swe.rise_trans(jd(mid), swe.SUN, swe.CALC_RISE, (LON, LAT, 0), 1013.25, 15, FL)
    sr = t[0]
    iso = lambda j: fromjd(j).astimezone(TZ).strftime('%Y-%m-%dT%H:%M')
    out[d.isoformat()] = {
        'sunrise': iso(sr),
        'tithi': int(elong(sr) // 12) + 1, 'tithiEnd': iso(end_of(elong, sr, 12)),
        'nakshatra': int(nak(sr) // (360/27)) + 1, 'nakshatraEnd': iso(end_of(nak, sr, 360/27)),
        'yoga': int(yog(sr) // (360/27)) + 1, 'yogaEnd': iso(end_of(yog, sr, 360/27)),
        'karana': int(elong(sr) // 6),
        'ayanamsa': swe.get_ayanamsa_ut(sr),
    }
    d += dt.timedelta(days=1)
json.dump(out, open(__file__.replace('se_check.py', 'se_auckland_2026_2028.json'), 'w'), indent=0)
print('days', len(out))
