import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Sparkles, Upload, X } from 'lucide-react';
import type {
  ActionStatus,
  BpnStage,
  CertificationStatus,
  IssueCategory,
  MarketAsset,
  MarketUpdatePayload,
} from '../types/aset';
import { BPN_STAGES_ORDER, validateMarketUpdate } from '../utils/asetLogic';

interface UpdateMarketModalProps {
  market: MarketAsset | null;
  onClose: () => void;
  onSave: (marketId: string, payload: MarketUpdatePayload) => void;
}

const RECOMMENDED_PLANS: Record<IssueCategory, string> = {
  'Sengketa Batas':
    'Melaksanakan mediasi dan pengukuran ulang batas bidang dengan menghadirkan Petugas Ukur BPN, Camat, Kepala Desa, dan pemilik persil penyanding.',
  'Selisih Luas KIB A':
    'Menyusun Berita Acara Rekonsiliasi & Koreksi Luasan KIB A bersama Bidang Aset BPKAD Kab. Sidoarjo dan memadankan peta bidang BPN.',
  'Kelengkapan Alas Hak':
    'Menelusuri buku Letter C desa dan menerbitkan Surat Keterangan Riwayat Tanah serta Surat Pernyataan Penguasaan Fisik Bidang Tanah yang disahkan Camat.',
  'Tumpang Tindih Bidang':
    'Mengajukan surat klarifikasi garis sempadan dan pemisahan poligon bidang kepada instansi teknis terkait dan Seksi Pemetaan BPN Sidoarjo.',
  'Administrasi Desa/Kecamatan':
    'Melakukan pemasangan patok batas permanen di 4 sudut lahan dan memproses surat pengantar kelengkapan pra-pendaftaran ke BPN.',
};

export function UpdateMarketModal({
  market,
  onClose,
  onSave,
}: UpdateMarketModalProps) {
  const [status, setStatus] = useState<CertificationStatus>(
    market?.statusSertifikasi ?? 'PROSES_BPN'
  );
  const [luasKibA, setLuasKibA] = useState<number>(market?.luasKibA ?? 0);

  // Certificate fields
  const [nomorSertifikat, setNomorSertifikat] = useState(
    market?.certificate?.nomorSertifikat ?? ''
  );
  const [nib, setNib] = useState(market?.certificate?.nib ?? '');
  const [tahunTerbit, setTahunTerbit] = useState<number>(
    market?.certificate?.tahunTerbit ?? 2026
  );
  const [tanggalTerbit, setTanggalTerbit] = useState(
    market?.certificate?.tanggalTerbit ?? '2026-11-16'
  );
  const [luasSertifikat, setLuasSertifikat] = useState<number>(
    market?.certificate?.luasSertifikat ?? market?.luasKibA ?? 0
  );
  const [suratUkurNo, setSuratUkurNo] = useState(
    market?.certificate?.suratUkurNo ?? 'SU-001/2026'
  );
  const [filePdfName, setFilePdfName] = useState(
    market?.certificate?.filePdfName ??
      `SHP_${market?.namaPasar.replace(/\s+/g, '_') ?? 'Pasar'}.pdf`
  );
  const [uploadedDataUrl, setUploadedDataUrl] = useState<string | undefined>(
    market?.certificate?.uploadedDataUrl
  );

  // BPN fields
  const [nomorBerkasBpn, setNomorBerkasBpn] = useState(
    market?.bpnProgress?.nomorBerkasBpn ?? 'BPN-SDA/2026/'
  );
  const [tanggalDaftar, setTanggalDaftar] = useState(
    market?.bpnProgress?.tanggalDaftar ?? '2026-11-01'
  );
  const [tahapanSaatIni, setTahapanSaatIni] = useState<BpnStage>(
    market?.bpnProgress?.tahapanSaatIni ?? 'Pemberkasan Alas Hak'
  );
  const [estimasiSelesai, setEstimasiSelesai] = useState(
    market?.bpnProgress?.estimasiSelesai ?? '2027-01-30'
  );
  const [picBpn, setPicBpn] = useState(
    market?.bpnProgress?.picBpn ?? 'Dwi Prasetyo, S.H. (BPN Sidoarjo)'
  );
  const [luasPengukuranBpn, setLuasPengukuranBpn] = useState<number | ''>(
    market?.bpnProgress?.luasPengukuranBpn ?? ''
  );
  const [keteranganProgres, setKeteranganProgres] = useState(
    market?.bpnProgress?.keteranganProgres ?? ''
  );

  // Issue & Action Plan fields
  const [kategoriKendala, setKategoriKendala] = useState<IssueCategory>(
    market?.issueActionPlan?.kategoriKendala ?? 'Sengketa Batas'
  );
  const [uraianKendala, setUraianKendala] = useState(
    market?.issueActionPlan?.uraianKendala ?? ''
  );
  const [kronologi, setKronologi] = useState(
    market?.issueActionPlan?.kronologi ?? ''
  );
  const [rencanaAksi, setRencanaAksi] = useState(
    market?.issueActionPlan?.rencanaAksi ?? ''
  );
  const [instansiTerkait, setInstansiTerkait] = useState(
    market?.issueActionPlan?.instansiTerkait ?? 'BPN Sidoarjo, BPKAD'
  );
  const [targetSelesai, setTargetSelesai] = useState(
    market?.issueActionPlan?.targetSelesai ?? '2026-12-30'
  );
  const [statusTindakLanjut, setStatusTindakLanjut] = useState<ActionStatus>(
    market?.issueActionPlan?.statusTindakLanjut ?? 'Dalam Koordinasi'
  );
  const [picDisperindag, setPicDisperindag] = useState(
    market?.issueActionPlan?.picDisperindag ?? 'Kasubbag Umum & Kepegawaian'
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!market) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFilePdfName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyRecommendation = () => {
    setRencanaAksi(RECOMMENDED_PLANS[kategoriKendala]);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const payload: MarketUpdatePayload = {
      statusSertifikasi: status,
      luasKibA,
      nomorSertifikat,
      nib,
      tahunTerbit,
      tanggalTerbit,
      luasSertifikat,
      suratUkurNo,
      filePdfName,
      uploadedDataUrl,
      nomorBerkasBpn,
      tanggalDaftar,
      tahapanSaatIni,
      estimasiSelesai,
      picBpn,
      luasPengukuranBpn:
        luasPengukuranBpn === '' ? undefined : Number(luasPengukuranBpn),
      keteranganProgres,
      kategoriKendala,
      uraianKendala,
      kronologi,
      rencanaAksi,
      instansiTerkait,
      targetSelesai,
      statusTindakLanjut,
      picDisperindag,
    };

    const result = validateMarketUpdate(payload);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    onSave(market.id, payload);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-modal-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-[#0F294A] px-6 py-4 text-white">
          <div>
            <div className="text-xs text-sky-200">
              Pembaruan Data Subbag Umum & Kepegawaian · {market.kodePasar}
            </div>
            <h2
              id="update-modal-title"
              className="font-display text-lg font-bold"
            >
              Update Status & Progres: {market.namaPasar}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup form update"
            className="rounded-lg p-1.5 text-slate-200 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Status Selector + KIB A */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="status-select"
                className="block text-xs font-semibold text-slate-700"
              >
                Status Sertifikasi Aset
              </label>
              <select
                id="status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as CertificationStatus)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#0284C7] focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20"
              >
                <option value="BERSERTIFIKAT">Sudah Bersertifikat (Hijau)</option>
                <option value="PROSES_BPN">Sedang Proses BPN (Kuning)</option>
                <option value="TERKENDALA">Terkendala (Merah)</option>
                <option value="BELUM_PROSES">Belum Proses (Abu-abu)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="luas-kib-input"
                className="block text-xs font-semibold text-slate-700"
              >
                Luas Lahan KIB A (m²)
              </label>
              <input
                id="luas-kib-input"
                type="number"
                value={luasKibA}
                onChange={(e) => setLuasKibA(Number(e.target.value))}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs text-slate-900 focus:border-[#0284C7] focus:outline-none"
              />
              {errors.luasKibA && (
                <p className="mt-1 text-[11px] text-red-600">{errors.luasKibA}</p>
              )}
            </div>
          </div>

          {/* Conditional Fields: BERSERTIFIKAT */}
          {status === 'BERSERTIFIKAT' && (
            <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
              <div className="text-xs font-semibold text-emerald-900">
                Metadata & Unggah Dokumen Sertifikat Hak Pakai
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="no-sertifikat"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Nomor Sertifikat *
                  </label>
                  <input
                    id="no-sertifikat"
                    type="text"
                    value={nomorSertifikat}
                    onChange={(e) => setNomorSertifikat(e.target.value)}
                    placeholder="Contoh: HP No. 00032 / Desa Krian"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs"
                  />
                  {errors.nomorSertifikat && (
                    <p className="mt-1 text-[11px] text-red-600">
                      {errors.nomorSertifikat}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="nib-input"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Nomor Identifikasi Bidang (NIB) *
                  </label>
                  <input
                    id="nib-input"
                    type="text"
                    value={nib}
                    onChange={(e) => setNib(e.target.value)}
                    placeholder="Contoh: 12.14.07.01.00321"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs"
                  />
                  {errors.nib && (
                    <p className="mt-1 text-[11px] text-red-600">{errors.nib}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="luas-sertifikat"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Luas Tertera Sertifikat (m²) *
                  </label>
                  <input
                    id="luas-sertifikat"
                    type="number"
                    value={luasSertifikat}
                    onChange={(e) => setLuasSertifikat(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs"
                  />
                  {errors.luasSertifikat && (
                    <p className="mt-1 text-[11px] text-red-600">
                      {errors.luasSertifikat}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="tahun-terbit"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Tahun Terbit *
                  </label>
                  <input
                    id="tahun-terbit"
                    type="number"
                    value={tahunTerbit}
                    onChange={(e) => setTahunTerbit(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs"
                  />
                </div>

                <div>
                  <label
                    htmlFor="tanggal-terbit"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Tanggal Terbit
                  </label>
                  <input
                    id="tanggal-terbit"
                    type="date"
                    value={tanggalTerbit}
                    onChange={(e) => setTanggalTerbit(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs"
                  />
                </div>

                <div>
                  <label
                    htmlFor="surat-ukur"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Nomor Surat Ukur
                  </label>
                  <input
                    id="surat-ukur"
                    type="text"
                    value={suratUkurNo}
                    onChange={(e) => setSuratUkurNo(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="upload-sertifikat"
                  className="block text-xs font-medium text-slate-700"
                >
                  Unggah Scan Sertifikat (PDF / Gambar JPG, PNG)
                </label>
                <label
                  htmlFor="upload-sertifikat"
                  className="mt-1.5 flex cursor-pointer items-center justify-between rounded-lg border border-dashed border-emerald-400 bg-white px-3.5 py-2.5 text-xs hover:bg-emerald-50/40"
                >
                  <span className="inline-flex items-center gap-2 text-slate-700">
                    <Upload className="h-4 w-4 text-emerald-700" />
                    <span>{filePdfName || 'Pilih berkas PDF/Gambar...'}</span>
                  </span>
                  <span className="font-semibold text-emerald-700">Pilih File</span>
                </label>
                <input
                  id="upload-sertifikat"
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </div>
            </div>
          )}

          {/* Conditional Fields: PROSES_BPN */}
          {status === 'PROSES_BPN' && (
            <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50/40 p-4">
              <div className="text-xs font-semibold text-amber-900">
                Log Progres Berkas Kantor Pertanahan (BPN) Kab. Sidoarjo
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="no-berkas-bpn"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Nomor Berkas BPN *
                  </label>
                  <input
                    id="no-berkas-bpn"
                    type="text"
                    value={nomorBerkasBpn}
                    onChange={(e) => setNomorBerkasBpn(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs"
                  />
                  {errors.nomorBerkasBpn && (
                    <p className="mt-1 text-[11px] text-red-600">
                      {errors.nomorBerkasBpn}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="tahapan-bpn"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Tahapan Proses Saat Ini *
                  </label>
                  <select
                    id="tahapan-bpn"
                    value={tahapanSaatIni}
                    onChange={(e) => setTahapanSaatIni(e.target.value as BpnStage)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  >
                    {BPN_STAGES_ORDER.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="pic-bpn"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Petugas Penghubung BPN *
                  </label>
                  <input
                    id="pic-bpn"
                    type="text"
                    value={picBpn}
                    onChange={(e) => setPicBpn(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  />
                  {errors.picBpn && (
                    <p className="mt-1 text-[11px] text-red-600">{errors.picBpn}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="luas-ukur-bpn"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Luas Pengukuran BPN (m², opsional)
                  </label>
                  <input
                    id="luas-ukur-bpn"
                    type="number"
                    value={luasPengukuranBpn}
                    onChange={(e) =>
                      setLuasPengukuranBpn(
                        e.target.value === '' ? '' : Number(e.target.value)
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs"
                  />
                </div>

                <div>
                  <label
                    htmlFor="tgl-daftar-bpn"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Tanggal Daftar BPN
                  </label>
                  <input
                    id="tgl-daftar-bpn"
                    type="date"
                    value={tanggalDaftar}
                    onChange={(e) => setTanggalDaftar(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs"
                  />
                </div>

                <div>
                  <label
                    htmlFor="estimasi-bpn"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Estimasi Selesai
                  </label>
                  <input
                    id="estimasi-bpn"
                    type="date"
                    value={estimasiSelesai}
                    onChange={(e) => setEstimasiSelesai(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="ket-bpn"
                  className="block text-xs font-medium text-slate-700"
                >
                  Catatan Progres Terbaru
                </label>
                <textarea
                  id="ket-bpn"
                  rows={2}
                  value={keteranganProgres}
                  onChange={(e) => setKeteranganProgres(e.target.value)}
                  placeholder="Tuliskan hasil koordinasi / pengukuran terakhir di BPN..."
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                />
              </div>
            </div>
          )}

          {/* Conditional Fields: TERKENDALA or BELUM_PROSES */}
          {(status === 'TERKENDALA' || status === 'BELUM_PROSES') && (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-semibold text-[#0F294A]">
                  {status === 'TERKENDALA'
                    ? 'Matriks Kendala & Rencana Aksi (Action Plan)'
                    : 'Persiapan Berkas Pra-Pengajuan BPN'}
                </div>
                <button
                  type="button"
                  onClick={handleApplyRecommendation}
                  className="inline-flex items-center gap-1 rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-[#0F294A] hover:bg-sky-100"
                >
                  <Sparkles className="h-3 w-3 text-[#0284C7]" aria-hidden="true" />
                  <span>Saran Rencana Aksi Otomatis</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="kategori-kendala"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Kategori Kendala *
                  </label>
                  <select
                    id="kategori-kendala"
                    value={kategoriKendala}
                    onChange={(e) =>
                      setKategoriKendala(e.target.value as IssueCategory)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  >
                    <option value="Sengketa Batas">Sengketa Batas</option>
                    <option value="Selisih Luas KIB A">Selisih Luas KIB A</option>
                    <option value="Kelengkapan Alas Hak">Kelengkapan Alas Hak</option>
                    <option value="Tumpang Tindih Bidang">Tumpang Tindih Bidang</option>
                    <option value="Administrasi Desa/Kecamatan">
                      Administrasi Desa/Kecamatan
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="status-tindak-lanjut"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Status Tindak Lanjut
                  </label>
                  <select
                    id="status-tindak-lanjut"
                    value={statusTindakLanjut}
                    onChange={(e) =>
                      setStatusTindakLanjut(e.target.value as ActionStatus)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  >
                    <option value="Belum Dimulai">Belum Dimulai</option>
                    <option value="Dalam Koordinasi">Dalam Koordinasi</option>
                    <option value="Proses Lapangan">Proses Lapangan</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="pic-disperindag"
                    className="block text-xs font-medium text-slate-700"
                  >
                    PIC Penanggung Jawab *
                  </label>
                  <input
                    id="pic-disperindag"
                    type="text"
                    value={picDisperindag}
                    onChange={(e) => setPicDisperindag(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                  />
                  {errors.picDisperindag && (
                    <p className="mt-1 text-[11px] text-red-600">
                      {errors.picDisperindag}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="target-selesai"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Target Waktu Penyelesaian *
                  </label>
                  <input
                    id="target-selesai"
                    type="date"
                    value={targetSelesai}
                    onChange={(e) => setTargetSelesai(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs"
                  />
                  {errors.targetSelesai && (
                    <p className="mt-1 text-[11px] text-red-600">
                      {errors.targetSelesai}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="instansi-terkait"
                  className="block text-xs font-medium text-slate-700"
                >
                  Instansi Terkait (Koordinasi Lintas Sektor)
                </label>
                <input
                  id="instansi-terkait"
                  type="text"
                  value={instansiTerkait}
                  onChange={(e) => setInstansiTerkait(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label
                  htmlFor="uraian-kendala"
                  className="block text-xs font-medium text-slate-700"
                >
                  Uraian Kendala / Kondisi Lapangan {status === 'TERKENDALA' ? '*' : ''}
                </label>
                <textarea
                  id="uraian-kendala"
                  rows={2}
                  value={uraianKendala}
                  onChange={(e) => setUraianKendala(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                />
                {errors.uraianKendala && (
                  <p className="mt-1 text-[11px] text-red-600">
                    {errors.uraianKendala}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="kronologi-kendala"
                  className="block text-xs font-medium text-slate-700"
                >
                  Kronologi Singkat
                </label>
                <textarea
                  id="kronologi-kendala"
                  rows={2}
                  value={kronologi}
                  onChange={(e) => setKronologi(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label
                  htmlFor="rencana-aksi"
                  className="block text-xs font-medium text-slate-700"
                >
                  Rencana Aksi (Action Plan) *
                </label>
                <textarea
                  id="rencana-aksi"
                  rows={2}
                  value={rencanaAksi}
                  onChange={(e) => setRencanaAksi(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                />
                {errors.rencanaAksi && (
                  <p className="mt-1 text-[11px] text-red-600">
                    {errors.rencanaAksi}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Submit footer */}
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#0F294A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#173B68]"
            >
              Simpan Perubahan Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
