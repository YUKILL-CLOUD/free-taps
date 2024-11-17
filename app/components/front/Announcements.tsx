import { Announcement } from '@/types/announcement';


interface AnnouncementsProps {
    announcements: Announcement[]; // Replace 'any' with your Announcement type
}

export default function Announcements({ announcements }: AnnouncementsProps) {
    if (!announcements || announcements.length === 0) {
        return null;
      }
    return (
        <div className="bg-white p-4 rounded-md shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Announcements</h1>
            </div>
            <div className="flex flex-col gap-4 mt-4">
                {announcements.map((announcement, index) => (
                    <div 
                        key={announcement.id} 
                        className={`rounded-md p-4 ${
                            index % 3 === 0 ? "bg-mainColor-light shadow-md" :
                            index % 3 === 1 ? "bg-mainColor-700" :
                            "bg-mainColor-900"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="font-medium">{announcement.title}</h2>
                            <span className="text-xs text-gray-600 bg-white rounded-md px-1 py-1">
                                {new Date(announcement.startDate).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">
                            {announcement.content}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}
