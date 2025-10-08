import SearchBox from '@/components/ui/SearchBox';
import HomeBanner from './HomeBanner';
import ServiceSection from './ServiceSection';
import HotDestinations from './HotDestinations';
import HotSearchSection from './HotSearchSection';
import PopularPostsSection from './PopularPostsSection';
import HotBloggerSection from './HotBloggerSection';
import FeedbackSection from './FeedbackSection';
import TrendSection from './TrendSection';
import Image from 'next/image';
import QNASection from './QNASection';

export default function UserHomePage() {
  return (
    <div className="relative overflow-hidden">
    <div className="absolute w-[500px] h-[450px] bg-[var(--secondary)] opacity-50 blur-[250px] pointer-events-none" style={{ top: "400px", left: "-420px" }} />
    <div className="absolute w-[500] h-[550px] bg-[var(--primary)] opacity-50 blur-[250px] pointer-events-none" style={{ top: "770px", left: "1470px" }} />
    <div className="absolute w-[400px] h-[300px] bg-[var(--primary)] opacity-50 blur-[250px] pointer-events-none" style={{ top: "1350px", left: "-300px" }} />
    <div className="absolute w-[500px] h-[450px] bg-[var(--secondary)] opacity-50 blur-[250px] pointer-events-none" style={{ top: "2050px", left: "1470px" }} />
    <div className="absolute w-[400px] h-[300px] bg-[var(--primary)] opacity-50 blur-[250px] pointer-events-none" style={{ top: "2980px", left: "-150px" }} />
    <div className="absolute w-[500px] h-[550px] bg-[var(--secondary)] opacity-50 blur-[250px] pointer-events-none" style={{ top: "4750px", left: "1470px" }} />
      <HomeBanner />
      <SearchBox searchType="all" />
      <ServiceSection />
      <HotDestinations />
      <HotSearchSection/>
      <PopularPostsSection/>
      <HotBloggerSection/>
      <FeedbackSection/>
      <TrendSection/>
      <div className="absolute pointer-events-none" style={{ top: '4900px',zIndex: 0 }}>
        <Image
          src="/OBJECTS.svg"
          alt="Background Objects"
          width={200}
          height={200}
        />
      </div>
      <QNASection/>
    </div>
  );
}