'use client';

import { useState } from 'react';
import { Phone, MessageSquare, Mail, Share2 } from 'lucide-react';
import { initiateCall, sendWhatsAppFollowup } from '@/app/actions';
import { toast } from 'sonner';
import type { LucideIcon } from 'lucide-react';

type Props = {
  leadId: string;
  phone: string;
  name: string;
};

export function LeadQuickActions({ leadId, phone, name }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCall = async () => {
    setLoading('call');
    const res = await initiateCall(leadId, phone, '+919999999999'); // Mock agent phone
    if (res.success) {
      toast.success('Call bridge initiated');
    } else {
      toast.error('Failed to start call');
    }
    setLoading(null);
  };

  const handleWhatsApp = async () => {
    setLoading('whatsapp');
    const msg = `Hi ${name}, just following up on your property inquiry. Are you available for a quick chat?`;
    const res = await sendWhatsAppFollowup(leadId, phone, msg);
    if (res.success) {
      toast.success('WhatsApp message sent');
    } else {
      toast.error('Failed to send WhatsApp');
    }
    setLoading(null);
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      <ActionButton 
        icon={Phone} 
        label="Call" 
        onClick={handleCall} 
        loading={loading === 'call'} 
        color="bg-emerald-400 text-slate-950" 
      />
      <ActionButton 
        icon={MessageSquare} 
        label="WhatsApp" 
        onClick={handleWhatsApp} 
        loading={loading === 'whatsapp'} 
        color="bg-green-500 text-white" 
      />
      <ActionButton 
        icon={Mail} 
        label="Email" 
        onClick={() => toast.info('Email service coming soon')} 
        color="bg-blue-500 text-white" 
      />
      <ActionButton 
        icon={Share2} 
        label="Share" 
        onClick={() => toast.info('Sharing link generated')} 
        color="bg-purple-500 text-white" 
      />
    </div>
  );
}

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  loading?: boolean;
  color: string;
}

function ActionButton({ icon: Icon, label, onClick, loading, color }: ActionButtonProps) {
  return (
    <button
      disabled={loading}
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-2xl p-3 transition active:scale-95 disabled:opacity-50 ${color}`}
    >
      <Icon className={`h-5 w-5 ${loading ? 'animate-pulse' : ''}`} />
      <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
    </button>
  );
}
