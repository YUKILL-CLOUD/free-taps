export function formatDate(date: Date) {
  const isoDate = date.toISOString();
  const [datePart] = isoDate.split("T");
  const [year, month, day] = datePart.split("-");
  
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${monthNames[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
}

export function formatTime(time: Date) {
  const isoTime = time.toISOString();
  const timeString = isoTime.split('T')[1].split('.')[0];
  const [hours, minutes] = timeString.split(':').map(Number);
  
  // Convert to 12-hour format
  const hour12 = hours % 12 || 12;
  const period = hours >= 12 ? 'PM' : 'AM';
  
  // Format minutes to always show two digits
  const formattedMinutes = minutes.toString().padStart(2, '0');
  
  return `${hour12}:${formattedMinutes} ${period}`;
}