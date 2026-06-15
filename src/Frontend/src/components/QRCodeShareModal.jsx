import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Link, Eye, Edit2 } from 'lucide-react';
import { useTravelPlan } from '../context/TravelPlanContext';
import Modal from './Modal';

export const QRCodeShareModal = ({ isOpen, onClose, planId }) => {
  const { generateShareToken } = useTravelPlan();
  const [accessLevel, setAccessLevel] = useState('VIEW');
  const [shareLink, setShareLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const share = await generateShareToken(planId, accessLevel);
      // Construct sharing link
      // Use window.location.origin to support local running host dynamically!
      const link = `${window.location.origin}/share/${share.token}`;
      setShareLink(link);
    } catch (err) {
      alert('Greška pri kreiranju linka: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Podeli plan putovanja">
      <div style={styles.container}>
        {!shareLink ? (
          <div style={styles.setupSection}>
            <p style={styles.instruction}>
              Odaberite nivo dozvole za osobu sa kojom delite plan putovanja:
            </p>

            <div style={styles.options}>
              <div 
                style={{
                  ...styles.optionCard,
                  borderColor: accessLevel === 'VIEW' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)',
                  background: accessLevel === 'VIEW' ? 'rgba(138, 92, 246, 0.08)' : 'rgba(255, 255, 255, 0.02)'
                }}
                onClick={() => setAccessLevel('VIEW')}
              >
                <Eye size={20} color={accessLevel === 'VIEW' ? 'var(--primary)' : '#9ca3af'} />
                <div style={styles.optionText}>
                  <span style={styles.optionTitle}>Samo pregled (VIEW)</span>
                  <span style={styles.optionDesc}>Osoba može samo da vidi detalje putovanja, bez izmena.</span>
                </div>
              </div>

              <div 
                style={{
                  ...styles.optionCard,
                  borderColor: accessLevel === 'EDIT' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)',
                  background: accessLevel === 'EDIT' ? 'rgba(138, 92, 246, 0.08)' : 'rgba(255, 255, 255, 0.02)'
                }}
                onClick={() => setAccessLevel('EDIT')}
              >
                <Edit2 size={18} color={accessLevel === 'EDIT' ? 'var(--primary)' : '#9ca3af'} />
                <div style={styles.optionText}>
                  <span style={styles.optionTitle}>Uređivanje (EDIT)</span>
                  <span style={styles.optionDesc}>Osoba može menjati destinacije, aktivnosti i troškove.</span>
                </div>
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              style={styles.generateBtn} 
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? 'Generisanje...' : 'Generiši QR Kod i Link'}
            </button>
          </div>
        ) : (
          <div style={styles.resultSection} className="animate-fade">
            <div style={styles.qrWrapper}>
              <QRCodeSVG 
                value={shareLink} 
                size={200}
                bgColor="#140f26"
                fgColor="#ffffff"
                level="H"
                includeMargin={true}
              />
            </div>

            <span className={`badge ${accessLevel === 'EDIT' ? 'badge-danger' : 'badge-primary'}`} style={styles.levelBadge}>
              Dozvola: {accessLevel === 'EDIT' ? 'Uređivanje' : 'Pregled'}
            </span>

            <div style={styles.linkContainer}>
              <input 
                type="text" 
                readOnly 
                value={shareLink} 
                className="form-input" 
                style={styles.linkInput} 
              />
              <button 
                className="btn btn-primary btn-sm" 
                style={styles.copyBtn} 
                onClick={handleCopy}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Kopirano' : 'Kopiraj'}</span>
              </button>
            </div>

            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => { setShareLink(''); setCopied(false); }}
              style={styles.backBtn}
            >
              Nazad na podešavanje
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column'
  },
  setupSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  instruction: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    lineHeight: '1.4'
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  optionCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    padding: '16px',
    border: '1px solid',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  optionText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  optionTitle: {
    fontWeight: '600',
    color: '#fff',
    fontSize: '0.95rem'
  },
  optionDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    lineHeight: '1.3'
  },
  generateBtn: {
    width: '100%',
    marginTop: '8px'
  },
  resultSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },
  qrWrapper: {
    background: '#140f26',
    padding: '16px',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
  },
  levelBadge: {
    fontSize: '0.75rem'
  },
  linkContainer: {
    display: 'flex',
    width: '100%',
    gap: '10px',
    marginTop: '8px'
  },
  linkInput: {
    flex: 1,
    fontSize: '0.8rem',
    background: 'rgba(255, 255, 255, 0.03)',
    color: 'var(--text-muted)'
  },
  copyBtn: {
    flexShrink: 0
  },
  backBtn: {
    marginTop: '12px'
  }
};

export default QRCodeShareModal;
