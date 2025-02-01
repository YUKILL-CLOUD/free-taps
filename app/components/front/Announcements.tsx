import { Announcement } from '@/types/announcement';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

interface AnnouncementsProps {
    announcements: Announcement[];
}

export default function Announcements({ announcements }: AnnouncementsProps) {
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

    if (!announcements || announcements.length === 0) {
        return null;
    }

    // Sort announcements to show important ones first
    const sortedAnnouncements = [...announcements].sort((a, b) => {
        if (a.status === 'important' && b.status !== 'important') return -1;
        if (a.status !== 'important' && b.status === 'important') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return (
        <>
            <div className="bg-white p-4 rounded-md shadow-md hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Announcements</h1>
                </div>
                <div className="flex flex-col gap-4 mt-4 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-mainColor-200 scrollbar-track-transparent hover:scrollbar-thumb-mainColor-300 pr-2">
                    {sortedAnnouncements.map((announcement) => (
                        <div 
                            key={announcement.id} 
                            className={`rounded-md p-4 ${announcement.status === 'important' ? 'bg-red-50' : 'bg-mainColor-light'} shadow-md cursor-pointer hover:shadow-lg transition-all duration-200`}
                            onClick={() => setSelectedAnnouncement(announcement)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 max-w-[70%]">
                                    <h2 className="font-medium truncate">{announcement.title}</h2>
                                    {announcement.status === 'important' && (
                                        <Badge variant="destructive" className="flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            Important
                                        </Badge>
                                    )}
                                </div>
                                <span className="text-xs text-gray-600 bg-white rounded-md px-1 py-1">
                                    {new Date(announcement.startDate).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                                {announcement.content}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <Dialog open={!!selectedAnnouncement} onOpenChange={() => setSelectedAnnouncement(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedAnnouncement?.title}
                            {selectedAnnouncement?.status === 'important' && (
                                <Badge variant="destructive" className="flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Important
                                </Badge>
                            )}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedAnnouncement?.content}</p>
                        <div className="flex justify-between items-center mt-6 text-sm text-gray-500 pt-4 border-t">
                            <span>Starts: {selectedAnnouncement && new Date(selectedAnnouncement.startDate).toLocaleDateString('en-US', { 
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}</span>
                            <span>Ends: {selectedAnnouncement && new Date(selectedAnnouncement.endDate).toLocaleDateString('en-US', { 
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}</span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
