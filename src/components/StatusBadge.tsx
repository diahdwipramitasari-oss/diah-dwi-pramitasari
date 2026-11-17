import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileQuestion,
} from 'lucide-react';
import type { CertificationStatus } from '../types/aset';
import { STATUS_META } from '../utils/asetLogic';

interface StatusBadgeProps {
  status: CertificationStatus;
  compact?: boolean;
}

export function StatusBadge({ status, compact = false }: StatusBadgeProps) {
  const meta = STATUS_META[status];

  const Icon =
    status === 'BERSERTIFIKAT'
      ? CheckCircle2
      : status === 'PROSES_BPN'
      ? Clock
      : status === 'TERKENDALA'
      ? AlertTriangle
      : FileQuestion;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap shrink-0 ${meta.bgSoft} ${meta.textClass} ${meta.borderClass}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{compact ? meta.shortLabel : meta.label}</span>
    </span>
  );
}
