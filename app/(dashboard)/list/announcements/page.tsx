"use client";

import { useState, useEffect } from 'react';
import { AnnouncementForm } from '@/app/components/forms/AnnouncementForm';
import { getAnnouncements, deleteAnnouncement } from '@/lib/actions';
import { toast } from 'react-toastify';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Announcement } from '@/types/announcement';


export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const data = await getAnnouncements();
            setAnnouncements(data);
        } catch (error) {
            toast.error('Failed to fetch announcements');
            console.error('Error fetching announcements:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            if (window.confirm('Are you sure you want to delete this announcement?')) {
                const result = await deleteAnnouncement(id);
                if (result.success) {
                    toast.success('Announcement deleted successfully');
                    fetchAnnouncements(); // Refresh the list
                } else {
                    toast.error('Failed to delete announcement');
                }
            }
        } catch (error) {
            toast.error('An error occurred while deleting the announcement');
            console.error('Error deleting announcement:', error);
        }
    };

    const handleEdit = (announcement: Announcement) => {
        // Convert dates to proper Date objects
        const editData = {
            ...announcement,
            startDate: new Date(announcement.startDate),
            endDate: new Date(announcement.endDate),
        };
        setEditingAnnouncement(editData);
        setIsEditing(true);
    };

    return (
        <div className="p-6 md:p-8 lg:p-10 w-full max-w-[1500px] mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-mainColor">Manage Announcements</h1>
            <div className="grid grid-cols-1 gap-8">
                <div className="w-full">
                    {isEditing ? (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Edit Announcement</h2>
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditingAnnouncement(null);
                                    }}
                                >
                                    Cancel Edit
                                </Button>
                            </div>
                            <AnnouncementForm 
                                initialData={editingAnnouncement}
                                onClose={() => {
                                    setIsEditing(false);
                                    setEditingAnnouncement(null);
                                }}
                                onSuccess={() => {
                                    setIsEditing(false);
                                    setEditingAnnouncement(null);
                                    fetchAnnouncements();
                                }}
                            />
                        </>
                    ) : (
                        <>
                            <h2 className="text-xl font-semibold mb-4">Create New Announcement</h2>
                            <AnnouncementForm 
                                onSuccess={() => {
                                    fetchAnnouncements();
                                }}
                            />
                        </>
                    )}
                </div>
                <div className="w-full grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {announcements.map((announcement) => (
                        <div key={announcement.id} className="bg-white rounded-lg shadow p-4 relative flex flex-col min-h-[200px]">
                            <div className="absolute top-2 right-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={() => handleEdit(announcement)}
                                            className="flex items-center cursor-pointer"
                                        >
                                            <Pencil className="mr-2 h-4 w-4" />
                                            <span>Edit</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleDelete(announcement.id)}
                                            className="flex items-center cursor-pointer text-red-600"
                                        >
                                            <Trash className="mr-2 h-4 w-4" />
                                            <span>Delete</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="flex-grow">
                                <h2 className="text-xl font-semibold text-mainColor pr-8">{announcement.title}</h2>
                                <p className="text-gray-600 mt-2">{announcement.content}</p>
                            </div>
                            <div className="flex justify-between items-center mt-4 text-sm text-gray-500 pt-4 border-t">
                                <span>Starts: {new Date(announcement.startDate).toLocaleDateString('en-US', { 
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}</span>
                                <span>Ends: {new Date(announcement.endDate).toLocaleDateString('en-US', { 
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
