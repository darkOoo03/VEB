import React, { useState, useEffect } from 'react';
import { useTravelPlan } from '../context/TravelPlanContext';
import { CalendarView } from '../components/CalendarView';
import { BudgetTracker } from '../components/BudgetTracker';
import { Checklist } from '../components/Checklist';
import { QRCodeShareModal } from '../components/QRCodeShareModal';
import Modal from '../components/Modal';
import { 
  ArrowLeft, Calendar, MapPin, DollarSign, ListTodo, Share2, Plus, 
  Trash2, Edit, Save, FileText, ChevronRight
} from 'lucide-react';

export const PlanDetail = ({ planId, onBack, shareToken = null }) => {
  const { 
    currentPlan, accessLevel, fetchPlan, updatePlan,
    addDestination, updateDestination, deleteDestination 
  } = useTravelPlan();
  
  const [activeSection, setActiveSection] = useState('itinerary'); // itinerary, destinations, budget, packing
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDestModalOpen, setIsDestModalOpen] = useState(false);
  const [editingDest, setEditingDest] = useState(null);

  // Destination form states
  const [destName, setDestName] = useState('');
  const [destLocation, setDestLocation] = useState('');
  const [destArrival, setDestArrival] = useState('');
  const [destDeparture, setDestDeparture] = useState('');
  const [destNotes, setDestNotes] = useState('');
  const [destError, setDestError] = useState('');

  // Edit basic plan info states
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [basicName, setBasicName] = useState('');
  const [basicDesc, setBasicDesc] = useState('');
  const [basicStart, setBasicStart] = useState('');
  const [basicEnd, setBasicEnd] = useState('');
  const [basicBudget, setBasicBudget] = useState('');
  const [basicNotes, setBasicNotes] = useState('');

  const isEditable = accessLevel === 'EDIT' || accessLevel === 'ADMIN';

  useEffect(() => {
    loadPlan();
  }, [planId]);

  const loadPlan = async () => {
    try {
      await fetchPlan(planId, shareToken);
    } catch (err) {
      alert('Greška pri učitavanju plana: ' + err.message);
      onBack();
    }
  };

  const handleOpenDestAdd = () => {
    setEditingDest(null);
    setDestName('');
    setDestLocation('');
    setDestArrival(currentPlan.startDate.toISOString().split('T')[0]);
    setDestDeparture(currentPlan.endDate.toISOString().split('T')[0]);
    setDestNotes('');
    setDestError('');
    setIsDestModalOpen(true);
  };

  const handleOpenDestEdit = (dest) => {
    setEditingDest(dest);
    setDestName(dest.name);
    setDestLocation(dest.location);
    setDestArrival(new Date(dest.arrivalDate).toISOString().split('T')[0]);
    setDestDeparture(new Date(dest.departureDate).toISOString().split('T')[0]);
    setDestNotes(dest.notes);
    setDestError('');
    setIsDestModalOpen(true);
  };

  const handleDestSave = async (e) => {
    e.preventDefault();
    setDestError('');

    if (!destName.trim() || !destLocation.trim()) {
      setDestError('Naziv i lokacija su obavezni.');
      return;
    }

    const planStart = new Date(currentPlan.startDate).toISOString().split('T')[0];
    const planEnd = new Date(currentPlan.endDate).toISOString().split('T')[0];

    if (destArrival < planStart || destDeparture > planEnd) {
      setDestError(`Datumi moraju biti u okviru putovanja (${new Date(currentPlan.startDate).toLocaleDateString()} - ${new Date(currentPlan.endDate).toLocaleDateString()}).`);
      return;
    }

    if (destDeparture < destArrival) {
      setDestError('Datum odlaska ne može biti pre datuma dolaska.');
      return;
    }

    const payload = {
      name: destName.trim(),
      location: destLocation.trim(),
      arrivalDate: new Date(destArrival),
      departureDate: new Date(destDeparture),
      notes: destNotes.trim()
    };

    try {
      if (editingDest) {
        await updateDestination(currentPlan.id, editingDest.id, payload, shareToken);
      } else {
        await addDestination(currentPlan.id, payload, shareToken);
      }
      setIsDestModalOpen(false);
    } catch (err) {
      setDestError(err.message);
    }
  };

  const handleDestDelete = async (destId) => {
    if (!confirm('Da li želite da obrišete ovu destinaciju?')) return;
    try {
      await deleteDestination(currentPlan.id, destId, shareToken);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStartEditBasic = () => {
    setBasicName(currentPlan.name);
    setBasicDesc(currentPlan.description);
    setBasicStart(new Date(currentPlan.startDate).toISOString().split('T')[0]);
    setBasicEnd(new Date(currentPlan.endDate).toISOString().split('T')[0]);
    setBasicBudget(currentPlan.budget.toString());
    setBasicNotes(currentPlan.notes);
    setIsEditingBasic(true);
  };

  const handleSaveBasic = async () => {
    if (new Date(basicEnd) < new Date(basicStart)) {
      alert('Krajnji datum ne može biti pre početnog datuma.');
      return;
    }

    const budgetVal = parseFloat(basicBudget) || 0;
    if (budgetVal < 0) {
      alert('Budžet ne može biti negativan.');
      return;
    }

    try {
      await updatePlan(currentPlan.id, {
        name: basicName,
        description: basicDesc,
        startDate: new Date(basicStart),
        endDate: new Date(basicEnd),
        budget: budgetVal,
        notes: basicNotes
      }, shareToken);
      
      setIsEditingBasic(false);
      loadPlan(); // Reload to refresh everything
    } catch (err) {
      alert(err.message);
    }
  };

  const generatePDFReport = () => {
    // Generate a simple print layout
    window.print();
  };

  if (!currentPlan) return <p style={{ color: 'var(--text-muted)', padding: '24px' }}>Učitavanje plana putovanja...</p>;

  const daysCount = currentPlan.getDaysCount();

  return (
    <div style={styles.container}>
      {/* Detail Header */}
      <div style={styles.navHeader}>
        <button className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Nazad</span>
        </button>

        <div style={styles.headerActions}>
          <button className="btn btn-secondary btn-sm" onClick={generatePDFReport} title="Generiši PDF izveštaj">
            <FileText size={16} />
            <span>PDF Izveštaj</span>
          </button>
          
          {isEditable && (
            <button className="btn btn-primary btn-sm btn-accent" onClick={() => setIsShareModalOpen(true)}>
              <Share2 size={16} />
              <span>Podeli putovanje</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Info Box */}
      <div className="glass-panel animate-fade" style={styles.infoBox}>
        {isEditingBasic ? (
          <div style={styles.editingBasicForm}>
            <div className="form-group">
              <label className="form-label">Naziv putovanja</label>
              <input type="text" className="form-input" value={basicName} onChange={(e) => setBasicName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Kratak opis</label>
              <input type="text" className="form-input" value={basicDesc} onChange={(e) => setBasicDesc(e.target.value)} />
            </div>
            <div style={styles.row}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Početak</label>
                <input type="date" className="form-input" value={basicStart} onChange={(e) => setBasicStart(e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Kraj</label>
                <input type="date" className="form-input" value={basicEnd} onChange={(e) => setBasicEnd(e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Budžet (EUR)</label>
                <input type="number" className="form-input" value={basicBudget} onChange={(e) => setBasicBudget(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Napomene</label>
              <textarea rows="2" className="form-input" value={basicNotes} onChange={(e) => setBasicNotes(e.target.value)} style={{ resize: 'none' }} />
            </div>
            <div style={styles.basicActions}>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsEditingBasic(false)}>Otkaži</button>
              <button className="btn btn-primary btn-sm" onClick={handleSaveBasic}>
                <Save size={14} /> Sačuvaj
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.basicDisplay}>
            <div style={{ flex: 1 }}>
              <div style={styles.titleRow}>
                <h2 style={styles.planTitle}>{currentPlan.name}</h2>
                <span className="badge badge-primary" style={{ marginLeft: '12px' }}>
                  {daysCount} {daysCount === 1 ? 'dan' : (daysCount < 5 ? 'dana' : 'dana')}
                </span>
                {!isEditable && (
                  <span className="badge badge-warning" style={{ marginLeft: '8px' }}>
                    Samo Pregled (VIEW)
                  </span>
                )}
              </div>
              <p style={styles.planDesc}>{currentPlan.description || 'Nema opisa.'}</p>
              
              <div style={styles.datesNotes}>
                <span style={styles.dateText}>
                  <Calendar size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                  {currentPlan.startDate.toLocaleDateString('sr-RS')} - {currentPlan.endDate.toLocaleDateString('sr-RS')}
                </span>
                {currentPlan.notes && (
                  <p style={styles.notesBlock}>
                    <strong>Opšte napomene: </strong> {currentPlan.notes}
                  </p>
                )}
              </div>
            </div>

            {isEditable && (
              <button className="btn btn-secondary btn-sm" style={styles.editBasicBtn} onClick={handleStartEditBasic}>
                <Edit size={14} />
                Uredi
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeSection === 'itinerary' ? 'active' : ''}`}
          onClick={() => setActiveSection('itinerary')}
        >
          <Calendar size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Plan aktivnosti
        </button>
        <button 
          className={`tab-btn ${activeSection === 'destinations' ? 'active' : ''}`}
          onClick={() => setActiveSection('destinations')}
        >
          <MapPin size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Destinacije ({currentPlan.destinations.length})
        </button>
        <button 
          className={`tab-btn ${activeSection === 'budget' ? 'active' : ''}`}
          onClick={() => setActiveSection('budget')}
        >
          <DollarSign size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Budžet i Troškovi
        </button>
        <button 
          className={`tab-btn ${activeSection === 'packing' ? 'active' : ''}`}
          onClick={() => setActiveSection('packing')}
        >
          <ListTodo size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Packing lista
        </button>
      </div>

      {/* Section body */}
      <div style={{ marginTop: '12px' }} className="print-section">
        {activeSection === 'itinerary' && (
          <CalendarView 
            plan={currentPlan} 
            isEditable={isEditable} 
            onBudgetUpdate={loadPlan} // Reload when activities update costs
          />
        )}

        {activeSection === 'destinations' && (
          <div style={styles.destinationsSection}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Planirane destinacije</h3>
              {isEditable && (
                <button className="btn btn-primary btn-sm btn-accent" onClick={handleOpenDestAdd}>
                  <Plus size={16} />
                  Dodaj destinaciju
                </button>
              )}
            </div>

            {currentPlan.destinations.length === 0 ? (
              <div className="glass-panel" style={styles.emptyState}>
                <MapPin size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                <p>Nema unetih destinacija za ovo putovanje.</p>
                {isEditable && (
                  <button className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }} onClick={handleOpenDestAdd}>
                    Dodaj prvu destinaciju
                  </button>
                )}
              </div>
            ) : (
              <div style={styles.destList}>
                {currentPlan.destinations.map((dest, idx) => (
                  <div key={idx} className="glass-panel" style={styles.destCard}>
                    <div style={styles.destHeader}>
                      <div>
                        <h4 style={styles.destName}>{dest.name}</h4>
                        <span style={styles.destLoc}>
                          <MapPin size={12} style={{ marginRight: '4px' }} />
                          {dest.location}
                        </span>
                      </div>

                      {isEditable && (
                        <div style={styles.destActions}>
                          <button style={styles.actionBtn} onClick={() => handleOpenDestEdit(dest)}>
                            <Edit size={14} />
                          </button>
                          <button style={{ ...styles.actionBtn, color: 'var(--danger)' }} onClick={() => handleDestDelete(dest.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div style={styles.destDates}>
                      <Calendar size={14} style={{ marginRight: '6px' }} />
                      <span>
                        {new Date(dest.arrivalDate).toLocaleDateString('sr-RS')} - {new Date(dest.departureDate).toLocaleDateString('sr-RS')}
                      </span>
                    </div>

                    {dest.notes && (
                      <p style={styles.destNotes}>
                        <strong>Napomene: </strong> {dest.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'budget' && (
          <BudgetTracker plan={currentPlan} isEditable={isEditable} />
        )}

        {activeSection === 'packing' && (
          <Checklist plan={currentPlan} isEditable={isEditable} />
        )}
      </div>

      {/* Share Modal */}
      <QRCodeShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        planId={currentPlan.id} 
      />

      {/* Destination Add/Edit Modal */}
      <Modal isOpen={isDestModalOpen} onClose={() => setIsDestModalOpen(false)} title={editingDest ? 'Izmeni destinaciju' : 'Dodaj destinaciju'}>
        {destError && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '10px', marginBottom: '16px', textTransform: 'none' }}>
            {destError}
          </div>
        )}

        <form onSubmit={handleDestSave}>
          <div className="form-group">
            <label className="form-label">Naziv destinacije</label>
            <input 
              type="text" 
              required 
              className="form-input" 
              value={destName} 
              onChange={(e) => setDestName(e.target.value)} 
              placeholder="npr. Atina"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tačna lokacija (ili adresa)</label>
            <input 
              type="text" 
              required 
              className="form-input" 
              value={destLocation} 
              onChange={(e) => setDestLocation(e.target.value)} 
              placeholder="npr. Grčka"
            />
          </div>

          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Datum dolaska</label>
              <input 
                type="date" 
                required 
                className="form-input" 
                value={destArrival} 
                onChange={(e) => setDestArrival(e.target.value)} 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Datum odlaska</label>
              <input 
                type="date" 
                required 
                className="form-input" 
                value={destDeparture} 
                onChange={(e) => setDestDeparture(e.target.value)} 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Kratak opis ili napomena (opciono)</label>
            <textarea 
              rows="3" 
              className="form-input" 
              value={destNotes} 
              onChange={(e) => setDestNotes(e.target.value)}
              placeholder="npr. Rezervisana poseta Akropolju za 16. jun."
              style={{ resize: 'none' }}
            />
          </div>

          <div style={styles.formActions}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsDestModalOpen(false)}>
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
    padding: '24px 0'
  },
  navHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  headerActions: {
    display: 'flex',
    gap: '12px'
  },
  infoBox: {
    padding: '24px',
    marginBottom: '32px'
  },
  editingBasicForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  basicActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '12px'
  },
  basicDisplay: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '24px'
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  planTitle: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#fff'
  },
  planDesc: {
    fontSize: '1rem',
    color: 'var(--text-muted)',
    marginTop: '8px',
    lineHeight: '1.4'
  },
  datesNotes: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '16px'
  },
  dateText: {
    fontSize: '0.9rem',
    color: 'var(--primary)',
    fontWeight: '600'
  },
  notesBlock: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    background: 'rgba(255, 255, 255, 0.02)',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.05)'
  },
  editBasicBtn: {
    flexShrink: 0
  },
  destinationsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sectionTitle: {
    fontSize: '1.2rem',
    color: '#fff'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px',
    textAlign: 'center',
    color: 'var(--text-muted)'
  },
  destList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  destCard: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  destHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px'
  },
  destName: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#fff'
  },
  destLoc: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    display: 'inline-flex',
    alignItems: 'center',
    marginTop: '2px'
  },
  destActions: {
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
  destDates: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.85rem',
    color: 'var(--text-muted)'
  },
  destNotes: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    background: 'rgba(255, 255, 255, 0.02)',
    padding: '8px 12px',
    borderRadius: '6px',
    borderLeft: '2px solid var(--primary)'
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

export default PlanDetail;
