import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity, AlertTriangle, CheckCircle2, Play, Pause, RotateCcw,
  Sliders, ShieldAlert, FileText, Layers, Droplets, Flame,
  Wind, Gauge, ArrowRight, Wrench, UserCheck, Terminal, Cpu,
  ChevronRight, Info, RefreshCw, Zap, XCircle
} from 'lucide-react';

// ============================================================================
// SAFE OPERATING LIMITS & SOP DATA (FROM HD-W-7000-00-001)
// ============================================================================
const SOL_LIMITS = {
  // Washing
  PI_701:   { unit: 'kg/cm²G', ll: null, l: 0.1,   h: 0.5,   hh: null, nom: 0.2,  desc: 'Áp suất D-721' },
  LI_701:   { unit: 'mm',       ll: null, l: 1420,  h: 3283,  hh: null, nom: 2350, desc: 'Mức nước D-721' },
  LI_702:   { unit: 'mm',       ll: null, l: 4130,  h: 4850,  hh: null, nom: 4480, desc: 'Mức Hexane D-721' },
  LI_703:   { unit: 'mm',       ll: null, l: 1420,  h: 2900,  hh: null, nom: 2100, desc: 'Mức nước D-722' },
  LI_704:   { unit: 'mm',       ll: null, l: 3830,  h: 4750,  hh: null, nom: 4300, desc: 'Mức Hexane D-722' },
  TI_702:   { unit: '°C',       ll: null, l: 50,    h: 70,    hh: null, nom: 60.0, desc: 'Nhiệt độ M-721 -> D-721' },
  TI_704:   { unit: '°C',       ll: null, l: 50,    h: 70,    hh: null, nom: 60.0, desc: 'Nhiệt độ M-722 -> D-722' },
  PH_721:   { unit: 'pH',       ll: null, l: 12.0,  h: 14.0,  hh: null, nom: 12.6, desc: 'pH tuần hoàn M-721' },
  PH_722:   { unit: 'pH',       ll: null, l: 6.5,   h: 8.5,   hh: null, nom: 7.4,  desc: 'pH tuần hoàn M-722' },
  LI_711:   { unit: 'mm',       ll: null, l: 890,   h: 8010,  hh: null, nom: 4500, desc: 'Mức bồn Hexane thô D-701' },

  // Stripping
  PIC_721:  { unit: 'kg/cm²G', ll: null, l: 1.0,   h: 4.0,   hh: 4.5,  nom: 3.0,  desc: 'Áp suất tháp T-703' },
  TI_703B:  { unit: '°C',       ll: null, l: 112,   h: 128,   hh: null, nom: 120.0,desc: 'Nhiệt độ đáy T-703' },
  LIC_721:  { unit: 'mm',       ll: 450,  l: 600,   h: 1400,  hh: 1800, nom: 1000, desc: 'Mức đáy T-703' },
  PDI_732:  { unit: 'mmAq',     ll: null, l: null,  h: 800,   hh: null, nom: 420,  desc: 'Chênh áp khay T-703' },
  LP_703:   { unit: 'wt%',      ll: null, l: 8.0,   h: 12.0,  hh: null, nom: 10.0, desc: 'Nồng độ Low Polymer đáy T-703' },

  // Low Polymer Handling
  PIC_723:  { unit: 'kg/cm²G', ll: null, l: null,  h: 30.0,  hh: null, nom: 22.0, desc: 'Áp suất đẩy bơm P-711A/B' },
  TI_729:   { unit: '°C',       ll: null, l: 180,   h: 220,   hh: null, nom: 220.0,desc: 'Nhiệt độ vào D-711 (sau E-711)' },
  PI_730:   { unit: 'kg/cm²G', ll: null, l: null,  h: 4.0,   hh: 4.6,  nom: 3.0,  desc: 'Áp suất đỉnh 1st Flash D-711' },
  TI_726:   { unit: '°C',       ll: null, l: 160,   h: 180,   hh: null, nom: 162.0,desc: 'Nhiệt độ LP trong D-711' },
  LIC_722:  { unit: 'mm',       ll: null, l: 1075,  h: 3450,  hh: null, nom: 2200, desc: 'Mức LP trong D-711' },
  PIC_724:  { unit: 'kg/cm²G', ll: -0.6, l: -0.5,  h: -0.2,  hh: null, nom: -0.39,desc: 'Áp suất chân không D-712 (C-701)' },
  TI_730:   { unit: '°C',       ll: null, l: 170,   h: 200,   hh: null, nom: 180.0,desc: 'Nhiệt độ 2nd Flash D-712' },
  LIC_723:  { unit: 'mm',       ll: null, l: null,  h: 3380,  hh: 3800, nom: 1850, desc: 'Mức LP trong D-712' },
  LI_781:   { unit: 'mm',       ll: null, l: 816,   h: 3000,  hh: 3450, nom: 1900, desc: 'Mức LP Holding Drum D-717' },
  AZI_761A: { unit: '% O₂',     ll: null, l: null,  h: 3.0,   hh: 5.0,  nom: 0.4,  desc: 'Hàm lượng O₂ Vent Flaker M-761A' },

  // Purification & Distribution
  PIC_731:  { unit: 'kg/cm²G', ll: null, l: null,  h: 0.5,   hh: null, nom: 0.2,  desc: 'Áp suất đỉnh D-702 / T-704' },
  LIC_731:  { unit: 'mm',       ll: null, l: 350,   h: 3478,  hh: null, nom: 1800, desc: 'Mức Hexane D-702' },
  LIC_732:  { unit: 'mm',       ll: null, l: 350,   h: 840,   hh: null, nom: 550,  desc: 'Mức nước Boot D-702' },
  FZA_732:  { unit: 't/h',      ll: 475,  l: 500,   h: null,  hh: null, nom: 620,  desc: 'Lưu lượng nước làm mát E-704' },
  TI_708:   { unit: '°C',       ll: 2.0,  l: 3.5,   h: 8.0,   hh: null, nom: 5.0,  desc: 'Nhiệt độ khí ra Vent Condenser E-708' },
  LIC_733:  { unit: 'mm',       ll: null, l: 400,   h: 1900,  hh: null, nom: 1150, desc: 'Mức đáy tháp khử nước T-704' },
  AI_205_2: { unit: 'wt ppm',   ll: null, l: null,  h: 15.0,  hh: null, nom: 7.5,  desc: 'Hàm lượng nước đầu ra T-704' },
  LI_741:   { unit: 'mm',       ll: null, l: 420,   h: 9440,  hh: 9650, nom: 5200, desc: 'Mức bể Hexane tinh khiết TK-702' },
  P_708_OUT:{ unit: 'kg/cm²G', ll: null, l: 12.0,  h: 16.0,  hh: null, nom: 13.5, desc: 'Áp suất phân phối HP P-708A/B' },
  H2O_DRY:  { unit: 'wt ppm',   ll: null, l: null,  h: 5.0,   hh: null, nom: 2.1,  desc: 'Độ ẩm sau sấy sàng phân tử D-703A/B' },

  // Oligomer & Slop
  PZI_753:  { unit: 'kg/cm²G', ll: null, l: 1.0,   h: 1.7,   hh: 1.8,  nom: 1.5,  desc: 'Áp suất đỉnh tháp cắt Oligomer T-761' },
  TI_792:   { unit: '°C',       ll: null, l: 170,   h: 190,   hh: null, nom: 185.0,desc: 'Nhiệt độ đáy tháp T-761' },
  TI_790:   { unit: '°C',       ll: null, l: 93,    h: 113,   hh: null, nom: 102.5,desc: 'Nhiệt độ dòng sườn Hexane T-761' },
  LIC_790:  { unit: 'mm',       ll: null, l: 400,   h: 1500,  hh: null, nom: 950,  desc: 'Mức đáy tháp T-761' },
  TI_753:   { unit: '°C',       ll: null, l: 80,    h: 100,   hh: null, nom: 90.0, desc: 'Nhiệt độ chưng cất Slop D-753' },

  // pH Treatment
  LI_785:   { unit: 'mm',       ll: 200,  l: 400,   h: 1700,  hh: null, nom: 1100, desc: 'Mức bồn Axit HCl 18% D-781' },
  AI_781:   { unit: 'pH',       ll: null, l: 6.0,   h: 13.5,  hh: null, nom: 10.0, desc: 'pH đầu ra bể trung hòa cấp 1 D-782' },
  AI_782:   { unit: 'pH',       ll: null, l: 6.0,   h: 10.0,  hh: null, nom: 7.2,  desc: 'pH đầu ra bể trung hòa cấp 2 D-783' },
  AI_783:   { unit: 'pH',       ll: null, l: 6.0,   h: 8.0,   hh: null, nom: 7.1,  desc: 'pH xả thải cuối cùng D-783 -> CWWT' }
};

const SCENARIOS = [
  {
    id: 'NORMAL',
    name: 'Vận hành bình thường (Normal Steady-State)',
    tag: 'ALL UNITS',
    severity: 'normal',
    cause: 'Toàn bộ thông số nằm trong dải thiết kế SOP HD-W-7000-00-001.',
    consequence: 'Thu hồi Hexane tinh khiết (< 5 ppm H₂O), Low Polymer đóng bao ổn định, nước thải đạt chuẩn pH 6-8.',
    actions: [
      'Boardman (BM): Giám sát liên tục các vòng điều khiển PID trên hệ thống DCS.',
      'Field Operator (FO): Tuần tra kiểm tra mức kính thủy (LG), bẫy hơi và độ rung bơm A/B.'
    ]
  },
  {
    id: 'LOSS_CWS_E704',
    name: 'Mất nước làm mát E-704 (Low CWR FZA-732)',
    tag: 'E-704 / D-702',
    severity: 'critical',
    cause: 'Mất nguồn cấp nước làm mát (CWS) tới bộ ngưng tụ đỉnh E-704 (FZA-732 < 475 t/h).',
    consequence: 'Hơi Hexane từ T-703 và T-704 không ngưng tụ được -> Quá áp hệ thống D-702 (thiết kế 3.8 barg), nguy cơ bung thiết bị (LOC) và cháy nổ!',
    actions: [
      'FO: Kiểm tra hệ thống CWS và đồng hồ áp suất PG-7307.',
      'FO: Khởi động lại bơm nước làm mát (CW Pump) dự phòng.',
      'FO: Kiểm tra và mở hoàn toàn các van chặn thủ công vào/ra E-704.',
      'BM: Giảm nhiệt gia nhiệt Reboiler E-703A/B (FV-721) nếu áp suất PIC-731 tiếp tục tăng.'
    ]
  },
  {
    id: 'TRIP_P706',
    name: 'Trip bơm cấp Dehydrator P-706A/B (High Level D-702)',
    tag: 'D-702 / T-704',
    severity: 'warning',
    cause: 'Bơm P-706A/B ngừng hoạt động đột ngột hoặc van LV-731 đóng nhầm.',
    consequence: 'Mức Hexane trong D-702 tăng cao (LIC-731 > 3478 mm) gây ngập bộ ngưng tụ E-704, mất khả năng ngưng tụ và gây quá áp hệ thống.',
    actions: [
      'BM: Kiểm tra trạng thái chạy của bơm P-706A/B trên màn hình DCS và khởi động bơm dự phòng.',
      'FO: Kiểm tra vị trí mở thực tế của van điều khiển LV-731 ngoài hiện trường.',
      'FO: Nếu LV-731 kẹt đóng, mở và điều tiết thủ công bằng van bypass của LV-731 để duy trì cấp liệu cho T-704.'
    ]
  },
  {
    id: 'CLOSE_FV721',
    name: 'Đóng nhầm van hơi MS FV-721 (High Level T-703)',
    tag: 'T-703 / E-703',
    severity: 'warning',
    cause: 'Van cấp hơi áp suất trung bình FV-721 vào Reboiler E-703A/B bị đóng nhầm.',
    consequence: 'Mất nhiệt lượng chưng cất ở đáy T-703 -> Mức đáy T-703 tăng cao (LIC-721 > 1400 mm), kéo theo lượng lớn Hexane lỏng sang cụm Low Polymer D-711/D-712 gây nguy cơ cháy tại Flaker.',
    actions: [
      'BM: Kiểm tra tín hiệu điều khiển FV-721, lưu lượng cấp liệu FV-712 và lưu lượng đáy FV-722.',
      'BM: Chuyển FV-721 sang chế độ MAN để mở lại nguồn hơi MS cho E-703A/B.',
      'FO: Kiểm tra hoạt động của bẫy hơi và mức nước ngưng trong bình D-784A/B (LG-7250A/B).'
    ]
  },
  {
    id: 'LOSS_HS_E711',
    name: 'Mất hơi cao áp HS tại E-711 (Low Temp TI-729)',
    tag: 'E-711 / D-711',
    severity: 'critical',
    cause: 'Van TV-724 đóng nhầm hoặc mất nguồn cấp hơi cao áp (HS) vào bộ gia nhiệt Flash Preheater E-711.',
    consequence: 'Nhiệt độ dòng vào D-711 giảm sâu dưới 180°C -> Low Polymer bị đông đặc gây tắc nghẽn đường ống từ E-711 sang D-711!',
    actions: [
      'BM/FO: Kiểm tra ngay chỉ số nhiệt độ TG-7201, TI-725, TI-726, TI-729.',
      'FO: Kiểm tra vị trí van TV-724. Nếu van tự động kẹt, đóng van cách ly trước TV-724 và mở điều tiết thủ công van bypass ngay lập tức.',
      'FO: Đảm bảo hơi HS cấp cho ống jacket (vỏ bọc giữ nhiệt) vẫn thông suốt.'
    ]
  },
  {
    id: 'OVERDOSE_HCL_D782',
    name: 'Quá liều Axit HCl tại D-782 (Low pH AI-781 / AI-783)',
    tag: 'pH Unit D-782/783',
    severity: 'warning',
    cause: 'Bộ điều khiển AIC-781 bị lỗi làm bơm định lượng axit P-782A/B chạy tối đa công suất.',
    consequence: 'pH nước thải giảm dưới 6.0 -> Nước thải không đạt chuẩn môi trường, gây chết vi sinh tại hệ thống xử lý nước thải sinh học tập trung (CWWT).',
    actions: [
      'BM: Kiểm tra đối chiếu các đầu đo AI-781, AI-782 và AI-783.',
      'BM: Chuyển ngay AIC-781 và AIC-782 từ chế độ AUTO sang MAN.',
      'BM: Giảm tốc độ động cơ servomotor của bơm axit P-782A/B và P-784A/B để đưa pH đầu ra D-783 về dải 6.0 - 8.0.'
    ]
  }
];

// ============================================================================
// REUSABLE PID COMPONENTS
// ============================================================================
const TagBox = ({ tag, value, unit, limitKey, position = "bottom" }) => {
  const limit = SOL_LIMITS[limitKey];
  let status = 'normal';
  if (limit) {
    if ((limit.hh !== null && value >= limit.hh) || (limit.ll !== null && value <= limit.ll)) {
      status = 'critical';
    } else if ((limit.h !== null && value >= limit.h) || (limit.l !== null && value <= limit.l)) {
      status = 'warning';
    }
  }

  const badgeColors = {
    normal: 'bg-slate-900/95 border-emerald-500/60 text-emerald-300',
    warning: 'bg-amber-950/95 border-amber-400 text-amber-300 animate-pulse',
    critical: 'bg-rose-950/95 border-rose-500 text-rose-200 animate-bounce'
  };

  const dotColors = {
    normal: 'bg-emerald-400',
    warning: 'bg-amber-400',
    critical: 'bg-rose-500'
  };

  return (
    <div className={`inline-flex flex-col px-2 py-1 rounded border text-[11px] font-mono shadow-lg backdrop-blur-sm transition-all ${badgeColors[status]}`}>
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-0.5 mb-0.5">
        <span className="font-bold tracking-wider text-slate-200">{tag}</span>
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[status]}`} />
      </div>
      <div className="flex items-baseline justify-between gap-1.5">
        <span className="text-xs font-extrabold">{typeof value === 'number' ? value.toFixed(value % 1 === 0 ? 0 : 2) : value}</span>
        <span className="text-[9px] opacity-75">{unit}</span>
      </div>
    </div>
  );
};

const EquipmentVessel = ({ code, title, subtitle, levelPct = 50, color = "cyan", children, height = "h-36", width = "w-28" }) => {
  const fillColors = {
    cyan: 'bg-cyan-500/30 border-t border-cyan-400',
    amber: 'bg-amber-500/35 border-t border-amber-400',
    emerald: 'bg-emerald-500/30 border-t border-emerald-400',
    purple: 'bg-purple-500/35 border-t border-purple-400',
    blue: 'bg-blue-500/35 border-t border-blue-400',
  };

  return (
    <div className="flex flex-col items-center">
      <div className="text-xs font-bold text-slate-200 tracking-wide mb-1">{code}</div>
      <div className={`relative ${width} ${height} rounded-2xl border-2 border-slate-500 bg-slate-900/90 overflow-hidden shadow-inner flex flex-col justify-between p-1.5`}>
        {/* Liquid Level */}
        <div
          className={`absolute bottom-0 left-0 right-0 transition-all duration-700 ${fillColors[color]}`}
          style={{ height: `${Math.min(95, Math.max(5, levelPct))}%` }}
        />
        <div className="relative z-10 text-[10px] text-center font-semibold text-slate-300 leading-tight bg-slate-950/60 rounded px-1 py-0.5">
          {title}
        </div>
        <div className="relative z-10 flex flex-col items-center gap-1 my-auto">
          {children}
        </div>
        {subtitle && (
          <div className="relative z-10 text-[9px] text-center text-slate-400 font-mono bg-slate-950/70 rounded px-1">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

const PumpIcon = ({ code, running = true, duty = "A/B" }) => (
  <div className="flex flex-col items-center gap-0.5">
    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shadow ${running ? 'border-emerald-400 bg-emerald-950/60 text-emerald-300' : 'border-rose-500 bg-rose-950/80 text-rose-400 animate-pulse'}`}>
      <RefreshCw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
    </div>
    <span className="text-[10px] font-mono font-bold text-slate-300">{code}</span>
    <span className={`text-[9px] px-1 rounded ${running ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
      {running ? `RUN (${duty})` : 'TRIP'}
    </span>
  </div>
);

const ExchangerIcon = ({ code, title, utility, tempOut }) => (
  <div className="flex flex-col items-center bg-slate-900/90 border border-slate-600 rounded-lg px-2.5 py-1.5 shadow">
    <div className="flex items-center gap-1.5">
      <div className="w-5 h-5 rounded-full border border-orange-400 bg-orange-950/50 flex items-center justify-center text-[10px] font-bold text-orange-300">
        E
      </div>
      <span className="text-[11px] font-bold text-slate-200">{code}</span>
    </div>
    <span className="text-[9px] text-slate-400 text-center">{title}</span>
    <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono">
      <span className="px-1 rounded bg-slate-800 text-amber-300">{utility}</span>
      {tempOut && <span className="text-cyan-300">{tempOut}</span>}
    </div>
  </div>
);

// ============================================================================
// MAIN APPLICATION
// ============================================================================
export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isRunning, setIsRunning] = useState(true);
  const [scenarioId, setScenarioId] = useState('NORMAL');
  const [showDeployModal, setShowDeployModal] = useState(false);

  // Operator Adjustable Setpoints / Controls
  const [controls, setControls] = useState({
    mlFeedRate: 42.0,       // T/h Mother Liquor from M-301A/B
    naohFlow: 28.5,         // kg/h 25 wt% Caustic Soda
    dmwFlow: 2.4,           // t/h DMW to M-721
    t703SteamValve: 65,     // % FV-721 MS to E-703A/B
    e711SteamValve: 78,     // % TV-724 HS to E-711
    c701VacuumTarget: -0.39,// kg/cm2G D-712
    hclValve1: 45,          // % P-782A/B speed
    hclValve2: 35,          // % P-784A/B speed
    gradeMode: 'SERIES'     // SERIES (>2.5% oligomer -> T-761 batch active) | PARALLEL
  });

  // Live Simulated Process Variables
  const [pv, setPv] = useState({
    PI_701: 0.20,
    LI_701: 2350,
    LI_702: 4480,
    LI_703: 2100,
    LI_704: 4300,
    TI_702: 60.0,
    TI_704: 60.0,
    PH_721: 12.6,
    PH_722: 7.4,
    LI_711: 4500,

    PIC_721: 3.0,
    TI_703B: 120.0,
    LIC_721: 1000,
    PDI_732: 420,
    LP_703: 10.0,

    PIC_723: 22.0,
    TI_729: 220.0,
    PI_730: 3.0,
    TI_726: 162.0,
    LIC_722: 2200,
    PIC_724: -0.39,
    TI_730: 180.0,
    LIC_723: 1850,
    LI_781: 1900,
    AZI_761A: 0.4,

    PIC_731: 0.20,
    LIC_731: 1800,
    LIC_732: 550,
    FZA_732: 620,
    TI_708: 5.0,
    LIC_733: 1150,
    AI_205_2: 7.5,
    LI_741: 5200,
    P_708_OUT: 13.5,
    H2O_DRY: 2.1,

    PZI_753: 1.50,
    TI_792: 185.0,
    TI_790: 102.5,
    LIC_790: 950,
    TI_753: 90.0,

    LI_785: 1100,
    AI_781: 10.0,
    AI_782: 7.2,
    AI_783: 7.1
  });

  // Trigger Scenario Effects
  const handleSelectScenario = (id) => {
    setScenarioId(id);
    if (id === 'NORMAL') {
      setControls({
        mlFeedRate: 42.0,
        naohFlow: 28.5,
        dmwFlow: 2.4,
        t703SteamValve: 65,
        e711SteamValve: 78,
        c701VacuumTarget: -0.39,
        hclValve1: 45,
        hclValve2: 35,
        gradeMode: 'SERIES'
      });
    } else if (id === 'CLOSE_FV721') {
      setControls(prev => ({ ...prev, t703SteamValve: 5 }));
    } else if (id === 'LOSS_HS_E711') {
      setControls(prev => ({ ...prev, e711SteamValve: 0 }));
    } else if (id === 'OVERDOSE_HCL_D782') {
      setControls(prev => ({ ...prev, hclValve1: 98, hclValve2: 85 }));
    }
  };

  // Dynamic Physics & Process Simulation Loop
  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => {
      const noise = (amp) => (Math.random() - 0.5) * amp;

      setPv(prev => {
        // 1. Hexane Washing Dynamics
        const targetPh721 = 11.2 + (controls.naohFlow / 28.5) * 1.4;
        const targetPh722 = 6.8 + (targetPh721 - 12.0) * 0.4 - (controls.dmwFlow - 2.4) * 0.3;

        // 2. Hexane Stripping T-703 Dynamics
        const steamFactor703 = controls.t703SteamValve / 65;
        const targetT703B = 98 + steamFactor703 * 22;
        const targetLic721 = 1000 + (1 - steamFactor703) * 650 + (controls.mlFeedRate - 42) * 12;
        const targetLp703 = Math.max(3.5, Math.min(18.0, 10.0 * steamFactor703));

        // 3. Low Polymer Handling Dynamics
        const steamFactor711 = controls.e711SteamValve / 78;
        const targetTi729 = 135 + steamFactor711 * 85;
        const targetTi726 = 125 + steamFactor711 * 37;
        const targetPic724 = controls.c701VacuumTarget;

        // 4. Purification & Condenser E-704 / D-702 Dynamics
        let targetFza732 = 620;
        let targetPic731 = 0.20;
        let targetLic731 = 1800;

        if (scenarioId === 'LOSS_CWS_E704') {
          targetFza732 = 410; // Below LL 475 t/h
          targetPic731 = Math.min(3.8, prev.PIC_731 + 0.08); // Pressure climbing dangerously
        } else if (scenarioId === 'TRIP_P706') {
          targetLic731 = Math.min(3950, prev.LIC_731 + 110); // Level climbing above H 3478 mm
          targetPic731 = prev.LIC_731 > 3400 ? 0.62 : 0.24;
        } else {
          targetPic731 = 0.20;
          targetLic731 = 1800 + (controls.mlFeedRate - 42) * 18;
        }

        const targetAi205 = targetT703B < 110 ? 18.5 : 7.5;

        // 5. pH Treatment Dynamics
        const targetAi781 = Math.max(3.8, Math.min(13.6, 12.6 - (controls.hclValve1 / 45) * 2.6));
        const targetAi782 = Math.max(3.5, Math.min(11.0, targetAi781 - (controls.hclValve2 / 35) * 2.8));
        const targetAi783 = targetAi782 - 0.1;

        const lerp = (curr, targ, rate = 0.22) => curr + (targ - curr) * rate;

        return {
          PI_701: Number((0.20 + noise(0.01)).toFixed(2)),
          LI_701: Math.round(lerp(prev.LI_701, 2350) + noise(12)),
          LI_702: Math.round(lerp(prev.LI_702, 4480) + noise(15)),
          LI_703: Math.round(lerp(prev.LI_703, 2100) + noise(10)),
          LI_704: Math.round(lerp(prev.LI_704, 4300) + noise(14)),
          TI_702: Number((60.0 + noise(0.3)).toFixed(1)),
          TI_704: Number((60.0 + noise(0.3)).toFixed(1)),
          PH_721: Number((lerp(prev.PH_721, targetPh721) + noise(0.05)).toFixed(2)),
          PH_722: Number((lerp(prev.PH_722, targetPh722) + noise(0.04)).toFixed(2)),
          LI_711: Math.round(lerp(prev.LI_711, 4500 + (controls.mlFeedRate - 42) * 35) + noise(20)),

          PIC_721: Number((3.0 + (steamFactor703 - 1) * 0.6 + noise(0.03)).toFixed(2)),
          TI_703B: Number((lerp(prev.TI_703B, targetT703B) + noise(0.3)).toFixed(1)),
          LIC_721: Math.round(lerp(prev.LIC_721, targetLic721) + noise(10)),
          PDI_732: Math.round(420 + (controls.mlFeedRate - 42) * 8 + noise(6)),
          LP_703: Number((lerp(prev.LP_703, targetLp703) + noise(0.1)).toFixed(1)),

          PIC_723: Number((22.0 + (targetTi729 < 175 ? 9.5 : 0) + noise(0.2)).toFixed(1)),
          TI_729: Number((lerp(prev.TI_729, targetTi729) + noise(0.4)).toFixed(1)),
          PI_730: Number((3.0 + noise(0.03)).toFixed(2)),
          TI_726: Number((lerp(prev.TI_726, targetTi726) + noise(0.3)).toFixed(1)),
          LIC_722: Math.round(lerp(prev.LIC_722, 2200) + noise(12)),
          PIC_724: Number((lerp(prev.PIC_724, targetPic724) + noise(0.01)).toFixed(2)),
          TI_730: Number((180.0 + noise(0.3)).toFixed(1)),
          LIC_723: Math.round(lerp(prev.LIC_723, 1850) + noise(12)),
          LI_781: Math.round(lerp(prev.LI_781, 1900) + noise(10)),
          AZI_761A: Number((0.4 + noise(0.05)).toFixed(2)),

          PIC_731: Number((lerp(prev.PIC_731, targetPic731) + noise(0.01)).toFixed(2)),
          LIC_731: Math.round(lerp(prev.LIC_731, targetLic731) + noise(12)),
          LIC_732: Math.round(550 + noise(5)),
          FZA_732: Math.round(lerp(prev.FZA_732, targetFza732) + noise(4)),
          TI_708: Number((5.0 + (scenarioId === 'LOSS_CWS_E704' ? 14 : 0) + noise(0.15)).toFixed(1)),
          LIC_733: Math.round(1150 + noise(8)),
          AI_205_2: Number((lerp(prev.AI_205_2, targetAi205) + noise(0.2)).toFixed(1)),
          LI_741: Math.round(5200 + noise(10)),
          P_708_OUT: Number((13.5 + noise(0.1)).toFixed(1)),
          H2O_DRY: Number((2.1 + (targetAi205 > 15 ? 4.5 : 0) + noise(0.1)).toFixed(1)),

          PZI_753: Number((controls.gradeMode === 'SERIES' ? 1.50 + noise(0.02) : 0.25).toFixed(2)),
          TI_792: Number((controls.gradeMode === 'SERIES' ? 185.0 + noise(0.4) : 45.0).toFixed(1)),
          TI_790: Number((controls.gradeMode === 'SERIES' ? 102.5 + noise(0.3) : 40.0).toFixed(1)),
          LIC_790: Math.round(controls.gradeMode === 'SERIES' ? 950 + noise(8) : 420),
          TI_753: Number((90.0 + noise(0.3)).toFixed(1)),

          LI_785: Math.round(1100 + noise(4)),
          AI_781: Number((lerp(prev.AI_781, targetAi781) + noise(0.05)).toFixed(2)),
          AI_782: Number((lerp(prev.AI_782, targetAi782) + noise(0.04)).toFixed(2)),
          AI_783: Number((lerp(prev.AI_783, targetAi783) + noise(0.04)).toFixed(2)),
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, controls, scenarioId]);

  // Compute Active Alarms across all SOL Limits
  const activeAlarms = useMemo(() => {
    const list = [];
    Object.entries(SOL_LIMITS).forEach(([key, lim]) => {
      const val = pv[key];
      if (val === undefined) return;
      if ((lim.hh !== null && val >= lim.hh) || (lim.ll !== null && val <= lim.ll)) {
        list.push({ tag: key.replace('_', '-'), desc: lim.desc, val, unit: lim.unit, level: 'HH/LL ESD' });
      } else if ((lim.h !== null && val >= lim.h) || (lim.l !== null && val <= lim.l)) {
        list.push({ tag: key.replace('_', '-'), desc: lim.desc, val, unit: lim.unit, level: 'H/L ALARM' });
      }
    });
    return list;
  }, [pv]);

  const currentScenario = SCENARIOS.find(s => s.id === scenarioId) || SCENARIOS[0];

  const tabs = [
    { id: 'overview', label: 'Tổng quan Section #700', icon: Layers },
    { id: 'washing', label: '1. Hexane Washing', icon: Droplets },
    { id: 'stripping', label: '2. Stripping T-703', icon: Flame },
    { id: 'lowpolymer', label: '3. Low Polymer & Flaker', icon: Cpu },
    { id: 'purification', label: '4. Purification T-704', icon: Wind },
    { id: 'oligomer', label: '5. Oligomer & Slop', icon: Activity },
    { id: 'phtreatment', label: '6. pH Treatment', icon: Gauge },
    { id: 'sol_table', label: 'Bảng SOL & SOP', icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* TOP DCS HEADER BAR */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-bold tracking-wide text-white">
                DCS SIMULATOR — CỤM THU HỒI HEXANE (SECTION #700)
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-700/60 rounded">
                SOP: HD-W-7000-00-001
              </span>
            </div>
            <p className="text-xs text-slate-400">
              HDPE Plant • LSCX_PDP_Vol I_Optimized IFF_Rev.04 • Real-time Process & Hazard Simulation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              isRunning
                ? 'bg-emerald-950/70 border-emerald-600/60 text-emerald-300 hover:bg-emerald-900/70'
                : 'bg-amber-950/70 border-amber-600/60 text-amber-300 hover:bg-amber-900/70'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isRunning ? 'DCS RUNNING' : 'PAUSED'}
          </button>

          <button
            onClick={() => handleSelectScenario('NORMAL')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Chuẩn
          </button>

          <button
            onClick={() => setShowDeployModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition"
          >
            <Terminal className="w-3.5 h-3.5" />
            Xuất mã nguồn GitHub / Vercel
          </button>
        </div>
      </header>

      {/* ACTIVE ALARM BANNER */}
      <div className={`px-4 py-1.5 border-b text-xs flex items-center justify-between gap-2 transition-colors ${
        activeAlarms.length > 0
          ? 'bg-rose-950/85 border-rose-700 text-rose-200'
          : 'bg-emerald-950/40 border-slate-800 text-emerald-300'
      }`}>
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          {activeAlarms.length > 0 ? (
            <>
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-ping" />
              <span className="font-bold text-rose-300 shrink-0">CẢNH BÁO AN TOÀN ({activeAlarms.length}):</span>
              {activeAlarms.map((al, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-rose-900/90 border border-rose-500/60 font-mono text-[11px]">
                  [{al.level}] {al.tag}: {al.val} {al.unit} ({al.desc})
                </span>
              ))}
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>HỆ THỐNG AN TOÀN: Tất cả thông số vận hành nằm trong giới hạn Safe Operating Limits (SOL).</span>
            </>
          )}
        </div>
        <span className="text-[11px] font-mono text-slate-400 shrink-0 hidden md:inline">
          Grade: <strong className="text-cyan-300">{controls.gradeMode}</strong>
        </span>
      </div>

      {/* NAVIGATION SUB-UNITS TABS */}
      <nav className="bg-slate-900/70 border-b border-slate-800 px-4 py-2 flex items-center gap-1.5 overflow-x-auto">
        {tabs.map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                active
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </nav>

      {/* MAIN WORKSPACE: LEFT P&ID CANVAS + RIGHT CONTROL/SOP PANEL */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
        {/* LEFT P&ID PROCESS DIAGRAM (8 COLS) */}
        <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between overflow-x-auto">
          {/* OVERVIEW P&ID */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">
                  Sơ đồ khối công nghệ tích hợp — Section #700 Hexane Recovery
                </h2>
                <span className="text-[11px] text-slate-400">Nhấn vào từng cụm để xem chi tiết thiết bị & van</span>
              </div>

              {/* Row 1: Washing -> Stripping -> Purification -> Pure Hexane */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-stretch">
                <div
                  onClick={() => setActiveTab('washing')}
                  className="cursor-pointer bg-slate-950/90 hover:bg-slate-900 border border-cyan-800/60 hover:border-cyan-400 rounded-xl p-3 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-cyan-400 mb-1">
                      <span>1. HEXANE WASHING</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                    <p className="text-[11px] text-slate-400 mb-2">
                      Rửa Mother Liquor (ML từ M-301A/B) bằng NaOH 25% & DMW để loại tro & chloride.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono bg-slate-900 px-2 py-1 rounded">
                      <span>pH M-721 / M-722:</span>
                      <span className="text-emerald-300">{pv.PH_721} / {pv.PH_722}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-mono bg-slate-900 px-2 py-1 rounded">
                      <span>D-701 Level (LI-711):</span>
                      <span className="text-cyan-300">{pv.LI_711} mm</span>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('stripping')}
                  className="cursor-pointer bg-slate-950/90 hover:bg-slate-900 border border-amber-800/60 hover:border-amber-400 rounded-xl p-3 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-amber-400 mb-1">
                      <span>2. STRIPPING (T-703)</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                    <p className="text-[11px] text-slate-400 mb-2">
                      Chưng cất tách hơi Hexane lên đỉnh; cô đặc Low Polymer ở đáy đạt ~10 wt%.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono bg-slate-900 px-2 py-1 rounded">
                      <span>T-703 P / T đáy:</span>
                      <span className="text-amber-300">{pv.PIC_721} kg/cm²G | {pv.TI_703B}°C</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-mono bg-slate-900 px-2 py-1 rounded">
                      <span>Low Polymer đáy:</span>
                      <span className="text-emerald-300">{pv.LP_703} wt%</span>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('purification')}
                  className="cursor-pointer bg-slate-950/90 hover:bg-slate-900 border border-emerald-800/60 hover:border-emerald-400 rounded-xl p-3 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mb-1">
                      <span>4. PURIFICATION (T-704)</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                    <p className="text-[11px] text-slate-400 mb-2">
                      Ngưng tụ E-704/E-708 (5°C), tách nước D-702, chưng cất khô T-704 & sấy D-703A/B.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono bg-slate-900 px-2 py-1 rounded">
                      <span>H₂O ra T-704 / D-703:</span>
                      <span className="text-emerald-300">{pv.AI_205_2} / {pv.H2O_DRY} ppm</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-mono bg-slate-900 px-2 py-1 rounded">
                      <span>TK-702 Level:</span>
                      <span className="text-cyan-300">{pv.LI_741} mm</span>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('lowpolymer')}
                  className="cursor-pointer bg-slate-950/90 hover:bg-slate-900 border border-purple-800/60 hover:border-purple-400 rounded-xl p-3 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-purple-400 mb-1">
                      <span>3. LOW POLYMER & FLAKER</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                    <p className="text-[11px] text-slate-400 mb-2">
                      Flash 2 cấp D-711 (3 kg/cm²G) & D-712 (-0.39 kg/cm²G) -> Hóa rắn Flaker M-761A/B.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono bg-slate-900 px-2 py-1 rounded">
                      <span>D-711 / D-712 Temp:</span>
                      <span className="text-purple-300">{pv.TI_726}°C / {pv.TI_730}°C</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-mono bg-slate-900 px-2 py-1 rounded">
                      <span>Chân không PIC-724:</span>
                      <span className="text-cyan-300">{pv.PIC_724} kg/cm²G</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Auxiliary Units (Oligomer Cut, Slop Recovery, pH Treatment) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div
                  onClick={() => setActiveTab('oligomer')}
                  className="cursor-pointer bg-slate-950/90 hover:bg-slate-900 border border-indigo-800/60 hover:border-indigo-400 rounded-xl p-3 transition"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-400 mb-1">
                    <span>5. OLIGOMER CUT (T-761) & SLOP HEXANE (D-753)</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2">
                    Tách Oligomer nặng từ D-718 (vận hành mẻ khi chạy Series Grade &gt; 2.5% oligomer) và chưng hơi thu hồi Slop Hexane từ mẫu thí nghiệm/xúc tác.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="bg-slate-900 px-2 py-1 rounded flex justify-between">
                      <span>T-761 Side Hexane:</span>
                      <span className="text-indigo-300">{pv.TI_790}°C</span>
                    </div>
                    <div className="bg-slate-900 px-2 py-1 rounded flex justify-between">
                      <span>D-753 Strip Temp:</span>
                      <span className="text-amber-300">{pv.TI_753}°C</span>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('phtreatment')}
                  className="cursor-pointer bg-slate-950/90 hover:bg-slate-900 border border-teal-800/60 hover:border-teal-400 rounded-xl p-3 transition"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-teal-400 mb-1">
                    <span>6. pH TREATMENT UNIT (D-782 / D-783)</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2">
                    Trung hòa nước thải kiềm (pH &gt; 12) từ D-721 bằng HCl 18% qua 2 cấp: D-782 (pH ~10) và D-783 (pH 6-8) trước khi xả ra CWWT.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="bg-slate-900 px-2 py-1 rounded flex justify-between">
                      <span>D-782 (AI-781):</span>
                      <span className="text-teal-300">pH {pv.AI_781}</span>
                    </div>
                    <div className="bg-slate-900 px-2 py-1 rounded flex justify-between">
                      <span>D-783 Outlet (AI-783):</span>
                      <span className="text-emerald-300">pH {pv.AI_783}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: HEXANE WASHING */}
          {activeTab === 'washing' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                <h2 className="text-sm font-bold text-cyan-400">PHÂN KHU 1: HEXANE WASHING (M-721/D-721 -> M-722/D-722 -> D-701)</h2>
                <span className="text-xs font-mono text-slate-400">Điều kiện vận hành: 0.2 kg/cm²G | 60°C</span>
              </div>

              <div className="flex flex-wrap items-center justify-around gap-4 py-4 bg-slate-950/60 rounded-xl border border-slate-800/80 px-3">
                {/* Feed & Contactor M-721 */}
                <div className="flex flex-col items-center gap-2">
                  <div className="text-[11px] bg-slate-900 border border-slate-700 px-2.5 py-1.5 rounded text-center">
                    <div className="font-bold text-cyan-300">ML từ M-301A/B</div>
                    <div className="text-[10px] text-slate-400">{controls.mlFeedRate} T/h | NaOH 25% + DMW + LS</div>
                  </div>
                  <div className="px-3 py-2 rounded-lg border-2 border-cyan-500 bg-cyan-950/40 text-center">
                    <div className="text-xs font-bold text-white">M-721</div>
                    <div className="text-[10px] text-cyan-200">HX & NaOH Contactor</div>
                    <div className="mt-1"><TagBox tag="pH M-721" value={pv.PH_721} unit="pH" limitKey="PH_721" /></div>
                  </div>
                  <TagBox tag="TI-702" value={pv.TI_702} unit="°C" limitKey="TI_702" />
                </div>

                <ArrowRight className="w-5 h-5 text-cyan-500 hidden md:block" />

                {/* Separator D-721 */}
                <div className="flex flex-col items-center gap-2">
                  <EquipmentVessel code="D-721" title="HX & NaOH Separator" subtitle="0.2 kg/cm²G | 60°C" levelPct={(pv.LI_702 / 5500) * 100} color="cyan" width="w-36" height="h-44">
                    <TagBox tag="LI-702 (HX)" value={pv.LI_702} unit="mm" limitKey="LI_702" />
                    <TagBox tag="LI-701 (WW)" value={pv.LI_701} unit="mm" limitKey="LI_701" />
                  </EquipmentVessel>
                  <TagBox tag="PI-701" value={pv.PI_701} unit="kg/cm²G" limitKey="PI_701" />
                  <span className="text-[10px] text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">
                    LIC-701 (LV-701) -> Xả WW tới D-782
                  </span>
                </div>

                <ArrowRight className="w-5 h-5 text-cyan-500 hidden md:block" />

                {/* Contactor M-722 & Separator D-722 */}
                <div className="flex flex-col items-center gap-2">
                  <div className="px-3 py-1.5 rounded-lg border border-blue-500 bg-blue-950/40 text-center">
                    <div className="text-xs font-bold text-white">M-722 (Rửa DMW)</div>
                    <TagBox tag="pH M-722" value={pv.PH_722} unit="pH" limitKey="PH_722" />
                  </div>
                  <EquipmentVessel code="D-722" title="HX & Water Separator" subtitle="Tuần hoàn WW -> M-721" levelPct={(pv.LI_704 / 5500) * 100} color="blue" width="w-36" height="h-40">
                    <TagBox tag="LI-704 (HX)" value={pv.LI_704} unit="mm" limitKey="LI_704" />
                    <TagBox tag="LI-703 (WW)" value={pv.LI_703} unit="mm" limitKey="LI_703" />
                  </EquipmentVessel>
                  <TagBox tag="TI-704" value={pv.TI_704} unit="°C" limitKey="TI_704" />
                </div>

                <ArrowRight className="w-5 h-5 text-cyan-500 hidden md:block" />

                {/* Pump P-721A/B & Crude Hexane Drum D-701 */}
                <div className="flex flex-col items-center gap-3">
                  <PumpIcon code="P-721A/B" running={true} />
                  <EquipmentVessel code="D-701" title="Crude Hexane Feed Drum" subtitle="Chứa Hexane thô đã rửa" levelPct={(pv.LI_711 / 9000) * 100} color="amber" width="w-36" height="h-40">
                    <TagBox tag="LI-711" value={pv.LI_711} unit="mm" limitKey="LI_711" />
                  </EquipmentVessel>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HEXANE STRIPPING */}
          {activeTab === 'stripping' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                <h2 className="text-sm font-bold text-amber-400">PHÂN KHU 2: HEXANE STRIPPING (D-701 -> P-702A/B -> T-703 -> E-703A/B)</h2>
                <span className="text-xs font-mono text-slate-400">Đáy T-703: 120°C | 3.0 kg/cm²G | LP ~10 wt%</span>
              </div>

              <div className="flex flex-wrap items-center justify-around gap-4 py-4 bg-slate-950/60 rounded-xl border border-slate-800/80 px-3">
                <div className="flex flex-col items-center gap-3">
                  <EquipmentVessel code="D-701" title="Crude Hexane Drum" levelPct={(pv.LI_711 / 9000) * 100} color="amber" width="w-32" height="h-32">
                    <TagBox tag="LI-711" value={pv.LI_711} unit="mm" limitKey="LI_711" />
                  </EquipmentVessel>
                  <PumpIcon code="P-702A/B" running={true} />
                </div>

                <ArrowRight className="w-5 h-5 text-amber-500 hidden md:block" />

                {/* Main Stripper Column T-703 */}
                <div className="flex flex-col items-center gap-2">
                  <div className="text-[10px] text-cyan-300 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-700">
                    Hơi đỉnh T-703 -> Giảm áp PIC-721 (0.2 kg/cm²G) tới E-704
                  </div>
                  <EquipmentVessel code="T-703" title="Hexane Stripper Tower" subtitle="P = 3.0 kg/cm²G | T đáy = 120°C" levelPct={(pv.LIC_721 / 1800) * 100} color="amber" width="w-44" height="h-64">
                    <TagBox tag="PIC-721" value={pv.PIC_721} unit="kg/cm²G" limitKey="PIC_721" />
                    <TagBox tag="PDI-732" value={pv.PDI_732} unit="mmAq" limitKey="PDI_732" />
                    <TagBox tag="TI-703B" value={pv.TI_703B} unit="°C" limitKey="TI_703B" />
                    <TagBox tag="LIC-721" value={pv.LIC_721} unit="mm" limitKey="LIC_721" />
                  </EquipmentVessel>
                </div>

                {/* Reboiler & Bottom Circulation */}
                <div className="flex flex-col items-center gap-3">
                  <ExchangerIcon code="E-703A/B" title="Crude Hexane Reboiler" utility={`MS (${controls.t703SteamValve}%)`} tempOut={`${pv.TI_703B}°C`} />
                  <div className="text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-700">
                    Bình ngưng D-784A/B (LIC-725A/B)
                  </div>
                  <PumpIcon code="P-705A/B" running={true} duty="Tuần hoàn" />
                  <TagBox tag="LP Đáy T-703" value={pv.LP_703} unit="wt%" limitKey="LP_703" />
                  <div className="text-[10px] text-purple-300 bg-purple-950/60 px-2 py-1 rounded border border-purple-700">
                    Đáy T-703 -> P-711A/B tới D-711
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LOW POLYMER HANDLING */}
          {activeTab === 'lowpolymer' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                <h2 className="text-sm font-bold text-purple-400">PHÂN KHU 3: LOW POLYMER HANDLING (D-711 -> D-712 -> D-717 -> FLAKER M-761A/B)</h2>
                <span className="text-xs font-mono text-slate-400">Flash 2 cấp & Hóa rắn đóng bao</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950/60 rounded-xl border border-slate-800/80 p-3">
                {/* Stage 1 Flash */}
                <div className="flex flex-col items-center gap-2 border border-slate-800 rounded-lg p-2.5 bg-slate-900/40">
                  <div className="text-xs font-bold text-purple-300">Cấp 1: 1st Flash Drum</div>
                  <PumpIcon code="P-711A/B" running={true} duty="22 kg/cm²G" />
                  <TagBox tag="PIC-723" value={pv.PIC_723} unit="kg/cm²G" limitKey="PIC_723" />
                  <ExchangerIcon code="E-711" title="Flash Preheater" utility={`HS (${controls.e711SteamValve}%)`} tempOut={`${pv.TI_729}°C`} />
                  <TagBox tag="TI-729" value={pv.TI_729} unit="°C" limitKey="TI_729" />
                  <EquipmentVessel code="D-711" title="1st Flash Drum" subtitle="3 kg/cm²G | ~160°C" levelPct={(pv.LIC_722 / 3500) * 100} color="purple" width="w-36" height="h-36">
                    <TagBox tag="PI-730" value={pv.PI_730} unit="kg/cm²G" limitKey="PI_730" />
                    <TagBox tag="TI-726" value={pv.TI_726} unit="°C" limitKey="TI_726" />
                    <TagBox tag="LIC-722" value={pv.LIC_722} unit="mm" limitKey="LIC_722" />
                  </EquipmentVessel>
                </div>

                {/* Stage 2 Vacuum Flash */}
                <div className="flex flex-col items-center gap-2 border border-slate-800 rounded-lg p-2.5 bg-slate-900/40">
                  <div className="text-xs font-bold text-purple-300">Cấp 2: Vacuum Flash</div>
                  <ExchangerIcon code="E-712" title="LP Preheater" utility="HS Steam" tempOut={`${pv.TI_730}°C`} />
                  <EquipmentVessel code="D-712" title="2nd Flash Drum" subtitle="-0.39 kg/cm²G | 180°C" levelPct={(pv.LIC_723 / 3800) * 100} color="purple" width="w-36" height="h-40">
                    <TagBox tag="PIC-724" value={pv.PIC_724} unit="kg/cm²G" limitKey="PIC_724" />
                    <TagBox tag="TI-730" value={pv.TI_730} unit="°C" limitKey="TI_730" />
                    <TagBox tag="LIC-723" value={pv.LIC_723} unit="mm" limitKey="LIC_723" />
                  </EquipmentVessel>
                  <div className="text-[10px] text-center text-cyan-300 bg-cyan-950/60 px-2 py-1 rounded border border-cyan-800">
                    Hơi HX -> C-701 -> E-713 -> D-714 -> D-701 / D-718
                  </div>
                </div>

                {/* Holding & Flaker */}
                <div className="flex flex-col items-center gap-2 border border-slate-800 rounded-lg p-2.5 bg-slate-900/40">
                  <div className="text-xs font-bold text-purple-300">Cấp 3: Holding & Flaker</div>
                  <PumpIcon code="P-713A/B" running={true} duty="Jacketing HS" />
                  <EquipmentVessel code="D-717" title="LP Holding Drum" subtitle="P-717A/B -> Flaker" levelPct={(pv.LI_781 / 3450) * 100} color="amber" width="w-36" height="h-32">
                    <TagBox tag="LI-781" value={pv.LI_781} unit="mm" limitKey="LI_781" />
                  </EquipmentVessel>
                  <div className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-center space-y-1">
                    <div className="text-xs font-bold text-emerald-300">Drum Flaker M-761A/B</div>
                    <div className="text-[10px] text-slate-400">Nghiền ZZ-761A/B -> Vít tải cân FD-762A/B</div>
                    <TagBox tag="AZI-761A (O₂)" value={pv.AZI_761A} unit="%" limitKey="AZI_761A" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PURIFICATION & DISTRIBUTION */}
          {activeTab === 'purification' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                <h2 className="text-sm font-bold text-emerald-400">PHÂN KHU 4: HEXANE PURIFICATION & DISTRIBUTION (E-704 -> D-702 -> T-704 -> TK-702 -> D-703A/B)</h2>
                <span className="text-xs font-mono text-slate-400">Độ ẩm xuất xưởng &lt; 5 wt ppm H₂O</span>
              </div>

              <div className="flex flex-wrap items-center justify-around gap-3 py-4 bg-slate-950/60 rounded-xl border border-slate-800/80 px-3">
                {/* Condensers & Receiver D-702 */}
                <div className="flex flex-col items-center gap-2">
                  <ExchangerIcon code="E-704" title="Overhead Condenser" utility="CWS" tempOut="U-Seal" />
                  <TagBox tag="FZA-732 (CWR)" value={pv.FZA_732} unit="t/h" limitKey="FZA_732" />
                  <ExchangerIcon code="E-708" title="Vent Condenser" utility="Brine" tempOut={`${pv.TI_708}°C -> Flare`} />
                  <EquipmentVessel code="D-702" title="Stripper Receiver" subtitle="HX ~250 ppm H₂O + Boot Nước" levelPct={(pv.LIC_731 / 3800) * 100} color="emerald" width="w-36" height="h-40">
                    <TagBox tag="PIC-731" value={pv.PIC_731} unit="kg/cm²G" limitKey="PIC_731" />
                    <TagBox tag="LIC-731" value={pv.LIC_731} unit="mm" limitKey="LIC_731" />
                    <TagBox tag="LIC-732" value={pv.LIC_732} unit="mm" limitKey="LIC_732" />
                  </EquipmentVessel>
                </div>

                {/* Dehydrator Tower T-704 */}
                <div className="flex flex-col items-center gap-2">
                  <PumpIcon code="P-706A/B" running={scenarioId !== 'TRIP_P706'} />
                  <EquipmentVessel code="T-704" title="Hexane Dehydrator" subtitle="0.2 kg/cm²G | Đáy 80°C" levelPct={(pv.LIC_733 / 1900) * 100} color="cyan" width="w-36" height="h-48">
                    <TagBox tag="LIC-733" value={pv.LIC_733} unit="mm" limitKey="LIC_733" />
                    <TagBox tag="AI-205-2" value={pv.AI_205_2} unit="ppm" limitKey="AI_205_2" />
                  </EquipmentVessel>
                  <ExchangerIcon code="E-705 / E-706" title="Reboiler & Cooler" utility="LS / CW" tempOut="40-43°C" />
                </div>

                {/* Pure Hexane Tank & Dryer */}
                <div className="flex flex-col items-center gap-2">
                  <PumpIcon code="P-707A/B" running={true} />
                  <EquipmentVessel code="TK-702" title="Pure Hexane Tank" subtitle="N₂ Seal | <= 10 ppm H₂O" levelPct={(pv.LI_741 / 9650) * 100} color="emerald" width="w-36" height="h-36">
                    <TagBox tag="LI-741" value={pv.LI_741} unit="mm" limitKey="LI_741" />
                  </EquipmentVessel>
                  <PumpIcon code="P-708A/B" running={true} duty=">= 12 kg/cm²G" />
                  <div className="bg-emerald-950/50 border border-emerald-500/60 rounded-lg p-2 text-center">
                    <div className="text-xs font-bold text-emerald-300">Dryer D-703A/B + F-704A/B</div>
                    <div className="text-[10px] text-slate-300 mb-1">Molecular Sieve Dehydration</div>
                    <TagBox tag="H₂O Sản phẩm" value={pv.H2O_DRY} unit="wt ppm" limitKey="H2O_DRY" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: OLIGOMER & SLOP */}
          {activeTab === 'oligomer' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                <h2 className="text-sm font-bold text-indigo-400">PHÂN KHU 5: OLIGOMER CUT (T-761) & SLOP HEXANE RECOVERY (D-753)</h2>
                <span className="text-xs font-mono text-indigo-300">Chế độ Grade: {controls.gradeMode}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 rounded-xl border border-slate-800 p-3">
                {/* Oligomer Cut T-761 */}
                <div className="flex flex-col items-center gap-2 border border-slate-800 rounded-lg p-3 bg-slate-900/40">
                  <div className="text-xs font-bold text-indigo-300">Tháp cắt Oligomer T-761 (Từ D-718)</div>
                  <p className="text-[10px] text-slate-400 text-center">
                    Vận hành theo mẻ khi sản xuất Series Grade (Oligomer &gt; 2.5%). Dòng đỉnh xả Butene-1 qua PIC-763; dòng sườn rút Hexane sạch (100-105°C); đáy xả Oligomer (200-210°C -> E-764 -> D-763 -> OSBL).
                  </p>
                  <EquipmentVessel code="T-761" title="Oligomer Cut Tower" subtitle="1.5 kg/cm²G | Reboiler E-761 (HS)" levelPct={(pv.LIC_790 / 1500) * 100} color="purple" width="w-40" height="h-48">
                    <TagBox tag="PZI-753" value={pv.PZI_753} unit="kg/cm²G" limitKey="PZI_753" />
                    <TagBox tag="TI-790 (Side)" value={pv.TI_790} unit="°C" limitKey="TI_790" />
                    <TagBox tag="TI-792 (Btm)" value={pv.TI_792} unit="°C" limitKey="TI_792" />
                    <TagBox tag="LIC-790" value={pv.LIC_790} unit="mm" limitKey="LIC_790" />
                  </EquipmentVessel>
                </div>

                {/* Slop Hexane Recovery D-753 */}
                <div className="flex flex-col items-center gap-2 border border-slate-800 rounded-lg p-3 bg-slate-900/40">
                  <div className="text-xs font-bold text-amber-300">Hệ thống thu hồi Hexane thải (Slop)</div>
                  <p className="text-[10px] text-slate-400 text-center">
                    Mẫu phân tích (D-751/752) & chất thải xúc tác (D-110A/B, D-111, D-112) đẩy bằng N₂ sang D-753. Trung hòa bằng NaOH, chưng hơi LS ở 90°C (FIC-751), ngưng tụ tại E-751 -> D-754 -> bơm P-754 về TK-703 / D-701.
                  </p>
                  <EquipmentVessel code="D-753" title="Slop Hexane Stripper" subtitle="Steam Stripping 90°C + Agitator" levelPct={65} color="amber" width="w-40" height="h-40">
                    <TagBox tag="TI-753" value={pv.TI_753} unit="°C" limitKey="TI_753" />
                  </EquipmentVessel>
                  <div className="flex items-center gap-2 text-[11px]">
                    <ExchangerIcon code="E-751" title="Slop Condenser" utility="CW" tempOut="40°C" />
                    <PumpIcon code="P-754" running={true} duty="-> TK-703" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: pH TREATMENT UNIT */}
          {activeTab === 'phtreatment' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                <h2 className="text-sm font-bold text-teal-400">PHÂN KHU 6: pH TREATMENT UNIT (D-781 HCl 18% -> D-782 -> D-783 -> CWWT)</h2>
                <span className="text-xs font-mono text-slate-400">Trung hòa nước thải kiềm 2 giai đoạn</span>
              </div>

              <div className="flex flex-wrap items-center justify-around gap-4 py-6 bg-slate-950/60 rounded-xl border border-slate-800 px-3">
                <div className="flex flex-col items-center gap-2">
                  <EquipmentVessel code="D-781" title="HCl 18% Acid Drum" subtitle="Cấp axit trung hòa" levelPct={(pv.LI_785 / 1700) * 100} color="amber" width="w-36" height="h-36">
                    <TagBox tag="LI-785" value={pv.LI_785} unit="mm" limitKey="LI_785" />
                  </EquipmentVessel>
                  <div className="flex gap-2">
                    <PumpIcon code="P-782A/B" running={true} duty={`${controls.hclValve1}%`} />
                    <PumpIcon code="P-784A/B" running={true} duty={`${controls.hclValve2}%`} />
                  </div>
                </div>

                <ArrowRight className="w-5 h-5 text-teal-500 hidden md:block" />

                <div className="flex flex-col items-center gap-2">
                  <div className="text-[10px] text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">
                    WW từ D-721 (pH &gt; 12)
                  </div>
                  <EquipmentVessel code="D-782" title="No.1 pH Treatment Drum" subtitle="Giảm pH >12 xuống ~10" levelPct={72} color="blue" width="w-40" height="h-40">
                    <TagBox tag="AI-781" value={pv.AI_781} unit="pH" limitKey="AI_781" />
                  </EquipmentVessel>
                </div>

                <ArrowRight className="w-5 h-5 text-teal-500 hidden md:block" />

                <div className="flex flex-col items-center gap-2">
                  <EquipmentVessel code="D-783" title="No.2 pH Treatment Drum" subtitle="Giảm pH 10 xuống 6 - 8" levelPct={75} color="emerald" width="w-40" height="h-40">
                    <TagBox tag="AI-782" value={pv.AI_782} unit="pH" limitKey="AI_782" />
                    <TagBox tag="AI-783 (Out)" value={pv.AI_783} unit="pH" limitKey="AI_783" />
                  </EquipmentVessel>
                  <div className="text-[10px] text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-700">
                    Đạt chuẩn -> Xả tới hệ thống CWWT
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SAFE OPERATING LIMITS TABLE */}
          {activeTab === 'sol_table' && (
            <div className="space-y-3">
              <div className="border-b border-slate-800 pb-2">
                <h2 className="text-sm font-bold text-rose-400">
                  BẢNG GIỚI HẠN VẬN HÀNH AN TOÀN (SAFE OPERATING LIMITS — SOP HD-W-7000-00-001)
                </h2>
              </div>
              <div className="overflow-x-auto max-h-[460px] rounded-lg border border-slate-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-900 text-slate-300 sticky top-0">
                    <tr>
                      <th className="p-2 border-b border-slate-800">Tag</th>
                      <th className="p-2 border-b border-slate-800">Mô tả thông số</th>
                      <th className="p-2 border-b border-slate-800">Giá trị hiện tại</th>
                      <th className="p-2 border-b border-slate-800">Đơn vị</th>
                      <th className="p-2 border-b border-slate-800 text-rose-400">LL / ESD</th>
                      <th className="p-2 border-b border-slate-800 text-amber-400">L Alarm</th>
                      <th className="p-2 border-b border-slate-800 text-amber-400">H Alarm</th>
                      <th className="p-2 border-b border-slate-800 text-rose-400">HH / ESD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 font-mono">
                    {Object.entries(SOL_LIMITS).map(([k, lim]) => {
                      const val = pv[k];
                      const isCrit = (lim.hh !== null && val >= lim.hh) || (lim.ll !== null && val <= lim.ll);
                      const isWarn = !isCrit && ((lim.h !== null && val >= lim.h) || (lim.l !== null && val <= lim.l));
                      return (
                        <tr key={k} className={isCrit ? 'bg-rose-950/60' : isWarn ? 'bg-amber-950/40' : 'hover:bg-slate-900/50'}>
                          <td className="p-2 font-bold text-cyan-300">{k.replace('_', '-')}</td>
                          <td className="p-2 font-sans text-slate-300">{lim.desc}</td>
                          <td className={`p-2 font-bold ${isCrit ? 'text-rose-400' : isWarn ? 'text-amber-300' : 'text-emerald-300'}`}>
                            {val}
                          </td>
                          <td className="p-2 text-slate-400">{lim.unit}</td>
                          <td className="p-2 text-rose-400">{lim.ll ?? '-/-'}</td>
                          <td className="p-2 text-amber-300">{lim.l ?? '-/-'}</td>
                          <td className="p-2 text-amber-300">{lim.h ?? '-/-'}</td>
                          <td className="p-2 text-rose-400">{lim.hh ?? '-/-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BOTTOM PROCESS DESCRIPTION FOOTER */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Vai trò vận hành: <strong className="text-slate-200">Boardman - HD (BM)</strong> điều khiển DCS & Interlock | <strong className="text-slate-200">Field Operator - HD (FO)</strong> thao tác van tay & kiểm tra hiện trường.</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: OPERATOR CONTROLS & HAZOP SCENARIOS (4 COLS) */}
        <div className="lg:col-span-4 space-y-4">
          {/* 1. DCS OPERATOR SETPOINT CONTROLS */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 uppercase">
                <Sliders className="w-4 h-4" />
                Bảng điều khiển Boardman (DCS)
              </div>
              <select
                value={controls.gradeMode}
                onChange={(e) => setControls(p => ({ ...p, gradeMode: e.target.value }))}
                className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-[11px] text-indigo-300 font-semibold"
              >
                <option value="SERIES">Grade: SERIES (T-761 Active)</option>
                <option value="PARALLEL">Grade: PARALLEL (T-761 Standby)</option>
              </select>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-0.5">
                  <span>Lưu lượng ML từ M-301A/B:</span>
                  <span className="font-mono text-cyan-300">{controls.mlFeedRate} T/h</span>
                </div>
                <input
                  type="range" min="25" max="60" step="1"
                  value={controls.mlFeedRate}
                  onChange={(e) => setControls(p => ({ ...p, mlFeedRate: Number(e.target.value) }))}
                  className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-0.5">
                  <span>Cấp Xút 25% vào M-721 (FI-703):</span>
                  <span className="font-mono text-cyan-300">{controls.naohFlow} kg/h</span>
                </div>
                <input
                  type="range" min="15" max="40" step="0.5"
                  value={controls.naohFlow}
                  onChange={(e) => setControls(p => ({ ...p, naohFlow: Number(e.target.value) }))}
                  className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-0.5">
                  <span>Van hơi MS E-703A/B (FV-721):</span>
                  <span className="font-mono text-amber-300">{controls.t703SteamValve}%</span>
                </div>
                <input
                  type="range" min="0" max="100" step="1"
                  value={controls.t703SteamValve}
                  onChange={(e) => setControls(p => ({ ...p, t703SteamValve: Number(e.target.value) }))}
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-0.5">
                  <span>Van hơi HS E-711 (TV-724):</span>
                  <span className="font-mono text-purple-300">{controls.e711SteamValve}%</span>
                </div>
                <input
                  type="range" min="0" max="100" step="1"
                  value={controls.e711SteamValve}
                  onChange={(e) => setControls(p => ({ ...p, e711SteamValve: Number(e.target.value) }))}
                  className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-300 mb-0.5">
                    <span>HCl P-782 (D-782):</span>
                    <span className="font-mono text-teal-300">{controls.hclValve1}%</span>
                  </div>
                  <input
                    type="range" min="0" max="100" step="1"
                    value={controls.hclValve1}
                    onChange={(e) => setControls(p => ({ ...p, hclValve1: Number(e.target.value) }))}
                    className="w-full accent-teal-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-300 mb-0.5">
                    <span>HCl P-784 (D-783):</span>
                    <span className="font-mono text-teal-300">{controls.hclValve2}%</span>
                  </div>
                  <input
                    type="range" min="0" max="100" step="1"
                    value={controls.hclValve2}
                    onChange={(e) => setControls(p => ({ ...p, hclValve2: Number(e.target.value) }))}
                    className="w-full accent-teal-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. DEVIATION & CORRECTIVE ACTION SIMULATOR (SOP HAZOP) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase border-b border-slate-800 pb-2">
              <Zap className="w-4 h-4" />
              Mô phỏng sự cố & Xử lý SOP
            </div>

            <div className="space-y-1.5">
              {SCENARIOS.map(sc => {
                const selected = sc.id === scenarioId;
                return (
                  <button
                    key={sc.id}
                    onClick={() => handleSelectScenario(sc.id)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg border text-xs transition flex items-center justify-between ${
                      selected
                        ? sc.severity === 'critical'
                          ? 'bg-rose-950/80 border-rose-500 text-white'
                          : sc.severity === 'warning'
                          ? 'bg-amber-950/80 border-amber-500 text-white'
                          : 'bg-emerald-950/60 border-emerald-500 text-white'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <span className="font-medium truncate pr-2">{sc.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 shrink-0">
                      {sc.tag}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Scenario SOP Guidance Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-400 block">Nguyên nhân (Cause):</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">{currentScenario.cause}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-rose-400 block">Hậu quả tiềm ẩn (Consequence):</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">{currentScenario.consequence}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-400 flex items-center gap-1 mb-1">
                  <Wrench className="w-3 h-3" /> Bước khắc phục chuẩn (Corrective Action):
                </span>
                <ul className="space-y-1 text-[11px] text-slate-200 list-disc pl-4">
                  {currentScenario.actions.map((act, idx) => (
                    <li key={idx} className="leading-snug">{act}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: GITHUB & VERCEL DEPLOYMENT INSTRUCTIONS */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Triển khai dự án lên GitHub & Vercel</h3>
              </div>
              <button onClick={() => setShowDeployModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>
                Ứng dụng được thiết kế chuẩn <strong>React + Vite + Tailwind CSS</strong> để triển khai trực tiếp lên <strong>GitHub</strong> và tự động build trên <strong>Vercel</strong>:
              </p>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[11px] space-y-1">
                <div className="text-indigo-400 font-bold"># 1. Khởi tạo dự án Vite React & cài đặt thư viện</div>
                <div className="text-slate-200">npm create vite@latest hexane-recovery-sim -- --template react</div>
                <div className="text-slate-200">cd hexane-recovery-sim</div>
                <div className="text-slate-200">npm install lucide-react</div>
                <div className="text-slate-200">npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[11px]">
                  <div className="text-emerald-400 font-bold mb-1">package.json (scripts & deps)</div>
                  <pre className="text-slate-300 overflow-x-auto">{`{
  "name": "hexane-recovery-sim",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.460.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}`}</pre>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[11px]">
                  <div className="text-cyan-400 font-bold mb-1">vercel.json (Cấu hình Deploy)</div>
                  <pre className="text-slate-300 overflow-x-auto">{`{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}`}</pre>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[11px] space-y-1">
                <div className="text-amber-400 font-bold"># 2. Đẩy mã nguồn lên GitHub & kết nối Vercel</div>
                <div className="text-slate-200">git init && git add .</div>
                <div className="text-slate-200">git commit -m "Deploy Hexane Recovery Section #700 DCS Simulator"</div>
                <div className="text-slate-200">git branch -M main</div>
                <div className="text-slate-200">git remote add origin https://github.com/&lt;YOUR_USERNAME&gt;/hexane-recovery-sim.git</div>
                <div className="text-slate-200">git push -u origin main</div>
                <div className="text-slate-400 pt-1">-> Truy cập vercel.com/new, chọn repo "hexane-recovery-sim" và nhấn Deploy.</div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowDeployModal(false)}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
              >
                Đóng hướng dẫn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
