import { AlertTriangle, Edit3, Eye, FileText, Search } from 'lucide-react';
import type { CertificationStatus, MarketAsset, UserRole } from '../types/aset';
import {
  formatDateId,
  getAreaDiscrepancy,
  isBpnStagnant,
} from '../utils/asetLogic';
import { StatusBadge } from './StatusBadge';

interface ActionMatrixTableProps {
  markets: MarketAsset[];
  allMarketsCount: number;
  statusFilter: CertificationStatus | 'ALL';
  onStatusFilterChange: (status: CertificationStatus | 'ALL') => void;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  selectedMarketId: string | null;
  userRole: UserRole;
  onSelectMarket: (market: MarketAsset) => void;
  onOpenDetail: (market: MarketAsset, tab?: 'profil' | 'sertifikat' | 'progres') => void;
  onOpenUpdate: (market: MarketAsset) => void;
  title?: string;
}

export function ActionMatrixTable({
  markets,
  allMarketsCount,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
  selectedMarketId,
  userRole,
  onSelectMarket,
  onOpenDetail,
  onOpenUpdate,
  title = 'Matriks Status Legalitas, Kendala & Rencana Aksi 19 Pasar',
}: ActionMatrixTableProps) {
  const canEdit = userRole === 'KASUBBAG_UMPEG' || userRole === 'OPERATOR_ASET';

  const filterTabs: Array<{ key: CertificationStatus | 'ALL'; label: string }> = [
    { key: 'ALL', label: `Semua (${allMarketsCount})` },
    { key: 'BERSERTIFIKAT', label: 'Bersertifikat' },
    { key: 'PROSES_BPN', label: 'Proses BPN' },
    { key: 'TERKENDALA', label: 'Terkendala' },
    { key: 'BELUM_PROSES', label: 'Belum Proses' },
  ];

  return (
    <section
      aria-label={title}
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
    >
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-display text-base font-semibold text-[#0F294A]">
            {title}
          </h2>
          <p className="text-xs text-slate-500">
            Menampilkan {markets.length} dari {allMarketsCount} pasar daerah · Klik baris untuk sinkronisasi peta
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Segmented status filter */}
          <div
            className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1"
            role="group"
            aria-label="Filter status sertifikasi"
          >
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => onStatusFilterChange(tab.key)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  statusFilter === tab.key
                    ? 'bg-white text-[#0F294A] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative min-w-[220px]">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Cari nama pasar / kecamatan / berkas..."
              aria-label="Cari nama pasar, kecamatan, atau nomor berkas"
              className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#0284C7] focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20"
            />
          </div>
        </div>
      </div>

      {markets.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <p className="font-display text-sm font-semibold text-slate-800">
            Tidak ada data pasar yang sesuai filter
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Ubah kata kunci pencarian atau pilih filter status "Semua".
          </p>
          <button
            type="button"
            onClick={() => {
              onStatusFilterChange('ALL');
              onSearchQueryChange('');
            }}
            className="mt-3 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600">
                <th className="px-4 py-3 whitespace-nowrap">Pasar & Kecamatan</th>
                <th className="px-3 py-3 text-right whitespace-nowrap">Luas KIB A</th>
                <th className="px-3 py-3 whitespace-nowrap">Status Legalitas</th>
                <th className="px-3 py-3 whitespace-nowrap">
                  Info Sertifikat / Kendala / Tahapan BPN
                </th>
                <th className="px-3 py-3 whitespace-nowrap">
                  Rencana Aksi & PIC
                </th>
                <th className="px-3 py-3 whitespace-nowrap">Target / Update</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {markets.map((m) => {
                const isSelected = m.id === selectedMarketId;
                const stag = isBpnStagnant(m, '2026-11-16');
                const disc = getAreaDiscrepancy(m);

                return (
                  <tr
                    key={m.id}
                    onClick={() => onSelectMarket(m)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-sky-50/70' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="px-4 py-3 align-top">
                      <div className="font-semibold text-[#0F294A]">
                        {m.namaPasar}
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-500">
                        <span className="font-mono">{m.kodePasar}</span> · Kec.{' '}
                        {m.kecamatan}
                      </div>
                    </td>

                    <td className="px-3 py-3 text-right align-top font-mono tabular-nums text-slate-800 whitespace-nowrap">
                      <div>{m.luasKibA.toLocaleString('id-ID')} m²</div>
                      {disc.hasDiscrepancy && (
                        <div className="mt-0.5 text-[11px] font-medium text-amber-700">
                          Selisih {disc.difference > 0 ? '+' : ''}
                          {disc.difference.toLocaleString('id-ID')} m²
                        </div>
                      )}
                    </td>

                    <td className="px-3 py-3 align-top">
                      <StatusBadge status={m.statusSertifikasi} compact />
                      {stag.stagnant && (
                        <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-red-700">
                          <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />
                          <span>Stagnan {stag.daysSinceUpdate}h</span>
                        </div>
                      )}
                    </td>

                    <td className="px-3 py-3 align-top max-w-[270px]">
                      {m.statusSertifikasi === 'BERSERTIFIKAT' && m.certificate && (
                        <div>
                          <div className="font-mono font-medium text-slate-800">
                            {m.certificate.nomorSertifikat}
                          </div>
                          <div className="mt-0.5 text-[11px] text-slate-500 tabular-nums">
                            NIB: {m.certificate.nib} · Tahun {m.certificate.tahunTerbit}
                          </div>
                        </div>
                      )}

                      {m.statusSertifikasi === 'PROSES_BPN' && m.bpnProgress && (
                        <div>
                          <div className="font-medium text-slate-800">
                            {m.bpnProgress.tahapanSaatIni}
                          </div>
                          <div className="mt-0.5 font-mono text-[11px] text-slate-500">
                            Berkas: {m.bpnProgress.nomorBerkasBpn}
                          </div>
                        </div>
                      )}

                      {(m.statusSertifikasi === 'TERKENDALA' ||
                        m.statusSertifikasi === 'BELUM_PROSES') &&
                        m.issueActionPlan && (
                          <div>
                            <div className="font-medium text-slate-900">
                              {m.issueActionPlan.kategoriKendala}
                            </div>
                            <div className="mt-0.5 text-[11px] text-slate-600 line-clamp-2">
                              {m.issueActionPlan.uraianKendala}
                            </div>
                          </div>
                        )}
                    </td>

                    <td className="px-3 py-3 align-top max-w-[260px]">
                      {m.statusSertifikasi === 'BERSERTIFIKAT' ? (
                        <span className="text-[11px] text-emerald-700 font-medium">
                          Arsip digital terverifikasi ({m.certificate?.verifiedBy})
                        </span>
                      ) : m.issueActionPlan ? (
                        <div>
                          <div className="text-slate-700 line-clamp-2">
                            {m.issueActionPlan.rencanaAksi}
                          </div>
                          <div className="mt-0.5 text-[11px] text-slate-500">
                            PIC: {m.issueActionPlan.picDisperindag}
                          </div>
                        </div>
                      ) : m.bpnProgress ? (
                        <div>
                          <div className="text-slate-700 line-clamp-2">
                            {m.bpnProgress.keteranganProgres}
                          </div>
                          <div className="mt-0.5 text-[11px] text-slate-500">
                            PIC: {m.bpnProgress.picBpn}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="px-3 py-3 align-top whitespace-nowrap font-mono text-[11px] text-slate-600 tabular-nums">
                      {m.statusSertifikasi === 'BERSERTIFIKAT' && m.certificate
                        ? `Terbit ${formatDateId(m.certificate.tanggalTerbit)}`
                        : m.issueActionPlan?.targetSelesai
                        ? `Target ${formatDateId(m.issueActionPlan.targetSelesai)}`
                        : m.bpnProgress?.estimasiSelesai
                        ? `Est. ${formatDateId(m.bpnProgress.estimasiSelesai)}`
                        : formatDateId(m.updatedAt)}
                    </td>

                    <td
                      className="px-4 py-3 align-top text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1.5">
                        {m.statusSertifikasi === 'BERSERTIFIKAT' && (
                          <button
                            type="button"
                            onClick={() => onOpenDetail(m, 'sertifikat')}
                            title={`Pratinjau sertifikat ${m.namaPasar}`}
                            aria-label={`Pratinjau sertifikat ${m.namaPasar}`}
                            className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-800 hover:bg-emerald-100"
                          >
                            <FileText className="h-3 w-3" aria-hidden="true" />
                            <span>Sertifikat</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onOpenDetail(m, 'profil')}
                          aria-label={`Detail ${m.namaPasar}`}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="h-3 w-3" aria-hidden="true" />
                          <span>Detail</span>
                        </button>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => onOpenUpdate(m)}
                            aria-label={`Update ${m.namaPasar}`}
                            className="inline-flex items-center gap-1 rounded-md bg-[#0F294A] px-2 py-1 text-[11px] font-medium text-white hover:bg-[#173B68]"
                          >
                            <Edit3 className="h-3 w-3" aria-hidden="true" />
                            <span>Update</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
