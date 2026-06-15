import React, { useState } from 'react';
import { useTravelPlan } from '../context/TravelPlanContext';
import { CheckSquare, Square, Trash2, Plus, Luggage } from 'lucide-react';

export const Checklist = ({ plan, isEditable = true }) => {
  const { addPackingItem, updatePackingItem, deletePackingItem } = useTravelPlan();
  const [newItemName, setNewItemName] = useState('');

  const presets = {
    letovanje: ['Kupaći kostim', 'Krema za sunčanje', 'Naočare za sunce', 'Peškir za plažu', 'Pasoš'],
    poslovno: ['Laptop', 'Punjači i adapteri', 'Službena odeća', 'Notes i olovka', 'Lična karta']
  };

  const applyPreset = async (type) => {
    const itemsToAdd = presets[type];
    try {
      for (const itemName of itemsToAdd) {
        if (!items.some(i => i.name.toLowerCase() === itemName.toLowerCase())) {
          await addPackingItem(plan.id, { name: itemName, isCompleted: false });
        }
      }
    } catch (err) {
      alert('Greška pri učitavanju šablona: ' + err.message);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    try {
      await addPackingItem(plan.id, { name: newItemName.trim(), isCompleted: false });
      setNewItemName('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggle = async (item) => {
    if (!isEditable) return;
    try {
      await updatePackingItem(plan.id, item.id, {
        name: item.name,
        isCompleted: !item.isCompleted
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (itemId) => {
    if (!isEditable) return;
    try {
      await deletePackingItem(plan.id, itemId);
    } catch (err) {
      alert(err.message);
    }
  };

  const items = plan.packingListItems || [];
  const packedCount = items.filter(i => i.isCompleted).length;
  const total = items.length;
  const percentage = total > 0 ? Math.round((packedCount / total) * 100) : 0;

  return (
    <div style={styles.container}>
      {/* Header Stat Card */}
      <div className="glass-panel" style={styles.statCard}>
        <div style={styles.statText}>
          <Luggage size={24} color="var(--primary)" />
          <div>
            <h4 style={{ color: '#fff', fontSize: '1rem' }}>Pakovanje kofera</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Spakovano {packedCount} od {total} stvari ({percentage}%)
            </p>
          </div>
        </div>
        <div style={styles.progressContainer}>
          <div style={{ ...styles.progressBar, width: `${percentage}%` }} />
        </div>
      </div>

      {/* Add form */}
      {isEditable && (
        <>
          <form onSubmit={handleAdd} style={styles.addForm}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="npr. Pasoš, Punjač za telefon, Lekovi..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              style={styles.addInput}
            />
            <button type="submit" className="btn btn-primary">
              <Plus size={16} />
              <span>Dodaj</span>
            </button>
          </form>

          <div style={{ display: 'flex', gap: '10px', marginTop: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Brzi šabloni:</span>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm" 
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              onClick={() => applyPreset('letovanje')}
            >
              🏖️ Letovanje
            </button>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm" 
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              onClick={() => applyPreset('poslovno')}
            >
              💼 Poslovni put
            </button>
          </div>
        </>
      )}

      {/* Items list */}
      <div style={styles.list}>
        {items.length === 0 ? (
          <div className="glass-panel" style={styles.emptyState}>
            <p>Vaša packing lista je prazna. Dodajte stvari koje treba poneti.</p>
          </div>
        ) : (
          items.map((item, idx) => (
            <div 
              key={idx} 
              className="glass-panel" 
              style={{
                ...styles.itemRow,
                opacity: item.isCompleted ? 0.75 : 1
              }}
              onClick={() => handleToggle(item)}
            >
              <div style={styles.itemInfo}>
                {item.isCompleted ? (
                  <CheckSquare size={20} color="var(--success)" style={styles.checkIcon} />
                ) : (
                  <Square size={20} color="var(--text-muted)" style={styles.checkIcon} />
                )}
                <span 
                  style={{
                    ...styles.itemName,
                    textDecoration: item.isCompleted ? 'line-through' : 'none',
                    color: item.isCompleted ? 'var(--text-muted)' : '#fff'
                  }}
                >
                  {item.name}
                </span>
              </div>

              {isEditable && (
                <button 
                  style={styles.deleteBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  statCard: {
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  statText: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  progressContainer: {
    width: '100%',
    height: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'var(--primary)',
    boxShadow: '0 0 8px var(--primary)',
    transition: 'width 0.3s ease'
  },
  addForm: {
    display: 'flex',
    gap: '10px'
  },
  addInput: {
    flex: 1
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '24px',
    color: 'var(--text-muted)',
    fontSize: '0.9rem'
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  itemInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  checkIcon: {
    flexShrink: 0
  },
  itemName: {
    fontSize: '0.95rem',
    fontWeight: '500'
  },
  deleteBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '4px',
    transition: 'color 0.2s ease'
  }
};

export default Checklist;
