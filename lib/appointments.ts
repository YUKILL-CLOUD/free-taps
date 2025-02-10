export const getRecordType = (serviceName: string) => {
    switch (serviceName.toLowerCase()) {
      case 'anti-parasitic':
        return 'Deworming';
      case 'immunization':
        return 'Vaccination';
      case 'check-up and consultation':
      case 'complete blood count testing':
      case 'operation (castration)':
      case 'operation (eye and ear)':
        return 'Health Record';
      default:
        return '-';
    }
  };

export function hasTimeConflict(
  date1: Date,
  time1: Date,
  date2: Date,
  time2: Date,
  bufferMinutes: number = 15
): boolean {
  const datetime1 = new Date(date1);
  datetime1.setHours(time1.getHours(), time1.getMinutes());
  
  const datetime2 = new Date(date2);
  datetime2.setHours(time2.getHours(), time2.getMinutes());

  // Calculate time difference in minutes
  const diffInMinutes = Math.abs(datetime1.getTime() - datetime2.getTime()) / (1000 * 60);

  // If appointments are on the same day and less than buffer time apart
  if (
    datetime1.getFullYear() === datetime2.getFullYear() &&
    datetime1.getMonth() === datetime2.getMonth() &&
    datetime1.getDate() === datetime2.getDate() &&
    diffInMinutes < bufferMinutes
  ) {
    return true;
  }

  return false;
}