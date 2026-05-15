import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="/">TourMatch</Link>
      </div>

      <ul className={styles.navLinks}>
        <li><Link to="/">Inicio</Link></li>
        <li><Link to="/panoramas">Panoramas</Link></li>
        <li><Link to="/lugares">Lugares</Link></li>
        <li><Link to="/nosotros">Nosotros</Link></li>
        <li><Link to="/contacto">Contacto</Link></li>
        
        {/* MEJORA: El Dashboard aparece al final de la lista SOLO si hay sesión */}
        {user && (
          <li>
            <Link to="/dashboard" className={styles.dashboardLink}>
              Mi Dashboard
            </Link>
          </li>
        )}
      </ul>

      <div className={styles.authArea}>
        {user ? (
          <div className={styles.userInfo}>
            <div className={styles.userBadge}>
              {/* CORRECCIÓN: Sincronización con el Backend (user.rol) */}
              <span className={styles.roleTag}>
                {user.rol === 'CONDUCTOR' ? '🚐 CONDUCTOR' : '🎒 TURISTA'}
              </span>
              <span className={styles.userName}>{user.nombre}</span>
            </div>
            <button onClick={handleLogout} className={styles.logoutBtn}>Salir</button>
          </div>
        ) : (
          <Link to="/login" className={styles.loginBtn}>Ingresar</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;