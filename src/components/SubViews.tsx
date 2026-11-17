import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Edit3,
  FileText,
  History,
  ShieldCheck,
} from 'lucide-react';
import type { AuditLogEntry, MarketAsset, UserRole } from '../types/aset';
import {
  BPN_STAGES_ORDER,
  formatDateId,
  getAreaDiscrepancy,
  getBpnStagePercent,
  isBpnStagnant,
} from '../utils/asetLogic';
import { StatusBadge } from './StatusBadge';

interface BpnMonitoringViewProps {
  markets: MarketAsset[];
  userRole: UserRole;
  onOpenDetail: (market: MarketAsset, tab?: 'profil' | 'sertifikat' | 'progres') => void;
  onOpenUpdate: (market: MarketAsset) => void;
}

export function BpnMonitoringView({
  markets,
  userRole,
  onOpenDetail,
  onOpenUpdate,
}: BpnMonitoringViewProps) {
  const canEdit = userRole === 'KASUBBAG_UMPEG' || userRole === 'OPERATOR_ASET';
  const bpnMarkets = markets.filter((m) => m.statusSertifikasi === 'PROSES_BPN');

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-display text-base font-bold text-[#0F294A]">
          Monitoring Linimasa Berkas di Kantor Pertanahan (BPN) Kab. Sidoarjo
        </h2>
        <p className="mt-1 text-xs text-slate-600">
          Pelacakan 5 tahapan sertifikasi Hak Pakai dan deteksi dini berkas stagnan (&gt; 30 hari tanpa pembaruan).
        </p>

        {/* Stage Distribution */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-5">
          {BPN_STAGES_ORDER.map((stage, idx) => {
            const count = bpnMarkets.filter(
              (m) => m.bpnProgress?.tahapanSaatIni === stage
            ).length;
            return (
              <div
                key={stage}
                className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5"
              >
                <div className="font-mono text-[11px] font-semibold text-slate-500">
                  TAHAP 0{idx + 1}
                </div>
                <div className="mt-1 text-xs font-semibold text-[#0F294A]">
                  {stage}
                </div>
                <div className="mt-2 font-mono text-xl font-bold text-amber-700 tabular-nums">
                  {count}{' '}
                  <span className="text-xs font-normal text-slate-500">
                    Pasar
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {bpnMarkets.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-xs text-slate-500">
          Tidak ada pasar yang sedang berstatus Proses BPN saat ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {bpnMarkets.map((m) => {
            const stag = isBpnStagnant(m, '2026-11-16');
            const disc = getAreaDiscrepancy(m);
            const pct = getBpnStagePercent(m.bpnProgress?.tahapanSaatIni);

            return (
              <div
                key={m.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-mono text-xs text-slate-500">
                        {m.kodePasar} · Kec. {m.kecamatan}
                      </div>
                      <h3 className="mt-0.5 font-display text-base font-bold text-[#0F294A]">
                        {m.namaPasar}
                      </h3>
                    </div>
                    <StatusBadge status={m.statusSertifikasi} />
                  </div>

                  {stag.stagnant && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-800">
                      <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>
                        Stagnan {stag.daysSinceUpdate} hari tanpa pembaruan · Perlu eskalasi ke {m.bpnProgress?.picBpn}
                      </span>
                    </div>
                  )}

                  {disc.hasDiscrepancy && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 tabular-nums">
                      Catatan Ukur: Hasil BPN {disc.comparedArea?.toLocaleString('id-ID')} m² vs KIB A {m.luasKibA.toLocaleString('id-ID')} m² (selisih {disc.difference} m²).
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">
                        {m.bpnProgress?.tahapanSaatIni}
                      </span>
                      <span className="font-mono font-bold text-amber-700 tabular-nums">
                        {pct}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full bg-amber-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-600">
                    {m.bpnProgress?.keteranganProgres}
                  </p>

                  <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                    <div>
                      No. Berkas:{' '}
                      <span className="font-mono font-semibold text-slate-800">
                        {m.bpnProgress?.nomorBerkasBpn}
                      </span>
                    </div>
                    <div className="text-right tabular-nums">
                      Update: {formatDateId(m.bpnProgress?.tanggalUpdate ?? '')}
                    </div>
                    <div>PIC: {m.bpnProgress?.picBpn}</div>
                    <div className="text-right tabular-nums">
                      Est. Selesai: {formatDateId(m.bpnProgress?.estimasiSelesai ?? '')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onOpenDetail(m, 'progres')}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Riwayat Berkas
                  </button>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => onOpenUpdate(m)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#0F294A] px-3 py-2 text-xs font-semibold text-white hover:bg-[#173B68]"
                    >
                      <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Update Tahapan</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface CertificateVaultViewProps {
  markets: MarketAsset[];
  onOpenDetail: (market: MarketAsset, tab?: 'profil' | 'sertifikat' | 'progres') => void;
}

export function CertificateVaultView({
  markets,
  onOpenDetail,
}: CertificateVaultViewProps) {
  const certified = markets.filter((m) => m.statusSertifikasi === 'BERSERTIFIKAT');
  const totalCertArea = certified.reduce(
    (sum, m) => sum + (m.certificate?.luasSertifikat ?? m.luasKibA),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-base font-bold text-[#0F294A]">
            Brankas Sertifikat Digital Pasar Pemda Sidoarjo
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Arsip terverifikasi Sertifikat Hak Pakai Pemerintah Kabupaten Sidoarjo dengan penanda air internal.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs tabular-nums">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2">
            <div className="text-[11px] text-emerald-800">Total Dokumen Sah</div>
            <div className="font-mono text-base font-bold text-emerald-800">
              {certified.length} Sertifikat
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2">
            <div className="text-[11px] text-slate-600">Total Luas Bersertifikat</div>
            <div className="font-mono text-base font-bold text-[#0F294A]">
              {totalCertArea.toLocaleString('id-ID')} m²
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {certified.map((m) => (
          <article
            key={m.id}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-mono text-xs text-slate-500">
                    {m.kodePasar} · Kec. {m.kecamatan}
                  </div>
                  <h3 className="mt-0.5 font-display text-base font-bold text-[#0F294A]">
                    {m.namaPasar}
                  </h3>
                </div>
                <ShieldCheck
                  className="h-5 w-5 shrink-0 text-emerald-600"
                  aria-hidden="true"
                />
              </div>

              <dl className="space-y-1.5 border-y border-slate-100 py-3 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Nomor Sertifikat</dt>
                  <dd className="font-mono font-semibold text-slate-900 text-right">
                    {m.certificate?.nomorSertifikat}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">NIB</dt>
                  <dd className="font-mono text-slate-700 tabular-nums">
                    {m.certificate?.nib}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Luas Sertifikat</dt>
                  <dd className="font-mono font-semibold text-emerald-700 tabular-nums">
                    {m.certificate?.luasSertifikat.toLocaleString('id-ID')} m²
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Tanggal Terbit</dt>
                  <dd className="font-mono text-slate-700 tabular-nums">
                    {formatDateId(m.certificate?.tanggalTerbit ?? '')}
                  </dd>
                </div>
              </dl>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                <span className="truncate font-mono">{m.certificate?.filePdfName}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenDetail(m, 'sertifikat')}
              className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#0F294A] px-3 py-2 text-xs font-semibold text-white hover:bg-[#173B68]"
            >
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Buka Pratinjau Sertifikat</span>
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

interface AuditTrailSectionProps {
  logs: AuditLogEntry[];
}

export function AuditTrailSection({ logs }: AuditTrailSectionProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-[#0F294A]" aria-hidden="true" />
        <h3 className="font-display text-sm font-semibold text-[#0F294A]">
          Jejak Audit Perubahan Data Aset (Audit Trail)
        </h3>
      </div>
      <div className="mt-3 divide-y divide-slate-100">
        {logs.slice(0, 6).map((log) => (
          <div
            key={log.id}
            className="flex flex-col gap-1 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <span className="font-semibold text-[#0F294A]">{log.marketName}</span>
              <span className="text-slate-400"> · </span>
              <span className="font-medium text-slate-700">{log.jenisAktivitas}:</span>{' '}
              <span className="text-slate-600">{log.detailPerubahan}</span>
            </div>
            <div className="font-mono text-[11px] text-slate-500 whitespace-nowrap tabular-nums">
              {log.userName} · {log.timestamp}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
