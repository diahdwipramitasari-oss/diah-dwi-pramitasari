import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Edit3,
  FileCheck2,
  FileText,
  Info,
  X,
} from 'lucide-react';
import type { MarketAsset, UserRole } from '../types/aset';
import {
  BPN_STAGES_ORDER,
  formatCurrencyIdr,
  formatDateId,
  getAreaDiscrepancy,
  getBpnStagePercent,
  isBpnStagnant,
} from '../utils/asetLogic';
import { CertificateDocumentPreview } from './CertificateDocumentPreview';
import { StatusBadge } from './StatusBadge';

interface MarketDetailModalProps {
  market: MarketAsset | null;
  initialTab?: 'profil' | 'sertifikat' | 'progres';
  userRole: UserRole;
  onClose: () => void;
  onOpenUpdate: (market: MarketAsset) => void;
}

export function MarketDetailModal({
  market,
  initialTab = 'profil',
  userRole,
  onClose,
  onOpenUpdate,
}: MarketDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'profil' | 'sertifikat' | 'progres'>(
    initialTab
  );

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, market?.id]);

  if (!market) return null;

  const canEdit = userRole === 'KASUBBAG_UMPEG' || userRole === 'OPERATOR_ASET';
  const discrepancy = getAreaDiscrepancy(market);
  const stagnation = isBpnStagnant(market, '2026-11-16');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-[#0F294A] px-6 py-4 text-white">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-sky-200">
              <span className="font-mono">{market.kodePasar}</span>
              <span aria-hidden="true">·</span>
              <span>Kecamatan {market.kecamatan}</span>
              <span aria-hidden="true">·</span>
              <span>UPTD: {market.kepalaUptd}</span>
            </div>
            <h2
              id="detail-modal-title"
              className="mt-1 font-display text-xl font-bold text-white"
            >
              {market.namaPasar}
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            <StatusBadge status={market.statusSertifikasi} />
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup jendela detail pasar"
              className="rounded-lg p-1.5 text-slate-200 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div
          className="flex items-center gap-1 border-b border-slate-200 bg-slate-50 px-6 pt-2"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'profil'}
            onClick={() => setActiveTab('profil')}
            className={`inline-flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'profil'
                ? 'border-[#0F294A] text-[#0F294A]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Info className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Profil & Data KIB A</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'sertifikat'}
            onClick={() => setActiveTab('sertifikat')}
            className={`inline-flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'sertifikat'
                ? 'border-[#0F294A] text-[#0F294A]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Dokumen Sertifikat</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'progres'}
            onClick={() => setActiveTab('progres')}
            className={`inline-flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'progres'
                ? 'border-[#0F294A] text-[#0F294A]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Riwayat BPN, Kendala & Rencana Aksi</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'profil' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                  <h3 className="font-display text-sm font-semibold text-[#0F294A]">
                    Identitas & Lokasi Pasar
                  </h3>
                  <dl className="space-y-2.5 text-xs">
                    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                      <dt className="text-slate-500">Alamat Lengkap</dt>
                      <dd className="text-right font-medium text-slate-800 max-w-[260px]">
                        {market.alamat}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                      <dt className="text-slate-500">Kelurahan / Desa</dt>
                      <dd className="font-medium text-slate-800">
                        {market.kelurahan}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                      <dt className="text-slate-500">Kecamatan</dt>
                      <dd className="font-medium text-slate-800">
                        {market.kecamatan}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                      <dt className="text-slate-500">Koordinat Geografis</dt>
                      <dd className="font-mono text-slate-800 tabular-nums">
                        {market.latitude.toFixed(4)}, {market.longitude.toFixed(4)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Kepala UPTD / Pengelola</dt>
                      <dd className="font-medium text-slate-800">
                        {market.kepalaUptd}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                  <h3 className="font-display text-sm font-semibold text-[#0F294A]">
                    Data Inventaris KIB A (SIMDA BMD)
                  </h3>
                  <dl className="space-y-2.5 text-xs">
                    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                      <dt className="text-slate-500">Nomor Register KIB</dt>
                      <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                        {market.nomorRegisterKib}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                      <dt className="text-slate-500">Kode Barang</dt>
                      <dd className="font-mono text-slate-800 tabular-nums">
                        {market.kodeBarang}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                      <dt className="text-slate-500">Luas Tercatat KIB A</dt>
                      <dd className="font-mono font-bold text-[#0F294A] tabular-nums">
                        {market.luasKibA.toLocaleString('id-ID')} m²
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                      <dt className="text-slate-500">Tahun & Asal Perolehan</dt>
                      <dd className="text-right font-medium text-slate-800">
                        {market.tahunPerolehan} · {market.asalUsul}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Nilai Perolehan Aset</dt>
                      <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                        {formatCurrencyIdr(market.nilaiPerolehan)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Reconciliation Box */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="font-display text-xs font-semibold text-[#0F294A]">
                  Rekonsiliasi Luas Lahan (KIB A vs Data BPN)
                </h4>
                {discrepancy.comparedArea ? (
                  <p className="mt-1.5 text-xs text-slate-700 tabular-nums">
                    Luas KIB A tercatat{' '}
                    <strong className="font-mono">
                      {market.luasKibA.toLocaleString('id-ID')} m²
                    </strong>
                    , dibandingkan hasil {discrepancy.sourceLabel} sebesar{' '}
                    <strong className="font-mono">
                      {discrepancy.comparedArea.toLocaleString('id-ID')} m²
                    </strong>{' '}
                    —{' '}
                    {discrepancy.hasDiscrepancy ? (
                      <span className="font-semibold text-amber-800">
                        terdapat selisih{' '}
                        {discrepancy.difference > 0 ? '+' : ''}
                        {discrepancy.difference.toLocaleString('id-ID')} m² (perlu berita acara rekonsiliasi BPKAD).
                      </span>
                    ) : (
                      <span className="font-semibold text-emerald-700">
                        sesuai 100% tanpa selisih.
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-slate-600">
                    Belum tersedia angka pengukuran resmi BPN; saat ini mengacu pada luas KIB A ({market.luasKibA.toLocaleString('id-ID')} m²).
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'sertifikat' && (
            <div>
              {market.statusSertifikasi === 'BERSERTIFIKAT' && market.certificate ? (
                <CertificateDocumentPreview market={market} />
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                  <FileText className="h-10 w-10 text-slate-300" aria-hidden="true" />
                  <h3 className="mt-3 font-display text-sm font-semibold text-slate-800">
                    Dokumen Sertifikat Belum Terbit
                  </h3>
                  <p className="mt-1 max-w-md text-xs text-slate-500">
                    {market.namaPasar} saat ini berstatus{' '}
                    <strong>{market.statusSertifikasi.replace('_', ' ')}</strong>.
                    Arsip sertifikat PDF dapat diunggah melalui menu Update Progres setelah sertifikat Hak Pakai terbit dari BPN.
                  </p>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => onOpenUpdate(market)}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#0F294A] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#173B68]"
                    >
                      <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Unggah Sertifikat / Update Status</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'progres' && (
            <div className="space-y-6">
              {/* BPN Timeline Section */}
              {market.bpnProgress && (
                <div className="space-y-4 rounded-xl border border-slate-200 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-display text-sm font-semibold text-[#0F294A]">
                        Pelacakan Tahapan Proses BPN Kab. Sidoarjo
                      </h3>
                      <p className="text-xs text-slate-500">
                        Nomor Berkas:{' '}
                        <span className="font-mono font-semibold text-slate-800">
                          {market.bpnProgress.nomorBerkasBpn}
                        </span>{' '}
                        · Terdaftar {formatDateId(market.bpnProgress.tanggalDaftar)}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-bold text-amber-700 tabular-nums">
                      {getBpnStagePercent(market.bpnProgress.tahapanSaatIni)}%
                    </span>
                  </div>

                  {stagnation.stagnant && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-800">
                      <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>
                        Deteksi Stagnasi: Berkas belum diperbarui selama {stagnation.daysSinceUpdate} hari (melebihi ambang batas 30 hari). Perlu konfirmasi ke {market.bpnProgress.picBpn}.
                      </span>
                    </div>
                  )}

                  {/* 5 Stage Stepper */}
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
                    {BPN_STAGES_ORDER.map((stage, idx) => {
                      const activeIdx = BPN_STAGES_ORDER.indexOf(
                        market.bpnProgress!.tahapanSaatIni
                      );
                      const isDone = idx < activeIdx;
                      const isCurrent = idx === activeIdx;
                      return (
                        <div
                          key={stage}
                          className={`rounded-lg border p-2.5 text-xs ${
                            isCurrent
                              ? 'border-amber-500 bg-amber-50 text-amber-950 font-semibold'
                              : isDone
                              ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
                              : 'border-slate-200 bg-slate-50 text-slate-500'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span>0{idx + 1}</span>
                            {isDone && (
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            )}
                          </div>
                          <div className="mt-1 leading-snug">{stage}</div>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-xs leading-relaxed text-slate-700">
                    {market.bpnProgress.keteranganProgres}
                  </p>

                  {market.bpnProgress.riwayat.length > 0 && (
                    <div className="border-t border-slate-100 pt-3">
                      <div className="text-xs font-semibold text-slate-700">
                        Kronologi Pembaruan Berkas
                      </div>
                      <ul className="mt-2 space-y-2">
                        {market.bpnProgress.riwayat.map((log, i) => (
                          <li
                            key={`${log.tanggal}-${i}`}
                            className="flex flex-col gap-0.5 rounded-lg bg-slate-50 px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <span className="font-semibold text-[#0F294A]">
                                {log.tahapan}
                              </span>
                              <span className="text-slate-400"> · </span>
                              <span className="text-slate-700">{log.catatan}</span>
                            </div>
                            <div className="font-mono text-[11px] text-slate-500 whitespace-nowrap tabular-nums">
                              {formatDateId(log.tanggal)} ({log.petugas})
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Issue & Action Plan Section */}
              {market.issueActionPlan && (
                <div className="space-y-4 rounded-xl border border-slate-200 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-sm font-semibold text-[#0F294A]">
                      Rincian Kendala & Rencana Aksi (Action Plan)
                    </h3>
                    <span className="rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">
                      {market.issueActionPlan.kategoriKendala}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-2">
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-600">
                        Uraian Kendala Lapangan
                      </div>
                      <p className="leading-relaxed text-slate-800">
                        {market.issueActionPlan.uraianKendala}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-600">
                        Kronologi Permasalahan
                      </div>
                      <p className="leading-relaxed text-slate-700">
                        {market.issueActionPlan.kronologi}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-sky-200 bg-sky-50/60 p-4 text-xs">
                    <div className="font-semibold text-[#0F294A]">
                      Rencana Aksi Penyelesaian
                    </div>
                    <p className="mt-1 leading-relaxed text-slate-800">
                      {market.issueActionPlan.rencanaAksi}
                    </p>
                    <div className="mt-3 grid grid-cols-1 gap-2 border-t border-sky-200/80 pt-3 sm:grid-cols-3">
                      <div>
                        <span className="text-slate-500">Instansi Terkait:</span>
                        <div className="font-medium text-slate-900">
                          {market.issueActionPlan.instansiTerkait}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500">PIC Disperindag:</span>
                        <div className="font-medium text-slate-900">
                          {market.issueActionPlan.picDisperindag}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500">Target & Status:</span>
                        <div className="font-mono font-semibold text-[#0F294A] tabular-nums">
                          {formatDateId(market.issueActionPlan.targetSelesai)} ·{' '}
                          {market.issueActionPlan.statusTindakLanjut}
                        </div>
                      </div>
                    </div>
                  </div>

                  {market.issueActionPlan.kelengkapanDokumen && (
                    <div>
                      <div className="text-xs font-semibold text-slate-700">
                        Daftar Kelengkapan Berkas Pra-Pengajuan BPN
                      </div>
                      <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {market.issueActionPlan.kelengkapanDokumen.map((item) => (
                          <li
                            key={item}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {!market.bpnProgress && !market.issueActionPlan && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 text-xs text-emerald-900">
                  <div className="font-semibold">
                    Aset Pasar Telah Bersertifikat Tuntas
                  </div>
                  <p className="mt-1 text-emerald-800">
                    Tidak terdapat kendala pertanahan aktif. Dokumen sertifikat Hak Pakai telah tersimpan pada tab Dokumen Sertifikat.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-3.5">
          <span className="text-xs text-slate-500 tabular-nums">
            Pembaruan terakhir: {formatDateId(market.updatedAt)}
          </span>
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenUpdate(market);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F294A] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#173B68]"
              >
                <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Update Progres / Status</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
