import React, { useState, useEffect } from 'react';
import { activityService } from '../services/ActivityService';
import { Calendar, Plus, MapPin, Clock, Info, CheckCircle, HelpCircle, Edit, Trash2 } from 'lucide-react';
import Modal from './Modal';

export const CalendarView = ({ plan, isEditable = true, onBudgetUpdate }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(plan.startDate);
  const [viewMode, setViewMode] = useState('itinerary'); // 'itinerary' or 'calendar'
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [editingActivity, setEditingActivity] = useState(null);
  const [formName, setFormName] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCost, setFormCost] = useState('0');
  const [formStatus, setFormStatus] = useState('planirano');

  useEffect(() => {
    loadActivities();
  }, [plan.id]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const data = await activityService.getActivities(plan.id);
      setActivities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to generate all dates between plan.startDate and plan.endDate
  const getPlanDates = () => {
    const dates = [];
    let current = new Date(plan.startDate);
    const end = new Date(plan.endDate);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const dates = getPlanDates();

  const handleOpenAdd = (date = selectedDate) => {
    setEditingActivity(null);
    setFormName('');
    const dStr = date ? new Date(date).toISOString().split('T')[0] : '';
    setFormDate(dStr);
    setFormTime('');
    setFormLocation('');
    setFormDescription('');
    setFormCost('0');
    setFormStatus('planirano');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (activity) => {
    setEditingActivity(activity);
    setFormName(activity.name);
    const dStr = new Date(activity.date).toISOString().split('T')[0];
    setFormDate(dStr);
    setFormTime(activity.time);
    setFormLocation(activity.location);
    setFormDescription(activity.description);
    setFormCost(activity.estimatedCost.toString());
    setFormStatus(activity.status);
    setIsModalOpen(true);
  };

  const handleDelete = async (activityId) => {
    if (!confirm('Da li želite da obrišete ovu aktivnost?')) return;
    try {
      await activityService.deleteActivity(plan.id, activityId, plan.budget);
      setActivities(prev => prev.filter(a => a.id !== activityId));
      if (onBudgetUpdate) onBudgetUpdate();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (new Date(formDate) < new Date(plan.startDate) || new Date(formDate) > new Date(plan.endDate)) {
      alert(`Datum mora biti u okviru putovanja (${new Date(plan.startDate).toLocaleDateString()} - ${new Date(plan.endDate).toLocaleDateString()}).`);
      return;
    }

    const payload = {
      name: formName,
      date: new Date(formDate),
      time: formTime,
      location: formLocation,
      description: formDescription,
      estimatedCost: parseFloat(formCost) || 0,
      status: formStatus
    };

    try {
      if (editingActivity) {
        const updated = await activityService.updateActivity(plan.id, editingActivity.id, payload, plan.budget);
        setActivities(prev => prev.map(a => a.id === editingActivity.id ? updated : a));
      } else {
        const added = await activityService.addActivity(plan.id, payload, plan.budget);
        setActivities(prev => [...prev, added]);
      }
      setIsModalOpen(false);
      if (onBudgetUpdate) onBudgetUpdate();
    } catch (err) {
      alert(err.message);
    }
  };

  // Filter activities for selected date (ignoring time/timezone shifts)
  const getActivitiesForDate = (date) => {
    if (!date) return [];
    const targetStr = new Date(date).toISOString().split('T')[0];
    return activities.filter(a => new Date(a.date).toISOString().split('T')[0] === targetStr);
  };

  const activeActivities = getActivitiesForDate(selectedDate);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'završeno': return 'badge-success';
      case 'rezervisano': return 'badge-primary';
      case 'otkazano': return 'badge-danger';
      default: return 'badge-warning';
    }
  };

  // Generate calendar days for monthly view (using first date month)
  const getCalendarCells = () => {
    const startMonth = new Date(plan.startDate);
    const year = startMonth.getFullYear();
    const month = startMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Day of the week (0 = Sun, 6 = Sat). Shift so Monday is 0.
    let dayOfWeek = firstDay.getDay() - 1;
    if (dayOfWeek < 0) dayOfWeek = 6;
    
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    const cells = [];
    // Padding for days before 1st of month
    for (let i = 0; i < dayOfWeek; i++) {
      cells.push(null);
    }
    // Days of month
    for (let i = 1; i <= totalDays; i++) {
      cells.push(new Date(year, month, i));
    }
    return cells;
  };

  const calendarCells = getCalendarCells();

  return (
    <div style={styles.container}>
      <div style={styles.viewToggleHeader}>
        <div style={styles.viewToggle}>
          <button 
            className={`btn btn-sm ${viewMode === 'itinerary' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('itinerary')}
          >
            Dnevni plan
          </button>
          <button 
            className={`btn btn-sm ${viewMode === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('calendar')}
          >
            Mesečni kalendar
          </button>
        </div>

        {isEditable && (
          <button className="btn btn-primary btn-sm btn-accent" onClick={() => handleOpenAdd()}>
            <Plus size={16} />
            Dodaj aktivnost
          </button>
        )}
      </div>

      {loading ? (
        <p style={styles.loading}>Učitavanje aktivnosti...</p>
      ) : viewMode === 'itinerary' ? (
        // ITINERARY TIMELINE VIEW
        <div style={styles.itineraryLayout}>
          {/* Horizontal days bar */}
          <div style={styles.daysTimeline}>
            {dates.map((date, idx) => {
              const active = new Date(date).toISOString().split('T')[0] === new Date(selectedDate).toISOString().split('T')[0];
              const dailyActivities = getActivitiesForDate(date);
              
              return (
                <button
                  key={idx}
                  style={{
                    ...styles.dayTimelineCard,
                    borderColor: active ? 'var(--primary)' : 'rgba(255, 255, 255, 0.06)',
                    background: active ? 'rgba(138, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.02)'
                  }}
                  onClick={() => setSelectedDate(date)}
                >
                  <span style={styles.dayNum}>Dan {idx + 1}</span>
                  <span style={{ ...styles.dayName, color: active ? '#fff' : 'var(--text-muted)' }}>
                    {date.toLocaleDateString('sr-RS', { weekday: 'short', day: 'numeric' })}
                  </span>
                  {dailyActivities.length > 0 && (
                    <span style={styles.activityDotCount}>{dailyActivities.length}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Activities list for selected day */}
          <div style={styles.activitiesSection}>
            <h4 style={styles.sectionTitle}>
              Aktivnosti za {new Date(selectedDate).toLocaleDateString('sr-RS', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h4>

            {activeActivities.length === 0 ? (
              <div className="glass-panel" style={styles.emptyState}>
                <Calendar size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                <p>Nema planiranih aktivnosti za ovaj dan.</p>
                {isEditable && (
                  <button className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }} onClick={() => handleOpenAdd(selectedDate)}>
                    Isplaniraj prvu aktivnost
                  </button>
                )}
              </div>
            ) : (
              <div style={styles.activitiesList}>
                {activeActivities.map((activity, idx) => (
                  <div key={idx} className="glass-panel" style={styles.activityCard}>
                    <div style={styles.activityHeader}>
                      <div style={styles.activityTitleBlock}>
                        <span className={`badge ${getStatusBadgeClass(activity.status)}`} style={{ fontSize: '0.6rem' }}>
                          {activity.status}
                        </span>
                        <h5 style={styles.activityName}>{activity.name}</h5>
                      </div>
                      
                      {isEditable && (
                        <div style={styles.actionButtons}>
                          <button style={styles.actionBtn} onClick={() => handleOpenEdit(activity)}>
                            <Edit size={14} />
                          </button>
                          <button style={{ ...styles.actionBtn, color: 'var(--danger)' }} onClick={() => handleDelete(activity.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div style={styles.activityDetails}>
                      {activity.time && (
                        <span style={styles.detailItem}>
                          <Clock size={14} />
                          <span>{activity.time}</span>
                        </span>
                      )}
                      {activity.location && (
                        <span style={styles.detailItem}>
                          <MapPin size={14} />
                          <span>{activity.location}</span>
                        </span>
                      )}
                      <span style={styles.detailItem}>
                        <span>Cena: <strong>{activity.estimatedCost} EUR</strong></span>
                      </span>
                    </div>

                    {activity.description && (
                      <p style={styles.activityDesc}>
                        <Info size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                        {activity.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // MONTHLY CALENDAR GRID VIEW
        <div style={styles.calendarGrid}>
          {/* Days of week headers */}
          {['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'].map(d => (
            <div key={d} style={styles.gridDayHeader}>{d}</div>
          ))}

          {/* Calendar grid cells */}
          {calendarCells.map((cell, idx) => {
            if (!cell) {
              return <div key={`empty-${idx}`} style={styles.gridCellEmpty} />;
            }

            const cellStr = cell.toISOString().split('T')[0];
            const startStr = new Date(plan.startDate).toISOString().split('T')[0];
            const endStr = new Date(plan.endDate).toISOString().split('T')[0];
            const isInTrip = cellStr >= startStr && cellStr <= endStr;
            const cellActivities = getActivitiesForDate(cell);
            const isSelected = new Date(selectedDate).toISOString().split('T')[0] === cellStr;

            return (
              <div
                key={idx}
                style={{
                  ...styles.gridCell,
                  borderColor: isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.06)',
                  background: isInTrip 
                    ? (isSelected ? 'rgba(138, 92, 246, 0.15)' : 'rgba(138, 92, 246, 0.04)')
                    : 'rgba(255, 255, 255, 0.01)'
                }}
                onClick={() => {
                  setSelectedDate(cell);
                  setViewMode('itinerary');
                }}
              >
                <span style={{ 
                  ...styles.cellDayNum, 
                  color: isInTrip ? '#fff' : 'var(--text-muted)',
                  fontWeight: isInTrip ? '700' : '400'
                }}>
                  {cell.getDate()}
                </span>
                
                <div style={styles.cellActivitiesWrapper}>
                  {cellActivities.slice(0, 3).map((act, actIdx) => (
                    <div key={actIdx} style={styles.cellActivityTag} title={`${act.time} - ${act.name}`}>
                      {act.name}
                    </div>
                  ))}
                  {cellActivities.length > 3 && (
                    <div style={styles.cellActivityMore}>
                      + {cellActivities.length - 3} više
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Activity Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingActivity ? 'Izmeni aktivnost' : 'Dodaj aktivnost'}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Naziv aktivnosti</label>
            <input 
              type="text" 
              required 
              className="form-input" 
              value={formName} 
              onChange={(e) => setFormName(e.target.value)} 
              placeholder="npr. Poseta muzeju Luvr"
            />
          </div>

          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Datum</label>
              <input 
                type="date" 
                required 
                className="form-input" 
                value={formDate} 
                onChange={(e) => setFormDate(e.target.value)} 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Vreme (opciono)</label>
              <input 
                type="time" 
                className="form-input" 
                value={formTime} 
                onChange={(e) => setFormTime(e.target.value)} 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Lokacija (opciono)</label>
            <input 
              type="text" 
              className="form-input" 
              value={formLocation} 
              onChange={(e) => setFormLocation(e.target.value)} 
              placeholder="npr. Pariz, Francuska"
            />
          </div>

          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Procenjeni trošak (EUR)</label>
              <input 
                type="number" 
                min="0" 
                step="0.01" 
                className="form-input" 
                value={formCost} 
                onChange={(e) => setFormCost(e.target.value)} 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Status</label>
              <select 
                className="form-input" 
                value={formStatus} 
                onChange={(e) => setFormStatus(e.target.value)}
                style={{ appearance: 'none', background: 'rgba(25, 20, 45, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white' }}
              >
                <option value="planirano">Planirano</option>
                <option value="rezervisano">Rezervisano</option>
                <option value="završeno">Završeno</option>
                <option value="otkazano">Otkazano</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Opis (opciono)</label>
            <textarea 
              rows="3" 
              className="form-input" 
              value={formDescription} 
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="npr. Ulaznice rezervisane online, poneti isprintane vaučere."
              style={{ resize: 'none' }}
            />
          </div>

          <div style={styles.formActions}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Otkaži
            </button>
            <button type="submit" className="btn btn-primary">
              Sačuvaj
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
  viewToggleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px'
  },
  viewToggle: {
    display: 'flex',
    gap: '8px'
  },
  loading: {
    color: 'var(--text-muted)',
    fontSize: '0.95rem'
  },
  itineraryLayout: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  daysTimeline: {
    display: 'flex',
    gap: '12px',
    overflowX: 'auto',
    paddingBottom: '8px'
  },
  dayTimelineCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '12px 18px',
    border: '1px solid',
    borderRadius: '12px',
    cursor: 'pointer',
    minWidth: '110px',
    position: 'relative',
    transition: 'all 0.2s ease'
  },
  dayNum: {
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    color: 'var(--primary)',
    fontWeight: '700',
    letterSpacing: '0.05em'
  },
  dayName: {
    fontSize: '0.85rem',
    fontWeight: '600',
    marginTop: '2px'
  },
  activityDotCount: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    background: 'var(--accent)',
    color: '#fff',
    borderRadius: '9999px',
    fontSize: '0.65rem',
    fontWeight: '700',
    padding: '2px 6px',
    border: '2px solid var(--bg-color)'
  },
  activitiesSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  sectionTitle: {
    fontSize: '1.1rem',
    color: '#fff',
    fontWeight: '600'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px',
    textAlign: 'center',
    color: 'var(--text-muted)'
  },
  activitiesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  activityCard: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  activityHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px'
  },
  activityTitleBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  activityName: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#fff'
  },
  actionButtons: {
    display: 'flex',
    gap: '8px'
  },
  actionBtn: {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '6px',
    color: 'var(--text-muted)',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  activityDetails: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    fontSize: '0.85rem',
    color: 'var(--text-muted)'
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  activityDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    background: 'rgba(255, 255, 255, 0.02)',
    padding: '8px 12px',
    borderRadius: '6px',
    borderLeft: '2px solid var(--primary)'
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px',
    background: 'rgba(0, 0, 0, 0.1)',
    padding: '12px',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)'
  },
  gridDayHeader: {
    textAlign: 'center',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    padding: '8px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  gridCell: {
    aspectRatio: '1',
    border: '1px solid',
    borderRadius: '10px',
    padding: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minHeight: '75px'
  },
  gridCellEmpty: {
    aspectRatio: '1',
    opacity: 0.1
  },
  cellDayNum: {
    fontSize: '0.8rem',
    alignSelf: 'flex-end'
  },
  cellActivitiesWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
    overflow: 'hidden'
  },
  cellActivityTag: {
    fontSize: '0.6rem',
    background: 'var(--primary)',
    color: '#fff',
    padding: '2px 4px',
    borderRadius: '4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  cellActivityMore: {
    fontSize: '0.55rem',
    color: 'var(--text-muted)',
    textAlign: 'center',
    fontWeight: '600'
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

export default CalendarView;
