import { Card, Badge, Button } from "@/components/ui";
import { 
  Plus,
  Calendar, 
  Image as ImageIcon,
  Clock,
  MoreVertical,
  ChevronLeft,
  Megaphone,
  Briefcase,
  Globe
} from "lucide-react";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { listSocialPosts } from "@/services/socialPostService";
import { SocialPostForm } from "@/components/social/social-post-form";

export default async function SocialPage() {
  const user = await getSessionUser();
  const posts = user?.organizationId ? await listSocialPosts(user.organizationId, 30) : [];
  const scheduledCount = posts.filter((post) => post.status === 'scheduled').length;
  const publishedCount = posts.filter((post) => post.status === 'published').length;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/more" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-400">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Content Calendar</h1>
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 text-slate-950">
          <Plus className="h-5 w-5" />
        </button>
      </header>

      <Card>
        <SocialPostForm />
      </Card>

      <section className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col items-center gap-2 py-4 bg-white/5 border-none">
          <span className="text-2xl font-bold">{scheduledCount}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Scheduled</span>
        </Card>
        <Card className="flex flex-col items-center gap-2 py-4 bg-white/5 border-none">
          <span className="text-2xl font-bold text-emerald-400">{publishedCount}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Published</span>
        </Card>
      </section>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Upcoming Posts</h3>
          <Calendar className="h-5 w-5 text-slate-500" />
        </div>
        
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id} className="p-4 bg-white/5 border-none">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900">
                    <ImageIcon className="h-6 w-6 text-slate-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{post.title}</h4>
                    <div className="mt-1 flex gap-2">
                      <PlatformIcon name={post.post_type ?? 'Instagram Post'} />
                      <span className="text-[10px] text-slate-500">• {post.post_type ?? 'Post'}</span>
                    </div>
                  </div>
                </div>
                <Badge className={`h-5 px-1.5 text-[9px] ${
                  post.status === 'scheduled' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-orange-400/10 text-orange-400'
                }`}>
                  {post.status}
                </Badge>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.scheduled_at ? new Date(post.scheduled_at).toLocaleDateString() : 'Not scheduled'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.scheduled_at ? new Date(post.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                  </div>
                </div>
                <button className="text-slate-500">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      <Button className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300">
        Sync with Social Accounts
      </Button>
    </div>
  );
}

function PlatformIcon({ name }: { name: string }) {
  if (name.toLowerCase().includes('instagram')) return <Megaphone className="h-3 w-3 text-pink-400" />;
  if (name.toLowerCase().includes('facebook')) return <Globe className="h-3 w-3 text-blue-500" />;
  if (name.toLowerCase().includes('linkedin')) return <Briefcase className="h-3 w-3 text-blue-400" />;
  return null;
}

