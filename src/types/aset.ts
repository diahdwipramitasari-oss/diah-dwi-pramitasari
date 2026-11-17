export type CertificationStatus =
  | 'BERSERTIFIKAT'
  | 'PROSES_BPN'
  | 'TERKENDALA'
  | 'BELUM_PROSES';

export type UserRole = 'KASUBBAG_UMPEG' | 'OPERATOR_ASET' | 'PIMPINAN';

export type ActiveView =
  | 'dashboard'
  | 'markets'
  | 'bpn'
  | 'issues'
  | 'vault'
  | 'brief';

export type BpnStage =
  | 'Pemberkasan Alas Hak'
  | 'Pengukuran Bidang'
  | 'Sidang Panitia A'
  | 'Pengumuman'
  | 'Penerbitan SK & Cetak';

export type IssueCategory =
  | 'Sengketa Batas'
  | 'Selisih Luas KIB A'
  | 'Kelengkapan Alas Hak'
  | 'Tumpang Tindih Bidang'
  | 'Administrasi Desa/Kecamatan';

export type ActionStatus =
  | 'Belum Dimulai'
  | 'Dalam Koordinasi'
  | 'Proses Lapangan'
  | 'Selesai';

export interface CertificateRecord {
  jenisHak: 'Hak Pakai' | 'Hak Pengelolaan';
  nomorSertifikat: string;
  nib: string;
  tanggalTerbit: string; // YYYY-MM-DD
  tahunTerbit: number;
  luasSertifikat: number; // m²
  pemegangHak: string;
  suratUkurNo: string;
  verifiedBy: string;
  filePdfName: string;
  uploadedDataUrl?: string;
}

export interface BpnProgressLog {
  id: string;
  nomorBerkasBpn: string;
  tanggalDaftar: string; // YYYY-MM-DD
  tahapanSaatIni: BpnStage;
  tanggalUpdate: string; // YYYY-MM-DD
  estimasiSelesai: string; // YYYY-MM-DD
  luasPengukuranBpn?: number;
  picBpn: string;
  keteranganProgres: string;
  riwayat: Array<{
    tanggal: string;
    tahapan: string;
    catatan: string;
    petugas: string;
  }>;
}

export interface IssueActionPlan {
  id: string;
  kategoriKendala: IssueCategory;
  uraianKendala: string;
  kronologi: string;
  rencanaAksi: string;
  instansiTerkait: string;
  targetSelesai: string; // YYYY-MM-DD
  statusTindakLanjut: ActionStatus;
  picDisperindag: string;
  kelengkapanDokumen?: string[];
}

export interface MarketAsset {
  id: string;
  kodePasar: string;
  namaPasar: string;
  kecamatan: string;
  kelurahan: string;
  alamat: string;
  latitude: number;
  longitude: number;
  luasKibA: number; // m²
  nomorRegisterKib: string;
  kodeBarang: string;
  tahunPerolehan: number;
  asalUsul: string;
  nilaiPerolehan: number; // IDR
  kepalaUptd: string;
  statusSertifikasi: CertificationStatus;
  updatedAt: string; // YYYY-MM-DD
  certificate?: CertificateRecord;
  bpnProgress?: BpnProgressLog;
  issueActionPlan?: IssueActionPlan;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userRole: UserRole;
  userName: string;
  marketId: string;
  marketName: string;
  jenisAktivitas: string;
  detailPerubahan: string;
}

export interface KpiSummary {
  totalPasar: number;
  totalLuasKibA: number;
  totalLuasBersertifikat: number;
  counts: Record<CertificationStatus, number>;
  percentages: Record<CertificationStatus, number>;
  stagnantBpnCount: number;
  areaDiscrepancyCount: number;
}

export interface MarketUpdatePayload {
  statusSertifikasi: CertificationStatus;
  luasKibA: number;
  // Sertifikat fields
  nomorSertifikat?: string;
  nib?: string;
  tahunTerbit?: number;
  tanggalTerbit?: string;
  luasSertifikat?: number;
  suratUkurNo?: string;
  filePdfName?: string;
  uploadedDataUrl?: string;
  // BPN fields
  nomorBerkasBpn?: string;
  tanggalDaftar?: string;
  tahapanSaatIni?: BpnStage;
  estimasiSelesai?: string;
  picBpn?: string;
  luasPengukuranBpn?: number;
  keteranganProgres?: string;
  // Issue / Belum Proses fields
  kategoriKendala?: IssueCategory;
  uraianKendala?: string;
  kronologi?: string;
  rencanaAksi?: string;
  instansiTerkait?: string;
  targetSelesai?: string;
  statusTindakLanjut?: ActionStatus;
  picDisperindag?: string;
}
