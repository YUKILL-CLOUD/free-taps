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
    description?: string;
  }>;
}

const BigCalendarAdmin = ({ events }: BigCalendarProps) => {
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());

  // Format date similar to EventCalendar
  const formatCustomDate = (date: Date) => {
    const isoDate = date.toISOString();
    const [datePart] = isoDate.split("T");
    const [year, month, day] = datePart.split("-");
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${monthNames[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
  };

  // Get events for selected date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
  };

  // Get upcoming events
  const upcomingEvents = events
    .filter(event => event.start >= new Date())
    .sort((a, b) => a.start.getTime() - b.start.getTime());

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
    const isSelected = moment(date).isSame(moment(date), 'day');
    const isToday = moment(date).isSame(moment(), 'day');

    if (isSelected && isToday) {
      return {
        style: {
          backgroundColor: 'rgba(94, 84, 142, 0.4)',
          cursor: 'pointer',
        },
        className: 'selected-day'
      };
    } else if (isToday) {
      return {
        style: {
          backgroundColor: 'rgba(94, 84, 142, 0.4)',
          cursor: 'pointer',
        }
      };
    } else if (isSelected) {
      return {
        style: {
          cursor: 'pointer',
        },
        className: 'selected-day'
      };
    }
    return {
      style: {
        cursor: 'pointer',
      }
    };
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

  const convertTime = (time: Date) => {
    const isoTime = time.toISOString();
    const timeString = isoTime.split('T')[1].split('.')[0];
    const [hours, minutes] = timeString.split(':').map(Number);
    
    // Convert to 12-hour format
    const hour12 = hours % 12 || 12;
    const period = hours >= 12 ? 'PM' : 'AM';
    
    // Format minutes to always show two digits
    const formattedMinutes = minutes.toString().padStart(2, '0');
    
    return `${hour12}:${formattedMinutes} ${period}`;
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-md shadow-md">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={["month"]}
          view={view}
          date={date}
          onView={handleOnChangeView}
          onNavigate={(newDate) => setDate(newDate)}
          style={{ height: "500px" }}
          eventPropGetter={eventStyleGetter}
          dayPropGetter={dayPropGetter}
          selectable={true}
          onSelectSlot={({ start }) => setDate(start)}
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
      </div>

      {/* Today's Appointments Section */}
      <div className="bg-white p-4 rounded-md shadow-md">
        <h2 className="text-lg font-semibold mb-2">
          Appointments for {date.toDateString()}
        </h2>
        <div className={`${getEventsForDate(date).length > 5 ? 'max-h-[250px] overflow-y-auto' : ''}`}>
          {getEventsForDate(date).length > 0 ? (
            <div className="space-y-2">
              {getEventsForDate(date).map((event) => (
                <div
                  key={event.start.toString()}
                  className="p-2 rounded-md border border-mainColor-200 bg-mainColor-50"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-mainColor-700">{event.title}</h3>
                    <span className="text-sm text-mainColor-500">
                    {convertTime(event.start)}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-mainColor-600 mt-1">{event.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No appointments for this date.</p>
          )}
        </div>
      </div>

      {/* Upcoming Appointments Section */}
      <div className="bg-white p-4 rounded-md shadow-md">
        <h2 className="text-lg font-semibold mb-4">Upcoming Appointments</h2>
        <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-mainColor-200 scrollbar-track-transparent hover:scrollbar-thumb-mainColor-300">
          {upcomingEvents.length > 0 ? (
            <ul className="space-y-2 pr-2">
              {upcomingEvents.map((event) => (
                <li 
                  key={event.start.toString()} 
                  className="p-2 rounded-md border border-mainColor-200 bg-mainColor-50 hover:bg-mainColor-100 transition-colors duration-200"
                >
                  <p className="font-medium text-mainColor-700">{event.title}</p>
                  {event.description && (
                    <p className="text-sm text-mainColor-600">{event.description}</p>
                  )}
                  <p className="text-sm text-mainColor-500">
                    {formatCustomDate(event.start)} - {convertTime(event.start)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No upcoming appointments.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BigCalendarAdmin;
