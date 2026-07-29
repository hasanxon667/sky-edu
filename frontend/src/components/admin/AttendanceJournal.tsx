import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { exportToPDF, exportToExcel, exportToCSV } from '../../services/reportExport';
import { Search, Filter, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, FileText, FileSpreadsheet, Download } from 'lucide-react';

export const AttendanceJournal: React.FC = () => {
  const { records } = useAttendance();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ON_TIME' | 'LATE'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filtered = records.filter((r) => {
    const matchSearch =
      r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.userPosition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const inputStyle: React.CSSProperties = {
    height: 40, padding: '0 12px 0 36px', borderRadius: 10, fontSize: 13, fontWeight: 500,
    background: 'var(--bg)', border: '1.5px solid var(--surface-border)',
    color: 'var(--text)', outline: 'none', width: '100%',
  };

  const exportBtnStyle = (color: string, bg: string, border: string): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
    borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${border}`,
    background: bg, color: color, transition: 'all 0.15s',
  });

  return (
    <div style={{ padding: '20px 16px 100px', maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>Davomat Jurnali</h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Xodimlarning keldi-ketdi vaqtlari va kechikishlari
          </p>
        </div>
        {/* Export buttons */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => exportToPDF(filtered)} style={exportBtnStyle('#f43f5e', 'rgba(244,63,94,0.1)', 'rgba(244,63,94,0.25)')}>
            <FileText size={14} /><span>PDF</span>
          </button>
          <button onClick={() => exportToExcel(filtered)} style={exportBtnStyle('#10b981', 'rgba(16,185,129,0.1)', 'rgba(16,185,129,0.25)')}>
            <FileSpreadsheet size={14} /><span>Excel</span>
          </button>
          <button onClick={() => exportToCSV(filtered)} style={exportBtnStyle('#3b82f6', 'rgba(59,130,246,0.1)', 'rgba(59,130,246,0.25)')}>
            <Download size={14} /><span>CSV</span>
          </button>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="sky-card" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: '12px 14px' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 0 }}>
          <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="F.I.O yoki lavozim..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={inputStyle}
          />
        </div>
        <div style={{ position: 'relative', flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
            style={{ ...inputStyle, padding: '0 12px', width: 'auto', minWidth: 160, paddingLeft: 12 }}
          >
            <option value="ALL">Barcha holatlar</option>
            <option value="ON_TIME">O'z vaqtida</option>
            <option value="LATE">Kechikkanlar</option>
          </select>
        </div>
      </div>

      {/* Mobile: Cards */}
      <div className="sm:hidden" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {paginated.length === 0 ? (
          <div className="sky-card" style={{ alignItems: 'center', padding: '40px 20px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Ma'lumot topilmadi</p>
          </div>
        ) : paginated.map((r) => (
          <div key={r.id} className="sky-card" style={{ gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <img src={r.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                  alt={r.userName} style={{ width: 40, height: 40, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.userName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.userPosition}</div>
                </div>
              </div>
              <span className={`sky-badge ${r.status === 'LATE' ? 'sky-badge-amber' : 'sky-badge-green'}`} style={{ flexShrink: 0 }}>
                {r.status === 'LATE' ? 'Kechikkan' : 'Vaqtida'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', borderTop: '1px solid var(--surface-border)', paddingTop: 10 }}>
              {[
                ['Sana', r.date],
                ['Ishlagan', r.workHours ? `${r.workHours} soat` : '–'],
                ['Kelgan', r.checkInTime || '–'],
                ['Ketgan', r.checkOutTime || '–'],
              ].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: 'monospace' }}>{val}</div>
                </div>
              ))}
            </div>
            {r.minutesLate > 0 && (
              <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>⚠ Kechikish: {r.minutesLate} daqiqa</div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop: Table */}
      <div className="hidden sm:block sky-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)', background: 'rgba(0,0,0,0.03)' }} className="dark:bg-white/3">
                {['#', 'Xodim', 'Sana', 'Kelgan', 'Ketgan', 'Ishlagan', 'Kechikish', 'Holat'].map((h) => (
                  <th key={h} style={{
                    padding: '12px 14px', textAlign: h === 'Holat' ? 'right' : 'left',
                    fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>Ma'lumot topilmadi</td></tr>
              ) : paginated.map((r, idx) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--surface-border)', transition: 'background 0.1s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.025)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: 12 }}>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img src={r.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                        alt={r.userName} style={{ width: 32, height: 32, borderRadius: 9, objectFit: 'cover', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text)' }}>{r.userName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.userPosition}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: 12 }}>{r.date}</td>
                  <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--text)' }}>{r.checkInTime || '–'}</td>
                  <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--text)' }}>{r.checkOutTime || '–'}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{r.workHours ? `${r.workHours} soat` : '–'}</td>
                  <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 600, color: r.minutesLate > 0 ? '#f59e0b' : 'var(--text-muted)' }}>
                    {r.minutesLate > 0 ? `${r.minutesLate} daq` : '0'}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <span className={`sky-badge ${r.status === 'LATE' ? 'sky-badge-amber' : 'sky-badge-green'}`}>
                      {r.status === 'LATE' ? <><AlertTriangle size={11} /> Kechikkan</> : <><CheckCircle2 size={11} /> Vaqtida</>}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="sky-card" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {filtered.length} ta yozuvdan {Math.min((currentPage - 1) * itemsPerPage + 1, filtered.length)}–{Math.min(currentPage * itemsPerPage, filtered.length)}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            style={{
              width: 32, height: 32, borderRadius: 9, border: '1.5px solid var(--surface-border)',
              background: 'var(--bg)', cursor: currentPage === 1 ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', opacity: currentPage === 1 ? 0.4 : 1,
            }}
          ><ChevronLeft size={16} /></button>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', minWidth: 60, textAlign: 'center' }}>
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            style={{
              width: 32, height: 32, borderRadius: 9, border: '1.5px solid var(--surface-border)',
              background: 'var(--bg)', cursor: currentPage === totalPages ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', opacity: currentPage === totalPages ? 0.4 : 1,
            }}
          ><ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  );
};
