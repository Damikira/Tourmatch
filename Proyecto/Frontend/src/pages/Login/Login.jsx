import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Login.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Llamamos a la función login del AuthContext
      const result = await login(email, password);

      // Si el login fue exitoso
      if (result && result.success) {
        if (result.rol === 'CONDUCTOR') {
          navigate('/dashboard-conductor');
        } else if (result.rol === 'TURISTA') {
          navigate('/dashboard-turista');
        } else {
          navigate('/dashboard');
        }
      } else {
        // 🌟 CORREGIDO: Forzamos un mensaje limpio y amigable para cualquier fallo de credenciales
        const msgLower = result && result.message ? result.message.toLowerCase() : '';
        
        if (
          msgLower.includes('credential') || 
          msgLower.includes('password') || 
          msgLower.includes('incorrect') || 
          msgLower.includes('bad') ||
          msgLower.includes('token')
        ) {
          setError('❌ Contraseña o correo incorrectos, intente de nuevo.');
        } else {
          setError(result?.message || '❌ Contraseña o correo incorrectos, intente de nuevo.');
        }
        setLoading(false);
      }
    } catch (err) {
      console.error("Error atrapado en el login:", err);
      setError('❌ Contraseña o correo incorrectos, intente de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h2>Bienvenido de nuevo</h2>
        <p>Ingresa tus credenciales para acceder a TourMatch.</p>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Correo Electrónico</label>
            <input 
              type=\"email\" 
              placeholder=\"correo@ejemplo.com\" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Contraseña</label>
            <input 
              type=\"password\" 
              placeholder=\"••••••••\" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type=\"submit\" className={styles.loginBtn} disabled={loading}>
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className={styles.footer}>
          <p>¿No tienes cuenta? <Link to=\"/registro\">Regístrate aquí</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
