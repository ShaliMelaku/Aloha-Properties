import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ArrowLeft, Calendar, User, ExternalLink } from "lucide-react";
import { BlogShareButton } from "@/components/blog-share-button";
import Link from "next/link";
import Image from "next/image";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Navbar />
      
      {/* Article Header */}
      <section className="relative pt-40 pb-20 px-6 border-b border-[var(--border)] overflow-hidden">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue/5 blur-[120px] rounded-full -mr-64 -mt-64" />
         
         <div className="max-w-4xl mx-auto relative">
            <Link 
              href="/#blog" 
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-blue mb-12 hover:gap-4 transition-all"
            >
               <ArrowLeft size={14} /> Back to Market Trends
            </Link>
            
            <h1 className="text-5xl md:text-7xl font-heading font-black tracking-tighter leading-[0.9] mb-8 text-[var(--foreground)]">
               {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-8 py-8 border-y border-[var(--border)]">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue border border-brand-blue/20">
                     <User size={18} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Author</p>
                     <p className="text-sm font-bold">{post.author_name}</p>
                  </div>
               </div>
               
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-500/10 flex items-center justify-center text-[var(--foreground)] opacity-40 border border-[var(--border)]">
                     <Calendar size={18} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Published</p>
                     <p className="text-sm font-bold">{new Date(post.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
               </div>

               <BlogShareButton title={post.title} excerpt={post.excerpt} slug={post.slug} />
            </div>
         </div>
      </section>

      {/* Article Content */}
      <section className="py-20 px-6">
         <div className="max-w-4xl mx-auto">
            {/* Featured Media */}
            {post.video_url ? (
               <div className="relative aspect-video rounded-[3rem] overflow-hidden mb-16 border border-[var(--border)] shadow-2xl group cursor-pointer">
                  <iframe 
                    title="Featured Property Video"
                    src={post.video_url.replace('watch?v=', 'embed/')} 
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
               </div>
            ) : post.cover_image && (
               <div className="relative aspect-[21/9] rounded-[3rem] overflow-hidden mb-16 border border-[var(--border)] shadow-2xl">
                  <img 
                    src={post.cover_image} 
                    alt={post.title} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
               </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-20">
               {/* Body text */}
               <div className="prose prose-luxury lg:prose-xl text-[var(--foreground)]">
                  <p className="text-2xl font-bold italic opacity-60 leading-relaxed mb-12 border-l-4 border-brand-blue pl-8">
                     {post.excerpt}
                  </p>
                  
                  <div className="whitespace-pre-wrap leading-loose font-medium opacity-80" dangerouslySetInnerHTML={{ __html: post.content }} />
               </div>

               {/* Sidebar */}
               <aside className="space-y-12">
                  {post.source_url && (
                     <div className="p-8 bg-brand-blue text-white rounded-[2rem] shadow-xl shadow-brand-blue/20">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-4">Verification</p>
                        <h4 className="text-xl font-heading font-black mb-6 leading-tight">Authentic Market Intelligence</h4>
                        <a 
                          href={post.source_url} 
                          target="_blank" 
                          className="inline-flex items-center gap-2 bg-white text-brand-blue px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform"
                        >
                           {post.source_label || 'View Source'} <ExternalLink size={12} />
                        </a>
                     </div>
                  )}

                  <div className="p-8 border border-[var(--border)] rounded-[2rem]">
                     <h4 className="text-sm font-black uppercase tracking-widest mb-6 border-b border-[var(--border)] pb-4">Investor Tools</h4>
                     <ul className="space-y-4">
                        <li>
                           <Link href="/#catalog" className="text-sm font-bold opacity-60 hover:text-brand-blue hover:opacity-100 transition-all flex items-center justify-between">
                              Portfolio Map <ArrowLeft size={14} className="rotate-180" />
                           </Link>
                        </li>
                        <li>
                           <Link href="/#contact" className="text-sm font-bold opacity-60 hover:text-brand-blue hover:opacity-100 transition-all flex items-center justify-between">
                              Inquire Now <ArrowLeft size={14} className="rotate-180" />
                           </Link>
                        </li>
                     </ul>
                  </div>
               </aside>
            </div>
         </div>
      </section>

      <Footer />
    </main>
  );
}
