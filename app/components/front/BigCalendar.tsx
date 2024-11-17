"use client";

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

const localizer = momentLocalizer(moment);

interface BigCalendarProps {
  events: Array<{
    title: string;
    fullTitle: string;
    start: Date;
    end: Date;
    allDay?: boolean;
  }>;
}

const BigCalendar = ({ events }: BigCalendarProps) => {
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());

  const handleOnChangeView = (selectedView: View) => {
    setView(selectedView);
  };

  const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    const newDate = new Date(date);
    switch (action) {
      case 'PREV':
        newDate.setMonth(date.getMonth() - 1);
        break;
      case 'NEXT':
        newDate.setMonth(date.getMonth() + 1);
        break;
      case 'TODAY':
        newDate.setTime(new Date().getTime());
        break;
    }
    setDate(newDate);
  };

  const eventStyleGetter = (event: any) => {
    const style = {
      backgroundColor: 'rgba(94, 84, 142, 0.8)',
      borderRadius: '5px',
      color: 'white',
      border: '0px',
      display: 'block',
      padding: '2px 5px',
    };
    return {
      style: style
    };
  };

  const dayPropGetter = (date: Date) => {
    if (moment(date).isSame(moment(), 'day')) {
      return {
        style: {
          backgroundColor: 'rgba(94, 84, 142, 0.4)',
        },
      };
    }
    return {};
  };

  const CustomToolbar = (toolbar: any) => {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between p-2 sm:p-4 gap-2 sm:gap-0">
        <div className="flex items-center gap-2 order-2 sm:order-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigate('PREV')}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigate('TODAY')}
            className="hidden sm:flex items-center"
          >
            <CalendarIcon className="h-4 w-4 mr-1" />
            Today
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigate('TODAY')}
            className="sm:hidden h-8 w-8 p-0"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigate('NEXT')}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="text-base sm:text-lg font-semibold order-1 sm:order-2">
          {moment(date).format('MMMM YYYY')}
        </h2>
        <div className="flex gap-1 sm:gap-2 order-3">
          {toolbar.views.map((view: string) => (
            <Button
              key={view}
              variant={toolbar.view === view ? "default" : "ghost"}
              size="sm"
              onClick={() => toolbar.onView(view)}
              className="text-xs sm:text-sm px-2 sm:px-4"
            >
              {view}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      views={["month", "week", "day"]}
      view={view}
      date={date}
      onView={handleOnChangeView}
      onNavigate={(newDate) => setDate(newDate)}
      style={{ height: "500px" }}
      eventPropGetter={eventStyleGetter}
      dayPropGetter={dayPropGetter}
      formats={{
        eventTimeRangeFormat: () => "",
      }}
      components={{
        toolbar: CustomToolbar,
        event: (props) => {
          const shortTitle = props.title.length > 10 ? props.title.substring(0, 10) + '...' : props.title;
          return (
            <div
              title={props.event.fullTitle}
              style={{ 
                textShadow: '0px 0px 2px rgba(0,0,0,0.5)', 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                fontSize: '0.8rem',
                lineHeight: '1.2' 
              }}
            >
              {shortTitle}
            </div>
          );
        },
      }}
    />
  );
};

export default BigCalendar;
