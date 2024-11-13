import { deleteService } from '@/lib/actions';
import { DeleteServiceModalClient } from '@/app/components/front/DeleteServiceModalClient';

export function DeleteServiceModal({ service }: { service: any }) {
  return <DeleteServiceModalClient deleteService={deleteService} service={service} />;
}