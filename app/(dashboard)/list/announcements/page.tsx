import { AnnouncementForm } from '@/app/components/forms/AnnouncementForm';
import { getAnnouncements } from '@/lib/actions';

export default async function AnnouncementsPage() {
    const announcements = await getAnnouncements();

    return (
        <div className="p-6 md:p-8 lg:p-10 w-full max-w-[1500px] mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-mainColor">Manage Announcements</h1>
            <div className="grid grid-cols-1 gap-8">
                <div className="w-full">
                    <AnnouncementForm />
                </div>
                <div className="w-full grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {announcements.map((announcement) => (
                        <div key={announcement.id} className="bg-white rounded-lg shadow p-4">
                            <h2 className="text-xl font-semibold text-mainColor">{announcement.title}</h2>
                            <p className="text-gray-600 mt-2">{announcement.content}</p>
                            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                                <span>Starts: {new Date(announcement.startDate).toLocaleDateString()}</span>
                                <span>Ends: {new Date(announcement.endDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
