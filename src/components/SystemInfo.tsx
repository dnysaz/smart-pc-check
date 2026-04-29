'use client';

import { useState, useEffect } from 'react';
import { Monitor, Cpu, HardDrive, Layout, ShieldCheck, Info, Zap, RotateCcw, Play, CheckCircle2, AlertCircle, Shield, Battery, Clock, Wifi, Download, Bot } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SystemInfo() {
  const router = useRouter();
  const [specs, setSpecs] = useState<any>({
    os: "Detecting...", browser: "Detecting...", cpu: "Detecting...",
    ram: "Detecting...", gpu: "Detecting...", screen: "Detecting...",
    motherboard: "Run Deep Scan", serial: "Run Deep Scan"
  });

  useEffect(() => {
    try {
      const ua = navigator.userAgent;
      setSpecs((p: any) => ({
        ...p,
        os: ua.includes("Win") ? "Windows" : ua.includes("Mac") ? "macOS" : "Unknown",
        browser: ua.includes("Chrome") ? "Chrome" : ua.includes("Firefox") ? "Firefox" : "Other",
        cpu: (navigator as any).hardwareConcurrency ? `${(navigator as any).hardwareConcurrency} Cores` : "Unknown",
        ram: (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : "Unknown",
        gpu: "Integrated/Discrete",
        screen: `${screen.width} x ${screen.height}`,
      }));
    } catch (e) { console.error(e); }
    // Restore from localStorage
    try {
      const saved = localStorage.getItem('smartpc_report');
      const savedSpecs = localStorage.getItem('smartpc_specs');
      if (saved) setReport(JSON.parse(saved));
      if (savedSpecs) setSpecs((p: any) => ({ ...p, ...JSON.parse(savedSpecs) }));
    } catch {}
  }, []);

  const [showManual, setShowManual] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    showToast('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const parse = () => {
    try {
      const d = JSON.parse(manualInput);
      setReport(d);

      // Process RAM data
      const ramSticks = d.ram ? (Array.isArray(d.ram) ? d.ram : [d.ram]) : [];
      const totalRamGB = ramSticks.reduce((sum: number, r: any) => sum + Math.round((r.Capacity || 0) / 1073741824), 0);
      const ramSpeed = ramSticks[0]?.Speed || '';
      const ramMfr = ramSticks[0]?.Manufacturer || '';
      const ramInfo = totalRamGB > 0
        ? `${totalRamGB} GB${ramSpeed ? ' @ ' + ramSpeed + ' MHz' : ''}${ramMfr ? ' (' + ramMfr.trim() + ')' : ''}`
        : 'Unknown';

      // Process Motherboard
      const moboMfr = d.mobo?.Manufacturer || '';
      const moboProd = d.mobo?.Product || '';
      const moboInfo = (moboMfr + ' ' + moboProd).trim() || 'Unknown';

      setSpecs((p: any) => ({
        ...p,
        motherboard: moboInfo,
        serial: d.bios?.SerialNumber || "Unknown",
        cpu: d.cpu?.Name || p.cpu,
        gpu: (d.gpu?.Name || p.gpu) + (d.gpu?.DriverVersion ? ' (v' + d.gpu.DriverVersion + ')' : ''),
        os: d.os?.Caption || p.os,
        ram: ramInfo
      }));
      setShowManual(false);
      setManualInput('');
      // Persist to localStorage
      try {
        localStorage.setItem('smartpc_report', JSON.stringify(d));
        localStorage.setItem('smartpc_specs', JSON.stringify({ motherboard: moboInfo, serial: d.bios?.SerialNumber || 'Unknown', cpu: d.cpu?.Name, gpu: (d.gpu?.Name||'') + (d.gpu?.DriverVersion?' (v'+d.gpu.DriverVersion+')':''), os: d.os?.Caption, ram: ramInfo }));
      } catch {}
    } catch { showToast("Format tidak valid. Pastikan paste output JSON yang tepat."); }
  };

  // Single-quoted JS string = no $ escaping issues
  const cmd = '$s=@{cpu=gcim Win32_Processor|select Name,NumberOfLogicalProcessors,MaxClockSpeed;ram=gcim Win32_PhysicalMemory|select Capacity,Speed,Manufacturer;gpu=gcim Win32_VideoController|select Name,DriverVersion,DriverDate;disk=Get-PhysicalDisk -EA SilentlyContinue|select FriendlyName,MediaType,Size,HealthStatus;mobo=gcim Win32_BaseBoard|select Manufacturer,Product;bios=gcim Win32_BIOS|select SerialNumber,SMBIOSBIOSVersion;os=gcim Win32_OperatingSystem|select Caption,Version,BuildNumber,LastBootUpTime;problems=gcim Win32_PnPEntity|where {$_.ConfigManagerErrorCode -ne 0}|select Name;license=Get-CimInstance SoftwareLicensingProduct|where {$_.PartialProductKey}|select Name,LicenseStatus;bsod=(Get-WinEvent System -MaxEvents 500 -EA SilentlyContinue|where {$_.Id -eq 41}|select -First 5 TimeCreated);defender=Get-MpComputerStatus -EA SilentlyContinue|select AntivirusEnabled,RealTimeProtectionEnabled,AntivirusSignatureLastUpdated,FullScanEndTime;errors=(Get-WinEvent System -MaxEvents 200 -EA SilentlyContinue|where {$_.Level -le 2}|select -First 10 TimeCreated,ProviderName);battery=gcim Win32_Battery -EA SilentlyContinue|select EstimatedChargeRemaining,BatteryStatus;uptime=(Get-Date)-(gcim Win32_OperatingSystem).LastBootUpTime|select Days,Hours}; $s|ConvertTo-Json -Depth 3 -Compress';

  const hasProblems = report?.problems?.length > 0;
  const bsodCount = Array.isArray(report?.bsod) ? report.bsod.length : report?.bsod ? 1 : 0;
  const licenseOk = (() => {
    if (!report?.license) return null;
    const l = Array.isArray(report.license) ? report.license[0] : report.license;
    return l?.LicenseStatus === 1;
  })();
  const defenderOk = report?.defender?.AntivirusEnabled && report?.defender?.RealTimeProtectionEnabled;

  const downloadPDF = () => {
    if (!report) return;
    const now = new Date().toLocaleString();
    const arr = (d: any) => d ? (Array.isArray(d) ? d : [d]) : [];
    const check = (ok: boolean | null) => ok === null ? '⚪ N/A' : ok ? '✅ OK' : '❌ ISSUE';
    const disks = arr(report.disk);
    const problems = arr(report.problems);
    const errors = arr(report.errors);
    const volumes = arr(report.volume);
    const networks = arr(report.network);
    const apps = arr(report.apps);
    const startups = arr(report.startup);
    const ramSticks = arr(report.ram);
    const totalRam = ramSticks.reduce((s: number, r: any) => s + Math.round((r.Capacity || 0) / 1073741824), 0);
    const gpu = report.gpu || {};
    const res = gpu.CurrentHorizontalResolution && gpu.CurrentVerticalResolution ? `${gpu.CurrentHorizontalResolution}x${gpu.CurrentVerticalResolution}` : 'N/A';
    const hz = gpu.CurrentRefreshRate ? `${gpu.CurrentRefreshRate} Hz` : 'N/A';

    // Build items
    const items: {label:string;detail:string;status:string}[] = [];
    items.push({ label:'Driver Status', detail: hasProblems?problems.map((p:any)=>p.Name||'?').join(', '):'All OK', status: hasProblems?'error':'pass' });
    items.push({ label:'BSOD', detail: bsodCount>0?`${bsodCount} crash(es)`:'None', status: bsodCount>0?'error':'pass' });
    if (licenseOk!==null) items.push({ label:'Windows License', detail: licenseOk?'Activated':'NOT Activated', status: licenseOk?'pass':'error' });
    if (report.defender) items.push({ label:'Antivirus', detail: defenderOk?'Active':'DISABLED', status: defenderOk?'pass':'error' });
    disks.forEach((d:any) => items.push({ label:`Disk: ${d.FriendlyName||'?'}`, detail:`${d.MediaType||''} ${d.Size?Math.round(d.Size/1073741824)+'GB':''}`, status: d.HealthStatus==='Healthy'?'pass':'error' }));
    volumes.forEach((v:any) => { const pct=v.Size>0?Math.round(v.SizeRemaining/v.Size*100):0; items.push({ label:`Drive ${v.DriveLetter}:`, detail:`${Math.round((v.SizeRemaining||0)/1073741824)}GB free / ${Math.round((v.Size||0)/1073741824)}GB (${pct}%)`, status: pct<10?'error':pct<20?'warn':'pass' }); });
    if (report.uptime) items.push({ label:'Uptime', detail:`${report.uptime.Days||0}d ${report.uptime.Hours||0}h`, status:(report.uptime.Days||0)>7?'warn':'pass' });
    if (report.battery) items.push({ label:'Battery', detail:`${report.battery.EstimatedChargeRemaining||0}%`, status:(report.battery.EstimatedChargeRemaining||0)<15?'warn':'pass' });
    if (errors.length>0) items.push({ label:'System Errors', detail:`${errors.length} event(s)`, status:'warn' });

    const errs = items.filter(i=>i.status==='error');
    const wrns = items.filter(i=>i.status==='warn');
    const pss = items.filter(i=>i.status==='pass');
    const row = (it:{label:string;detail:string;status:string}) => {const c=it.status==='error'?'#991b1b':it.status==='warn'?'#92400e':'#166534';const bg=it.status==='error'?'#fff1f2':it.status==='warn'?'#fffbeb':'#f0fdf4';return `<tr><td style="font-weight:700;color:${c};background:${bg}">${it.label}</td><td style="background:${bg}">${it.detail}</td></tr>`;};

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>SmartPCChecker Report</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',system-ui,sans-serif;color:#1e293b;padding:40px;max-width:850px;margin:auto}
      h1{font-size:24px;margin-bottom:4px}h2{font-size:15px;font-weight:800;color:#0070f3;border-bottom:2px solid #e2e8f0;padding-bottom:6px;margin-bottom:10px}
      .sub{color:#64748b;font-size:13px;margin-bottom:28px}.section{margin-bottom:24px}
      .grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px 20px;font-size:13px}.grid .l{color:#64748b;font-weight:600}.grid .v{font-weight:700}
      table{width:100%;border-collapse:collapse;font-size:13px;margin-top:6px}th,td{text-align:left;padding:6px 10px;border-bottom:1px solid #e2e8f0}th{background:#f8fafc;font-weight:700;color:#475569}
      .badge{display:inline-block;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:700;margin:3px}.ok{background:#f0fdf4;color:#166534}.bad{background:#fff1f2;color:#991b1b}.warn{background:#fffbeb;color:#92400e}.na{background:#f8fafc;color:#94a3b8}
      .footer{margin-top:30px;text-align:center;color:#94a3b8;font-size:11px;border-top:1px solid #e2e8f0;padding-top:12px}
      @media print{body{padding:20px}}
    </style></head><body>
    <h1>🛡️ SmartPCChecker — Full Diagnostic Report</h1>
    <p class="sub">Generated: ${now}</p>

    <div class="section"><h2>📋 System Specifications</h2>
      <div class="grid">
        <span class="l">OS</span><span class="v">${report.os?.Caption||specs.os}</span><span></span>
        <span class="l">CPU</span><span class="v">${report.cpu?.Name||specs.cpu}</span><span class="l">Cores: <b>${report.cpu?.NumberOfLogicalProcessors||'N/A'}</b> | Clock: <b>${report.cpu?.MaxClockSpeed||'N/A'} MHz</b></span>
        <span class="l">RAM</span><span class="v">${totalRam>0?totalRam+' GB':specs.ram}</span><span>${ramSticks.map((r:any)=>`${Math.round((r.Capacity||0)/1073741824)}GB ${r.Speed||''}MHz ${(r.Manufacturer||'').trim()}`).join(' + ')}</span>
        <span class="l">GPU</span><span class="v">${gpu.Name||specs.gpu}</span><span class="l">Driver: <b>${gpu.DriverVersion||'N/A'}</b> | VRAM: <b>${gpu.AdapterRAM?Math.round(gpu.AdapterRAM/1048576)+'MB':'N/A'}</b></span>
        <span class="l">Resolution</span><span class="v">${res}</span><span class="l">Refresh Rate: <b>${hz}</b></span>
        <span class="l">Motherboard</span><span class="v">${specs.motherboard}</span><span class="l">Serial: <b>${specs.serial}</b></span>
        <span class="l">BIOS</span><span class="v">${report.bios?.SMBIOSBIOSVersion||'N/A'}</span><span class="l">Arch: <b>${report.os?.OSArchitecture||'N/A'}</b></span>
      </div>
    </div>

    ${networks.length>0?'<div class="section"><h2>🌐 Network</h2><table><tr><th>Adapter</th><th>Status</th><th>Speed</th></tr>'+networks.map((n:any)=>`<tr><td>${n.Name}</td><td style="color:${n.Status==='Up'?'#166534':'#991b1b'};font-weight:700">${n.Status}</td><td>${n.LinkSpeed||''}</td></tr>`).join('')+'</table></div>':''}

    <div class="section"><h2>🏥 Health Summary</h2>
      <span class="badge ${!hasProblems?'ok':'bad'}">${check(!hasProblems)} Drivers</span>
      <span class="badge ${bsodCount===0?'ok':'bad'}">${check(bsodCount===0)} BSOD</span>
      <span class="badge ${licenseOk===null?'na':licenseOk?'ok':'bad'}">${check(licenseOk)} License</span>
      <span class="badge ${defenderOk?'ok':'bad'}">${check(defenderOk)} Antivirus</span>
      <span class="badge ${disks.every((d:any)=>d.HealthStatus==='Healthy')?'ok':disks.length>0?'bad':'na'}">${check(disks.length>0?disks.every((d:any)=>d.HealthStatus==='Healthy'):null)} Storage</span>
    </div>

    ${errs.length>0?'<div class="section"><h2>❌ Issues ('+errs.length+')</h2><table>'+errs.map(row).join('')+'</table></div>':''}
    ${wrns.length>0?'<div class="section"><h2>⚠️ Warnings ('+wrns.length+')</h2><table>'+wrns.map(row).join('')+'</table></div>':''}
    <div class="section"><h2>✅ Passed (${pss.length})</h2><table>${pss.map(row).join('')}</table></div>

    ${apps.length>0?'<div class="section"><h2>📦 Installed Applications ('+apps.length+')</h2><table><tr><th>Name</th><th>Version</th><th>Publisher</th></tr>'+apps.map((a:any)=>`<tr><td>${a.DisplayName||''}</td><td>${a.DisplayVersion||''}</td><td>${a.Publisher||''}</td></tr>`).join('')+'</table></div>':''}

    ${startups.length>0?'<div class="section"><h2>🚀 Startup Programs ('+startups.length+')</h2><table><tr><th>Name</th><th>Location</th></tr>'+startups.map((s:any)=>`<tr><td>${s.Name||''}</td><td>${s.Location||''}</td></tr>`).join('')+'</table></div>':''}

    <div class="footer">SmartPCChecker.com — Professional PC Diagnostics<br/>This report was generated automatically.</div>
    </body></html>`;

    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500); }
  };

  const cardStyle = (bg: string, border: string): React.CSSProperties => ({
    padding: '24px', backgroundColor: bg, borderRadius: '20px',
    border: `1px solid ${border}`, textAlign: 'left' as const
  });

  const h4Style = (color: string): React.CSSProperties => ({
    fontWeight: 800, color, marginBottom: '12px', display: 'flex',
    alignItems: 'center', gap: '8px', fontSize: '1rem'
  });

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck size={32} color="#0070f3" />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>System Health Analyzer</h2>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {report && <>
            <button onClick={() => {
              const arr = (d: any) => d ? (Array.isArray(d) ? d : [d]) : [];
              const summary = `Analyze my PC diagnostic scan results and give me recommendations:\n\n` +
                `OS: ${report.os?.Caption || specs.os}\n` +
                `CPU: ${report.cpu?.Name || specs.cpu} (${report.cpu?.NumberOfLogicalProcessors || '?'} threads)\n` +
                `RAM: ${specs.ram}\n` +
                `GPU: ${specs.gpu}\n` +
                `Motherboard: ${specs.motherboard}\n` +
                `\nDriver Issues: ${hasProblems ? arr(report.problems).map((p:any)=>p.Name).join(', ') : 'None'}` +
                `\nBSOD Events: ${bsodCount}` +
                `\nWindows License: ${licenseOk === null ? 'Unknown' : licenseOk ? 'Activated' : 'NOT Activated'}` +
                `\nAntivirus: ${defenderOk ? 'Active' : report.defender ? 'DISABLED' : 'Unknown'}` +
                `\nDisks: ${arr(report.disk).map((d:any)=>`${d.FriendlyName||'?'}: ${d.HealthStatus||'?'}`).join(', ') || 'N/A'}` +
                `\nUptime: ${report.uptime ? (report.uptime.Days||0)+'d '+(report.uptime.Hours||0)+'h' : 'N/A'}` +
                `\nSystem Errors: ${arr(report.errors).length} event(s)` +
                `\n\nPlease analyze these results, identify any problems, and provide specific recommendations to fix or improve my PC.`;
              const msgs = [
                { role: 'assistant', content: "Hello! I'm SmartPCChecker AI. I've received your diagnostic scan results. Let me analyze them..." },
                { role: 'user', content: summary }
              ];
              localStorage.setItem('smartpcchecker_chat_session', JSON.stringify(msgs));
              router.push('/ask-ai');
            }} style={{ padding: '10px 20px', borderRadius: '12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '8px' }}><Bot size={16} /> AI Analysis</button>
            <button onClick={downloadPDF} style={{ padding: '10px 20px', borderRadius: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}><Download size={16} /> Download PDF</button>
            <button onClick={() => { setReport(null); try { localStorage.removeItem('smartpc_report'); localStorage.removeItem('smartpc_specs'); } catch {} }} style={{ padding: '10px 20px', borderRadius: '12px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', color: '#991b1b' }}>Clear Report</button>
          </>}
          <button onClick={() => setShowManual(!showManual)} style={{ padding: '10px 20px', borderRadius: '12px', backgroundColor: showManual ? '#f1f5f9' : '#0070f3', border: 'none', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', color: showManual ? '#475569' : '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {showManual ? <RotateCcw size={16} /> : <Zap size={16} />}
            {showManual ? 'Close' : 'AI Pro Deep Scan'}
          </button>
        </div>
      </div>

      {/* Manual Scan Panel */}
      {showManual && (
        <div style={{ marginBottom: '40px', padding: '40px', backgroundColor: '#fff', borderRadius: '32px', color: '#1e293b', textAlign: 'left', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ padding: '10px', backgroundColor: '#eff6ff', borderRadius: '14px' }}><Zap size={24} color="#0070f3" /></div>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '4px' }}>AI Pro Deep Scan</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b' }}>BSOD, driver issues, license, antivirus, disk health & more.</p>
            </div>
          </div>

          <div style={{ padding: '28px', backgroundColor: '#f0fdf4', borderRadius: '20px', border: '1px solid #bbf7d0', textAlign: 'center', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '12px', right: '12px', padding: '4px 10px', backgroundColor: '#111', color: '#fff', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.5px' }}>WINDOWS ONLY</div>
            <h4 style={{ fontWeight: 800, marginBottom: '8px', color: '#1e293b', fontSize: '1.1rem' }}>Step 1: Download & Run Scanner</h4>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '20px', lineHeight: '1.6' }}>Download the file below, then right-click → <strong>Run as Administrator</strong>.<br/>The result will open automatically in Notepad.</p>
            <a href="/SmartPCChecker.bat" download style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 28px', backgroundColor: '#166534', color: '#fff', borderRadius: '14px', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(22,101,52,0.2)' }}>
              <Download size={20} /> Download SmartPCChecker.bat
            </a>
            <p style={{ marginTop: '16px', fontSize: '0.75rem', color: '#64748b' }}>*This tool uses PowerShell and is designed exclusively for Windows OS.</p>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#475569', marginBottom: '12px' }}>2. Paste result below</label>
            <textarea value={manualInput} onChange={(e) => setManualInput(e.target.value)} placeholder="Paste the JSON output here..." style={{ width: '100%', height: '160px', padding: '20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', color: '#1e293b', fontSize: '0.95rem', outline: 'none', resize: 'none', fontFamily: 'monospace', marginBottom: '24px' }} />
            <button onClick={parse} style={{ width: '100%', padding: '20px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,112,243,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <ShieldCheck size={20} /> Generate Full Diagnostic Report
            </button>
          </div>
        </div>
      )}

      {/* === FULL REPORT === */}
      {report && (() => {
        const arr = (d: any) => d ? (Array.isArray(d) ? d : [d]) : [];
        const diskOk = arr(report.disk).length > 0 && arr(report.disk).every((d: any) => d.HealthStatus === 'Healthy');
        const uptimeWarn = (report.uptime?.Days || 0) > 7;
        const ramSticks = arr(report.ram);
        const totalRam = ramSticks.reduce((s: number, r: any) => s + Math.round((r.Capacity || 0) / 1073741824), 0);
        const gpu = report.gpu || {};
        const resText = gpu.CurrentHorizontalResolution && gpu.CurrentVerticalResolution ? `${gpu.CurrentHorizontalResolution}x${gpu.CurrentVerticalResolution}` : '';
        const fpsText = gpu.CurrentRefreshRate ? `${gpu.CurrentRefreshRate} Hz` : '';

        const items: {label:string; detail:string; status:'pass'|'warn'|'error'}[] = [];
        // Drivers
        items.push({ label: 'Driver Status', detail: hasProblems ? arr(report.problems).map((p:any)=>p.Name||'Unknown').join(', ') : 'All drivers functioning correctly', status: hasProblems ? 'error' : 'pass' });
        // BSOD
        items.push({ label: 'Blue Screen (BSOD)', detail: bsodCount > 0 ? `${bsodCount} crash(es): ${arr(report.bsod).map((b:any)=>b.TimeCreated?new Date(b.TimeCreated).toLocaleDateString():'?').join(', ')}` : 'No crashes detected', status: bsodCount > 0 ? 'error' : 'pass' });
        // License
        if (licenseOk !== null) items.push({ label: 'Windows License', detail: licenseOk ? 'Genuine & Activated' : 'NOT Activated!', status: licenseOk ? 'pass' : 'error' });
        // Antivirus
        if (report.defender) items.push({ label: 'Antivirus (Defender)', detail: defenderOk ? `Active, signatures: ${report.defender.AntivirusSignatureLastUpdated?new Date(report.defender.AntivirusSignatureLastUpdated).toLocaleDateString():'N/A'}` : 'DISABLED!', status: defenderOk ? 'pass' : 'error' });
        // Storage
        arr(report.disk).forEach((d:any) => items.push({ label: `Disk: ${d.FriendlyName||'Unknown'}`, detail: `${d.MediaType||'N/A'} • ${d.Size?Math.round(d.Size/1073741824)+'GB':'?'} • ${d.BusType||''}`, status: d.HealthStatus==='Healthy'?'pass':'error' }));
        // Volumes
        arr(report.volume).forEach((v:any) => { const pct = v.Size>0?Math.round(v.SizeRemaining/v.Size*100):0; items.push({ label: `Drive ${v.DriveLetter}: (${v.FileSystemLabel||v.FileSystem||''})`, detail: `${Math.round((v.SizeRemaining||0)/1073741824)} GB free of ${Math.round((v.Size||0)/1073741824)} GB (${pct}%)`, status: pct<10?'error':pct<20?'warn':'pass' }); });
        // Uptime
        if (report.uptime) items.push({ label: 'System Uptime', detail: `${report.uptime.Days||0}d ${report.uptime.Hours||0}h ${report.uptime.Minutes||0}m`, status: uptimeWarn ? 'warn' : 'pass' });
        // Battery
        if (report.battery) items.push({ label: 'Battery', detail: `${report.battery.EstimatedChargeRemaining||0}% — ${report.battery.BatteryStatus===2?'Charging':'On Battery'}`, status: (report.battery.EstimatedChargeRemaining||0)<15?'warn':'pass' });
        // Errors
        if (arr(report.errors).length > 0) items.push({ label: 'Critical System Errors', detail: `${arr(report.errors).length} event(s) — ${arr(report.errors).map((e:any)=>e.ProviderName||'System').filter((v:string,i:number,a:string[])=>a.indexOf(v)===i).join(', ')}`, status: 'warn' });

        const errors = items.filter(i=>i.status==='error');
        const warns = items.filter(i=>i.status==='warn');
        const passes = items.filter(i=>i.status==='pass');
        const styles = { error: { bg:'#fff1f2',border:'#fecdd3',color:'#991b1b',icon:'❌' }, warn: { bg:'#fffbeb',border:'#fde68a',color:'#92400e',icon:'⚠️' }, pass: { bg:'#f0fdf4',border:'#bbf7d0',color:'#166534',icon:'✅' } };

        return (
        <div style={{ marginBottom: '32px' }}>
          {/* SPECS AT TOP */}
          <div style={{ ...cardStyle('#fff','#e2e8f0'), marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0070f3', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Cpu size={20} /> Full System Specifications</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '16px', fontSize: '0.9rem' }}>
              {[
                ['OS', report.os?.Caption||specs.os],
                ['CPU', report.cpu?.Name||specs.cpu],
                ['Cores / Threads', report.cpu?.NumberOfLogicalProcessors||'N/A'],
                ['CPU Clock', report.cpu?.MaxClockSpeed?report.cpu.MaxClockSpeed+' MHz':'N/A'],
                ['RAM', totalRam>0?`${totalRam} GB (${ramSticks.map((r:any)=>`${Math.round((r.Capacity||0)/1073741824)}GB ${r.Speed||''}MHz ${(r.Manufacturer||'').trim()}`).join(' + ')})`:'Unknown'],
                ['GPU', gpu.Name||specs.gpu],
                ['GPU Driver', gpu.DriverVersion||'N/A'],
                ['GPU VRAM', gpu.AdapterRAM?Math.round(gpu.AdapterRAM/1048576)+' MB':'N/A'],
                ['Resolution', resText||specs.screen],
                ['Refresh Rate', fpsText||'N/A'],
                ['Motherboard', specs.motherboard],
                ['Serial Number', specs.serial],
                ['BIOS', report.bios?.SMBIOSBIOSVersion||'N/A'],
                ['Architecture', report.os?.OSArchitecture||'N/A'],
              ].map(([label, value], i) => (
                <div key={i}><div style={{ color: '#64748b', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>{label}</div><div style={{ fontWeight: 700, color: '#1e293b' }}>{value}</div></div>
              ))}
            </div>
          </div>

          {/* Network */}
          {report.network && (
            <div style={{ ...cardStyle('#fff','#e2e8f0'), marginBottom: '20px' }}>
              <h4 style={h4Style('#1e293b')}><Wifi size={18} /> Network Adapters</h4>
              <div style={{ display: 'grid', gap: '8px' }}>
                {arr(report.network).map((n:any,i:number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', backgroundColor: '#f8fafc', borderRadius: '12px', fontSize: '0.9rem' }}>
                    <span style={{ fontWeight: 600 }}>{n.Name}</span>
                    <span style={{ color: n.Status==='Up'?'#166534':'#991b1b', fontWeight: 700 }}>{n.Status} {n.LinkSpeed?`• ${n.LinkSpeed}`:''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HEALTH STATUS */}
          <div style={{ ...cardStyle('#fff','#e2e8f0'), marginBottom: '20px', textAlign: 'center' as const }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>Health Status</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <StatusBadge label="Drivers" ok={!hasProblems} />
              <StatusBadge label="BSOD" ok={bsodCount === 0} count={bsodCount} />
              <StatusBadge label="License" ok={licenseOk} />
              <StatusBadge label="Antivirus" ok={defenderOk} />
              <StatusBadge label="Storage" ok={arr(report.disk).length>0?diskOk:null} />
            </div>
          </div>

          {/* ERROR GROUP */}
          {errors.length > 0 && <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#991b1b', marginBottom: '12px' }}>❌ Issues Found ({errors.length})</h4>
            {errors.map((item,i) => <div key={i} style={{ padding: '16px 20px', backgroundColor: styles.error.bg, border: `1px solid ${styles.error.border}`, borderRadius: '16px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}><div><div style={{ fontWeight: 700, color: styles.error.color, marginBottom: '4px' }}>{item.label}</div><div style={{ fontSize: '0.85rem', color: '#64748b' }}>{item.detail}</div></div></div>)}
          </div>}

          {/* WARN GROUP */}
          {warns.length > 0 && <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#92400e', marginBottom: '12px' }}>⚠️ Warnings ({warns.length})</h4>
            {warns.map((item,i) => <div key={i} style={{ padding: '16px 20px', backgroundColor: styles.warn.bg, border: `1px solid ${styles.warn.border}`, borderRadius: '16px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}><div><div style={{ fontWeight: 700, color: styles.warn.color, marginBottom: '4px' }}>{item.label}</div><div style={{ fontSize: '0.85rem', color: '#64748b' }}>{item.detail}</div></div></div>)}
          </div>}

          {/* PASS GROUP */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#166534', marginBottom: '12px' }}>✅ Passed ({passes.length})</h4>
            {passes.map((item,i) => <div key={i} style={{ padding: '16px 20px', backgroundColor: styles.pass.bg, border: `1px solid ${styles.pass.border}`, borderRadius: '16px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}><div><div style={{ fontWeight: 700, color: styles.pass.color, marginBottom: '4px' }}>{item.label}</div><div style={{ fontSize: '0.85rem', color: '#64748b' }}>{item.detail}</div></div></div>)}
          </div>

          {/* INSTALLED APPS */}
          {report.apps && <details style={{ marginBottom: '20px' }}>
            <summary style={{ ...cardStyle('#fff','#e2e8f0'), cursor: 'pointer', fontWeight: 800, fontSize: '1rem' }}>📦 Installed Applications ({arr(report.apps).length})</summary>
            <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '0 0 16px 16px', border: '1px solid #e2e8f0', borderTop: 'none', maxHeight: '400px', overflowY: 'auto' }}>
              {arr(report.apps).map((app:any,i:number) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 600 }}>{app.DisplayName}</span>
                  <span style={{ color: '#94a3b8' }}>{app.DisplayVersion||''} {app.Publisher?`• ${app.Publisher}`:''}</span>
                </div>
              ))}
            </div>
          </details>}

          {/* STARTUP PROGRAMS */}
          {report.startup && <details style={{ marginBottom: '20px' }}>
            <summary style={{ ...cardStyle('#fff','#e2e8f0'), cursor: 'pointer', fontWeight: 800, fontSize: '1rem' }}>🚀 Startup Programs ({arr(report.startup).length})</summary>
            <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '0 0 16px 16px', border: '1px solid #e2e8f0', borderTop: 'none' }}>
              {arr(report.startup).map((s:any,i:number) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 600 }}>{s.Name}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{s.Location} • {s.Command}</div>
                </div>
              ))}
            </div>
          </details>}
        </div>);
      })()}

      {/* Basic Spec Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <SpecCard icon={<Layout size={20} color="#0070f3" />} label="Operating System" value={specs.os} />
        <SpecCard icon={<Monitor size={20} color="#0070f3" />} label="Motherboard" value={specs.motherboard} />
        <SpecCard icon={<HardDrive size={20} color="#0070f3" />} label="System Serial" value={specs.serial} />
        <SpecCard icon={<Monitor size={20} color="#0070f3" />} label="Graphics (GPU)" value={specs.gpu} />
        <SpecCard icon={<Cpu size={20} color="#0070f3" />} label="Processor (CPU)" value={specs.cpu} />
        <SpecCard icon={<HardDrive size={20} color="#0070f3" />} label="Memory (RAM)" value={specs.ram} />
      </div>

      <div style={{ marginTop: '32px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', gap: '12px', textAlign: 'left' }}>
        <Info size={20} color="#64748b" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6' }}>
          <strong>Privacy Note:</strong> Detailed hardware identifiers like Motherboard models or specific Laptop brands are restricted by browser security policies to prevent device fingerprinting. For a deeper analysis, consider using native diagnostic tools.
        </p>
      </div>

      {/* Toast Notification */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        backgroundColor: '#1e293b',
        color: '#fff',
        padding: '12px 24px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        fontWeight: 600,
        fontSize: '0.9rem',
        transform: toastMessage ? 'translateY(0)' : 'translateY(100px)',
        opacity: toastMessage ? 1 : 0,
        pointerEvents: toastMessage ? 'auto' : 'none',
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        zIndex: 9999
      }}>
        {toastMessage}
      </div>
    </div>
  );
}

function StatusBadge({ label, ok, count }: { label: string; ok: boolean | null; count?: number }) {
  const color = ok === null ? '#94a3b8' : ok ? '#22c55e' : '#ef4444';
  const bg = ok === null ? '#f8fafc' : ok ? '#f0fdf4' : '#fff1f2';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: bg, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {ok === null ? <Shield size={20} color={color} /> : ok ? <CheckCircle2 size={20} color={color} /> : <AlertCircle size={20} color={color} />}
      </div>
      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>{label}</span>
      {count !== undefined && count > 0 && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700 }}>{count}x</span>}
    </div>
  );
}

function SpecCard({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'default' }}>
      <div style={{ width: '48px', height: '48px', backgroundColor: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{value}</div>
      </div>
    </div>
  );
}
