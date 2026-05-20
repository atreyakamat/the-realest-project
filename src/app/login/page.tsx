import { LoginForm } from '@/components/auth/login-form';
import { Card } from '@/components/ui';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-lg items-center px-4 py-8">
      <Card className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">EstateFlow CRM</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Sign in to your CRM</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">Use your work email to receive a magic link and continue into the dashboard.</p>
        </div>
        <LoginForm />
        <p className="text-xs text-slate-400">
          Need help? Ask your admin to invite you, or <Link href="/" className="text-emerald-300">go back home</Link>.
        </p>
      </Card>
    </div>
  );
}
