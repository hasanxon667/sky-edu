import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { User } from '../../types';
import { UserPlus, Edit3, Trash2, Search, Phone, Calendar, X, Check, Eye, EyeOff, Lock } from 'lucide-react';
import { formatUzPhone } from '../../utils/phoneUtils';

export const EmployeeManagement: React.FC = () => {
  const { usersList, addUser, updateUser, deleteUser, toggleUserStatus } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Map to toggle password visibility per user ID
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (id: string) => {
    setShowPasswordMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const [formData, setFormData] = useState<{
    name: string; phone: string; position: string; startDate: string; password: string;
    role: 'EMPLOYEE' | 'ADMIN'; status: 'ACTIVE' | 'INACTIVE'; profileImage: string;
  }>({
    name: '', phone: '+9989', position: 'Support Teacher', startDate: new Date().toISOString().split('T')[0], password: '',
    role: 'EMPLOYEE', status: 'ACTIVE',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  });

  const employeesOnly = usersList.filter((u) => u.role === 'EMPLOYEE');
  const filtered = employeesOnly.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone.includes(searchTerm)
  );

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: '', phone: '+9989', position: 'Support Teacher',
      startDate: new Date().toISOString().split('T')[0], password: '',
      role: 'EMPLOYEE', status: 'ACTIVE',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setFormData({
      name: u.name, phone: u.phone, position: u.position,
      startDate: u.startDate, password: u.password || '',
      role: u.role, status: u.status, profileImage: u.profileImage || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser({ ...editingUser, ...formData });
    } else {
      addUser(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu xodimni o\'chirmoqchimisiz?')) deleteUser(id);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 44, padding: '0 14px', fontSize: 13, fontWeight: 500,
    background: 'rgba(0,0,0,0.05)', border: '1.5px solid var(--surface-border)',
    borderRadius: 12, color: 'var(--text)', outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, display: 'block',
    textTransform: 'uppercase', letterSpacing: '0.06em',
  };

  return (
    <div style={{ padding: '20px 16px 100px', maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>Xodimlar</h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{employeesOnly.length} ta xodim ro'yxatda</p>
        </div>
        <button
          onClick={openAddModal}
          style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 12,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
          }}
        >
          <UserPlus size={16} />
          <span>Xodim qo'shish</span>
        </button>
      </div>

      {/* Search */}
      <div className="sky-card" style={{ flexDirection: 'row', padding: '10px 14px', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Ism, lavozim yoki telefon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 36 }}
          />
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 14 }}>
        {filtered.length === 0 ? (
          <div className="sky-card" style={{ gridColumn: '1/-1', alignItems: 'center', padding: '48px 20px', textAlign: 'center' }}>
            <Search size={32} color="var(--text-muted)" />
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 12, fontWeight: 600 }}>Xodim topilmadi</p>
          </div>
        ) : filtered.map((emp) => (
          <div key={emp.id} className="sky-card" style={{ padding: '16px', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img
                src={emp.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                alt={emp.name}
                style={{ width: 48, height: 48, borderRadius: 14, objectFit: 'cover', flexShrink: 0, border: '2px solid var(--surface-border)' }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>{emp.position}</div>
              </div>
              <span className={`sky-badge ${emp.status === 'ACTIVE' ? 'sky-badge-green' : 'sky-badge-rose'}`} style={{ flexShrink: 0 }}>
                {emp.status === 'ACTIVE' ? 'Faol' : 'Nofaol'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid var(--surface-border)', paddingTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                <Phone size={13} color="#3b82f6" />
                <span style={{ fontFamily: 'monospace', color: 'var(--text)', fontWeight: 600 }}>{emp.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Lock size={13} color="#f59e0b" />
                  <span style={{ fontFamily: 'monospace', color: showPasswordMap[emp.id] ? '#f59e0b' : 'var(--text)', fontWeight: 700 }}>
                    {showPasswordMap[emp.id] ? (emp.password || 'Mavjud emas') : '••••••••'}
                  </span>
                </div>
                <button
                  onClick={() => togglePasswordVisibility(emp.id)}
                  title={showPasswordMap[emp.id] ? "Parolni berkitish" : "Parolni ko'rish"}
                  style={{
                    background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
                    borderRadius: 8, padding: '3px 8px', cursor: 'pointer',
                    color: '#f59e0b', fontSize: 11, fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  {showPasswordMap[emp.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{showPasswordMap[emp.id] ? 'Yashirish' : 'Ko\'rish'}</span>
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                <Calendar size={13} color="#6366f1" />
                <span>{emp.startDate} dan beri</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--surface-border)', paddingTop: 10 }}>
              <button
                onClick={() => toggleUserStatus(emp.id)}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 10, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer',
                  background: emp.status === 'ACTIVE' ? 'rgba(244,63,94,0.1)' : 'rgba(16,185,129,0.1)',
                  color: emp.status === 'ACTIVE' ? '#f43f5e' : '#10b981',
                  transition: 'all 0.15s',
                }}
              >
                {emp.status === 'ACTIVE' ? 'O\'chirish' : 'Faollashtirish'}
              </button>
              <button
                onClick={() => openEditModal(emp)}
                style={{
                  width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: 'rgba(99,102,241,0.1)', color: '#6366f1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Edit3 size={15} />
              </button>
              <button
                onClick={() => handleDelete(emp.id)}
                style={{
                  width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: 'rgba(244,63,94,0.1)', color: '#f43f5e',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
        >
          <div style={{
            width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto',
            background: 'var(--surface)', border: '1px solid var(--surface-border)',
            borderRadius: 24, padding: 24,
            display: 'flex', flexDirection: 'column', gap: 16,
            boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                {editingUser ? 'Xodimni tahrirlash' : 'Yangi xodim qo\'shish'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  width: 34, height: 34, borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: 'rgba(0,0,0,0.07)', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              ><X size={17} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'To\'liq ism *', key: 'name', type: 'text', placeholder: 'Abdullayev Sarvar' },
                { label: 'Telefon *', key: 'phone', type: 'text', placeholder: '+998901234567' },
                { label: 'Lavozim *', key: 'position', type: 'text', placeholder: 'Support Teacher' },
                { label: 'Ish boshlanish vaqti *', key: 'workStartTime', type: 'time', placeholder: '09:00' },
                { label: 'Parol *', key: 'password', type: 'text', placeholder: 'Xodim paroli' },
                { label: 'Ishga kirgan sana', key: 'startDate', type: 'date', placeholder: '' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <input
                    type={type}
                    required={key !== 'profileImage' && key !== 'startDate'}
                    placeholder={placeholder}
                    value={(formData as any)[key]}
                    onChange={(e) => {
                      const val = key === 'phone' ? formatUzPhone(e.target.value) : e.target.value;
                      setFormData((prev) => ({ ...prev, [key]: val }));
                    }}
                    style={inputStyle}
                  />
                </div>
              ))}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Rol / Turi</label>
                  <select
                    value={formData.position === 'Support Teacher' ? 'SUPPORT' : 'EMPLOYEE'}
                    onChange={(e) => {
                      if (e.target.value === 'SUPPORT') {
                        setFormData((prev) => ({ ...prev, role: 'EMPLOYEE', position: 'Support Teacher' }));
                      } else {
                        setFormData((prev) => ({ ...prev, role: 'EMPLOYEE', position: prev.position === 'Support Teacher' ? 'O\'qituvchi' : prev.position }));
                      }
                    }}
                    style={inputStyle}
                  >
                    <option value="EMPLOYEE">Xodim (O'qituvchi)</option>
                    <option value="SUPPORT">Support Teacher (Yordamchi)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Holat</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as any }))}
                    style={inputStyle}
                  >
                    <option value="ACTIVE">Faol</option>
                    <option value="INACTIVE">Nofaol</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    flex: 1, height: 44, borderRadius: 12, border: '1.5px solid var(--surface-border)',
                    background: 'transparent', color: 'var(--text-muted)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}
                >Bekor qilish</button>
                <button
                  type="submit"
                  style={{
                    flex: 2, height: 44, borderRadius: 12, border: 'none',
                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                    color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                  }}
                >
                  <Check size={16} />
                  {editingUser ? 'Saqlash' : 'Qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
