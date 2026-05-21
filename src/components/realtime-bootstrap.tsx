'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

function decodeVapidPublicKey(base64Key: string) {
  const padding = '='.repeat((4 - (base64Key.length % 4)) % 4);
  const normalized = (base64Key + padding).replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(normalized);
  const output = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    output[i] = binary.charCodeAt(i);
  }

  return output;
}

async function registerServiceWorkerAndPush() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.register('/sw.js');
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  if (!vapidPublicKey || !('PushManager' in window)) return;

  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }

  if (Notification.permission !== 'granted') return;

  const existingSubscription = await registration.pushManager.getSubscription();
  const subscription =
    existingSubscription ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: decodeVapidPublicKey(vapidPublicKey),
    }));

  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(subscription),
  });
}

export function RealtimeBootstrap() {
  useEffect(() => {
    registerServiceWorkerAndPush().catch(() => {
      // Keep boot resilient if push isn't configured yet.
    });

    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel('estateflow-lead-alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        const notification = payload.new as { type?: string; payload?: { lead_name?: string; lead_id?: string } };
        if (notification.type === 'lead_assigned') {
          const leadName = notification.payload?.lead_name ?? 'New lead';
          toast.success(`New lead assigned: ${leadName}`);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
