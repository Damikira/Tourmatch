import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Registro.module.css';

const Registro = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'turista',
    patente: '',      // Campo nuevo
    capacidad: ''     // Campo nuevo
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("¡Ups! Las contraseñas no coinciden. Revisa de nuevo.");
      return;
    }

    // Aquí ya estamos enviando el objeto completo (con patente si es conductor)
    console.log("Datos para el Backend:", formData);

    alert(`¡Cuenta de ${formData.role} creada con éxito!`);
    navigate('/login');
  };

  return (
    <div className={styles.container}>
      <div className={styles.registerCard}>
        <h2>Crea tu cuenta</h2>
        <p>Regístrate para empezar a {formData.role === 'turista' ? 'viajar' : 'conducir'}.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Nombre Completo</label>
            <input 
              type="text" name="nombre" placeholder="Juan Pérez" 
              value={formData.nombre} onChange={handleChange} required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Correo Electrónico</label>
            <input 
              type="email" name="email" placeholder="correo@ejemplo.com" 
              value={formData.email} onChange={handleChange} required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label>¿Qué tipo de usuario eres?</label>
            <select name="role" value={formData.role} onChange={handleChange} className={styles.select}>
              <option value="turista">Turista / Pasajero</option>
              <option value="conductor">Conductor / Chofer</option>
            </select>
          </div>

          {/* CAMPOS CONDICIONALES PARA CONDUCTOR */}
          {formData.role === 'conductor' && (
            <div className={styles.conductorFields}>
              <div className={styles.inputGroup}>
                <label>Patente del Vehículo</label>
                <input 
                  type="text" name="patente" placeholder="ABCD-12" 
                  value={formData.patente} onChange={handleChange} required 
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Capacidad de Pasajeros</label>
                <input 
                  type="number" name="capacidad" placeholder="Ej: 4" 
                  value={formData.capacidad} onChange={handleChange} required 
                />
              </div>
            </div>
          )}

          <div className={styles.inputGroup}>
            <label>Contraseña</label>
            <input 
              type="password" name="password" placeholder="Min. 8 caracteres" 
              value={formData.password} onChange={handleChange} required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Confirmar Contraseña</label>
            <input 
              type="password" name="confirmPassword" placeholder="Repite tu contraseña" 
              value={formData.confirmPassword} onChange={handleChange} required 
            />
          </div>

          <button type="submit" className={styles.registerBtn}>
            Registrarme como {formData.role}
          </button>
        </form>

        <div className={styles.footer}>
          <p>¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Registro;