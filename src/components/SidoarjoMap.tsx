import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Maximize2 } from 'lucide-react';
import type { MarketAsset } from '../types/aset';
import { STATUS_META } from '../utils/asetLogic';

interface SidoarjoMapProps {
  markets: MarketAsset[];
  selectedMarketId: string | null;
  onSelectMarket: (market: MarketAsset) => void;
  onOpenDetailModal: (market: MarketAsset) => void;
  heightClass?: string;
}

// Approximate boundary polygon of Kabupaten Sidoarjo for visual geographical context
// (renders cleanly even if external map tiles are slow or unavailable)
const SIDOARJO_BOUNDARY: Array<[number, number]> = [
  [-7.335, 112.665],
  [-7.345, 112.735],
  [-7.365, 112.795],
  [-7.415, 112.825],
  [-7.485, 112.815],
  [-7.555, 112.795],
  [-7.575, 112.745],
  [-7.565, 112.685],
  [-7.545, 112.625],
  [-7.505, 112.565],
  [-7.475, 112.485],
  [-7.425, 112.475],
  [-7.395, 112.525],
  [-7.375, 112.595],
  [-7.345, 112.635],
];

export function SidoarjoMap({
  markets,
  selectedMarketId,
  onSelectMarket,
  onOpenDetailModal,
  heightClass = 'h-[430px]',
}: SidoarjoMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const onSelectRef = useRef(onSelectMarket);
  const onOpenDetailRef = useRef(onOpenDetailModal);

  useEffect(() => {
    onSelectRef.current = onSelectMarket;
    onOpenDetailRef.current = onOpenDetailModal;
  }, [onSelectMarket, onOpenDetailModal]);

  // Mount Leaflet map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [-7.452, 112.655],
      zoom: 11,
      minZoom: 10,
      maxZoom: 17,
      zoomControl: true,
    });

    // Clean OpenStreetMap basemap with tile error hiding so fallback vector geography remains crisp
    const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    });
    osmLayer.on('tileerror', (e) => {
      if (e.tile) {
        e.tile.style.display = 'none';
      }
    });
    osmLayer.addTo(map);

    // Sidoarjo Regency boundary polygon for immediate spatial grounding
    L.polygon(SIDOARJO_BOUNDARY, {
      color: '#0F294A',
      weight: 2,
      opacity: 0.65,
      dashArray: '6, 4',
      fillColor: '#E0F2FE',
      fillOpacity: 0.35,
    }).addTo(map);

    // Major Sidoarjo arterial corridors (Surabaya-Sidoarjo-Porong & Waru-Krian) for vector clarity
    L.polyline(
      [
        [-7.342, 112.728],
        [-7.388, 112.728],
        [-7.445, 112.718],
        [-7.475, 112.715],
        [-7.542, 112.695],
      ],
      { color: '#64748B', weight: 1.5, opacity: 0.45 }
    ).addTo(map);

    L.polyline(
      [
        [-7.358, 112.731],
        [-7.352, 112.695],
        [-7.409, 112.576],
        [-7.418, 112.517],
      ],
      { color: '#64748B', weight: 1.5, opacity: 0.45 }
    ).addTo(map);

    // Subtle regional labels for Sidoarjo orientation
    const areaLabels: Array<{ name: string; pos: [number, number] }> = [
      { name: 'WARU / TAMAN', pos: [-7.355, 112.715] },
      { name: 'KRIAN', pos: [-7.418, 112.576] },
      { name: 'SIDOARJO KOTA', pos: [-7.448, 112.718] },
      { name: 'PORONG', pos: [-7.548, 112.695] },
      { name: 'TARIK / PRAMBON', pos: [-7.465, 112.538] },
    ];
    for (const lbl of areaLabels) {
      L.marker(lbl.pos, {
        interactive: false,
        icon: L.divIcon({
          className: 'simpas-marker-wrapper',
          html: `<div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:9px;font-weight:700;letter-spacing:0.06em;color:rgba(15,41,74,0.45);white-space:nowrap;pointer-events:none;">${lbl.name}</div>`,
          iconSize: [100, 14],
          iconAnchor: [50, 7],
        }),
      }).addTo(map);
    }

    const layerGroup = L.layerGroup().addTo(map);
    mapRef.current = map;
    markersLayerRef.current = layerGroup;

    // Ensure proper sizing after mount
    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 120);

    return () => {
      clearTimeout(resizeTimer);
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Re-render markers whenever filtered markets or selection changes
  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = markersLayerRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    for (const market of markets) {
      const meta = STATUS_META[market.statusSertifikasi];
      const isSelected = market.id === selectedMarketId;
      const size = isSelected ? 26 : 19;

      const iconHtml = `
        <div style="
          width:${size}px;
          height:${size}px;
          border-radius:9999px;
          background:${meta.hex};
          border:${isSelected ? '3px solid #0F294A' : '2.5px solid #FFFFFF'};
          box-shadow:${
            isSelected
              ? '0 0 0 4px rgba(2,132,199,0.28), 0 4px 10px rgba(15,41,74,0.35)'
              : '0 2px 6px rgba(15,41,74,0.30)'
          };
          display:flex;
          align-items:center;
          justify-content:center;
          color:#FFFFFF;
          font-family:'IBM Plex Mono', monospace;
          font-size:${isSelected ? '10px' : '9px'};
          font-weight:700;
          cursor:pointer;
          transition:transform 150ms ease;
        ">
          ${market.kodePasar.replace('PSR-', '')}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'simpas-marker-wrapper',
        html: iconHtml,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([market.latitude, market.longitude], {
        icon: customIcon,
        zIndexOffset: isSelected ? 500 : 100,
      });

      marker.bindTooltip(
        `<div style="font-family:'Public Sans',sans-serif;font-size:12px;line-height:1.3;">
          <strong style="color:#0F294A;">${market.namaPasar}</strong><br/>
          <span style="color:#475569;">Kec. ${market.kecamatan} · ${meta.label}</span>
        </div>`,
        { direction: 'top', offset: [0, -10] }
      );

      const popupEl = document.createElement('div');
      popupEl.className = 'p-3 text-slate-800';
      popupEl.innerHTML = `
        <div style="font-size:11px;color:#64748B;font-family:'IBM Plex Mono',monospace;">${market.kodePasar} · Kec. ${market.kecamatan}</div>
        <div style="font-size:14px;font-weight:700;color:#0F294A;margin-top:2px;">${market.namaPasar}</div>
        <div style="margin-top:6px;display:flex;align-items:center;gap:6px;font-size:12px;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:999px;background:${meta.hex};"></span>
          <span style="font-weight:600;color:${meta.hex};">${meta.label}</span>
        </div>
        <div style="margin-top:6px;font-size:12px;color:#475569;">
          Luas KIB A: <strong style="font-family:'IBM Plex Mono',monospace;">${market.luasKibA.toLocaleString('id-ID')} m²</strong>
        </div>
        <button type="button" data-open-detail="1" style="
          margin-top:10px;
          width:100%;
          background:#0F294A;
          color:#FFFFFF;
          border:none;
          border-radius:6px;
          padding:6px 10px;
          font-size:12px;
          font-weight:600;
          cursor:pointer;
        ">Buka Rincian & Dokumen</button>
      `;

      const btn = popupEl.querySelector('[data-open-detail="1"]');
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          onOpenDetailRef.current(market);
        });
      }

      marker.bindPopup(popupEl);

      marker.on('click', () => {
        onSelectRef.current(market);
      });

      marker.addTo(layerGroup);
    }
  }, [markets, selectedMarketId]);

  const handleResetView = () => {
    mapRef.current?.flyTo([-7.452, 112.655], 11, { duration: 0.45 });
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/70 px-4 py-2.5">
        <div>
          <h2 className="font-display text-sm font-semibold text-[#0F294A]">
            Peta Sebaran Geospasial Pasar Pemda Sidoarjo
          </h2>
          <p className="text-xs text-slate-500">
            Menampilkan {markets.length} titik lokasi pasar · Klik penanda untuk rincian sertifikasi
          </p>
        </div>
        <button
          type="button"
          onClick={handleResetView}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
        >
          <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Reset Peta</span>
        </button>
      </div>

      <div
        ref={containerRef}
        data-testid="sidoarjo-leaflet-map"
        className={`w-full ${heightClass} z-0`}
      />

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-2 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-4">
          {(['BERSERTIFIKAT', 'PROSES_BPN', 'TERKENDALA', 'BELUM_PROSES'] as const).map(
            (key) => {
              const meta = STATUS_META[key];
              return (
                <div key={key} className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: meta.hex }}
                    aria-hidden="true"
                  />
                  <span>{meta.label}</span>
                </div>
              );
            }
          )}
        </div>
        <span className="font-mono text-[11px] text-slate-400">
          Kab. Sidoarjo (-7.452, 112.655)
        </span>
      </div>
    </div>
  );
}
