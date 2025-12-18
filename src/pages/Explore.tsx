import { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import { GalaxyBackground } from '@/components/galaxy/GalaxyBackground';
import { Sidebar } from '@/components/navigation/Sidebar';
import { UserStatus } from '@/components/galaxy/UserStatus';
import { ExploreRow } from '@/components/explore/ExploreRow';
import { ExploreCard } from '@/components/explore/ExploreCard';
import { TrendingPlanetCard } from '@/components/explore/TrendingPlanetCard';
import { TutoringTabs } from '@/components/explore/TutoringTabs';
import { DetailModal } from '@/components/explore/DetailModal';
import { CreatePostModal } from '@/components/explore/CreatePostModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  externalOpportunities,
  communityProjects,
  trendingPlanets,
  trendingAgents,
  tutoringNeeds,
  tutoringOffers,
  mockUserProfile,
  sortByPersonalization,
  ExploreItem,
} from '@/data/exploreData';

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<ExploreItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // User-created posts stored in state
  const [userProjects, setUserProjects] = useState<ExploreItem[]>([]);
  const [userTutoringNeeds, setUserTutoringNeeds] = useState<ExploreItem[]>([]);
  const [userTutoringOffers, setUserTutoringOffers] = useState<ExploreItem[]>([]);
  const [userResources, setUserResources] = useState<ExploreItem[]>([]);

  // Filter function for search
  const filterItems = (items: ExploreItem[]) => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.subject?.toLowerCase().includes(query) ||
      item.tags.some(tag => tag.toLowerCase().includes(query))
    );
  };

  // Personalized and filtered data
  const opportunities = useMemo(() => 
    filterItems(sortByPersonalization([...externalOpportunities, ...userResources], mockUserProfile)),
    [searchQuery, userResources]
  );
  
  const projects = useMemo(() => 
    filterItems(sortByPersonalization([...userProjects, ...communityProjects], mockUserProfile)),
    [searchQuery, userProjects]
  );
  
  const planets = useMemo(() => 
    filterItems(sortByPersonalization(trendingPlanets, mockUserProfile)),
    [searchQuery]
  );
  
  const agents = useMemo(() => 
    filterItems(sortByPersonalization(trendingAgents, mockUserProfile)),
    [searchQuery]
  );
  
  const needHelp = useMemo(() => 
    filterItems(sortByPersonalization([...userTutoringNeeds, ...tutoringNeeds], mockUserProfile)),
    [searchQuery, userTutoringNeeds]
  );
  
  const offeringHelp = useMemo(() => 
    filterItems(sortByPersonalization([...userTutoringOffers, ...tutoringOffers], mockUserProfile)),
    [searchQuery, userTutoringOffers]
  );

  const handleCardClick = (item: ExploreItem) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const handleCreatePost = (item: ExploreItem) => {
    switch (item.type) {
      case 'project':
        setUserProjects(prev => [item, ...prev]);
        break;
      case 'tutoring-need':
        setUserTutoringNeeds(prev => [item, ...prev]);
        break;
      case 'tutoring-offer':
        setUserTutoringOffers(prev => [item, ...prev]);
        break;
      case 'opportunity':
        setUserResources(prev => [item, ...prev]);
        break;
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <GalaxyBackground />
      <Sidebar />
      <UserStatus name="Brian" points={1250} />

      <div className="relative z-10 min-h-screen pl-24 pr-8 py-6">
        {/* Header */}
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-6 mb-8">
            {/* Title */}
            <h1 className="font-display text-2xl font-bold text-foreground">
              Explore
            </h1>

            {/* Search */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search opportunities, projects, planets, agents..."
                  className="pl-10 bg-card/60 border-border/50"
                />
              </div>
            </div>

            {/* Create Post Button */}
            <Button onClick={() => setIsCreateOpen(true)} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Create Post
            </Button>
          </div>

          {/* Rows */}
          <div className="space-y-2">
            {/* External Opportunities */}
            <ExploreRow 
              title="External Opportunities For You" 
              subtitle="Curated resources, competitions, and internships"
            >
              {opportunities.map(item => (
                <ExploreCard key={item.id} item={item} onClick={() => handleCardClick(item)} />
              ))}
            </ExploreRow>

            {/* Community Projects */}
            <ExploreRow 
              title="Community Projects & Challenges"
              subtitle="Join projects created by other learners"
            >
              {projects.map(item => (
                <ExploreCard key={item.id} item={item} onClick={() => handleCardClick(item)} />
              ))}
            </ExploreRow>

            {/* Trending Planets */}
            <ExploreRow 
              title="Trending Planets"
              subtitle="Popular learning galaxies this week"
            >
              {planets.map((item, index) => (
                <TrendingPlanetCard key={item.id} item={item} onClick={() => handleCardClick(item)} index={index} />
              ))}
            </ExploreRow>

            {/* Trending Agents */}
            <ExploreRow 
              title="Trending Learning Agents"
              subtitle="AI-powered study tools from the community"
            >
              {agents.map(item => (
                <ExploreCard key={item.id} item={item} onClick={() => handleCardClick(item)} />
              ))}
            </ExploreRow>

            {/* Tutoring */}
            <TutoringTabs
              needHelp={needHelp}
              offeringHelp={offeringHelp}
              onCardClick={handleCardClick}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <DetailModal
        item={selectedItem}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
};

export default Explore;
