import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import { ExploreCard } from './ExploreCard';
import { ExploreItem } from '@/data/exploreData';

interface TutoringTabsProps {
  needHelp: ExploreItem[];
  offeringHelp: ExploreItem[];
  onCardClick: (item: ExploreItem) => void;
  onSeeAll?: (tab: 'need' | 'offer') => void;
}

export const TutoringTabs = ({ needHelp, offeringHelp, onCardClick, onSeeAll }: TutoringTabsProps) => {
  const [activeTab, setActiveTab] = useState<'need' | 'offer'>('need');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const items = activeTab === 'need' ? needHelp : offeringHelp;

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="mb-8">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Tutoring
          </h2>
          <div className="flex bg-secondary/50 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('need')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === 'need'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Need Help
            </button>
            <button
              onClick={() => setActiveTab('offer')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === 'offer'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Offering Help
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              canScrollLeft 
                ? 'bg-secondary hover:bg-secondary/80 text-foreground' 
                : 'opacity-30 cursor-not-allowed text-muted-foreground'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              canScrollRight 
                ? 'bg-secondary hover:bg-secondary/80 text-foreground' 
                : 'opacity-30 cursor-not-allowed text-muted-foreground'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {onSeeAll && (
            <button 
              onClick={() => onSeeAll(activeTab)}
              className="text-sm text-primary hover:text-primary/80 font-medium ml-2"
            >
              See all
            </button>
          )}
        </div>
      </div>

      {/* Cards */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map(item => (
          <ExploreCard
            key={item.id}
            item={item}
            onClick={() => onCardClick(item)}
            variant="compact"
          />
        ))}
      </div>
    </div>
  );
};
