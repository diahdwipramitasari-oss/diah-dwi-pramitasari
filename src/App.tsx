import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  Clock,
  FileBarChart2,
  FileCheck2,
  LayoutDashboard,
  Map as MapIcon,
  Menu,
  MonitorPlay,
  RotateCcw,
  Shield,
  X,
} from 'lucide-react';
import { ActionMatrixTable } from './components/ActionMatrixTable';
import { KpiStrip } from './components/KpiStrip';
import { ManagementBriefModal } from './components/ManagementBriefModal';
import { MarketDetailModal } from './components/MarketDetailModal';
import { MarketQuickPanel } from './components/MarketQuickPanel';
import { SidoarjoMap } from './components/SidoarjoMap';
import {
  AuditTrailSection,
  BpnMonitoringView,
  CertificateVaultView,
} from './components/SubViews';
import { UpdateMarketModal } from './components/UpdateMarketModal';
import { INITIAL_AUDIT_LOGS, INITIAL_MARKETS } from './data/marketsSeed';
import type {
  ActiveView,
  AuditLogEntry,
  CertificationStatus,
  MarketAsset,
  MarketUpdatePayload,
  UserRole,
} from './types/aset';
import {
  computeKpiSummary,
  filterMarkets,
  STATUS_META,
} from './utils/asetLogic';

const STORAGE_MARKETS_KEY = 'simpas_aset_sidoarjo_markets_v1';
const STORAGE_AUDIT_KEY = 'simpas_aset_sidoarjo_audit_v1';

const ROLE_LABELS: Record<UserRole, { name: string; desc: string }> = {
  KASUBBAG_UMPEG: {
    name: 'Kasubbag Umpeg (Admin)',
    desc: 'Akses penuh validasi, aksi & ekspor',
  },
  OPERATOR_ASET: {
    name: 'Operator Pengurus Barang',
    desc: 'Input progres BPN & unggah sertifikat',
  },
  PIMPINAN: {
    name: 'Pimpinan / Kadis (Read-Only)',
    desc: 'Pantau eksekutif & pratinjau dokumen',
  },
};

export default function App() {
  const [markets, setMarkets] = useState<MarketAsset[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MARKETS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_MARKETS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_AUDIT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_AUDIT_LOGS;
  });

  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('KASUBBAG_UMPEG');
  const [presentationMode, setPresentationMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState<CertificationStatus | 'ALL'>(
    'ALL'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(
    INITIAL_MARKETS[0].id
  );

  const [detailModalState, setDetailModalState] = useState<{
    marketId: string;
    tab: 'profil' | 'sertifikat' | 'progres';
  } | null>(null);
  const [updateModalMarketId, setUpdateModalMarketId] = useState<string | null>(
    null
  );
  const [briefModalOpen, setBriefModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MARKETS_KEY, JSON.stringify(markets));
    } catch {
      // ignore storage quota errors
    }
  }, [markets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_AUDIT_KEY, JSON.stringify(auditLogs));
    } catch {
      // ignore
    }
  }, [auditLogs]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const kpi = useMemo(
    () => computeKpiSummary(markets, '2026-11-16'),
    [markets]
  );

  const filteredMarkets = useMemo(
    () =>
      filterMarkets(markets, {
        statusFilter,
        searchQuery,
      }),
    [markets, statusFilter, searchQuery]
  );

  const selectedMarket = useMemo(() => {
    const found = markets.find((m) => m.id === selectedMarketId);
    return found ?? filteredMarkets[0] ?? null;
  }, [markets, selectedMarketId, filteredMarkets]);

  const detailMarket = useMemo(
    () =>
      detailModalState
        ? markets.find((m) => m.id === detailModalState.marketId) ?? null
        : null,
    [markets, detailModalState]
  );

  const updateMarketTarget = useMemo(
    () =>
      updateModalMarketId
        ? markets.find((m) => m.id === updateModalMarketId) ?? null
        : null,
    [markets, updateModalMarketId]
  );

  const handleSaveMarketUpdate = (
    marketId: string,
    payload: MarketUpdatePayload
  ) => {
    const todayIso = '2026-11-16';
    let updatedMarketName = '';

    setMarkets((prev) =>
      prev.map((m) => {
        if (m.id !== marketId) return m;
        updatedMarketName = m.namaPasar;
        const next: MarketAsset = {
          ...m,
          luasKibA: payload.luasKibA,
          statusSertifikasi: payload.statusSertifikasi,
          updatedAt: todayIso,
        };

        if (payload.statusSertifikasi === 'BERSERTIFIKAT') {
          next.certificate = {
            jenisHak: 'Hak Pakai',
            nomorSertifikat: payload.nomorSertifikat ?? '',
            nib: payload.nib ?? '',
            tanggalTerbit: payload.tanggalTerbit ?? todayIso,
            tahunTerbit: payload.tahunTerbit ?? 2026,
            luasSertifikat: payload.luasSertifikat ?? payload.luasKibA,
            pemegangHak: 'Pemerintah Kabupaten Sidoarjo (Cq. Disperindag)',
            suratUkurNo: payload.suratUkurNo ?? 'SU-001/2026',
            verifiedBy: ROLE_LABELS[userRole].name,
            filePdfName: payload.filePdfName ?? 'Sertifikat_Hak_Pakai.pdf',
            uploadedDataUrl: payload.uploadedDataUrl,
          };
        } else if (payload.statusSertifikasi === 'PROSES_BPN') {
          const prevHistory = m.bpnProgress?.riwayat ?? [];
          next.bpnProgress = {
            id: m.bpnProgress?.id ?? `bpn-${m.id}`,
            nomorBerkasBpn: payload.nomorBerkasBpn ?? '',
            tanggalDaftar: payload.tanggalDaftar ?? todayIso,
            tahapanSaatIni: payload.tahapanSaatIni ?? 'Pemberkasan Alas Hak',
            tanggalUpdate: todayIso,
            estimasiSelesai: payload.estimasiSelesai ?? '2027-01-30',
            luasPengukuranBpn: payload.luasPengukuranBpn,
            picBpn: payload.picBpn ?? 'BPN Sidoarjo',
            keteranganProgres: payload.keteranganProgres ?? '',
            riwayat: [
              ...prevHistory,
              {
                tanggal: todayIso,
                tahapan: payload.tahapanSaatIni ?? 'Pembaruan',
                catatan:
                  payload.keteranganProgres ||
                  'Pembaruan tahapan proses sertifikasi BPN.',
                petugas: ROLE_LABELS[userRole].name,
              },
            ],
          };
        } else {
          next.issueActionPlan = {
            id: m.issueActionPlan?.id ?? `iss-${m.id}`,
            kategoriKendala:
              payload.kategoriKendala ?? 'Administrasi Desa/Kecamatan',
            uraianKendala: payload.uraianKendala ?? '',
            kronologi: payload.kronologi ?? '',
            rencanaAksi: payload.rencanaAksi ?? '',
            instansiTerkait: payload.instansiTerkait ?? 'BPN, BPKAD',
            targetSelesai: payload.targetSelesai ?? '2026-12-30',
            statusTindakLanjut:
              payload.statusTindakLanjut ?? 'Dalam Koordinasi',
            picDisperindag: payload.picDisperindag ?? 'Kasubbag Umpeg',
            kelengkapanDokumen: m.issueActionPlan?.kelengkapanDokumen,
          };
        }

        return next;
      })
    );

    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: '16 Nov 2026 · Baru saja',
      userRole,
      userName: ROLE_LABELS[userRole].name,
      marketId,
      marketName: updatedMarketName || marketId,
      jenisAktivitas: 'Perubahan Status Aset',
      detailPerubahan: `Status diperbarui menjadi ${STATUS_META[payload.statusSertifikasi].label}.`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    setUpdateModalMarketId(null);
    setSelectedMarketId(marketId);
    setToastMessage(
      `Data ${updatedMarketName} berhasil diperbarui ke status ${STATUS_META[payload.statusSertifikasi].label}.`
    );
  };

  const handleResetDemoData = () => {
    setMarkets(INITIAL_MARKETS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setStatusFilter('ALL');
    setSearchQuery('');
    setSelectedMarketId(INITIAL_MARKETS[0].id);
    setToastMessage('Data 19 Pasar Pemda dikembalikan ke data awal resmi.');
  };

  const navItems: Array<{
    key: ActiveView;
    label: string;
    icon: typeof LayoutDashboard;
  }> = [
    { key: 'dashboard', label: 'Peta & Dashboard Utama', icon: LayoutDashboard },
    { key: 'markets', label: 'Data 19 Pasar', icon: Building2 },
    { key: 'bpn', label: 'Monitoring Proses BPN', icon: Clock },
    { key: 'issues', label: 'Kendala & Rencana Aksi', icon: AlertTriangle },
    { key: 'vault', label: 'Brankas Sertifikat', icon: FileCheck2 },
    { key: 'brief', label: 'Laporan Pimpinan', icon: FileBarChart2 },
  ];

  const handleNavClick = (key: ActiveView) => {
    if (key === 'brief') {
      setBriefModalOpen(true);
      setMobileMenuOpen(false);
      return;
    }
    setActiveView(key);
    setMobileMenuOpen(false);
    if (key === 'issues') {
      setStatusFilter('TERKENDALA');
    } else if (key === 'markets') {
      setStatusFilter('ALL');
    }
  };

  const currentNavLabel =
    navItems.find((n) => n.key === activeView)?.label ?? 'Dashboard Utama';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex overflow-x-clip">
      {/* Left Sidebar (Hidden in Presentation Mode) */}
      {!presentationMode && (
        <aside
          aria-label="Navigasi Utama SIMPAS-ASET"
          className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col justify-between overflow-y-auto bg-[#0F294A] text-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col">
            {/* Brand Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                {/* Sidoarjo Shield SVG Emblem */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/20 border border-sky-400/30">
                  <MapIcon className="h-5 w-5 text-sky-300" aria-hidden="true" />
                </div>
                <div>
                  <div className="font-display text-sm font-bold tracking-tight text-white">
                    SIMPAS-ASET
                  </div>
                  <div className="text-[11px] text-sky-200/80">
                    Disperindag Sidoarjo
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Tutup menu navigasi"
                className="rounded-md p-1 text-slate-300 hover:bg-white/10 lg:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Menu */}
            <nav className="px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleNavClick(item.key)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-sky-500/20 text-white border border-sky-400/30'
                        : 'text-slate-200/85 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Role Switcher & Reset Utility (RBAC Simulation per PRD 2.1) */}
          <div className="border-t border-white/10 p-4 space-y-3">
            <div>
              <label
                htmlFor="role-switcher"
                className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-200"
              >
                <Shield className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Peran Pengguna (RBAC)</span>
              </label>
              <select
                id="role-switcher"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className="mt-1.5 w-full rounded-lg border border-white/20 bg-[#0A1D36] px-2.5 py-2 text-xs font-medium text-white focus:border-sky-400 focus:outline-none"
              >
                <option value="KASUBBAG_UMPEG">Kasubbag Umpeg (Admin)</option>
                <option value="OPERATOR_ASET">Operator Pengurus Barang</option>
                <option value="PIMPINAN">Pimpinan / Kadis (Read-Only)</option>
              </select>
              <p className="mt-1 text-[11px] text-slate-300/80">
                {ROLE_LABELS[userRole].desc}
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetDemoData}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-slate-200 hover:bg-white/10"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              <span>Reset Data Awal</span>
            </button>
          </div>
        </aside>
      )}

      {/* Mobile backdrop */}
      {mobileMenuOpen && !presentationMode && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Bar Contract: Clean Title/Breadcrumb on left + max 2 primary action buttons on right */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            {!presentationMode && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Buka menu navigasi"
                className="rounded-lg border border-slate-200 p-1.5 text-slate-700 hover:bg-slate-50 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
                <span className="font-semibold text-[#0F294A] whitespace-nowrap">
                  SIMPAS-ASET SIDOARJO
                </span>
                <span aria-hidden="true">/</span>
                <span className="truncate">
                  {presentationMode ? 'Mode Presentasi Pimpinan' : currentNavLabel}
                </span>
              </div>
              <h1 className="font-display text-sm font-bold text-slate-900 sm:text-base truncate">
                Pemetaan & Monitoring Sertifikasi 19 Pasar Pemda Kabupaten Sidoarjo
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setPresentationMode((v) => !v)}
              aria-pressed={presentationMode}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 sm:px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                presentationMode
                  ? 'border-sky-600 bg-sky-50 text-[#0F294A]'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <MonitorPlay className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="sm:hidden">
                {presentationMode ? 'Keluar' : 'Presentasi'}
              </span>
              <span className="hidden sm:inline">
                {presentationMode ? 'Keluar Presentasi' : 'Mode Presentasi'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setBriefModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F294A] px-2.5 sm:px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#173B68] transition-colors whitespace-nowrap shrink-0"
            >
              <FileBarChart2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="sm:hidden">Ekspor Brief</span>
              <span className="hidden sm:inline">Ekspor Laporan Pimpinan</span>
            </button>
          </div>
        </header>

        {/* Read-Only Banner when Pimpinan role is active */}
        {userRole === 'PIMPINAN' && (
          <div className="border-b border-sky-200 bg-sky-50 px-6 py-2 text-xs font-medium text-[#0F294A]">
            Mode Akses Pimpinan (Read-Only): Anda dapat memantau peta, KPI, pratinjau sertifikat, dan mengekspor laporan paparan tanpa risiko perubahan data.
          </div>
        )}

        {/* Main Workspace */}
        <main className="flex-1 p-4 sm:p-6 space-y-6 max-w-[1600px] w-full mx-auto">
          {/* Toast feedback */}
          {toastMessage && (
            <div
              role="status"
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-900"
            >
              {toastMessage}
            </div>
          )}

          {/* Always show Executive KPI Strip on Dashboard & Presentation Mode */}
          {(activeView === 'dashboard' || presentationMode) && (
            <KpiStrip
              kpi={kpi}
              activeFilter={statusFilter}
              onFilterSelect={(next) => setStatusFilter(next)}
            />
          )}

          {/* Primary Dashboard: Map (left 7 cols) + Quick Detail Panel (right 5 cols) + Bottom Matrix */}
          {(activeView === 'dashboard' || presentationMode) && (
            <>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-stretch">
                <div className="lg:col-span-7">
                  <SidoarjoMap
                    markets={filteredMarkets}
                    selectedMarketId={selectedMarket?.id ?? null}
                    onSelectMarket={(m) => setSelectedMarketId(m.id)}
                    onOpenDetailModal={(m) =>
                      setDetailModalState({ marketId: m.id, tab: 'profil' })
                    }
                  />
                </div>
                <div className="lg:col-span-5">
                  <MarketQuickPanel
                    market={selectedMarket}
                    userRole={userRole}
                    onOpenDetail={(m, tab = 'profil') =>
                      setDetailModalState({ marketId: m.id, tab })
                    }
                    onOpenUpdate={(m) => setUpdateModalMarketId(m.id)}
                  />
                </div>
              </div>

              <ActionMatrixTable
                markets={filteredMarkets}
                allMarketsCount={markets.length}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                selectedMarketId={selectedMarket?.id ?? null}
                userRole={userRole}
                onSelectMarket={(m) => setSelectedMarketId(m.id)}
                onOpenDetail={(m, tab = 'profil') =>
                  setDetailModalState({ marketId: m.id, tab })
                }
                onOpenUpdate={(m) => setUpdateModalMarketId(m.id)}
              />

              {!presentationMode && <AuditTrailSection logs={auditLogs} />}
            </>
          )}

          {/* Dedicated View: Data 19 Pasar & Kendala/Rencana Aksi */}
          {!presentationMode &&
            (activeView === 'markets' || activeView === 'issues') && (
              <>
                <KpiStrip
                  kpi={kpi}
                  activeFilter={statusFilter}
                  onFilterSelect={(next) => setStatusFilter(next)}
                />
                <ActionMatrixTable
                  title={
                    activeView === 'issues'
                      ? 'Daftar Pasar Terkendala & Matriks Rencana Aksi'
                      : 'Inventaris Lengkap 19 Pasar Pemerintah Daerah Sidoarjo'
                  }
                  markets={filteredMarkets}
                  allMarketsCount={markets.length}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  searchQuery={searchQuery}
                  onSearchQueryChange={setSearchQuery}
                  selectedMarketId={selectedMarket?.id ?? null}
                  userRole={userRole}
                  onSelectMarket={(m) => setSelectedMarketId(m.id)}
                  onOpenDetail={(m, tab = 'profil') =>
                    setDetailModalState({ marketId: m.id, tab })
                  }
                  onOpenUpdate={(m) => setUpdateModalMarketId(m.id)}
                />
              </>
            )}

          {/* Dedicated View: Monitoring Proses BPN */}
          {!presentationMode && activeView === 'bpn' && (
            <BpnMonitoringView
              markets={markets}
              userRole={userRole}
              onOpenDetail={(m, tab = 'progres') =>
                setDetailModalState({ marketId: m.id, tab })
              }
              onOpenUpdate={(m) => setUpdateModalMarketId(m.id)}
            />
          )}

          {/* Dedicated View: Brankas Sertifikat Digital */}
          {!presentationMode && activeView === 'vault' && (
            <CertificateVaultView
              markets={markets}
              onOpenDetail={(m, tab = 'sertifikat') =>
                setDetailModalState({ marketId: m.id, tab })
              }
            />
          )}
        </main>

        {/* Quiet Official Footer */}
        <footer className="border-t border-slate-200 bg-white px-6 py-3 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <span>
            SIMPAS-ASET SIDOARJO · Dinas Perindustrian dan Perdagangan Kabupaten Sidoarjo
          </span>
          <span>Subbagian Umum dan Kepegawaian (Pengelola Aset BMD)</span>
        </footer>
      </div>

      {/* Modals */}
      <MarketDetailModal
        market={detailMarket}
        initialTab={detailModalState?.tab ?? 'profil'}
        userRole={userRole}
        onClose={() => setDetailModalState(null)}
        onOpenUpdate={(m) => setUpdateModalMarketId(m.id)}
      />

      {updateMarketTarget && (
        <UpdateMarketModal
          key={updateMarketTarget.id}
          market={updateMarketTarget}
          onClose={() => setUpdateModalMarketId(null)}
          onSave={handleSaveMarketUpdate}
        />
      )}

      <ManagementBriefModal
        isOpen={briefModalOpen}
        markets={markets}
        onClose={() => setBriefModalOpen(false)}
      />
    </div>
  );
}
