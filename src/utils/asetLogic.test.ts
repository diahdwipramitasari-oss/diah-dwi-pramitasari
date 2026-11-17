import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeKpiSummary,
  filterMarkets,
  generateExecutiveNarrative,
  getAreaDiscrepancy,
  getBpnStagePercent,
  isBpnStagnant,
  validateMarketUpdate,
} from './asetLogic';
import type { MarketAsset } from '../types/aset';

const sampleMarkets: MarketAsset[] = [
  {
    id: 'm1',
    kodePasar: 'PSR-01',
    namaPasar: 'Pasar Baru Porong',
    kecamatan: 'Porong',
    kelurahan: 'Juwetkenongo',
    alamat: 'Jl. Raya Porong No. 1',
    latitude: -7.5416,
    longitude: 112.6952,
    luasKibA: 18500,
    nomorRegisterKib: '0001/KIB-A/2008',
    kodeBarang: '1.3.1.01.04',
    tahunPerolehan: 2008,
    asalUsul: 'Pembelian Pemda',
    nilaiPerolehan: 24500000000,
    kepalaUptd: 'H. Bambang S.',
    statusSertifikasi: 'BERSERTIFIKAT',
    updatedAt: '2026-10-01',
    certificate: {
      jenisHak: 'Hak Pakai',
      nomorSertifikat: 'HP No. 00012/Juwetkenongo',
      nib: '12.14.08.04.00112',
      tanggalTerbit: '2022-06-15',
      tahunTerbit: 2022,
      luasSertifikat: 18500,
      pemegangHak: 'Pemerintah Kabupaten Sidoarjo',
      suratUkurNo: 'SU-00412/2022',
      verifiedBy: 'Kasubbag Umpeg',
      filePdfName: 'Sertifikat_Pasar_Baru_Porong.pdf',
    },
  },
  {
    id: 'm2',
    kodePasar: 'PSR-02',
    namaPasar: 'Pasar Krian',
    kecamatan: 'Krian',
    kelurahan: 'Krian',
    alamat: 'Jl. Raya Krian',
    latitude: -7.4091,
    longitude: 112.5764,
    luasKibA: 12400,
    nomorRegisterKib: '0002/KIB-A/1995',
    kodeBarang: '1.3.1.01.04',
    tahunPerolehan: 1995,
    asalUsul: 'Aset Penyerahan',
    nilaiPerolehan: 18200000000,
    kepalaUptd: 'Slamet Riyadi',
    statusSertifikasi: 'PROSES_BPN',
    updatedAt: '2026-10-01',
    bpnProgress: {
      id: 'bpn-2',
      nomorBerkasBpn: '4412/2026/SDA',
      tanggalDaftar: '2026-08-10',
      tahapanSaatIni: 'Sidang Panitia A',
      tanggalUpdate: '2026-10-01',
      estimasiSelesai: '2026-12-20',
      luasPengukuranBpn: 12280,
      picBpn: 'Ir. Hendra Wijaya (BPN)',
      keteranganProgres: 'Menunggu jadwal sidang Panitia A',
      riwayat: [],
    },
  },
  {
    id: 'm3',
    kodePasar: 'PSR-03',
    namaPasar: 'Pasar Krembung',
    kecamatan: 'Krembung',
    kelurahan: 'Krembung',
    alamat: 'Jl. Raya Krembung',
    latitude: -7.5161,
    longitude: 112.6245,
    luasKibA: 6400,
    nomorRegisterKib: '0003/KIB-A/1992',
    kodeBarang: '1.3.1.01.04',
    tahunPerolehan: 1992,
    asalUsul: 'Hibah Desa',
    nilaiPerolehan: 5100000000,
    kepalaUptd: 'M. Arifin',
    statusSertifikasi: 'TERKENDALA',
    updatedAt: '2026-11-02',
    issueActionPlan: {
      id: 'iss-3',
      kategoriKendala: 'Sengketa Batas',
      uraianKendala: 'Terdapat klaim batas sisi timur sepanjang 24m.',
      kronologi: 'Pengukuran awal ditunda karena warga belum menandatangani batas.',
      rencanaAksi: 'Mediasi batas bersama Camat dan Kades Krembung',
      instansiTerkait: 'BPN, Kecamatan, Desa',
      targetSelesai: '2026-12-10',
      statusTindakLanjut: 'Dalam Koordinasi',
      picDisperindag: 'Diah Dwi P. (Kasubbag Umpeg)',
    },
  },
  {
    id: 'm4',
    kodePasar: 'PSR-04',
    namaPasar: 'Pasar Jabon',
    kecamatan: 'Jabon',
    kelurahan: 'Dukuhsari',
    alamat: 'Jl. Raya Jabon',
    latitude: -7.5512,
    longitude: 112.7429,
    luasKibA: 4200,
    nomorRegisterKib: '0004/KIB-A/1998',
    kodeBarang: '1.3.1.01.04',
    tahunPerolehan: 1998,
    asalUsul: 'Pembelian Pemda',
    nilaiPerolehan: 3200000000,
    kepalaUptd: 'Ahmad Fauzi',
    statusSertifikasi: 'BELUM_PROSES',
    updatedAt: '2026-10-20',
  },
];

test('computeKpiSummary aggregates counts, percentages, area, and stagnation accurately', () => {
  const kpi = computeKpiSummary(sampleMarkets, '2026-11-16');
  assert.equal(kpi.totalPasar, 4);
  assert.equal(kpi.counts.BERSERTIFIKAT, 1);
  assert.equal(kpi.counts.PROSES_BPN, 1);
  assert.equal(kpi.counts.TERKENDALA, 1);
  assert.equal(kpi.counts.BELUM_PROSES, 1);
  assert.equal(kpi.percentages.BERSERTIFIKAT, 25);
  assert.equal(kpi.totalLuasKibA, 41500);
  assert.equal(kpi.totalLuasBersertifikat, 18500);
  assert.equal(kpi.stagnantBpnCount, 1); // 2026-10-01 to 2026-11-16 is 46 days > 30
  assert.equal(kpi.areaDiscrepancyCount, 1); // Pasar Krian 12280 vs 12400
});

test('isBpnStagnant detects > 30 days without update', () => {
  const res = isBpnStagnant(sampleMarkets[1], '2026-11-16');
  assert.equal(res.stagnant, true);
  assert.equal(res.daysSinceUpdate, 46);

  const nonStagnant = isBpnStagnant(sampleMarkets[1], '2026-10-20');
  assert.equal(nonStagnant.stagnant, false);
});

test('getAreaDiscrepancy calculates difference between BPN and KIB A', () => {
  const same = getAreaDiscrepancy(sampleMarkets[0]);
  assert.equal(same.hasDiscrepancy, false);
  assert.equal(same.difference, 0);

  const diff = getAreaDiscrepancy(sampleMarkets[1]);
  assert.equal(diff.hasDiscrepancy, true);
  assert.equal(diff.difference, -120);
});

test('filterMarkets filters by status, kecamatan, and search query', () => {
  assert.equal(
    filterMarkets(sampleMarkets, { statusFilter: 'TERKENDALA', searchQuery: '' }).length,
    1
  );
  assert.equal(
    filterMarkets(sampleMarkets, { statusFilter: 'ALL', searchQuery: 'porong' }).length,
    1
  );
  assert.equal(
    filterMarkets(sampleMarkets, { statusFilter: 'ALL', searchQuery: '4412/2026' }).length,
    1
  );
});

test('getBpnStagePercent returns stepped progress', () => {
  assert.equal(getBpnStagePercent('Pemberkasan Alas Hak'), 20);
  assert.equal(getBpnStagePercent('Sidang Panitia A'), 60);
  assert.equal(getBpnStagePercent('Penerbitan SK & Cetak'), 100);
});

test('validateMarketUpdate enforces mandatory fields per status', () => {
  const invalidCert = validateMarketUpdate({
    statusSertifikasi: 'BERSERTIFIKAT',
    luasKibA: 5000,
    nomorSertifikat: '',
  });
  assert.equal(invalidCert.valid, false);
  assert.ok(invalidCert.errors.nomorSertifikat);
  assert.ok(invalidCert.errors.nib);

  const validIssue = validateMarketUpdate({
    statusSertifikasi: 'TERKENDALA',
    luasKibA: 5000,
    kategoriKendala: 'Sengketa Batas',
    uraianKendala: 'Klaim batas sisi utara',
    rencanaAksi: 'Koordinasi ulang',
    targetSelesai: '2026-12-30',
    picDisperindag: 'Kasubbag Umpeg',
  });
  assert.equal(validIssue.valid, true);
});

test('generateExecutiveNarrative produces actionable summary and interventions', () => {
  const brief = generateExecutiveNarrative(sampleMarkets, '2026-11-16');
  assert.match(brief.headline, /1 dari 4 Pasar/);
  assert.ok(brief.priorityInterventions.length >= 3);
});
