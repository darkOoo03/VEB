import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Plane, LogOut, Shield } from 'lucide-react';

export const Navbar = ({ onShowUsers }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <div className="logo" style={{ cursor: 'pointer' }}>
          <Plane size={28} style={{ transform: 'rotate(-45deg)' }} />
          <span>Voyager</span>
        </div>

        {user && (
          <div style={styles.userSection}>
            <div style={styles.userInfo}>
              <span style={styles.userName}>{user.name}</span>
              {user.isAdmin() ? (
                <span className="badge badge-danger" style={styles.adminBadge} onClick={onShowUsers}>
                  <Shield size={10} style={{ marginRight: '4px' }} />
                  Admin Panel
                </span>
              ) : (
                <span className="badge badge-primary" style={styles.roleBadge}>Putnik</span>
              )}
            </div>
            
            <button className="btn btn-secondary btn-sm" style={styles.logoutBtn} onClick={logout}>
              <LogOut size={16} />
              <span>Odjavi se</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

const styles = {
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '2px'
  },
  userName: {
    fontWeight: '600',
    fontSize: '0.95rem',
    color: '#fff'
  },
  adminBadge: {
    cursor: 'pointer',
    fontSize: '0.65rem',
    display: 'flex',
    alignItems: 'center',
    gap: '2px'
  },
  roleBadge: {
    fontSize: '0.65rem'
  },
  logoutBtn: {
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  }
};

export default Navbar;
