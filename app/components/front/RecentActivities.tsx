import { formatDate, formatTime } from "@/lib/dateFormat";
import { Activity } from '@/types/activity';

interface RecentActivitiesProps {
  activities: Activity[];
}

export default function RecentActivities({ activities }: RecentActivitiesProps) {
  if (!activities || activities.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-4 rounded-md shadow-md hover:shadow-lg transition-shadow duration-200">
      <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
      <div className="max-h-[300px] overflow-y-auto">
        <ul className="space-y-2">
          {activities.map((activity) => (
            <li key={activity.id} className="border-b pb-2">
              <p className="font-medium">{activity.description}</p>
              <p className="text-sm text-gray-500">
                {formatDate(new Date(activity.date))} • {formatTime(new Date(activity.date))}
              </p>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">{activity.type}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
