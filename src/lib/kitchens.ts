'use client';
import { useEffect, useState } from 'react';
import type { Kitchen } from '@/lib/types';
import type { WeekMeal } from '@/lib/mock-data';

/* A kitchen as the API returns it: the Kitchen record plus its weekly meals. */
export type LiveKitchen = Kitchen & { weeklyMeals: WeekMeal[] };

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/* WeeklyMeal rows carry a day name but no date. Work out the date each day
   falls on in the current delivery week so the UI shows something real. */
export function withDates(meals: WeekMeal[]): WeekMeal[] {
  const now = new Date();
  const mondayOffset = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);

  return [...meals]
    .sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day))
    .map(m => {
      const i = DAY_ORDER.indexOf(m.day);
      if (i < 0) return m;
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return { ...m, date: `${MONTHS[d.getMonth()]} ${d.getDate()}` };
    });
}

function normalise(k: any): LiveKitchen {
  return { ...k, weeklyMeals: withDates(k.weeklyMeals ?? []) };
}

/* Every kitchen taking orders in a city. */
export function useKitchens(city = 'Surrey') {
  const [kitchens, setKitchens] = useState<LiveKitchen[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setFailed(false);
    fetch(`/api/kitchens?city=${encodeURIComponent(city)}`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(d => { if (live) setKitchens((d.kitchens ?? []).map(normalise)); })
      .catch(() => { if (live) setFailed(true); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [city]);

  return { kitchens, loading, failed };
}

/* One kitchen by id. */
export function useKitchen(id: string | undefined) {
  const [kitchen, setKitchen] = useState<LiveKitchen | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    let live = true;
    setLoading(true);
    setFailed(false);
    fetch(`/api/kitchens?id=${encodeURIComponent(id)}`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(d => {
        if (!live) return;
        const k = d.kitchen ?? (d.kitchens ?? [])[0] ?? null;
        setKitchen(k ? normalise(k) : null);
      })
      .catch(() => { if (live) setFailed(true); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [id]);

  return { kitchen, loading, failed };
}

/* Today's meal from an already-loaded week. */
export function todaysMeal(meals: WeekMeal[]): WeekMeal | null {
  const today = DAY_ORDER[(new Date().getDay() + 6) % 7];
  return meals.find(m => m.day === today) ?? meals[0] ?? null;
}
