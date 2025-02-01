import { Button } from "@/components/ui/button";
import { startOfToday, startOfWeek, endOfWeek } from "date-fns";
import { toZonedTime } from 'date-fns-tz';

interface DateFilterProps {
  onFilterChange: (filter: string) => void;
  currentFilter: string;
}

export function DateFilter({ onFilterChange, currentFilter }: DateFilterProps) {
  return (
    <div className="flex gap-2 mb-4">
      <Button
        variant={currentFilter === 'all' ? "default" : "outline"}
        onClick={() => onFilterChange('all')}
        size="sm"
      >
        All
      </Button>
      <Button
        variant={currentFilter === 'today' ? "default" : "outline"}
        onClick={() => onFilterChange('today')}
        size="sm"
      >
        Today
      </Button>
      <Button
        variant={currentFilter === 'week' ? "default" : "outline"}
        onClick={() => onFilterChange('week')}
        size="sm"
      >
        This Week
      </Button>
    </div>
  );
} 