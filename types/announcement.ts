export interface Announcement {
    id: string;
    title: string;
    content: string;
    startDate: Date;
    endDate: Date;
    status: 'active' | 'important';
    createdAt: Date;
}