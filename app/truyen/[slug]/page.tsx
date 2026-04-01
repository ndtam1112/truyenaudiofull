import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { buildMetadata } from "@/lib/metadata";
import { getStoryDetail, getHomePage } from "@/lib/stories";

type StoryDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: StoryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getStoryDetail(slug);

  if (!result) {
    return buildMetadata({
      title: "Không tìm thấy truyện",
      description: "Truyện bạn đang tìm không tồn tại hoặc đã bị gỡ bỏ.",
      path: `/truyen/${slug}`,
    });
  }

  return buildMetadata({
    title: result.story.title,
    description: result.story.summary,
    path: `/truyen/${result.story.slug}`,
  });
}

export default async function StoryDetailPage({
  params,
}: StoryDetailPageProps) {
  const { slug } = await params;
  const content = await getStoryDetail(slug);
  const homeData = await getHomePage();

  if (!content) {
    notFound();
  }

  const { story, chapters } = content;
  const firstChapter = chapters[0] ?? null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header genres={homeData.genres} />
      
      <main className="page-shell py-8 md:py-12">
        {/* Story Breadcrumb */}
        <nav className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-muted/40 mb-6 overflow-hidden whitespace-nowrap">
           <Link href="/" className="hover:text-accent transition-colors shrink-0">Trang chủ</Link>
           <span className="opacity-20 shrink-0">/</span>
           <span className="shrink-0">{story.genre}</span>
           <span className="opacity-20 shrink-0">/</span>
           <span className="text-foreground/40 truncate">{story.title}</span>
        </nav>

        {/* Story Header Section - Compact & Mobile Optimized */}
        <section className="bg-white border border-border/80 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 shadow-xl shadow-black/[0.02]">
           <div className="flex flex-col md:flex-row gap-6 lg:gap-12 items-start">
              
              {/* Mobile: Cover + Title Side-by-Side. Desktop: Cover Only */}
              <div className="flex gap-5 md:contents w-full">
                 {/* Cover Image */}
                 <div className="relative w-[100px] sm:w-[120px] md:w-64 aspect-[3/4] shrink-0 overflow-hidden rounded-xl md:rounded-2xl shadow-lg md:shadow-2xl shadow-black/10">
                    {story.cover ? (
                       <Image 
                         src={story.cover} 
                         alt={story.title} 
                         fill 
                         priority
                         sizes="(max-width: 768px) 120px, 256px"
                         className="object-cover"
                       />
                    ) : (
                       <div className="h-full w-full bg-surface-strong" />
                    )}
                    <div className="absolute top-2 left-2 md:top-4 md:left-4">
                       <span className={`badge ${story.status === 'Completed' ? 'badge-completed' : 'badge-ongoing'} shadow-md border-none scale-75 md:scale-100 origin-top-left`}>
                          {story.status === 'Completed' ? 'Hoàn thành' : 'Đang ra'}
                       </span>
                    </div>
                 </div>

                 {/* Mobile Only: Title & Basic Info */}
                 <div className="flex flex-col justify-center flex-1 md:hidden">
                    <h1 className="font-display novel-title text-xl sm:text-2xl text-foreground mb-2 line-clamp-3 leading-tight">
                       {story.title}
                    </h1>
                    <p className="text-xs font-semibold text-muted mb-1">{story.author}</p>
                    <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{story.genre}</span>
                 </div>
              </div>

              {/* Story Info */}
              <div className="flex-1 flex flex-col w-full">
                 {/* Desktop Title */}
                 <h1 className="hidden md:block font-display novel-title text-3xl md:text-5xl text-foreground mb-6">
                    {story.title}
                 </h1>
                 
                 {/* Mobile Actions: immediately below cover/title row */}
                 <div className="flex gap-3 mb-6 md:hidden w-full">
                    {firstChapter && (
                       <Link 
                          href={`/truyen/${story.slug}/chuong/${firstChapter.id}`}
                          className="flex-1 h-12 inline-flex items-center justify-center bg-accent text-white rounded-xl font-bold text-sm shadow-md shadow-accent/20 active:scale-95 transition-all"
                       >
                          Đọc Từ Đầu
                       </Link>
                    )}
                    <button className="flex-1 h-12 inline-flex items-center justify-center bg-surface-strong text-foreground border border-border rounded-xl font-bold text-sm active:scale-95 transition-all">
                       Vào Kệ
                    </button>
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 md:py-0 md:border-y border-border md:mb-6 mt-2 md:mt-0">
                    <div className="space-y-0.5 hidden md:block border-b border-border md:border-none pb-4 md:pb-0">
                       <p className="text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Tác giả</p>
                       <p className="text-sm font-bold text-foreground/80 truncate border-l border-accent pl-3 mt-1.5">{story.author}</p>
                    </div>
                    <div className="space-y-0.5 hidden md:block border-b border-border md:border-none pb-4 md:pb-0">
                       <p className="text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Thể loại</p>
                       <p className="text-sm font-bold text-accent border-l border-accent pl-3 mt-1.5">{story.genre}</p>
                    </div>
                    <div className="space-y-0.5 border-t border-border md:border-none pt-4 md:pt-0">
                       <p className="text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Chương</p>
                       <p className="text-sm font-bold text-foreground/80 md:border-l md:border-accent md:pl-3 md:mt-1.5">{story.chapterCount}</p>
                    </div>
                    <div className="space-y-0.5 border-t border-border md:border-none pt-4 md:pt-0">
                       <p className="text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Thời gian</p>
                       <p className="text-sm font-bold text-foreground/80 md:border-l md:border-accent md:pl-3 md:mt-1.5">{story.totalReadingTime}</p>
                    </div>
                 </div>

                 {/* Desktop Actions */}
                 <div className="hidden md:flex flex-row gap-4 pt-2">
                    {firstChapter && (
                       <Link 
                          href={`/truyen/${story.slug}/chuong/${firstChapter.id}`}
                          className="inline-flex h-14 items-center justify-center bg-accent text-white px-12 rounded-2xl font-bold text-base shadow-xl shadow-accent/30 hover:scale-[1.02] hover:brightness-110 active:scale-95 transition-all"
                       >
                          Đọc Từ Đầu
                       </Link>
                    )}
                    <button className="inline-flex h-14 items-center justify-center bg-white text-foreground border border-border px-10 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all active:scale-95">
                       Thêm Vào Kệ
                    </button>
                 </div>
              </div>
           </div>
        </section>

        <div className="grid lg:grid-cols-[1fr_360px] gap-12 mt-12">
           {/* Main Content (Synopsis & Chapter List) */}
           <div className="space-y-16">
              {/* Synopsis */}
              <section>
                 <h2 className="font-display novel-title text-2xl text-foreground mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-accent rounded-full" />
                    Giới thiệu
                 </h2>
                 <div className="novel-content text-muted leading-relaxed whitespace-pre-wrap px-4">
                    {story.summary || "Thông tin giới thiệu về tác phẩm này đang được cập nhật. Vui lòng quay lại sau."}
                 </div>
              </section>

              {/* Chapter List */}
              <section id="chapters">
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="font-display novel-title text-2xl text-foreground flex items-center gap-3">
                       <span className="w-1.5 h-6 bg-accent rounded-full" />
                       Danh sách chương
                    </h2>
                    <span className="text-sm font-bold text-muted">{story.chapterCount} chương</span>
                 </div>
                 
                 <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 px-1">
                    {chapters.map((chapter) => (
                       <Link 
                          key={chapter.id}
                          href={`/truyen/${story.slug}/chuong/${chapter.id}`}
                          className="group py-3 border-b border-border/40 hover:border-accent/40 flex items-center justify-between gap-4 transition-all"
                       >
                          <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors line-clamp-1">
                             Chương {chapter.order}: {chapter.title}
                          </span>
                          <span className="text-[10px] font-bold text-muted/30 group-hover:text-accent/40 transition-colors uppercase whitespace-nowrap">
                             {chapter.readingTime}
                          </span>
                       </Link>
                    ))}
                 </div>
              </section>
           </div>

           {/* Sidebar */}
           <aside className="space-y-12">
              <div className="bg-surface p-8 rounded-3xl border border-border">
                 <h3 className="font-display novel-title text-xl mb-6">Có thể bạn quan tâm</h3>
                 <div className="space-y-4">
                    {homeData.latestStories.slice(0, 5).map((s) => (
                       <Link 
                          key={`rec-${s.id}`} 
                          href={`/truyen/${s.slug}`}
                          className="flex gap-4 group"
                       >
                          <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg shadow-sm">
                             {s.cover ? <Image src={s.cover} alt={s.title} fill sizes="48px" className="object-cover" /> : <div className="h-full w-full bg-surface-strong" />}
                          </div>
                          <div className="min-w-0 flex flex-col justify-center">
                             <h4 className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-accent transition-colors">{s.title}</h4>
                             <p className="text-[10px] text-muted mt-1">{s.genre}</p>
                          </div>
                       </Link>
                    ))}
                 </div>
              </div>
           </aside>
        </div>
      </main>

      {/* Novel Footer (Already globally in home-page-view, but for this page shell) */}
      <footer className="border-t border-border bg-white py-12 mt-20">
         <div className="page-shell text-center">
            <h2 className="text-xl font-bold tracking-tight text-foreground mb-4">NeuralStudio.</h2>
            <p className="text-sm text-muted max-w-md mx-auto mb-8">Nền tảng đọc truyện chữ hàng đầu Việt Nam, mang đến trải nghiệm đọc tốt nhất cho người dùng.</p>
            <p className="mt-12 text-[10px] text-muted/40 uppercase tracking-widest">© 2026 NeuralStudio. All rights reserved.</p>
         </div>
      </footer>
    </div>
  );
}
