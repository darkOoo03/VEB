import React from 'react';
import { Calendar, DollarSign, ListTodo, ArrowRight } from 'lucide-react';

export const PlanCard = ({ plan, onView, onDelete, showDelete = true }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' });
  };

  const packingItems = plan.packingListItems || [];
  const packedCount = packingItems.filter(i => i.isCompleted).length;
  const totalItems = packingItems.length;
  const packingPercent = totalItems > 0 ? Math.round((packedCount / totalItems) * 100) : 0;

  return (
    <div className="glass-panel glass-panel-hover animate-fade" style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>{plan.name}</h3>
        <span style={styles.dateBadge}>
          <Calendar size={14} style={{ marginRight: '6px' }} />
          {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
        </span>
      </div>

      <p style={styles.description}>
        {plan.description || 'Nema opisa za ovaj plan putovanja.'}
      </p>

      <div style={styles.meta}>
        <div style={styles.metaItem}>
          <DollarSign size={16} style={{ color: 'var(--success)' }} />
          <div>
            <span style={styles.metaLabel}>Budžet</span>
            <span style={styles.metaValue}>{plan.budget.toLocaleString('sr-RS')} EUR</span>
          </div>
        </div>

        {totalItems > 0 && (
          <div style={styles.metaItem}>
            <ListTodo size={16} style={{ color: 'var(--primary)' }} />
            <div>
              <span style={styles.metaLabel}>Packing</span>
              <span style={styles.metaValue}>{packedCount}/{totalItems} ({packingPercent}%)</span>
            </div>
          </div>
        )}
      </div>

      {totalItems > 0 && (
        <div style={styles.progressContainer}>
          <div style={{ ...styles.progressBar, width: `${packingPercent}%` }} />
        </div>
      )}

      <div style={styles.footer}>
        {showDelete && (
          <button 
            className="btn btn-danger btn-sm" 
            style={styles.deleteBtn}
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Da li ste sigurni da želite obrisati ovaj plan putovanja i sve njegove povezane podatke?')) {
                onDelete(plan.id);
              }
            }}
          >
            Obriši
          </button>
        )}
        <button className="btn btn-primary btn-sm" style={styles.viewBtn} onClick={() => onView(plan.id)}>
          <span>Detalji</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    height: '100%'
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px'
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#fff'
  },
  dateBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: '4px 10px',
    borderRadius: '8px',
    width: 'fit-content'
  },
  description: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    marginBottom: '20px',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    flex: 1
  },
  meta: {
    display: 'flex',
    gap: '24px',
    marginBottom: '16px',
    padding: '12px 0',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  metaLabel: {
    display: 'block',
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase'
  },
  metaValue: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#fff'
  },
  progressContainer: {
    width: '100%',
    height: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '20px'
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'var(--primary)',
    boxShadow: '0 0 8px var(--primary)',
    transition: 'width 0.3s ease'
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    marginTop: 'auto'
  },
  deleteBtn: {
    padding: '8px 16px'
  },
  viewBtn: {
    marginLeft: 'auto'
  }
};

export default PlanCard;
