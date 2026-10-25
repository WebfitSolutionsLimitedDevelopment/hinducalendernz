import type { EditorialStatus } from '@hindu-calendar/calendar-data';

const LABEL: Record<EditorialStatus, string> = {
  DRAFT: 'Draft', CALCULATED: 'Calculated – not yet reviewed', REVIEWED: 'Reviewed', APPROVED: 'Approved', PUBLISHED: 'Verified',
};

export function StatusBadge({ status }: { status: EditorialStatus }) {
  const ok = status === 'APPROVED' || status === 'PUBLISHED';
  return <span className={`badge ${ok ? 'badge-ok' : 'badge-calc'}`}>{LABEL[status]}</span>;
}
