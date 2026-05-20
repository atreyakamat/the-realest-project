'use client';

import { useState } from 'react';
import { Button, Card } from '@/components/ui';
import { MapPin, MapPinned, CheckCircle2 } from 'lucide-react';
import { checkInAttendance } from '@/app/actions';
import { toast } from 'sonner';

export function AttendanceCheckIn() {
  const [loading, setLoading] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  const handleCheckIn = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const res = await checkInAttendance('demo-user', latitude, longitude);
        
        if (res.success) {
          toast.success('Check-in successful!');
          setCheckedIn(true);
        } else {
          toast.error('Failed to check in');
        }
        setLoading(false);
      },
      (error) => {
        toast.error('Location access denied');
        setLoading(false);
      }
    );
  };

  if (checkedIn) {
    return (
      <Card className="flex flex-col items-center gap-4 py-8 bg-emerald-400/10 border-emerald-400/20">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400 text-slate-950">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-emerald-400">Checked In</h2>
          <p className="text-sm text-slate-400">9:30 AM • Head Office</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col items-center gap-6 py-8">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-slate-400">
        <MapPinned className="h-10 w-10" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold">Good Morning!</h2>
        <p className="text-sm text-slate-400">Ready for a productive day?</p>
      </div>
      <Button 
        onClick={handleCheckIn} 
        disabled={loading}
        className="w-full max-w-xs"
      >
        {loading ? 'Fetching Location...' : 'Punch In Now'}
      </Button>
    </Card>
  );
}
