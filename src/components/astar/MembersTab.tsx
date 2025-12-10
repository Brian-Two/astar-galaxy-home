import { Member } from './types';
import { Badge } from '@/components/ui/badge';

interface MembersTabProps {
  members: Member[];
}

export const MembersTab = ({ members }: MembersTabProps) => {
  return (
    <div className="p-4 h-full flex flex-col">
      <h3 className="font-semibold text-foreground mb-4">Members</h3>
      
      <div className="flex-1 overflow-y-auto space-y-3">
        {members.map((member, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border"
          >
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="font-semibold text-primary">
                {member.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground text-sm">{member.name}</h4>
              <Badge variant="outline" className="text-xs mt-0.5">{member.role}</Badge>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-muted/20 border border-dashed border-border">
        <p className="text-xs text-muted-foreground text-center">
          In future versions, members can join you in this space and collaborate in real time.
        </p>
      </div>
    </div>
  );
};
