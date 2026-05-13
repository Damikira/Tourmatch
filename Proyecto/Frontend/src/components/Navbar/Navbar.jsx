import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/">TourMatch</Link>
        </div>

        <ul className={styles.navLinks}>
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/panoramas">Panoramas</Link></li>
          <li><Link to="/lugares">Lugares</Link></li>
          <li><Link to="/nosotros">Nosotros</Link></li>
          <li><Link to="/contacto">Contacto</Link></li>
        </ul>

        <div className={styles.authButtons}>
          {user ? (
            <div className={styles.userSection}>
              <Link to="/dashboard" className={styles.userMenu}>
                <span className={styles.roleBadge}>
                  {user.role === 'conductor' ? '🚐 Conductor' : '🎒 Turista'}
                </span>
                <span className={styles.userName}>{user.nombre}</span>
              </Link>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                Salir
              </button>
            </div>
          ) : (
            <div className={styles.guestButtons}>
              <Link to="/login" className={styles.loginBtn}>Entrar</Link>
              <Link to="/registro" className={styles.registerBtn}>Registro</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;