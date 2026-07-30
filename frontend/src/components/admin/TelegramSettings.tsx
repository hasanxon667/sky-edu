import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { Send, CheckCircle2, AlertCircle, Bot, Save } from 'lucide-react';

export const TelegramSettings: React.FC = () => {
  const { telegramConfig, updateTelegramConfig, sendTelegramTest } = useAttendance();
  const [formData, setFormData] = useState(telegramConfig);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTelegramConfig(formData);
    setTestResult({ success: true, msg: 'Sozlamalar muvaffaqiyatli saqlandi!' });
  };

  const handleTest = async () => {
    setIsSending(true);
    setTestResult(null);
    const res = await (sendTelegramTest as any)('✅ Test bildirishnomasi: Skyline Education davomat tizimi faol ishlamoqda!', formData);
    setIsSending(false);
    if (typeof res === 'object' && res !== null) {
      setTestResult({ success: res.success, msg: res.message });
    } else {
      setTestResult({ success: !!res, msg: res ? '✅ Test xabari Telegram guruhiga muvaffaqiyatli yuborildi!' : '⚠️ Telegram API xatoligi: Bot token yoki Chat ID ni tekshiring.' });
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 44, padding: '0 14px', fontSize: 13, fontWeight: 500,
    background: 'rgba(0,0,0,0.04)', border: '1.5px solid var(--surface-border)',
    borderRadius: 12, color: 'var(--text)', outline: 'none', fontFamily: 'monospace',
  };

  return (
    <div className="sky-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Bot size={20} color="#3b82f6" />
        </div>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Telegram Bildirishnomalari</h3>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, marginTop: 2 }}>Davomat vaqtida guruhga avtomatik xabar yuborish</p>
        </div>
      </div>

      {testResult && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', borderRadius: 14,
          background: testResult.success ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
          border: `1px solid ${testResult.success ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}`,
          color: testResult.success ? '#10b981' : '#f43f5e',
          fontSize: 12, fontWeight: 600, lineHeight: 1.5,
        }}>
          {testResult.success ? <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: 1 }} /> : <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />}
          <span>{testResult.msg}</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { label: 'Bot Token', key: 'botToken', placeholder: '123456789:ABCdefGHIjklMNOpqrsTUVwxyZ' },
          { label: 'Telegram Chat ID (Guruh)', key: 'chatId', placeholder: '-100123456789' },
        ].map(({ label, key, placeholder }) => (
          <div key={key}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {label}
            </label>
            <input type="text" placeholder={placeholder}
              value={(formData as any)[key]}
              onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
              style={inputStyle} />
          </div>
        ))}

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
          <div
            onClick={() => setFormData((prev) => ({ ...prev, enabled: !prev.enabled }))}
            style={{
              width: 46, height: 26, borderRadius: 99,
              background: formData.enabled ? '#3b82f6' : 'rgba(148,163,184,0.3)',
              position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0,
            }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: '50%', background: '#fff',
              position: 'absolute', top: 3,
              left: formData.enabled ? 22 : 3,
              transition: 'left 0.2s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }} />
          </div>
          Telegram bildirishnomalarini yoqish
        </label>

        <div style={{ display: 'flex', gap: 10, paddingTop: 6, borderTop: '1px solid var(--surface-border)' }}>
          <button type="submit" style={{
            flex: 1, height: 42, borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
          }}>
            <Save size={15} /><span>Saqlash</span>
          </button>
          <button type="button" onClick={handleTest} disabled={isSending} style={{
            flex: 1, height: 42, borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none',
            background: isSending ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.9)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            boxShadow: '0 4px 14px rgba(16,185,129,0.25)',
          }}>
            <Send size={15} /><span>{isSending ? 'Yuborilmoqda...' : 'Test yuborish'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
