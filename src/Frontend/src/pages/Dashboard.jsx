import React, { useState, useEffect } from 'react';
import { useTravelPlan } from '../context/TravelPlanContext';
import { useAuth } from '../context/AuthContext';
import PlanCard from '../components/PlanCard';
import Modal from '../components/Modal';
import { Plus, Users, Compass, Shield, UserX, Calendar } from 'lucide-react';

export const Dashboard = ({ onSelectPlan }) => {
  const { plans, loading, fetchPlans, createPlan, deletePlan, authService } = useTravelPlan();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('plans'); // 'plans' or 'admin'
  const [usersList, setUsersList] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Travel plan form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState('');
  const [formBudget, setFormBudget] = useState('0');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (activeTab === 'admin' && user?.isAdmin()) {
      loadAdminUsers();
    }
  }, [activeTab]);

  const loadAdminUsers = async () => {
    setAdminLoading(true);
    try {
      const uList = await authService.getUsers();
      setUsersList(uList);
    } catch (err) {
      alert(err.message);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormName('');
    setFormDesc('');
    setFormStart('');
    setFormEnd('');
    setFormBudget('0');
    setFormNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim()) {
      setFormError('Naziv putovanja je obavezan.');
      return;
    }

    if (new Date(formEnd) < new Date(formStart)) {
      setFormError('Krajnji datum ne može biti pre početnog datuma.');
      return;
    }

    const budgetVal = parseFloat(formBudget) || 0;
    if (budgetVal < 0) {
      setFormError('Budžet ne može biti negativan.');
      return;
    }

    const planPayload = {
      name: formName.trim(),
      description: formDesc.trim(),
      startDate: new Date(formStart),
      endDate: new Date(formEnd),
      budget: budgetVal,
      notes: formNotes.trim()
    };

    try {
      await createPlan(planPayload);
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Da li ste sigurni da želite obrisati ovog korisnika i sve njegove podatke?')) return;
    try {
      await authService.deleteUser(userId);
      setUsersList(prev => prev.filter(u => u.id !== userId));
      // Refresh plans since user deleted their plans cascadingly
      fetchPlans();
    } catch (err) {
      alert(err.message);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Dobro jutro';
    if (hour < 18) return 'Dobar dan';
    return 'Dobro veče';
  };

  return (
    <div style={styles.container} className="animate-fade">
      {/* Tabbed view if admin */}
      {user?.isAdmin() && (
        <div className="tabs-container" style={{ marginBottom: '24px' }}>
          <button 
            className={`tab-btn ${activeTab === 'plans' ? 'active' : ''}`}
            onClick={() => setActiveTab('plans')}
          >
            <Compass size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Sva putovanja ({plans.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            <Shield size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Administracija korisnika
          </button>
        </div>
      )}

      {activeTab === 'plans' ? (
        <>
          <div style={styles.header}>
            <div>
              <h2 style={styles.title}>
                {user?.isAdmin() ? 'Svi planovi putovanja u sistemu' : `${getGreeting()}, ${user?.name || 'putnik'}!`}
              </h2>
              <p style={styles.subtitle}>
                {user?.isAdmin() 
                  ? 'Kao administrator možete pregledati i brisati planove svih registrovanih korisnika.' 
                  : 'Organizujte svoje rute, budžete, packing liste i podelite planove sa prijateljima.'}
              </p>
            </div>

            <button className="btn btn-primary" onClick={handleOpenAdd}>
              <Plus size={18} />
              Novi plan
            </button>
          </div>

          {/* Polje za pretragu */}
          <div style={{ marginBottom: '24px' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Pretraži putovanja po nazivu ili opisu..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>

          {loading ? (
            <p style={styles.infoText}>Učitavanje planova putovanja...</p>
          ) : plans.length === 0 ? (
            <div className="glass-panel" style={styles.emptyState}>
              <Compass size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
              <h3>Nemate kreiranih putovanja</h3>
              <p style={{ color: 'var(--text-muted)', margin: '8px 0 20px' }}>
                Započnite svoje sledeće putovanje kreiranjem novog plana putovanja!
              </p>
              <button className="btn btn-primary" onClick={handleOpenAdd}>
                Kreiraj prvi plan putovanja
              </button>
            </div>
          ) : (
            <div className="dashboard-grid">
              {plans
                .filter(plan => 
                  plan.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  plan.description.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((plan) => (
                  <PlanCard 
                    key={plan.id} 
                    plan={plan} 
                    onView={onSelectPlan} 
                    onDelete={deletePlan} 
                  />
                ))
              }
            </div>
          )}
        </>
      ) : (
        // ADMIN PANEL - USERS MANAGEMENT
        <>
          <div style={styles.header}>
            <div>
              <h2 style={styles.title}>Administracija korisničkih naloga</h2>
              <p style={styles.subtitle}>Pregledajte registrovane korisnike i obrišite naloge ukoliko je potrebno.</p>
            </div>
          </div>

          {adminLoading ? (
            <p style={styles.infoText}>Učitavanje korisničkih naloga...</p>
          ) : usersList.length === 0 ? (
            <p style={styles.infoText}>Nema registrovanih korisnika.</p>
          ) : (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Ime i prezime</th>
                      <th style={styles.th}>Email adresa</th>
                      <th style={styles.th}>Uloga</th>
                      <th style={styles.th}>Datum registracije</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>Akcija</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((usr, idx) => (
                      <tr key={idx} style={styles.tr}>
                        <td style={{ ...styles.td, color: '#fff', fontWeight: '600' }}>{usr.name}</td>
                        <td style={styles.td}>{usr.email}</td>
                        <td style={styles.td}>
                          <span className={`badge ${usr.role === 'Admin' ? 'badge-danger' : 'badge-primary'}`}>
                            {usr.role}
                          </span>
                        </td>
                        <td style={styles.td}>{new Date(usr.createdAt).toLocaleDateString('sr-RS')}</td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          {usr.id !== user?.id ? (
                            <button 
                              className="btn btn-danger btn-sm"
                              style={{ padding: '6px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              onClick={() => handleDeleteUser(usr.id)}
                            >
                              <UserX size={14} />
                              Obriši
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Vi (Prijavljeni)</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Plan Add Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Kreiraj plan putovanja">
        {formError && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '10px', marginBottom: '16px', textTransform: 'none' }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Naziv putovanja</label>
            <input 
              type="text" 
              required 
              className="form-input" 
              placeholder="npr. Letovanje u Grčkoj"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Kratak opis (opciono)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="npr. Dve nedelje obilaska Krita i Atine."
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
            />
          </div>

          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Početni datum</label>
              <input 
                type="date" 
                required 
                className="form-input" 
                value={formStart}
                onChange={(e) => setFormStart(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Krajnji datum</label>
              <input 
                type="date" 
                required 
                className="form-input" 
                value={formEnd}
                onChange={(e) => setFormEnd(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Planirani budžet (EUR)</label>
            <input 
              type="number" 
              min="0" 
              className="form-input" 
              value={formBudget}
              onChange={(e) => setFormBudget(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Opšte napomene (opciono)</label>
            <textarea 
              rows="3" 
              className="form-input" 
              placeholder="npr. Kupiti putno osiguranje na vreme."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              style={{ resize: 'none' }}
            />
          </div>

          <div style={styles.formActions}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Otkaži
            </button>
            <button type="submit" className="btn btn-primary">
              Kreiraj
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px 0'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '20px'
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#fff'
  },
  subtitle: {
    fontSize: '0.95rem',
    color: 'var(--text-muted)',
    marginTop: '4px'
  },
  infoText: {
    color: 'var(--text-muted)'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center',
    maxWidth: '500px',
    margin: '40px auto 0'
  },
  row: {
    display: 'flex',
    gap: '16px'
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  th: {
    padding: '12px 16px',
    color: 'var(--text-muted)',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    letterSpacing: '0.05em'
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)'
  },
  td: {
    padding: '16px',
    fontSize: '0.875rem',
    color: 'var(--text-muted)'
  }
};

export default Dashboard;
