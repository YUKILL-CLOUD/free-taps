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