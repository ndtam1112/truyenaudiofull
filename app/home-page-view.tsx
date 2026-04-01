import type { Metadata } from "next";
import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { Header } from "@/components/header";
import { HeroBanner } from "@/components/hero-banner";
import { Row } from "@/components/row";
import { StoryCard } from "@/components/story-card";
import { buildMetadata } from "@/lib/metadata";
import { getHomePage, getStoriesPage } from "@/lib/stories";

export const metadata: Metadata = buildMetadata({
  title: "NeuralStudio - Đọc truyện online miễn phí",
  description:
    "Nền tảng đọc truyện chữ, truyện dịch, truyện convert chất lượng cao. Hàng nghìn tác phẩm hấp dẫn đang chờ bạn.",
  path: "/",
});

type HomePageViewProps = {
  searchParams?: Promise<{
    q?: string;
    genre?: string;
  }>;
};

export default async function HomePageView({ searchParams: searchParamsPromise }: HomePageViewProps) {
  const searchParams = (await searchParamsPromise) || {};
  const { featuredStory, stories, latestStories, popularStories, genres } = await getHomePage();
  
  const results = await getStoriesPage({
    q: searchParams.q,
    genre: searchParams.genre,
    page: 1,
    pageSize: 12,
  });
  
  const hasSearch = Boolean(searchParams.q?.trim() || searchParams.genre?.trim());

  if (!featuredStory) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header genres={genres} initialQuery={searchParams.q ?? ""} />
        <main className="page-shell py-12 text-center">
           <h1 className="text-2xl font-bold">Chưa có truyện để hiển thị.</h1>
           <p className="mt-2 text-muted">Vui lòng quay lại sau.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 md:pb-0">
      <Header genres={genres} initialQuery={searchParams.q ?? ""} />
      
      <main className="page-shell py-8 space-y-12 md:py-12 md:space-y-16">
        
        {/* Featured & Rankings Section */}
        {!hasSearch && <HeroBanner story={featuredStory} topStories={popularStories} />}

        {hasSearch ? (
          <Row
            title="Kết quả tìm kiếm"
            description={`Tìm thấy ${results.items.length} truyện phù hợp.`}
          >
            {results.items.map((story) => (
              <StoryCard
                key={`result-${story.id}`}
                story={story}
              />
            ))}
          </Row>
        ) : (
          <>
            {/* Hot Stories Grid */}
            <Row
              title="Truyện Hot"
              eyebrow="Đang được săn đón"
              description="Những tác phẩm có lượt đọc cao nhất trong tuần qua."
              href="/collections/hot"
            >
              {popularStories.slice(0, 5).map((story) => (
                <StoryCard
                  key={`popular-${story.id}`}
                  story={story}
                />
              ))}
            </Row>

            {/* New Updates Section */}
            <div className="grid lg:grid-cols-[1fr_320px] gap-8">
              <Row
                title="Mới cập nhật"
                eyebrow="Tươi mới"
                description="Những chương mới vừa được đăng tải từ các tác giả."
              >
                {latestStories.slice(0, 10).map((story) => (
                  <StoryCard
                    key={`updated-${story.id}`}
                    story={story}
                  />
                ))}
              </Row>

              {/* Quick Genre Sidebar */}
              <aside className="hidden lg:block space-y-8">
                <div className="bg-surface p-6 rounded-2xl border border-border">
                  <h2 className="text-lg font-black novel-title mb-6">Thể loại phổ biến</h2>
                  <div className="flex flex-wrap gap-2">
                    {genres.slice(0, 15).map((genre) => (
                      <Link 
                        key={genre} 
                        href={`/?genre=${genre}`}
                        className="text-[11px] font-bold px-3 py-1.5 rounded-full border border-border/60 hover:border-accent hover:text-accent transition-all uppercase tracking-wide"
                      >
                        {genre}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="bg-accent/5 p-6 rounded-2xl border border-accent/10">
                   <h2 className="text-sm font-black uppercase tracking-widest text-accent mb-4">Bạn muốn viết truyện?</h2>
                   <p className="text-xs text-muted leading-relaxed mb-4">Trở thành tác giả của NeuralStudio và chia sẻ đam mê của bạn với hàng ngàn độc giả.</p>
                   <Link href="/author/register" className="inline-flex w-full items-center justify-center bg-accent text-white py-2.5 rounded-xl text-xs font-bold shadow-md hover:brightness-105 transition-all">
                      Đăng ký ngay
                   </Link>
                </div>
              </aside>
            </div>

            {/* Category Rows */}
            <Row
              title="Tiên Hiệp & Kiếm Hiệp"
              eyebrow="Thế giới huyền ảo"
              description="Khám phá những vùng đất thần tiên qua các tác phẩm đặc sắc."
              href="/genre/tien-hiep"
            >
              {stories.slice(5, 10).map((story) => (
                <StoryCard
                  key={`category-${story.id}`}
                  story={story}
                />
              ))}
            </Row>
          </>
        )}
      </main>
      
      <BottomNav />
      
      {/* Footer (Novel Style) */}
      <footer className="border-t border-border bg-white py-12 mt-20">
         <div className="page-shell text-center">
            <h2 className="text-xl font-bold tracking-tight text-foreground mb-4">NeuralStudio.</h2>
            <p className="text-sm text-muted max-w-md mx-auto mb-8">Nền tảng đọc truyện chữ hàng đầu Việt Nam, mang đến trải nghiệm đọc tốt nhất cho người dùng.</p>
            <div className="flex justify-center gap-6 text-xs font-bold text-muted uppercase tracking-widest">
               <Link href="/about" className="hover:text-accent font-sans decoration-0">Giới thiệu</Link>
               <Link href="/contact" className="hover:text-accent font-sans decoration-0">Liên hệ</Link>
               <Link href="/terms" className="hover:text-accent font-sans decoration-0">Điều khoản</Link>
            </div>
            <p className="mt-12 text-[10px] text-muted/40 uppercase tracking-widest">© 2026 NeuralStudio. All rights reserved.</p>
         </div>
      </footer>
    </div>
  );
}
