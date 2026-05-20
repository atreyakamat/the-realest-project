'use client';

import { useEffect, useMemo, useState } from 'react';
import { useActionState } from 'react';
import { checkInAttendanceAction, checkOutAttendanceAction } from '../../app/actions/attendance';
import { Button, Textarea } from '../ui';

const initialState = { message: '', error: '' };

type LocationState = { latitude: number | null; longitude: number | null; status: string };

function useGeolocation() {
  const [location, setLocation] = useState<LocationState>({ latitude: null, longitude: null, status: 'idle' });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({ latitude: null, longitude: null, status: 'unsupported' });
      return;
    }

    setLocation((current) => ({ ...current, status: 'requesting' }));
    navigator.geolocation.getCurrentPosition(
      (position) => setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude, status: 'ready' }),
      () => setLocation({ latitude: null, longitude: null, status: 'blocked' }),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  return location;
}

export function AttendanceForm() {
  const location = useGeolocation();
  const [checkInState, checkInAction, checkingIn] = useActionState(checkInAttendanceAction, initialState);
  const [checkOutState, checkOutAction, checkingOut] = useActionState(checkOutAttendanceAction, initialState);

  const helperText = useMemo(() => {
    if (location.status === 'requesting') return 'Fetching your location...';
    if (location.status === 'blocked') return 'Location access blocked. Enable GPS to clock in/out.';
    if (location.status === 'unsupported') return 'Geolocation is not supported on this device.';
    if (location.status === 'ready') return `Location ready: ${location.latitude?.toFixed(5)}, ${location.longitude?.toFixed(5)}`;
    return 'Tap check-in to send your GPS coordinates and selfie.';
  }, [location]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
      <form action={checkInAction} className="space-y-3 rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/20">
        <h3 className="text-lg font-semibold text-white">Check in</h3>
        <p className="text-sm text-slate-300">{helperText}</p>
        <input type="hidden" name="latitude" value={location.latitude ?? ''} />
        <input type="hidden" name="longitude" value={location.longitude ?? ''} />
        <label className="block text-sm text-slate-300">
          Selfie upload
          <input name="selfie" type="file" accept="image/*" capture="user" className="mt-2 block w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-400 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950" />
        </label>
        <Textarea name="notes" placeholder="Notes or site visit details" />
        {checkInState?.error ? <p className="text-sm text-rose-300">{checkInState.error}</p> : null}
        {checkInState?.message ? <p className="text-sm text-emerald-300">{checkInState.message}</p> : null}
        <Button type="submit" disabled={checkingIn} className="w-full">{checkingIn ? 'Checking in...' : 'Check in now'}</Button>
      </form>

      <form action={checkOutAction} className="space-y-3 rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/20">
        <h3 className="text-lg font-semibold text-white">Check out</h3>
        <p className="text-sm text-slate-300">Send a final GPS stamp and close the day.</p>
        <input type="hidden" name="latitude" value={location.latitude ?? ''} />
        <input type="hidden" name="longitude" value={location.longitude ?? ''} />
        <Textarea name="notes" placeholder="Optional checkout note" />
        {checkOutState?.error ? <p className="text-sm text-rose-300">{checkOutState.error}</p> : null}
        {checkOutState?.message ? <p className="text-sm text-emerald-300">{checkOutState.message}</p> : null}
        <Button type="submit" disabled={checkingOut} className="w-full bg-white/10 text-white shadow-none hover:bg-white/15">{checkingOut ? 'Checking out...' : 'Check out now'}</Button>
      </form>
    </div>
  );
}
