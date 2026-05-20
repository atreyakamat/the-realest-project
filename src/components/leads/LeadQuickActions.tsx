'use client';

import { useState } from 'react';
import { Phone, MessageSquare, Mail, Share2, Calendar } from 'lucide-react';
import { initiateCall, sendWhatsAppFollowup } from '@/app/actions';
import { toast } from 'sonner';
import type { LucideIcon } from 'lucide-react';
import { ScheduleVisitForm } from './schedule-visit-form';

type Props = {
  leadId: string;
  phone: string;
  name: string;
};

export function LeadQuickActions({ leadId, phone, name }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showVisitForm, setShowVisitForm] = useState(false);

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
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-2">
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
          icon={Calendar} 
          label="Visit" 
          onClick={() => setShowVisitForm(!showVisitForm)} 
          color="bg-orange-500 text-white" 
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

      {showVisitForm && (
        <div className="rounded-2xl bg-white/5 p-4 border border-white/10 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold">Schedule site visit</h4>
            <button onClick={() => setShowVisitForm(false)} className="text-xs text-slate-400">Cancel</button>
          </div>
          <ScheduleVisitForm leadId={leadId} onComplete={() => setShowVisitForm(false)} />
        </div>
      )}
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
