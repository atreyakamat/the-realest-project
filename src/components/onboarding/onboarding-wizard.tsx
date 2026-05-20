'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { CompleteOnboardingAction } from '@/app/actions/onboarding';
import { OnboardingStep1OrgInfo } from './step-1-org-info';
import { OnboardingStep2AdminInfo } from './step-2-admin-info';
import { OnboardingStep3TeamInvite } from './step-3-team-invite';
import { OnboardingStep4ApiKeys } from './step-4-api-keys';
import { OnboardingStep5LeadSources } from './step-5-lead-sources';
import { OnboardingStep6Review } from './step-6-review';
import { Button } from '@/components/ui';
import { ChevronRight, CheckCircle } from 'lucide-react';

export interface OnboardingData {
 orgName: string;
 orgIndustry: string;
 adminFullName: string;
 adminPhone: string;
 teamMembers: Array<{ email: string; fullName: string; role: string }>;
 apiKeys: {
 twilio_account_sid: string;
 twilio_auth_token: string;
 twilio_phone_number: string;
 whatsapp_sender_number: string;
 resend_api_key: string;
 openai_api_key: string;
 };
 leadSources: string[];
}

export function OnboardingWizard({ userId, email }: { userId: string; email: string }) {
 const [step, setStep] = useState(1);
 const [data, setData] = useState<OnboardingData>({
 orgName: '',
 orgIndustry: '',
 adminFullName: '',
 adminPhone: '',
 teamMembers: [],
 apiKeys: {
 twilio_account_sid: '',
 twilio_auth_token: '',
 twilio_phone_number: '',
 whatsapp_sender_number: '',
 resend_api_key: '',
 openai_api_key: '',
 },
 leadSources: [],
 });

 const [state, action, pending] = useActionState(CompleteOnboardingAction, { message: '', error: '' });

 const handleStepComplete = (stepData: Partial<OnboardingData>) => {
 setData({ ...data, ...stepData });
 setStep(step + 1);
 };

 const handlePrevious = () => {
 setStep(step - 1);
 };

 const handleSubmit = async (formData: FormData) => {
 formData.append('userId', userId);
 formData.append('email', email);
 formData.append('orgName', data.orgName);
 formData.append('orgIndustry', data.orgIndustry);
 formData.append('adminFullName', data.adminFullName);
 formData.append('adminPhone', data.adminPhone);
 formData.append('teamMembers', JSON.stringify(data.teamMembers));
 formData.append('apiKeys', JSON.stringify(data.apiKeys));
 formData.append('leadSources', JSON.stringify(data.leadSources));

 await action(formData);
 };

 const steps = [
 { number: 1, title: 'Organization' },
 { number: 2, title: 'Admin Account' },
 { number: 3, title: 'Team Members' },
 { number: 4, title: 'API Keys' },
 { number: 5, title: 'Lead Sources' },
 { number: 6, title: 'Review' },
 ];

 return (
 <div className="mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-12">
 <div className="w-full max-w-2xl">
 {/* Step Indicator */}
 <div className="mb-12">
 <div className="flex items-center justify-between">
 {steps.map((s) => (
 <div
 key={s.number}
 className={`flex flex-col items-center ${s.number <= step ? 'opacity-100' : 'opacity-50'}`}
 >
 <div
 className={`flex h-12 w-12 items-center justify-center rounded-full font-semibold ${
 s.number < step
 ? 'bg-emerald-400 text-slate-950'
 : s.number === step
 ? 'bg-white text-slate-950'
 : 'border-2 border-slate-600 text-slate-400'
 }`}
 >
 {s.number < step ? <CheckCircle className="h-5 w-5" /> : s.number}
 </div>
 <p className="mt-2 text-xs font-medium text-slate-300">{s.title}</p>
 </div>
 ))}
 </div>
 {/* Progress Bar */}
 <div className="mt-8 h-1 bg-slate-700">
 <div
 className="h-full bg-emerald-400 transition-all duration-300"
 style={{ width: `${(step / steps.length) * 100}%` }}
 />
 </div>
 </div>

 {/* Content */}
 <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-8 backdrop-blur">
 {step === 1 && <OnboardingStep1OrgInfo data={data} onComplete={handleStepComplete} />}
 {step === 2 && <OnboardingStep2AdminInfo data={data} onComplete={handleStepComplete} />}
 {step === 3 && <OnboardingStep3TeamInvite data={data} onComplete={handleStepComplete} />}
 {step === 4 && <OnboardingStep4ApiKeys data={data} onComplete={handleStepComplete} />}
 {step === 5 && <OnboardingStep5LeadSources data={data} onComplete={handleStepComplete} />}
 {step === 6 && <OnboardingStep6Review data={data} onSubmit={handleSubmit} pending={pending} />}

 {state.error && <p className="mt-4 text-sm text-rose-300">{state.error}</p>}
 {state.message && <p className="mt-4 text-sm text-emerald-300">{state.message}</p>}

 {/* Navigation */}
 <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
 {step > 1 ? (
 <Button className="bg-white/10 text-white shadow-none hover:bg-white/15" onClick={handlePrevious} disabled={pending}>
 Previous
 </Button>
 ) : (
 <div />
 )}
 {step < 6 && (
 <Button disabled={pending} onClick={() => setStep(step + 1)}>
 Next <ChevronRight className="ml-2 h-4 w-4" />
 </Button>
 )}
 </div>
 </div>

 {/* Skip Link */}
 <div className="mt-6 text-center">
 <p className="text-xs text-slate-500">
 You can configure these settings later in the admin dashboard.
 </p>
 </div>
 </div>
 </div>
 );
}
