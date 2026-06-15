import React, { useState, useEffect } from 'react';
import { activityService } from '../services/ActivityService';
import { Plus, DollarSign, Tag, Info, Trash2, Calendar, Coffee, Car, Home, Ticket, ShoppingBag, Briefcase } from 'lucide-react';
import Modal from './Modal';

export const BudgetTracker = ({ plan, isEditable = true }) => {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({
    plannedBudget: plan.budget,
    totalExpenses: 0,
    remainingBudget: plan.budget,
    totalEstimatedActivityCosts: 0
  });
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('sve');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('ostalo');
  const [formAmount, setFormAmount] = useState('0');
  const [formDate, setFormDate] = useState('');
  const [formDescription, setFormDescription] = useState('');

  useEffect(() => {
    loadData();
  }, [plan.id, plan.budget]);

  const loadData = async () => {
    setLoading(true);
    try {
      const expList = await activityService.getExpenses(plan.id);
      setExpenses(expList);
      
      const sum = await activityService.getBudgetSummary(plan.id, plan.budget);
      setSummary(sum);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormName('');
    setFormCategory('ostalo');
    setFormAmount('0');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormDescription('');
    setIsModalOpen(true);
  };

  const handleDelete = async (expenseId) => {
    if (!confirm('Da li želite da obrišete ovaj trošak?')) return;
    try {
      await activityService.deleteExpense(plan.id, expenseId, plan.budget);
      setExpenses(prev => prev.filter(e => e.id !== expenseId));
      // Reload summary
      const sum = await activityService.getBudgetSummary(plan.id, plan.budget);
      setSummary(sum);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const amountVal = parseFloat(formAmount) || 0;
    if (amountVal <= 0) {
      alert('Iznos mora biti veći od nule.');
      return;
    }

    const payload = {
      name: formName,
      category: formCategory,
      amount: amountVal,
      date: new Date(formDate),
      description: formDescription
    };

    try {
      const added = await activityService.addExpense(plan.id, payload, plan.budget);
      setExpenses(prev => [...prev, added]);
      setIsModalOpen(false);
      // Reload summary
      const sum = await activityService.getBudgetSummary(plan.id, plan.budget);
      setSummary(sum);
    } catch (err) {
      alert(err.message);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'prevoz': return <Car size={16} />;
      case 'smještaj': return <Home size={16} />;
      case 'hrana': return <Coffee size={16} />;
      case 'ulaznice': return <Ticket size={16} />;
      case 'kupovina': return <ShoppingBag size={16} />;
      default: return <Briefcase size={16} />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'prevoz': return '#3b82f6'; // blue
      case 'smještaj': return '#a855f7'; // purple
      case 'hrana': return '#f59e0b'; // amber
      case 'ulaznice': return '#10b981'; // emerald
      case 'kupovina': return '#ec4899'; // pink
      default: return '#6b7280'; // gray
    }
  };

  const filteredExpenses = categoryFilter === 'sve'
    ? expenses
    : expenses.filter(e => e.category === categoryFilter);

  const spentPercent = summary.plannedBudget > 0 
    ? Math.round((summary.totalExpenses / summary.plannedBudget) * 100)
    : 0;

  const isOverBudget = summary.remainingBudget < 0;

  return (
    <div style={styles.container}>
      {/* Summary Cards */}
      <div style={styles.summaryGrid}>
        <div className="glass-panel" style={styles.summaryCard}>
          <span style={styles.cardLabel}>Planirani budžet</span>
          <span style={{ ...styles.cardValue, color: '#fff' }}>
            {summary.plannedBudget.toLocaleString('sr-RS')} EUR
          </span>
        </div>

        <div className="glass-panel" style={styles.summaryCard}>
          <span style={styles.cardLabel}>Ukupno potrošeno</span>
          <span style={{ ...styles.cardValue, color: isOverBudget ? 'var(--danger)' : 'var(--success)' }}>
            {summary.totalExpenses.toLocaleString('sr-RS')} EUR
          </span>
        </div>

        <div className="glass-panel" style={styles.summaryCard}>
          <span style={styles.cardLabel}>Preostali budžet</span>
          <span style={{ ...styles.cardValue, color: isOverBudget ? 'var(--danger)' : 'var(--success)' }}>
            {summary.remainingBudget.toLocaleString('sr-RS')} EUR
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="glass-panel" style={styles.progressCard}>
        <div style={styles.progressHeader}>
          <span>Potrošeno: {spentPercent}% budžeta</span>
          {isOverBudget && (
            <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>
              Upozorenje: Prekoračen budžet!
            </span>
          )}
        </div>
        <div style={styles.progressBarWrapper}>
          <div 
            style={{ 
              ...styles.progressBar, 
              width: `${Math.min(spentPercent, 100)}%`,
              backgroundColor: isOverBudget ? 'var(--danger)' : 'var(--success)',
              boxShadow: isOverBudget ? '0 0 10px var(--danger)' : '0 0 10px var(--success)'
            }} 
          />
        </div>
      </div>

      {/* Expenses Log section */}
      <div className="glass-panel" style={styles.logPanel}>
        <div style={styles.logHeader}>
          <h4 style={styles.logTitle}>Evidencija troškova</h4>
          
          <div style={styles.actions}>
            <select 
              className="form-input" 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="sve">Sve kategorije</option>
              <option value="prevoz">Prevoz</option>
              <option value="smještaj">Smještaj</option>
              <option value="hrana">Hrana</option>
              <option value="ulaznice">Ulaznice</option>
              <option value="kupovina">Kupovina</option>
              <option value="ostalo">Ostalo</option>
            </select>

            {isEditable && (
              <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
                <Plus size={16} />
                Novi trošak
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <p style={styles.loading}>Učitavanje troškova...</p>
        ) : filteredExpenses.length === 0 ? (
          <div style={styles.emptyState}>
            <DollarSign size={28} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
            <p>Nema evidentiranih troškova za odabrane kriterijume.</p>
          </div>
        ) : (
          <div style={styles.expensesTableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Naziv</th>
                  <th style={styles.th}>Kategorija</th>
                  <th style={styles.th}>Datum</th>
                  <th style={styles.th}>Iznos</th>
                  {isEditable && <th style={{ ...styles.th, textAlign: 'right' }}>Akcija</th>}
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((exp, idx) => (
                  <tr key={idx} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.nameBlock}>
                        <span style={styles.expName}>{exp.name}</span>
                        {exp.description && <span style={styles.expDesc}>{exp.description}</span>}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span 
                        style={{ 
                          ...styles.catBadge, 
                          color: getCategoryColor(exp.category), 
                          backgroundColor: `${getCategoryColor(exp.category)}18` 
                        }}
                      >
                        {getCategoryIcon(exp.category)}
                        <span style={{ marginLeft: '4px', textTransform: 'capitalize' }}>{exp.category}</span>
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.dateText}>
                        {new Date(exp.date).toLocaleDateString('sr-RS')}
                      </span>
                    </td>
                    <td style={{ ...styles.td, fontWeight: '700', color: '#fff' }}>
                      {exp.amount.toLocaleString('sr-RS')} EUR
                    </td>
                    {isEditable && (
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <button 
                          style={styles.deleteBtn}
                          onClick={() => handleDelete(exp.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expense Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Evidentiraj trošak">
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Naziv troška</label>
            <input 
              type="text" 
              required 
              className="form-input" 
              value={formName} 
              onChange={(e) => setFormName(e.target.value)} 
              placeholder="npr. Avionska karta do Pariza"
            />
          </div>

          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Iznos (EUR)</label>
              <input 
                type="number" 
                min="0.01" 
                step="0.01" 
                required 
                className="form-input" 
                value={formAmount} 
                onChange={(e) => setFormAmount(e.target.value)} 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Kategorija</label>
              <select 
                className="form-input" 
                value={formCategory} 
                onChange={(e) => setFormCategory(e.target.value)}
                style={{ appearance: 'none', background: 'rgba(25, 20, 45, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white' }}
              >
                <option value="prevoz">Prevoz</option>
                <option value="smještaj">Smještaj</option>
                <option value="hrana">Hrana</option>
                <option value="ulaznice">Ulaznice</option>
                <option value="kupovina">Kupovina</option>
                <option value="ostalo">Ostalo</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Datum</label>
            <input 
              type="date" 
              required 
              className="form-input" 
              value={formDate} 
              onChange={(e) => setFormDate(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Dodatni opis (opciono)</label>
            <textarea 
              rows="3" 
              className="form-input" 
              value={formDescription} 
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="npr. Plaćeno karticom, prtljag uključen."
              style={{ resize: 'none' }}
            />
          </div>

          <div style={styles.formActions}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Otkaži
            </button>
            <button type="submit" className="btn btn-primary">
              Evidentiraj
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px'
  },
  summaryCard: {
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  cardLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  cardValue: {
    fontSize: '1.5rem',
    fontWeight: '800',
    fontFamily: 'var(--font-display)'
  },
  progressCard: {
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontWeight: '600'
  },
  progressBarWrapper: {
    width: '100%',
    height: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '9999px',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    borderRadius: '9999px',
    transition: 'width 0.4s ease'
  },
  logPanel: {
    padding: '24px'
  },
  logHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  logTitle: {
    fontSize: '1.2rem',
    color: '#fff'
  },
  actions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  filterSelect: {
    padding: '8px 12px',
    fontSize: '0.85rem',
    width: '160px',
    background: 'rgba(20, 15, 38, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#fff',
    borderRadius: '8px'
  },
  loading: {
    color: 'var(--text-muted)'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 0',
    color: 'var(--text-muted)'
  },
  expensesTableWrapper: {
    overflowX: 'auto'
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
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    letterSpacing: '0.05em'
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    transition: 'background 0.2s ease'
  },
  td: {
    padding: '16px',
    fontSize: '0.875rem'
  },
  nameBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  expName: {
    color: '#fff',
    fontWeight: '600'
  },
  expDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)'
  },
  catBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600'
  },
  dateText: {
    color: 'var(--text-muted)'
  },
  deleteBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '4px',
    transition: 'color 0.2s ease'
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
  }
};

// Fallback responsive css for smaller screens
if (typeof window !== 'undefined' && window.innerWidth < 768) {
  styles.summaryGrid.gridTemplateColumns = '1fr';
}

export default BudgetTracker;
