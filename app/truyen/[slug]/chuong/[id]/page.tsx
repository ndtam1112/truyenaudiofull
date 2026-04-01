import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/metadata";
import { getChapterDetail } from "@/lib/stories";

type ChapterDetailPageProps = {
  params: Promise<{
    slug: string;
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: ChapterDetailPageProps): Promise<Metadata> {
  const { slug, id } = await params;
  const result = await getChapterDetail(slug, id);

  if (!result) {
    return buildMetadata({
      title: "Không tìm thấy chương",
      description: "Chương truyện bạn đang tìm không tồn tại hoặc đã bị gỡ bỏ.",
      path: `/truyen/${slug}/chuong/${id}`,
    });
  }

  return buildMetadata({
    title: `${result.chapter.title} - ${result.story.title}`,
    description: result.chapter.excerpt,
    path: `/truyen/${result.story.slug}/chuong/${result.chapter.id}`,
  });
}

export default async function ChapterDetailPage({
  params,
}: ChapterDetailPageProps) {
  const { slug, id } = await params;
  const content = await getChapterDetail(slug, id);

  if (!content) {
    notFound();
  }

  const { story, chapter, previousChapter, nextChapter } = content;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Ghost Header for Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 border-b border-border/40 backdrop-blur-md py-3 shadow-sm">
        <div className="page-shell flex items-center justify-between gap-4">
           <Link href={`/truyen/${story.slug}`} className="flex items-center gap-2 group max-w-[50%]">
              <svg className="w-4 h-4 text-accent transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <h1 className="text-sm font-bold text-foreground truncate group-hover:text-accent transition-colors">
                {story.title}
              </h1>
           </Link>
           <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg hover:bg-surface-strong transition-colors text-muted" title="Cài đặt">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                 </svg>
              </button>
           </div>
        </div>
      </header>

      <main className="page-shell py-12 md:py-20 lg:max-w-3xl">
        <article className="space-y-12">
          {/* Chapter Metadata */}
          <div className="text-center space-y-4">
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">
                Chương {chapter.order}
             </p>
             <h2 className="font-display novel-title text-3xl md:text-5xl text-foreground">
                {chapter.title}
             </h2>
             <div className="flex items-center justify-center gap-6 pt-4 text-xs font-bold text-muted/40 uppercase tracking-widest">
                <span>{chapter.readingTime}</span>
                <span>•</span>
                <span>Chương {chapter.order}</span>
             </div>
          </div>

          {/* Chapter Content */}
          <div className="novel-content px-4 md:px-0">
             {chapter.content.map((line, idx) => (
                <p key={idx} className="mb-6 first-letter:text-2xl first-letter:font-bold first-letter:mr-1">
                  {line}
                </p>
             ))}
          </div>

          {/* Chapter Navigation Footer */}
          <section className="pt-20 border-t border-border">
             <div className="grid grid-cols-2 gap-4">
                {previousChapter ? (
                   <Link 
                      href={`/truyen/${story.slug}/chuong/${previousChapter.id}`}
                      className="flex flex-col gap-2 p-5 rounded-2xl bg-surface-strong border border-transparent hover:border-accent/40 group transition-all"
                   >
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted/60 group-hover:text-accent/60">Chương trước</span>
                      <span className="text-sm font-bold text-foreground line-clamp-1">← Quay lại</span>
                   </Link>
                ) : <div className="p-5 rounded-2xl bg-surface-strong/30 border border-transparent opacity-50 cursor-not-allowed">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted/60">Chương trước</span>
                      <span className="text-sm font-bold text-foreground">Hết chương</span>
                    </div>}

                {nextChapter ? (
                   <Link 
                      href={`/truyen/${story.slug}/chuong/${nextChapter.id}`}
                      className="flex flex-col gap-2 p-5 rounded-2xl bg-accent text-white shadow-xl shadow-accent/20 hover:brightness-105 group transition-all text-right"
                   >
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Chương tiếp</span>
                      <span className="text-sm font-bold line-clamp-1">Tiếp tục →</span>
                   </Link>
                ) : <div className="p-5 rounded-2xl bg-surface-strong/30 border border-transparent opacity-50 cursor-not-allowed text-right">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted/60">Chương tiếp</span>
                      <span className="text-sm font-bold text-foreground">Hết chương</span>
                    </div>}
             </div>
             
             <div className="mt-8 flex justify-center">
                <Link 
                   href={`/truyen/${story.slug}#chapters`}
                   className="inline-flex items-center gap-2 text-xs font-bold text-muted hover:text-accent transition-colors uppercase tracking-[0.2em]"
                >
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                   </svg>
                   Mục lục truyện
                </Link>
             </div>
          </section>
        </article>
      </main>

      {/* Floating Toolbar for Mobile */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-foreground/90 backdrop-blur-md rounded-full px-4 py-2 text-white shadow-2xl border border-white/10 md:hidden">
         <Link href="/" className="p-3 hover:text-accent transition-colors rounded-full" title="Về trang chủ">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
         </Link>
         <div className="w-px h-4 bg-white/20 mx-1" />
         <button className="p-3 hover:text-accent transition-colors rounded-full" title="Danh sách chương">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
         </button>
         <button className="p-3 hover:text-accent transition-colors rounded-full" title="Cài đặt reading">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
         </button>
      </nav>
    </div>
  );
}
