import { createService } from '@/lib/actions';
import { ServiceModalClient } from './ServiceModalClient';

export function ServiceModal() {
  return <ServiceModalClient createService={createService} />;
}