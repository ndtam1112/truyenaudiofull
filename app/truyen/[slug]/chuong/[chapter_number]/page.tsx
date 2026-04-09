import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/metadata";
import { getChapterDetail } from "@/lib/stories";
import { SaveReadingProgress } from "@/components/save-reading-progress";

type ChapterDetailPageProps = {
  params: Promise<{
    slug: string;
    chapter_number: string;
  }>;
};

export async function generateMetadata({
  params,
}: ChapterDetailPageProps): Promise<Metadata> {
  const { slug, chapter_number } = await params;
  const result = await getChapterDetail(slug, chapter_number);

  if (!result) {
    return buildMetadata({
      title: "Không tìm thấy chương",
      description: "Chương truyện bạn đang tìm không tồn tại hoặc đã bị gỡ bỏ.",
      path: `/truyen/${slug}/chuong/${chapter_number}`,
    });
  }

  return buildMetadata({
    title: `${result.chapter.title} - ${result.story.title}`,
    description: result.chapter.excerpt,
    path: `/truyen/${result.story.slug}/chuong/${result.chapter.order}`,
  });
}

export default async function ChapterDetailPage({
  params,
}: ChapterDetailPageProps) {
  const { slug, chapter_number } = await params;
  const content = await getChapterDetail(slug, chapter_number);

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
              <h1 className="text-sm font-semibold text-foreground truncate group-hover:text-accent transition-colors">
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
             <div className="flex items-center justify-center gap-6 pt-4 text-xs font-semibold text-muted/40 uppercase tracking-widest">
                <span>{chapter.readingTime}</span>
                <span>•</span>
                <span>Chương {chapter.order}</span>
             </div>
          </div>

          {/* Media Players */}
          {(chapter.audioUrl || chapter.videoUrl) && (
            <div className="px-4 md:px-0 pt-8 pb-4 flex flex-col items-center gap-6">
              {chapter.audioUrl && (
                <div className="w-full max-w-md bg-surface-strong/50 p-4 rounded-3xl border border-border/50 shadow-inner">
                   <p className="text-[10px] font-black text-muted mb-3 uppercase tracking-widest text-center">Nghe Audio</p>
                   <audio 
                      controls 
                      controlsList="nodownload"
                      className="w-full outline-none [&::-webkit-media-controls-enclosure]:bg-white/5 [&::-webkit-media-controls-panel]:bg-transparent" 
                      src={chapter.audioUrl} 
                      preload="none"
                   >
                      Trình duyệt của bạn không hỗ trợ thẻ audio.
                   </audio>
                </div>
              )}
              {chapter.videoUrl && (
                <div className="w-full aspect-video max-w-3xl rounded-2xl overflow-hidden shadow-2xl border border-border/20 bg-black/50 relative">
                  <iframe 
                    className="absolute inset-0 w-full h-full"
                    src={
                      chapter.videoUrl.includes("youtube.com/watch?v=") 
                        ? chapter.videoUrl.replace("watch?v=", "embed/").split("&")[0]
                        : chapter.videoUrl.includes("youtu.be/")
                        ? chapter.videoUrl.replace("youtu.be/", "www.youtube.com/embed/").split("?")[0]
                        : chapter.videoUrl
                    } 
                    title="Video Player" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen>
                  </iframe>
                </div>
              )}
            </div>
          )}

          {/* Chapter Content */}
          <div className="novel-content px-4 md:px-0">
             {chapter.content.map((line, idx) => (
                <p key={idx} className="mb-8 leading-relaxed opacity-95">
                  {line}
                </p>
             ))}
          </div>

          {/* Chapter Navigation Footer (Desktop Only) */}
          <section className="pt-20 border-t border-border hidden md:block">
             <div className="grid grid-cols-2 gap-4">
                {previousChapter ? (
                   <Link 
                      href={`/truyen/${story.slug}/chuong/${previousChapter.order}`}
                      className="flex flex-col gap-2 p-5 rounded-2xl bg-surface-strong border border-transparent hover:border-accent/40 group transition-all"
                   >
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted/60 group-hover:text-accent/60">Chương trước</span>
                      <span className="text-sm font-semibold text-foreground line-clamp-1">← Quay lại</span>
                   </Link>
                ) : <div className="p-5 rounded-2xl bg-surface-strong/30 border border-transparent opacity-50 cursor-not-allowed">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted/60">Chương trước</span>
                      <span className="text-sm font-semibold text-foreground">Hết chương</span>
                    </div>}

                {nextChapter ? (
                   <Link 
                      href={`/truyen/${story.slug}/chuong/${nextChapter.order}`}
                      className="flex flex-col gap-2 p-5 rounded-2xl bg-accent text-white shadow-xl shadow-accent/20 hover:brightness-105 group transition-all text-right"
                   >
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Chương tiếp</span>
                      <span className="text-sm font-semibold line-clamp-1">Tiếp tục →</span>
                   </Link>
                ) : <div className="p-5 rounded-2xl bg-surface-strong/30 border border-transparent opacity-50 cursor-not-allowed text-right">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted/60">Chương tiếp</span>
                      <span className="text-sm font-semibold text-foreground">Hết chương</span>
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

      <input type="checkbox" id="toc-modal" className="peer hidden" />

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden flex items-center justify-between gap-1 bg-[#18181b]/95 backdrop-blur-2xl rounded-full px-2 py-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10 transition-all scale-95">
         {/* Previous Button */}
         {previousChapter ? (
            <Link href={`/truyen/${story.slug}/chuong/${previousChapter.order}`} className="flex items-center justify-center p-2.5 rounded-full text-white/80 hover:text-accent transition-colors active:scale-90">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
               </svg>
            </Link>
         ) : (
            <div className="flex items-center justify-center p-2.5 rounded-full text-white/20">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
               </svg>
            </div>
         )}
         
         <div className="w-[1px] h-4 bg-white/15 mx-1" />
         
         {/* TOC Popup Trigger */}
         <label htmlFor="toc-modal" className="flex items-center gap-2 justify-center px-5 py-2.5 rounded-full bg-accent text-white shadow-lg shadow-accent/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer">
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-[0.1em] mt-0.5">Mục Lục</span>
         </label>

         <div className="w-[1px] h-4 bg-white/15 mx-1" />
         
         {/* Next Button */}
         {nextChapter ? (
            <Link href={`/truyen/${story.slug}/chuong/${nextChapter.order}`} className="flex items-center justify-center p-2.5 rounded-full text-white/80 hover:text-accent transition-colors active:scale-90">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
               </svg>
            </Link>
         ) : (
            <div className="flex items-center justify-center p-2.5 rounded-full text-white/20">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
               </svg>
            </div>
         )}
      </nav>

      {/* Pure CSS TOC Popup Modal */}
      <div className="fixed inset-0 z-[100] hidden peer-checked:flex items-end sm:items-center justify-center">
         <label htmlFor="toc-modal" className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0 cursor-default" />
         <div className="relative w-full sm:max-w-md h-[80vh] sm:h-[60vh] bg-surface rounded-t-[2rem] sm:rounded-3xl shadow-[0_-20px_60px_rgba(0,0,0,0.5)] flex flex-col z-10 animate-in slide-in-from-bottom-6 fade-in duration-300">
            <div className="px-6 py-5 border-b border-border/60 flex items-center justify-between bg-surface-strong/80 backdrop-blur top-0 sticky rounded-t-[2rem]">
               <h3 className="font-black text-lg novel-title">Mục lục</h3>
               <label htmlFor="toc-modal" className="w-8 h-8 flex items-center justify-center bg-black/5 rounded-full cursor-pointer hover:bg-black/10 transition-colors text-muted">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
               </label>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
               {story.chapters.map(c => (
                  <Link 
                     href={`/truyen/${story.slug}/chuong/${c.order}`} 
                     key={c.id} 
                     className={`block px-5 py-3.5 rounded-2xl transition-all font-bold text-sm ${
                        c.id === chapter.id 
                           ? 'bg-accent/15 text-accent' 
                           : 'hover:bg-surface-strong text-foreground/80'
                     }`}
                  >
                     <span className="opacity-50 text-[10px] uppercase tracking-widest block mb-0.5">Chương {c.order}</span>
                     {c.title}
                  </Link>
               ))}
            </div>
         </div>
      </div>
      
      <SaveReadingProgress 
        storySlug={story.slug}
        storyTitle={story.title}
        chapterId={chapter.id}
        chapterOrder={chapter.order}
        chapterTitle={chapter.title}
      />
    </div>
  );
}
