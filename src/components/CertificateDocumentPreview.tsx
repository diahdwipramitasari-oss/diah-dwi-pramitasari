import { Download, Printer, ShieldCheck } from 'lucide-react';
import type { MarketAsset } from '../types/aset';
import { formatDateId } from '../utils/asetLogic';

interface CertificateDocumentPreviewProps {
  market: MarketAsset;
}

export function CertificateDocumentPreview({
  market,
}: CertificateDocumentPreviewProps) {
  const cert = market.certificate;
  if (!cert) return null;

  const handleDownloadSummary = () => {
    const htmlContent = `<!doctype html>
<html lang="id">
<head><meta charset="utf-8"><title>${cert.filePdfName}</title></head>
<body style="font-family:sans-serif;padding:40px;color:#0f172a;max-width:780px;margin:auto;border:2px solid #0f294a;">
  <h2 style="text-align:center;color:#0f294a;margin-bottom:4px;">SALINAN DIGITAL SERTIFIKAT TANAH ASET PEMERINTAH DAERAH</h2>
  <p style="text-align:center;color:#475569;margin-top:0;">Dinas Perindustrian dan Perdagangan Kabupaten Sidoarjo</p>
  <hr/>
  <p><strong>Nama Pasar:</strong> ${market.namaPasar} (${market.kodePasar})</p>
  <p><strong>Jenis Hak:</strong> ${cert.jenisHak}</p>
  <p><strong>Nomor Sertifikat:</strong> ${cert.nomorSertifikat}</p>
  <p><strong>NIB:</strong> ${cert.nib}</p>
  <p><strong>Surat Ukur:</strong> ${cert.suratUkurNo}</p>
  <p><strong>Luas Tanah Tercantum:</strong> ${cert.luasSertifikat.toLocaleString('id-ID')} m²</p>
  <p><strong>Pemegang Hak:</strong> ${cert.pemegangHak}</p>
  <p><strong>Tanggal Terbit:</strong> ${cert.tanggalTerbit}</p>
  <p style="margin-top:32px;font-size:12px;color:#64748b;">Dokumen Internal Disperindag Kab. Sidoarjo · SIMPAS-ASET SIDOARJO</p>
</body></html>`;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = cert.filePdfName.replace(/\.pdf$/i, '_Salinan_Digital.html');
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
          <ShieldCheck className="h-4 w-4 text-emerald-700" aria-hidden="true" />
          <span className="font-mono">{cert.filePdfName}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Printer className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Cetak</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadSummary}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#0F294A] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#173B68]"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Unduh Salinan</span>
          </button>
        </div>
      </div>

      {/* Uploaded image/PDF OR formatted digital certificate facsimile with official watermark */}
      {cert.uploadedDataUrl ? (
        <div className="relative overflow-hidden rounded-xl border border-slate-300 bg-slate-100">
          {cert.uploadedDataUrl.startsWith('data:image/') ? (
            <img
              src={cert.uploadedDataUrl}
              alt={`Pindaian sertifikat ${market.namaPasar}`}
              className="mx-auto max-h-[460px] w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          ) : (
            <iframe
              src={cert.uploadedDataUrl}
              title={`PDF Sertifikat ${market.namaPasar}`}
              className="h-[460px] w-full"
            />
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-3 text-center">
            <span className="rounded bg-[#0F294A]/85 px-3 py-1 text-[11px] font-semibold text-white">
              Dokumen Internal Disperindag Kab. Sidoarjo
            </span>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-xl border-2 border-[#0F294A]/30 bg-white p-6 sm:p-8">
          {/* Official Digital Facsimile Sheet */}
          <div className="border-b-2 border-[#0F294A] pb-4 text-center">
            <div className="text-[11px] font-semibold tracking-wider text-slate-500">
              BADAN PERTANAHAN NASIONAL REPUBLIK INDONESIA · KANTOR PERTANAHAN KABUPATEN SIDOARJO
            </div>
            <h4 className="mt-1 font-display text-lg font-bold text-[#0F294A]">
              SERTIFIKAT HAK PAKAI (SALINAN ARSIP DIGITAL)
            </h4>
            <div className="mt-1 font-mono text-sm font-semibold text-emerald-800">
              {cert.nomorSertifikat}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
            <div className="space-y-2.5">
              <div>
                <div className="text-[11px] text-slate-500">Pemegang Hak</div>
                <div className="font-semibold text-slate-900">
                  {cert.pemegangHak}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Objek Aset Pasar</div>
                <div className="font-semibold text-slate-900">
                  {market.namaPasar} ({market.kodePasar})
                </div>
                <div className="text-slate-600">{market.alamat}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Letak Tanah</div>
                <div className="text-slate-800">
                  Kelurahan/Desa {market.kelurahan}, Kecamatan {market.kecamatan}, Kab. Sidoarjo
                </div>
              </div>
            </div>

            <div className="space-y-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3.5">
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">NIB</span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  {cert.nib}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Surat Ukur</span>
                <span className="font-mono font-medium text-slate-800">
                  {cert.suratUkurNo}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Luas Tertera</span>
                <span className="font-mono font-bold text-emerald-800 tabular-nums">
                  {cert.luasSertifikat.toLocaleString('id-ID')} m²
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Tanggal Terbit</span>
                <span className="font-mono text-slate-800 tabular-nums">
                  {formatDateId(cert.tanggalTerbit)}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Verifikator Internal</span>
                <span className="text-slate-800">{cert.verifiedBy}</span>
              </div>
            </div>
          </div>

          {/* Crisp Watermark Strip at footer per PRD 12 (no giant faded ghost text behind headings) */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 text-[11px] text-slate-500">
            <span className="font-semibold text-[#0F294A]">
              Dokumen Internal Disperindag Kab. Sidoarjo
            </span>
            <span className="font-mono">
              Reg. KIB A: {market.nomorRegisterKib}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
