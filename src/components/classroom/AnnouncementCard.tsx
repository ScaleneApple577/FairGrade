import { format } from "date-fns";

interface AnnouncementCardProps {
  author: string;
  date: string;
  message: string;
}

export function AnnouncementCard({ author, date, message }: AnnouncementCardProps) {
  return (
    <div className="gc-card p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-[#1a73e8] flex items-center justify-center text-white text-sm font-medium">
          {author.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium text-[#202124]">{author}</p>
          <p className="text-xs text-[#5f6368]">{format(new Date(date), 'MMM d, yyyy')}</p>
        </div>
      </div>
      <p className="text-sm text-[#3c4043] whitespace-pre-wrap">{message}</p>
    </div>
  );
}
