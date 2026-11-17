import * as XLSX from 'xlsx';
import type { MarketAsset } from '../types/aset';
import {
  computeKpiSummary,
  getAreaDiscrepancy,
  isBpnStagnant,
  STATUS_META,
} from './asetLogic';

export function exportMarketsToExcel(
  markets: MarketAsset[],
  referenceDateIso = '2026-11-16'
): void {
  const kpi = computeKpiSummary(markets, referenceDateIso);

  const summaryRows = [
    ['LAPORAN RINGKASAN EKSEKUTIF SERTIFIKASI ASET 19 PASAR PEMDA'],
    ['Dinas Perindustrian dan Perdagangan Kabupaten Sidoarjo'],
    ['Tanggal Ekspor', referenceDateIso],
    [],
    ['Kategori Status', 'Jumlah Pasar', 'Persentase (%)'],
    ['Total Pasar Pemda', kpi.totalPasar, 100],
    ['Sudah Bersertifikat', kpi.counts.BERSERTIFIKAT, kpi.percentages.BERSERTIFIKAT],
    ['Sedang Proses BPN', kpi.counts.PROSES_BPN, kpi.percentages.PROSES_BPN],
    ['Terkendala', kpi.counts.TERKENDALA, kpi.percentages.TERKENDALA],
    ['Belum Proses', kpi.counts.BELUM_PROSES, kpi.percentages.BELUM_PROSES],
    [],
    ['Total Luas Tercatat KIB A (m²)', kpi.totalLuasKibA],
    ['Total Luas Sudah Bersertifikat (m²)', kpi.totalLuasBersertifikat],
    ['Berkas BPN Stagnan > 30 Hari', kpi.stagnantBpnCount],
    ['Pasar dengan Selisih Luas KIB A', kpi.areaDiscrepancyCount],
  ];

  const marketRows = markets.map((m, idx) => {
    const disc = getAreaDiscrepancy(m);
    const stag = isBpnStagnant(m, referenceDateIso);
    return {
      No: idx + 1,
      'Kode Pasar': m.kodePasar,
      'Nama Pasar': m.namaPasar,
      Kecamatan: m.kecamatan,
      Alamat: m.alamat,
      'Nomor Register KIB A': m.nomorRegisterKib,
      'Luas KIB A (m²)': m.luasKibA,
      'Status Sertifikasi': STATUS_META[m.statusSertifikasi].label,
      'Nomor Sertifikat / Berkas BPN':
        m.certificate?.nomorSertifikat ??
        m.bpnProgress?.nomorBerkasBpn ??
        '-',
      'NIB / Tahapan BPN':
        m.certificate?.nib ?? m.bpnProgress?.tahapanSaatIni ?? '-',
      'Luas Sertifikat / Ukur BPN (m²)': disc.comparedArea ?? '-',
      'Selisih Luas (m²)': disc.hasDiscrepancy ? disc.difference : 0,
      'Peringatan Stagnan BPN': stag.stagnant
        ? `Ya (${stag.daysSinceUpdate} hari)`
        : 'Tidak',
      'Kategori Kendala': m.issueActionPlan?.kategoriKendala ?? '-',
      'Rencana Aksi': m.issueActionPlan?.rencanaAksi ?? '-',
      'Instansi Terkait': m.issueActionPlan?.instansiTerkait ?? '-',
      'Target Waktu': m.issueActionPlan?.targetSelesai ?? '-',
      'PIC Penanggung Jawab':
        m.issueActionPlan?.picDisperindag ??
        m.bpnProgress?.picBpn ??
        m.kepalaUptd,
    };
  });

  const issueRows = markets
    .filter((m) => m.statusSertifikasi !== 'BERSERTIFIKAT')
    .map((m, idx) => ({
      No: idx + 1,
      'Nama Pasar': m.namaPasar,
      Kecamatan: m.kecamatan,
      Status: STATUS_META[m.statusSertifikasi].label,
      'Kategori Kendala / Tahapan':
        m.issueActionPlan?.kategoriKendala ??
        m.bpnProgress?.tahapanSaatIni ??
        '-',
      'Uraian Masalah / Progres':
        m.issueActionPlan?.uraianKendala ??
        m.bpnProgress?.keteranganProgres ??
        '-',
      'Rencana Aksi':
        m.issueActionPlan?.rencanaAksi ??
        `Monitoring lanjutan berkas BPN (${m.bpnProgress?.nomorBerkasBpn ?? '-'})`,
      'Instansi Terkait': m.issueActionPlan?.instansiTerkait ?? 'BPN Kab. Sidoarjo',
      'Target Selesai':
        m.issueActionPlan?.targetSelesai ??
        m.bpnProgress?.estimasiSelesai ??
        '-',
      'Status Tindak Lanjut':
        m.issueActionPlan?.statusTindakLanjut ?? 'Dalam Proses BPN',
      PIC:
        m.issueActionPlan?.picDisperindag ??
        m.bpnProgress?.picBpn ??
        'Kasubbag Umpeg',
    }));

  const wb = XLSX.utils.book_new();
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  const wsMarkets = XLSX.utils.json_to_sheet(marketRows);
  const wsIssues = XLSX.utils.json_to_sheet(issueRows);

  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Eksekutif');
  XLSX.utils.book_append_sheet(wb, wsMarkets, 'Rekap 19 Pasar');
  XLSX.utils.book_append_sheet(wb, wsIssues, 'Matriks Rencana Aksi');

  XLSX.writeFile(wb, `SIMPAS-ASET_Sidoarjo_Rekap_19_Pasar_${referenceDateIso}.xlsx`);
}
