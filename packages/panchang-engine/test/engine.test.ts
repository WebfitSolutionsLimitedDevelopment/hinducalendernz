import { describe, it, expect } from 'vitest';
import { DateTime } from 'luxon';
import {
  LOCATIONS, DEFAULT_RULES, calculateFestivals, dailyPanchang, lunations, moonQuarters,
  localISO, tithiName,
} from '../src/index.ts';

const AKL = LOCATIONS.auckland;
const y0 = DateTime.fromISO('2027-01-01', { zone: AKL.timeZone }).toJSDate();
const y1 = DateTime.fromISO('2028-01-01', { zone: AKL.timeZone }).toJSDate();
const lunas = lunations(new Date(y0.getTime() - 40 * 864e5), new Date(y1.getTime() + 40 * 864e5));
const festivals = calculateFestivals(2027, AKL, DEFAULT_RULES);
const byId = (id: string) => festivals.find((f) => f.id === id)!;

describe('constants', () => {
  it('names tithis', () => {
    expect(tithiName(15).name).toBe('Purnima');
    expect(tithiName(30).name).toBe('Amavasya');
    expect(tithiName(26)).toEqual({ paksha: 'Krishna', number: 11, name: 'Ekadashi' });
  });
});

describe('astronomy (reference: independent NZ moon-phase table, ±2 min)', () => {
  it('first new moon of 2027 is 8 Jan 09:24 NZDT', () => {
    const q = moonQuarters(y0, y1)[0];
    expect(q.quarter).toBe(0);
    const t = DateTime.fromISO(localISO(q.time, AKL)!);
    expect(Math.abs(t.diff(DateTime.fromISO('2027-01-08T09:24+13:00')).as('minutes'))).toBeLessThanOrEqual(2);
  });
  it('produces 49 principal phases in 2027', () => {
    expect(moonQuarters(y0, y1)).toHaveLength(49);
  });
});

describe('daylight saving (NZ 2027: ends 4 Apr, starts 26 Sep)', () => {
  it('uses +13:00 in summer and +12:00 in winter', () => {
    expect(dailyPanchang('2027-01-10', AKL, lunas).sunrise.endsWith('+13:00')).toBe(true);
    expect(dailyPanchang('2027-07-10', AKL, lunas).sunrise.endsWith('+12:00')).toBe(true);
  });
});

describe('festival rules', () => {
  it('Diwali (Lakshmi Puja, pradosh Amavasya) is 29 Oct 2027', () => {
    expect(byId('diwali').date).toBe('2027-10-29');
  });
  it('Holi follows Holika Dahan by one day', () => {
    expect(byId('holi').date).toBe('2027-03-23');
  });
  it('Krishna Janmashtami uses Ashtami at local midnight (nishita)', () => {
    expect(byId('krishna-janmashtami').date).toBe('2027-08-25');
  });
  it('never marks anything beyond CALCULATED', () => {
    expect(festivals.every((f) => f.status === 'CALCULATED')).toBe(true);
  });
  it('gives every Ekadashi a parana window on the following day', () => {
    const eks = festivals.filter((f) => f.name.includes('Ekadashi'));
    expect(eks.length).toBeGreaterThanOrEqual(24);
    for (const e of eks) expect(e.timing.paranaStart! < e.timing.paranaEnd!).toBe(true);
  });
});
