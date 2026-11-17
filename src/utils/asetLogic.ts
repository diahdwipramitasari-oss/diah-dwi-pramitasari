import type {
  BpnStage,
  CertificationStatus,
  KpiSummary,
  MarketAsset,
  MarketUpdatePayload,
} from '../types/aset';

export const STATUS_META: Record<
  CertificationStatus,
  {
    label: string;
    shortLabel: string;
    hex: string;
    bgSoft: string;
    textClass: string;
    borderClass: string;
    dotClass: string;
  }
> = {
  BERSERTIFIKAT: {
    label: 'Sudah Bersertifikat',
    shortLabel: 'Bersertifikat',
    hex: '#16A34A',
    bgSoft: 'bg-emerald-50',
    textClass: 'text-emerald-800',
    borderClass: 'border-emerald-200',
    dotClass: 'bg-emerald-600',
  },
  PROSES_BPN: {
    label: 'Sedang Proses BPN',
    shortLabel: 'Proses BPN',
    hex: '#D97706',
    bgSoft: 'bg-amber-50',
    textClass: 'text-amber-800',
    borderClass: 'border-amber-200',
    dotClass: 'bg-amber-500',
  },
  TERKENDALA: {
    label: 'Terkendala',
    shortLabel: 'Terkendala',
    hex: '#DC2626',
    bgSoft: 'bg-red-50',
    textClass: 'text-red-800',
    borderClass: 'border-red-200',
    dotClass: 'bg-red-600',
  },
  BELUM_PROSES: {
    label: 'Belum Proses',
    shortLabel: 'Belum Proses',
    hex: '#64748B',
    bgSoft: 'bg-slate-100',
    textClass: 'text-slate-700',
    borderClass: 'border-slate-300',
    dotClass: 'bg-slate-500',
  },
};

export const BPN_STAGES_ORDER: BpnStage[] = [
  'Pemberkasan Alas Hak',
  'Pengukuran Bidang',
  'Sidang Panitia A',
  'Pengumuman',
  'Penerbitan SK & Cetak',
];

export function getBpnStagePercent(stage?: BpnStage): number {
  if (!stage) return 0;
  const idx = BPN_STAGES_ORDER.indexOf(stage);
  if (idx === -1) return 0;
  return Math.round(((idx + 1) / BPN_STAGES_ORDER.length) * 100);
}

export function isBpnStagnant(
  market: MarketAsset,
  referenceDateIso: string
): { stagnant: boolean; daysSinceUpdate: number } {
  if (market.statusSertifikasi !== 'PROSES_BPN' || !market.bpnProgress) {
    return { stagnant: false, daysSinceUpdate: 0 };
  }
  const lastUpdate = new Date(market.bpnProgress.tanggalUpdate).getTime();
  const ref = new Date(referenceDateIso).getTime();
  if (Number.isNaN(lastUpdate) || Number.isNaN(ref)) {
    return { stagnant: false, daysSinceUpdate: 0 };
  }
  const diffDays = Math.floor((ref - lastUpdate) / (1000 * 60 * 60 * 24));
  return {
    stagnant: diffDays > 30,
    daysSinceUpdate: Math.max(0, diffDays),
  };
}

export function getAreaDiscrepancy(market: MarketAsset): {
  hasDiscrepancy: boolean;
  comparedArea: number | null;
  difference: number;
  sourceLabel: string;
} {
  if (market.certificate?.luasSertifikat) {
    const diff = market.certificate.luasSertifikat - market.luasKibA;
    return {
      hasDiscrepancy: Math.abs(diff) > 0,
      comparedArea: market.certificate.luasSertifikat,
      difference: diff,
      sourceLabel: 'Sertifikat BPN',
    };
  }
  if (market.bpnProgress?.luasPengukuranBpn) {
    const diff = market.bpnProgress.luasPengukuranBpn - market.luasKibA;
    return {
      hasDiscrepancy: Math.abs(diff) > 0,
      comparedArea: market.bpnProgress.luasPengukuranBpn,
      difference: diff,
      sourceLabel: 'Ukur Bidang BPN',
    };
  }
  return {
    hasDiscrepancy: false,
    comparedArea: null,
    difference: 0,
    sourceLabel: '-',
  };
}

export function computeKpiSummary(
  markets: MarketAsset[],
  referenceDateIso = '2026-11-16'
): KpiSummary {
  const totalPasar = markets.length;
  const counts: Record<CertificationStatus, number> = {
    BERSERTIFIKAT: 0,
    PROSES_BPN: 0,
    TERKENDALA: 0,
    BELUM_PROSES: 0,
  };

  let totalLuasKibA = 0;
  let totalLuasBersertifikat = 0;
  let stagnantBpnCount = 0;
  let areaDiscrepancyCount = 0;

  for (const m of markets) {
    counts[m.statusSertifikasi] += 1;
    totalLuasKibA += m.luasKibA;
    if (m.statusSertifikasi === 'BERSERTIFIKAT') {
      totalLuasBersertifikat += m.certificate?.luasSertifikat ?? m.luasKibA;
    }
    if (isBpnStagnant(m, referenceDateIso).stagnant) {
      stagnantBpnCount += 1;
    }
    if (getAreaDiscrepancy(m).hasDiscrepancy) {
      areaDiscrepancyCount += 1;
    }
  }

  const pct = (count: number) =>
    totalPasar === 0 ? 0 : Number(((count / totalPasar) * 100).toFixed(1));

  return {
    totalPasar,
    totalLuasKibA,
    totalLuasBersertifikat,
    counts,
    percentages: {
      BERSERTIFIKAT: pct(counts.BERSERTIFIKAT),
      PROSES_BPN: pct(counts.PROSES_BPN),
      TERKENDALA: pct(counts.TERKENDALA),
      BELUM_PROSES: pct(counts.BELUM_PROSES),
    },
    stagnantBpnCount,
    areaDiscrepancyCount,
  };
}

export function filterMarkets(
  markets: MarketAsset[],
  options: {
    statusFilter: CertificationStatus | 'ALL';
    searchQuery: string;
    kecamatanFilter?: string;
  }
): MarketAsset[] {
  const q = options.searchQuery.trim().toLowerCase();
  const kec = options.kecamatanFilter?.trim() || 'ALL';

  return markets.filter((m) => {
    if (
      options.statusFilter !== 'ALL' &&
      m.statusSertifikasi !== options.statusFilter
    ) {
      return false;
    }
    if (kec !== 'ALL' && m.kecamatan !== kec) {
      return false;
    }
    if (!q) return true;
    return (
      m.namaPasar.toLowerCase().includes(q) ||
      m.kecamatan.toLowerCase().includes(q) ||
      m.kodePasar.toLowerCase().includes(q) ||
      m.alamat.toLowerCase().includes(q) ||
      (m.certificate?.nomorSertifikat.toLowerCase().includes(q) ?? false) ||
      (m.bpnProgress?.nomorBerkasBpn.toLowerCase().includes(q) ?? false)
    );
  });
}

export function validateMarketUpdate(
  payload: MarketUpdatePayload
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!payload.luasKibA || payload.luasKibA <= 0) {
    errors.luasKibA = 'Luas lahan KIB A harus lebih besar dari 0 m².';
  }

  if (payload.statusSertifikasi === 'BERSERTIFIKAT') {
    if (!payload.nomorSertifikat?.trim()) {
      errors.nomorSertifikat = 'Nomor sertifikat Hak Pakai wajib diisi.';
    }
    if (!payload.nib?.trim()) {
      errors.nib = 'Nomor Identifikasi Bidang (NIB) wajib diisi.';
    }
    if (!payload.tahunTerbit || payload.tahunTerbit < 1970 || payload.tahunTerbit > 2100) {
      errors.tahunTerbit = 'Tahun terbit sertifikat tidak valid.';
    }
    if (!payload.luasSertifikat || payload.luasSertifikat <= 0) {
      errors.luasSertifikat = 'Luas tertera di sertifikat wajib diisi.';
    }
  }

  if (payload.statusSertifikasi === 'PROSES_BPN') {
    if (!payload.nomorBerkasBpn?.trim()) {
      errors.nomorBerkasBpn = 'Nomor berkas permohonan BPN wajib diisi.';
    }
    if (!payload.tahapanSaatIni) {
      errors.tahapanSaatIni = 'Tahapan proses BPN saat ini wajib dipilih.';
    }
    if (!payload.picBpn?.trim()) {
      errors.picBpn = 'Petugas penghubung BPN wajib diisi.';
    }
  }

  if (payload.statusSertifikasi === 'TERKENDALA') {
    if (!payload.kategoriKendala) {
      errors.kategoriKendala = 'Kategori kendala wajib dipilih.';
    }
    if (!payload.uraianKendala?.trim()) {
      errors.uraianKendala = 'Uraian hambatan di lapangan wajib diisi.';
    }
    if (!payload.rencanaAksi?.trim()) {
      errors.rencanaAksi = 'Rencana aksi penyelesaian wajib diisi.';
    }
    if (!payload.targetSelesai?.trim()) {
      errors.targetSelesai = 'Target waktu penyelesaian wajib ditentukan.';
    }
    if (!payload.picDisperindag?.trim()) {
      errors.picDisperindag = 'Penanggung jawab (PIC) wajib diisi.';
    }
  }

  if (payload.statusSertifikasi === 'BELUM_PROSES') {
    if (!payload.rencanaAksi?.trim()) {
      errors.rencanaAksi = 'Rencana persiapan pengajuan wajib diisi.';
    }
    if (!payload.picDisperindag?.trim()) {
      errors.picDisperindag = 'PIC penyiapan berkas wajib diisi.';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function generateExecutiveNarrative(
  markets: MarketAsset[],
  referenceDateIso = '2026-11-16'
): {
  headline: string;
  summaryParagraph: string;
  priorityInterventions: string[];
} {
  const kpi = computeKpiSummary(markets, referenceDateIso);
  const constrained = markets.filter((m) => m.statusSertifikasi === 'TERKENDALA');
  const stagnantBpn = markets.filter(
    (m) => isBpnStagnant(m, referenceDateIso).stagnant
  );

  const headline = `Capaian Sertifikasi Aset Pasar Pemda Sidoarjo: ${kpi.counts.BERSERTIFIKAT} dari ${kpi.totalPasar} Pasar (${kpi.percentages.BERSERTIFIKAT}%) Telah Bersertifikat Sah`;

  const summaryParagraph = `Dari total ${kpi.totalPasar} pasar pemerintah daerah di bawah pengelolaan Dinas Perindustrian dan Perdagangan Kabupaten Sidoarjo dengan total luasan KIB A sebesar ${kpi.totalLuasKibA.toLocaleString('id-ID')} m², sebanyak ${kpi.counts.BERSERTIFIKAT} pasar (${kpi.percentages.BERSERTIFIKAT}%) telah mengantongi sertifikat Hak Pakai yang terdigitalisasi. Sebanyak ${kpi.counts.PROSES_BPN} pasar (${kpi.percentages.PROSES_BPN}%) sedang aktif berproses di Kantor Pertanahan (BPN) Kabupaten Sidoarjo, ${kpi.counts.TERKENDALA} pasar (${kpi.percentages.TERKENDALA}%) mengalami kendala teknis atau yuridis yang memerlukan atensi lintas instansi, dan ${kpi.counts.BELUM_PROSES} pasar (${kpi.percentages.BELUM_PROSES}%) berada pada tahap penyiapan berkas alas hak awal.`;

  const priorityInterventions: string[] = [];

  if (constrained.length > 0) {
    priorityInterventions.push(
      `Prioritas Penyelesaian Kendala (${constrained.length} Pasar): Fokus koordinasi BPKAD, BPN, dan Pemerintah Desa pada ${constrained
        .map((m) => `${m.namaPasar} (${m.issueActionPlan?.kategoriKendala ?? 'Kendala Lapangan'})`)
        .join(', ')}.`
    );
  }

  if (stagnantBpn.length > 0) {
    priorityInterventions.push(
      `Eskalasi Berkas BPN Stagnan > 30 Hari (${stagnantBpn.length} Pasar): Percepatan konfirmasi ke seksi pengukuran/Panitia A BPN Sidoarjo untuk ${stagnantBpn
        .map((m) => m.namaPasar)
        .join(', ')}.`
    );
  }

  if (kpi.areaDiscrepancyCount > 0) {
    priorityInterventions.push(
      `Rekonsiliasi Luas KIB A (${kpi.areaDiscrepancyCount} Pasar): Penyelarasan catatan luas pada SIMDA BMD/e-BMD bersama BPKAD agar selaras dengan hasil ukur bidang BPN.`
    );
  }

  const belum = markets.filter((m) => m.statusSertifikasi === 'BELUM_PROSES');
  if (belum.length > 0) {
    priorityInterventions.push(
      `Penyiapan Alas Hak Awal (${belum.length} Pasar): Penerbitan surat keterangan riwayat tanah dan pemasangan patok batas permanen di ${belum
        .map((m) => m.namaPasar)
        .join(', ')}.`
    );
  }

  return {
    headline,
    summaryParagraph,
    priorityInterventions,
  };
}

export function formatCurrencyIdr(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDateId(isoDate: string): string {
  if (!isoDate) return '-';
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}
