import {
  AlertCircle,
  Calendar,
  Edit3,
  Eye,
  FileText,
  MapPin,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import type { MarketAsset, UserRole } from '../types/aset';
import {
  BPN_STAGES_ORDER,
  formatDateId,
  getAreaDiscrepancy,
  getBpnStagePercent,
  isBpnStagnant,
} from '../utils/asetLogic';
import { StatusBadge } from './StatusBadge';

interface MarketQuickPanelProps {
  market: MarketAsset | null;
  userRole: UserRole;
  onOpenDetail: (market: MarketAsset, initialTab?: 'profil' | 'sertifikat' | 'progres') => void;
  onOpenUpdate: (market: MarketAsset) => void;
}

export function MarketQuickPanel({
  market,
  userRole,
  onOpenDetail,
  onOpenUpdate,
}: MarketQuickPanelProps) {
  const canEdit = userRole === 'KASUBBAG_UMPEG' || userRole === 'OPERATOR_ASET';

  if (!market) {
    return (
      <div className="flex h-full min-h-[430px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-center">
        <MapPin className="h-8 w-8 text-slate-300" aria-hidden="true" />
        <p className="mt-3 font-display text-sm font-semibold text-slate-800">
          Pilih Pasar pada Peta atau Daftar
        </p>
        <p className="mt-1 max-w-xs text-xs text-slate-500">
          Klik salah satu dari 19 titik lokasi pasar untuk melihat legalitas sertifikat, progres BPN, atau rencana aksi.
        </p>
      </div>
    );
  }

  const discrepancy = getAreaDiscrepancy(market);
  const stagnation = isBpnStagnant(market, '2026-11-16');
  const stagePct = getBpnStagePercent(market.bpnProgress?.tahapanSaatIni);

  return (
    <aside
      aria-label={`Ringkasan ${market.namaPasar}`}
      className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white"
    >
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-mono font-medium text-slate-700">
                {market.kodePasar}
              </span>
              <span aria-hidden="true">·</span>
              <span>Kec. {market.kecamatan}</span>
            </div>
            <h3 className="mt-1 font-display text-lg font-bold text-[#0F294A]">
              {market.namaPasar}
            </h3>
          </div>
          <StatusBadge status={market.statusSertifikasi} />
        </div>

        <p className="text-xs leading-relaxed text-slate-600">{market.alamat}</p>

        {/* Key KIB A Metrics */}
        <div className="grid grid-cols-2 gap-3 border-y border-slate-100 py-3">
          <div>
            <div className="text-[11px] font-medium text-slate-500">
              Luas KIB A
            </div>
            <div className="mt-0.5 font-mono text-sm font-semibold text-slate-900 tabular-nums">
              {market.luasKibA.toLocaleString('id-ID')} m²
            </div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500">
              No. Register KIB
            </div>
            <div className="mt-0.5 font-mono text-xs font-medium text-slate-800 tabular-nums truncate">
              {market.nomorRegisterKib}
            </div>
          </div>
        </div>

        {/* Area Discrepancy Alert if any */}
        {discrepancy.hasDiscrepancy && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
            <div className="flex items-center gap-1.5 font-semibold">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-700" aria-hidden="true" />
              <span>Selisih Luas Terdeteksi ({discrepancy.difference > 0 ? '+' : ''}{discrepancy.difference.toLocaleString('id-ID')} m²)</span>
            </div>
            <p className="mt-1 text-amber-800 tabular-nums">
              KIB A: {market.luasKibA.toLocaleString('id-ID')} m² vs {discrepancy.sourceLabel}:{' '}
              {discrepancy.comparedArea?.toLocaleString('id-ID')} m².
            </p>
          </div>
        )}

        {/* Status-Specific Body */}
        {market.statusSertifikasi === 'BERSERTIFIKAT' && market.certificate && (
          <div className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Legalitas Aset Terverifikasi ({market.certificate.jenisHak})</span>
            </div>
            <dl className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500">Nomor Sertifikat</dt>
                <dd className="font-mono font-semibold text-slate-900 text-right">
                  {market.certificate.nomorSertifikat}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500">NIB</dt>
                <dd className="font-mono text-slate-800 tabular-nums">
                  {market.certificate.nib}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500">Tahun Terbit & Luas</dt>
                <dd className="font-mono text-slate-800 tabular-nums">
                  {market.certificate.tahunTerbit} · {market.certificate.luasSertifikat.toLocaleString('id-ID')} m²
                </dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => onOpenDetail(market, 'sertifikat')}
              className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800 transition-colors"
            >
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Lihat Pratinjau Sertifikat Digital</span>
            </button>
          </div>
        )}

        {market.statusSertifikasi === 'PROSES_BPN' && market.bpnProgress && (
          <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/80 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#0F294A]">
                Progres Berkas BPN
              </span>
              <span className="font-mono text-xs font-medium text-slate-700">
                {market.bpnProgress.nomorBerkasBpn}
              </span>
            </div>

            {stagnation.stagnant && (
              <div className="rounded-md border border-red-200 bg-red-50 px-2.5 py-2 text-xs font-medium text-red-800">
                Peringatan Stagnasi: Tidak ada pembaruan selama {stagnation.daysSinceUpdate} hari (&gt; 30 hari).
              </div>
            )}

            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-amber-800">
                  Tahap: {market.bpnProgress.tahapanSaatIni}
                </span>
                <span className="font-mono font-semibold text-slate-700 tabular-nums">
                  {stagePct}%
                </span>
              </div>
              <div className="mt-1.5 grid grid-cols-5 gap-1">
                {BPN_STAGES_ORDER.map((stage, idx) => {
                  const activeIdx = BPN_STAGES_ORDER.indexOf(
                    market.bpnProgress!.tahapanSaatIni
                  );
                  const done = idx <= activeIdx;
                  return (
                    <div
                      key={stage}
                      className={`h-1.5 rounded-full ${
                        done ? 'bg-amber-500' : 'bg-slate-200'
                      }`}
                      title={stage}
                    />
                  );
                })}
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-600 line-clamp-3">
              {market.bpnProgress.keteranganProgres}
            </p>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>PIC: {market.bpnProgress.picBpn}</span>
              <span className="tabular-nums">
                Update: {formatDateId(market.bpnProgress.tanggalUpdate)}
              </span>
            </div>
          </div>
        )}

        {(market.statusSertifikasi === 'TERKENDALA' ||
          market.statusSertifikasi === 'BELUM_PROSES') &&
          market.issueActionPlan && (
            <div className="space-y-2.5 rounded-lg border border-slate-200 bg-slate-50/80 p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#0F294A]">
                  {market.statusSertifikasi === 'TERKENDALA'
                    ? `Kendala: ${market.issueActionPlan.kategoriKendala}`
                    : 'Persiapan Berkas Pra-BPN'}
                </span>
                <span className="text-[11px] font-medium text-slate-600">
                  {market.issueActionPlan.statusTindakLanjut}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-700 line-clamp-3">
                {market.issueActionPlan.uraianKendala}
              </p>
              <div className="border-t border-slate-200/80 pt-2">
                <div className="text-[11px] font-semibold text-slate-600">
                  Rencana Aksi:
                </div>
                <p className="mt-0.5 text-xs text-slate-700 line-clamp-2">
                  {market.issueActionPlan.rencanaAksi}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <UserCheck className="h-3 w-3" aria-hidden="true" />
                  {market.issueActionPlan.picDisperindag}
                </span>
                <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                  <Calendar className="h-3 w-3" aria-hidden="true" />
                  Target: {formatDateId(market.issueActionPlan.targetSelesai)}
                </span>
              </div>
            </div>
          )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center gap-2 border-t border-slate-200 bg-slate-50/60 px-5 py-3">
        <button
          type="button"
          onClick={() => onOpenDetail(market, 'profil')}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
        >
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Detail Lengkap</span>
        </button>
        {canEdit && (
          <button
            type="button"
            onClick={() => onOpenUpdate(market)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#0F294A] px-3 py-2 text-xs font-semibold text-white hover:bg-[#173B68] transition-colors whitespace-nowrap"
          >
            <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Update Progres</span>
          </button>
        )}
      </div>
    </aside>
  );
}
