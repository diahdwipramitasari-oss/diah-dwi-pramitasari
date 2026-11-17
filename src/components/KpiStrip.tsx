import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  FileQuestion,
} from 'lucide-react';
import type { CertificationStatus, KpiSummary } from '../types/aset';

interface KpiStripProps {
  kpi: KpiSummary;
  activeFilter: CertificationStatus | 'ALL';
  onFilterSelect: (status: CertificationStatus | 'ALL') => void;
}

export function KpiStrip({ kpi, activeFilter, onFilterSelect }: KpiStripProps) {
  const cards: Array<{
    key: CertificationStatus | 'ALL';
    title: string;
    count: number;
    subtext: string;
    icon: typeof Building2;
    accentColor: string;
    activeRing: string;
  }> = [
    {
      key: 'ALL',
      title: 'Total Pasar Pemda',
      count: kpi.totalPasar,
      subtext: `${kpi.totalLuasKibA.toLocaleString('id-ID')} m² Luas KIB A`,
      icon: Building2,
      accentColor: 'text-[#0F294A]',
      activeRing: 'border-[#0F294A] bg-slate-50/90 ring-1 ring-[#0F294A]/15',
    },
    {
      key: 'BERSERTIFIKAT',
      title: 'Sudah Bersertifikat',
      count: kpi.counts.BERSERTIFIKAT,
      subtext: `${kpi.percentages.BERSERTIFIKAT}% dari total pasar`,
      icon: CheckCircle2,
      accentColor: 'text-emerald-700',
      activeRing: 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600/20',
    },
    {
      key: 'PROSES_BPN',
      title: 'Sedang Proses BPN',
      count: kpi.counts.PROSES_BPN,
      subtext:
        kpi.stagnantBpnCount > 0
          ? `${kpi.percentages.PROSES_BPN}% · ${kpi.stagnantBpnCount} stagnan >30h`
          : `${kpi.percentages.PROSES_BPN}% aktif di Kantah`,
      icon: Clock,
      accentColor: 'text-amber-700',
      activeRing: 'border-amber-600 bg-amber-50/40 ring-1 ring-amber-600/20',
    },
    {
      key: 'TERKENDALA',
      title: 'Terkendala',
      count: kpi.counts.TERKENDALA,
      subtext: `${kpi.percentages.TERKENDALA}% butuh atensi`,
      icon: AlertTriangle,
      accentColor: 'text-red-700',
      activeRing: 'border-red-600 bg-red-50/40 ring-1 ring-red-600/20',
    },
    {
      key: 'BELUM_PROSES',
      title: 'Belum Proses',
      count: kpi.counts.BELUM_PROSES,
      subtext: `${kpi.percentages.BELUM_PROSES}% penyiapan berkas`,
      icon: FileQuestion,
      accentColor: 'text-slate-600',
      activeRing: 'border-slate-500 bg-slate-100/70 ring-1 ring-slate-500/20',
    },
  ];

  return (
    <section aria-label="Ringkasan KPI Sertifikasi Aset" className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          const isActive = activeFilter === card.key;
          return (
            <button
              key={card.key}
              type="button"
              onClick={() =>
                onFilterSelect(isActive && card.key !== 'ALL' ? 'ALL' : card.key)
              }
              aria-pressed={isActive}
              className={`group flex flex-col justify-between rounded-xl border p-4 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] ${
                isActive
                  ? card.activeRing
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-600">
                  {card.title}
                </span>
                <Icon
                  className={`h-4 w-4 shrink-0 ${card.accentColor}`}
                  aria-hidden="true"
                />
              </div>
              <div className="mt-2.5 flex items-baseline justify-between gap-2">
                <span
                  className={`font-display text-2xl font-bold tracking-tight tabular-nums ${card.accentColor}`}
                >
                  {card.count}
                </span>
                <span className="text-xs text-slate-500 tabular-nums">
                  Pasar
                </span>
              </div>
              <div className="mt-1.5 text-xs text-slate-500 tabular-nums truncate">
                {card.subtext}
              </div>
            </button>
          );
        })}
      </div>

      {/* Horizontal Certification Progress Bar & Area Reconciliation Strip */}
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-medium text-slate-800">
            <span>Progres Penyelesaian Sertifikasi 19 Pasar</span>
            <span className="text-slate-400" aria-hidden="true">
              ·
            </span>
            <span className="font-mono font-semibold text-emerald-700 tabular-nums">
              {kpi.percentages.BERSERTIFIKAT}% Tuntas ({kpi.counts.BERSERTIFIKAT}/{kpi.totalPasar})
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-600 tabular-nums">
            <span>
              Luas Bersertifikat:{' '}
              <strong className="font-mono text-slate-900">
                {kpi.totalLuasBersertifikat.toLocaleString('id-ID')} m²
              </strong>{' '}
              / {kpi.totalLuasKibA.toLocaleString('id-ID')} m²
            </span>
            {kpi.areaDiscrepancyCount > 0 && (
              <span className="text-amber-700 font-medium">
                {kpi.areaDiscrepancyCount} pasar selisih luas KIB A
              </span>
            )}
          </div>
        </div>
        <div
          className="mt-2.5 flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
          role="img"
          aria-label={`Distribusi status: ${kpi.percentages.BERSERTIFIKAT}% bersertifikat, ${kpi.percentages.PROSES_BPN}% proses BPN, ${kpi.percentages.TERKENDALA}% terkendala, ${kpi.percentages.BELUM_PROSES}% belum proses`}
        >
          <div
            style={{ width: `${kpi.percentages.BERSERTIFIKAT}%` }}
            className="bg-emerald-600 transition-all duration-300"
            title={`Sudah Bersertifikat: ${kpi.counts.BERSERTIFIKAT} pasar`}
          />
          <div
            style={{ width: `${kpi.percentages.PROSES_BPN}%` }}
            className="bg-amber-500 transition-all duration-300"
            title={`Sedang Proses BPN: ${kpi.counts.PROSES_BPN} pasar`}
          />
          <div
            style={{ width: `${kpi.percentages.TERKENDALA}%` }}
            className="bg-red-600 transition-all duration-300"
            title={`Terkendala: ${kpi.counts.TERKENDALA} pasar`}
          />
          <div
            style={{ width: `${kpi.percentages.BELUM_PROSES}%` }}
            className="bg-slate-400 transition-all duration-300"
            title={`Belum Proses: ${kpi.counts.BELUM_PROSES} pasar`}
          />
        </div>
      </div>
    </section>
  );
}
