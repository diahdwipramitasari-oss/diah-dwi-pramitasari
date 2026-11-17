import { FileSpreadsheet, Printer, X } from 'lucide-react';
import type { MarketAsset } from '../types/aset';
import {
  computeKpiSummary,
  formatDateId,
  generateExecutiveNarrative,
  isBpnStagnant,
  STATUS_META,
} from '../utils/asetLogic';
import { exportMarketsToExcel } from '../utils/exportBrief';

interface ManagementBriefModalProps {
  isOpen: boolean;
  markets: MarketAsset[];
  onClose: () => void;
}

export function ManagementBriefModal({
  isOpen,
  markets,
  onClose,
}: ManagementBriefModalProps) {
  if (!isOpen) return null;

  const kpi = computeKpiSummary(markets, '2026-11-16');
  const brief = generateExecutiveNarrative(markets, '2026-11-16');
  const certified = markets.filter((m) => m.statusSertifikasi === 'BERSERTIFIKAT');
  const actionMarkets = markets.filter(
    (m) => m.statusSertifikasi !== 'BERSERTIFIKAT'
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="brief-modal-title"
    >
      <div className="print-sheet flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
        {/* Top Action Bar (hidden on print) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-[#0F294A] px-6 py-4 text-white">
          <div>
            <div className="text-xs text-sky-200">
              Bahan Rapat Dinas Pimpinan · Disperindag Kabupaten Sidoarjo
            </div>
            <h2 id="brief-modal-title" className="font-display text-lg font-bold">
              Laporan Paparan Pimpinan (Executive Management Brief)
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => exportMarketsToExcel(markets, '2026-11-16')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
              <span>Unduh Excel (.xlsx)</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#0F294A] hover:bg-slate-100"
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup laporan paparan"
              className="rounded-lg p-1.5 text-slate-200 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-7 text-slate-800">
          {/* Official Letterhead */}
          <div className="border-b-2 border-[#0F294A] pb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-semibold tracking-wide text-slate-500">
                PEMERINTAH KABUPATEN SIDOARJO · DINAS PERINDUSTRIAN DAN PERDAGANGAN
              </div>
              <h3 className="mt-1 font-display text-xl font-bold text-[#0F294A]">
                MANAGEMENT BRIEF: PENGAMANAN & SERTIFIKASI ASET 19 PASAR PEMDA
              </h3>
              <p className="mt-0.5 text-xs text-slate-600">
                Disusun oleh Subbagian Umum dan Kepegawaian · Tanggal Cetak: 16 November 2026
              </p>
            </div>
            <div className="font-mono text-xs font-semibold text-[#0F294A]">
              SIMPAS-ASET SIDOARJO
            </div>
          </div>

          {/* 1. Ringkasan Capaian */}
          <section className="space-y-3">
            <h4 className="font-display text-sm font-bold text-[#0F294A]">
              01. Ringkasan Capaian Sertifikasi Aset Pasar
            </h4>
            <p className="text-xs font-semibold text-slate-900">{brief.headline}</p>
            <p className="text-xs leading-relaxed text-slate-700">
              {brief.summaryParagraph}
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 pt-1">
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="text-[11px] text-slate-500">Total Pasar</div>
                <div className="font-mono text-xl font-bold text-[#0F294A] tabular-nums">
                  {kpi.totalPasar}
                </div>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3">
                <div className="text-[11px] text-emerald-800">Bersertifikat</div>
                <div className="font-mono text-xl font-bold text-emerald-700 tabular-nums">
                  {kpi.counts.BERSERTIFIKAT} ({kpi.percentages.BERSERTIFIKAT}%)
                </div>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-3">
                <div className="text-[11px] text-amber-800">Proses BPN</div>
                <div className="font-mono text-xl font-bold text-amber-700 tabular-nums">
                  {kpi.counts.PROSES_BPN} ({kpi.percentages.PROSES_BPN}%)
                </div>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50/40 p-3">
                <div className="text-[11px] text-red-800">Terkendala</div>
                <div className="font-mono text-xl font-bold text-red-700 tabular-nums">
                  {kpi.counts.TERKENDALA} ({kpi.percentages.TERKENDALA}%)
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-[11px] text-slate-600">Belum Proses</div>
                <div className="font-mono text-xl font-bold text-slate-700 tabular-nums">
                  {kpi.counts.BELUM_PROSES} ({kpi.percentages.BELUM_PROSES}%)
                </div>
              </div>
            </div>
          </section>

          {/* 2. Rekomendasi Arahan Pimpinan */}
          <section className="space-y-2.5 rounded-xl border border-sky-200 bg-sky-50/50 p-4">
            <h4 className="font-display text-sm font-bold text-[#0F294A]">
              02. Poin Atensi & Dukungan Kebijakan yang Diharapkan dari Pimpinan
            </h4>
            <ul className="list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-slate-800">
              {brief.priorityInterventions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          {/* 3. Bukti Legalitas Aset (Sudah Bersertifikat) */}
          <section className="space-y-2.5">
            <h4 className="font-display text-sm font-bold text-[#0F294A]">
              03. Daftar Pasar Sudah Bersertifikat ({certified.length} Pasar)
            </h4>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Pasar</th>
                    <th className="px-3 py-2">Kecamatan</th>
                    <th className="px-3 py-2">Nomor Sertifikat Hak Pakai</th>
                    <th className="px-3 py-2">NIB</th>
                    <th className="px-3 py-2 text-right">Luas Sertifikat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {certified.map((m) => (
                    <tr key={m.id}>
                      <td className="px-3 py-2 font-medium text-slate-900">
                        {m.namaPasar}
                      </td>
                      <td className="px-3 py-2 text-slate-600">{m.kecamatan}</td>
                      <td className="px-3 py-2 font-mono text-slate-800">
                        {m.certificate?.nomorSertifikat}
                      </td>
                      <td className="px-3 py-2 font-mono text-slate-600 tabular-nums">
                        {m.certificate?.nib}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums">
                        {m.certificate?.luasSertifikat.toLocaleString('id-ID')} m²
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 4. Matriks Kendala, Progres BPN & Rencana Aksi */}
          <section className="space-y-2.5">
            <h4 className="font-display text-sm font-bold text-[#0F294A]">
              04. Matriks Tindak Lanjut Pasar Belum Bersertifikat ({actionMarkets.length} Pasar)
            </h4>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Pasar</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Kendala / Tahapan BPN</th>
                    <th className="px-3 py-2">Rencana Aksi & Instansi Mitra</th>
                    <th className="px-3 py-2">Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {actionMarkets.map((m) => {
                    const stag = isBpnStagnant(m, '2026-11-16');
                    return (
                      <tr key={m.id}>
                        <td className="px-3 py-2 font-medium text-slate-900 align-top">
                          <div>{m.namaPasar}</div>
                          <div className="text-[11px] text-slate-500">
                            Kec. {m.kecamatan}
                          </div>
                        </td>
                        <td className="px-3 py-2 align-top whitespace-nowrap">
                          <span
                            className={`font-semibold ${STATUS_META[m.statusSertifikasi].textClass}`}
                          >
                            {STATUS_META[m.statusSertifikasi].shortLabel}
                          </span>
                          {stag.stagnant && (
                            <div className="text-[10px] font-semibold text-red-700">
                              Stagnan {stag.daysSinceUpdate} hari
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 align-top max-w-[220px]">
                          {m.issueActionPlan ? (
                            <>
                              <div className="font-semibold text-slate-800">
                                {m.issueActionPlan.kategoriKendala}
                              </div>
                              <div className="text-[11px] text-slate-600">
                                {m.issueActionPlan.uraianKendala}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="font-semibold text-slate-800">
                                {m.bpnProgress?.tahapanSaatIni}
                              </div>
                              <div className="font-mono text-[11px] text-slate-500">
                                {m.bpnProgress?.nomorBerkasBpn}
                              </div>
                            </>
                          )}
                        </td>
                        <td className="px-3 py-2 align-top max-w-[260px]">
                          <div>
                            {m.issueActionPlan?.rencanaAksi ??
                              m.bpnProgress?.keteranganProgres}
                          </div>
                          <div className="mt-0.5 text-[11px] text-slate-500">
                            Mitra:{' '}
                            {m.issueActionPlan?.instansiTerkait ??
                              'BPN Kab. Sidoarjo'}
                          </div>
                        </td>
                        <td className="px-3 py-2 align-top font-mono text-[11px] whitespace-nowrap tabular-nums">
                          {formatDateId(
                            m.issueActionPlan?.targetSelesai ??
                              m.bpnProgress?.estimasiSelesai ??
                              ''
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
