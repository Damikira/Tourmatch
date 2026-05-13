import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Login.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('turista');
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Objeto de usuario con el rol seleccionado
    const userData = {
      email: email,
      nombre: email.split('@')[0], 
      role: role // 'turista' o 'conductor'
    };

    login(userData);

    // Mensaje personalizado según el rol
    if (role === 'conductor') {
      alert("Bienvenido, Conductor. Gestiona tu vehículo y rutas.");
    } else {
      alert(`¡Hola ${userData.nombre}! Prepara tu próxima aventura.`);
    }

    // IMPORTANTE: Ahora todos navegan a /dashboard. 
    // App.jsx decidirá si mostrar DashboardConductor o DashboardTurista
    navigate('/dashboard'); 
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h2>Iniciar Sesión</h2>
        <p>Selecciona tu tipo de cuenta para ingresar al sistema.</p>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Tipo de Usuario</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className={styles.selectRole}
            >
              <option value="turista">Turista / Pasajero</option>
              <option value="conductor">Conductor / Transportista</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label>Correo Electrónico</label>
            <input 
              type="email" 
              placeholder="correo@ejemplo.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className={styles.loginBtn}>
            Entrar como {role === 'turista' ? 'Turista' : 'Conductor'}
          </button>
        </form>

        <div className={styles.footer}>
          <Link to="/registro">¿No tienes cuenta? Regístrate aquí</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;