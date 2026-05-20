'use client';

import * as React from 'react';
import { Button, Input, Select } from '@/components/ui';
import { OnboardingData } from './onboarding-wizard';
import { X, Plus } from 'lucide-react';

interface Step3Props {
 data: OnboardingData;
 onComplete: (data: Partial<OnboardingData>) => void;
}

export function OnboardingStep3TeamInvite({ data, onComplete }: Step3Props) {
 const [members, setMembers] = React.useState(data.teamMembers);
 const [newMember, setNewMember] = React.useState({ email: '', fullName: '', role: 'sales_agent' });

 const handleAddMember = () => {
 if (newMember.email && newMember.fullName) {
 setMembers([...members, newMember]);
 setNewMember({ email: '', fullName: '', role: 'sales_agent' });
 }
 };

 const handleRemoveMember = (index: number) => {
 setMembers(members.filter((_, i) => i !== index));
 };

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 onComplete({ teamMembers: members });
 };

 return (
 <form onSubmit={handleSubmit} className="space-y-6">
 <div>
 <h2 className="mb-1 text-2xl font-semibold text-white">Add Team Members</h2>
 <p className="text-sm text-slate-400">Invite your sales team, managers, and field executives.</p>
 </div>

 <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
 <div className="grid gap-3 md:grid-cols-3">
 <Input
 placeholder="email@example.com"
 type="email"
 value={newMember.email}
 onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
 />
 <Input
 placeholder="Full Name"
 value={newMember.fullName}
 onChange={(e) => setNewMember({ ...newMember, fullName: e.target.value })}
 />
 <Select
 value={newMember.role}
 onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
 >
 <option value="sales_manager">Sales Manager</option>
 <option value="sales_agent">Sales Agent</option>
 <option value="field_executive">Field Executive</option>
 <option value="social_media_manager">Social Media Manager</option>
 </Select>
 </div>
 <Button
 type="button"
 
 onClick={handleAddMember}
 className="w-full bg-white/10 text-white shadow-none hover:bg-white/15"
 disabled={!newMember.email || !newMember.fullName}
 >
 <Plus className="mr-2 h-4 w-4" /> Add Member
 </Button>
 </div>

 {members.length > 0 && (
 <div className="space-y-2">
 <p className="text-sm font-medium text-slate-300">Team Members ({members.length})</p>
 {members.map((member, idx) => (
 <div key={idx} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
 <div className="flex flex-col">
 <p className="text-sm font-medium text-white">{member.fullName}</p>
 <p className="text-xs text-slate-400">{member.email}</p>
 </div>
 <div className="flex items-center gap-2">
 <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-xs text-emerald-300">
 {member.role.replace(/_/g, ' ')}
 </span>
 <button
 type="button"
 onClick={() => handleRemoveMember(idx)}
 className="text-slate-500 hover:text-rose-400"
 >
 <X className="h-4 w-4" />
 </button>
 </div>
 </div>
 ))}
 </div>
 )}

 <div className="rounded-2xl border border-blue-400/20 bg-blue-400/5 p-4">
 <p className="text-sm text-slate-300">
 <span className="font-semibold text-blue-300">Skip:</span> You can add team members later from the admin dashboard.
 </p>
 </div>

 <Button type="submit" className="w-full">
 Continue
 </Button>
 </form>
 );
}
