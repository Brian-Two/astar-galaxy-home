import { useState } from 'react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy, Rocket, UserPlus, Check, X } from 'lucide-react';

interface Friend {
  id: string;
  name: string;
  initials: string;
  planet: string;
  planetColor: string;
  lastActive: string;
  isOnline: boolean;
}

interface FriendRequest {
  id: string;
  name: string;
  initials: string;
  mutualSubjects: string[];
}

const initialFriends: Friend[] = [
  { id: '1', name: 'Alex Chen', initials: 'AC', planet: 'Physics', planetColor: '#3B82F6', lastActive: '2m ago', isOnline: true },
  { id: '2', name: 'Maya Rodriguez', initials: 'MR', planet: 'Calculus', planetColor: '#8B5CF6', lastActive: '10m ago', isOnline: true },
  { id: '3', name: 'Jordan Kim', initials: 'JK', planet: 'Chemistry', planetColor: '#10B981', lastActive: '1h ago', isOnline: false },
  { id: '4', name: 'Sam Taylor', initials: 'ST', planet: 'Biology', planetColor: '#F59E0B', lastActive: '3h ago', isOnline: false },
];

const initialRequests: FriendRequest[] = [
  { id: '1', name: 'Emma Wilson', initials: 'EW', mutualSubjects: ['Calculus', 'Computer Science'] },
  { id: '2', name: 'Liam Johnson', initials: 'LJ', mutualSubjects: ['Physics', 'Chemistry'] },
];

const Friends = () => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'rewards'>('friends');
  const [friends, setFriends] = useState<Friend[]>(initialFriends);
  const [requests, setRequests] = useState<FriendRequest[]>(initialRequests);
  const [points, setPoints] = useState(1250);
  const [totalReferralRewards, setTotalReferralRewards] = useState(0);
  const { toast } = useToast();

  const onlineFriendsCount = friends.filter(f => f.isOnline).length;

  const handleAcceptRequest = (request: FriendRequest) => {
    const newFriend: Friend = {
      id: `new-${request.id}`,
      name: request.name,
      initials: request.initials,
      planet: request.mutualSubjects[0] || 'Home',
      planetColor: '#6366F1',
      lastActive: 'Just now',
      isOnline: true,
    };
    setFriends([newFriend, ...friends]);
    setRequests(requests.filter(r => r.id !== request.id));
    toast({
      title: "Friend added!",
      description: `${request.name} is now your friend.`,
    });
  };

  const handleDeclineRequest = (requestId: string) => {
    setRequests(requests.filter(r => r.id !== requestId));
  };

  const handleReferralReward = () => {
    setPoints(points + 100);
    setTotalReferralRewards(totalReferralRewards + 100);
    toast({
      title: "Nice work, pilot!",
      description: "You earned +100 stars for a referral.",
    });
  };

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText('ASTAR-PILOT-2024');
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard.",
    });
  };

  const tabs = [
    { id: 'friends', label: 'Friends' },
    { id: 'requests', label: 'Requests' },
    { id: 'rewards', label: 'Refer & Rewards' },
  ] as const;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      
      {/* Top right points display */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-4">
        <div className="glass-panel px-4 py-2 flex items-center gap-2">
          <span className="text-yellow-400">★</span>
          <span className="font-medium">{points.toLocaleString()} stars</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
          <span className="text-sm font-medium">U</span>
        </div>
      </div>

      {/* Main content */}
      <main className="ml-20 pt-8 pb-16 px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold mb-2">Friends</h1>
            <p className="text-muted-foreground">
              Find study buddies, manage requests, and earn stars for referrals.
            </p>
          </div>

          {/* Tab bar */}
          <div className="flex gap-2 mb-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'friends' && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="text-sm text-muted-foreground mb-6">
                {friends.length} friends • {onlineFriendsCount} online
              </div>

              {/* Friend cards */}
              {friends.map(friend => (
                <div
                  key={friend.id}
                  className="glass-panel p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium"
                        style={{ backgroundColor: `${friend.planetColor}30`, color: friend.planetColor }}
                      >
                        {friend.initials}
                      </div>
                      {friend.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>

                    {/* Info */}
                    <div>
                      <h3 className="font-medium">{friend.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: friend.planetColor }}
                        />
                        <span>On: {friend.planet} planet</span>
                        <span className="text-muted-foreground/50">•</span>
                        <span>Last active: {friend.lastActive}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Rocket className="w-4 h-4" />
                      Jump to planet
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <UserPlus className="w-4 h-4" />
                      Invite to this planet
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="glass-panel p-8 text-center text-muted-foreground">
                  No friend requests right now.
                </div>
              ) : (
                requests.map(request => (
                  <div
                    key={request.id}
                    className="glass-panel p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                        {request.initials}
                      </div>

                      {/* Info */}
                      <div>
                        <h3 className="font-medium">{request.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Mutual subjects: {request.mutualSubjects.join(', ')}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleAcceptRequest(request)}
                      >
                        <Check className="w-4 h-4" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleDeclineRequest(request.id)}
                      >
                        <X className="w-4 h-4" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="space-y-6">
              {/* Referral explanation card */}
              <div className="glass-panel p-6">
                <h3 className="text-lg font-medium mb-2">Invite Friends, Earn Stars</h3>
                <p className="text-muted-foreground mb-4">
                  Share ASTAR with your friends! When a friend joins and starts using ASTAR, 
                  you'll earn <span className="text-yellow-400 font-medium">100 stars</span>.
                </p>

                {/* Referral code */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 bg-muted/50 rounded-lg px-4 py-3 font-mono text-sm">
                    ASTAR-PILOT-2024
                  </div>
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyReferralCode}>
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                </div>

                {/* Claim reward button */}
                <Button className="w-full gap-2" onClick={handleReferralReward}>
                  <span className="text-yellow-400">★</span>
                  I referred a friend (+100 stars)
                </Button>
              </div>

              {/* Total rewards earned */}
              {totalReferralRewards > 0 && (
                <div className="glass-panel p-4 text-center">
                  <p className="text-muted-foreground">
                    Total referral rewards earned: <span className="text-yellow-400 font-medium">{totalReferralRewards} stars</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Friends;
