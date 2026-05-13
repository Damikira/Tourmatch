import { useState } from 'react';
import styles from './Contacto.module.css';

const Contacto = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: 'soporte',
    mensaje: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí simulamos el envío
    console.log("Datos de contacto:", formData);
    alert(`¡Gracias ${formData.nombre}! Hemos recibido tu mensaje. Te contactaremos pronto.`);
    setFormData({ nombre: '', email: '', asunto: 'soporte', mensaje: '' });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Contáctanos</h1>
        <p>¿Tienes dudas? Estamos aquí para ayudarte a moverte por Santiago.</p>
      </header>

      <div className={styles.content}>
        {/* Información de contacto */}
        <div className={styles.infoSection}>
          <div className={styles.infoCard}>
            <h3>📍 Ubicación</h3>
            <p>Av. Nueva Providencia 1881, Santiago, Chile.</p>
          </div>
          <div className={styles.infoCard}>
            <h3>📞 Teléfono</h3>
            <p>+56 9 1234 5678</p>
          </div>
          <div className={styles.infoCard}>
            <h3>✉️ Email</h3>
            <p>soporte@tourmatch.cl</p>
          </div>
        </div>

        {/* Formulario */}
        <div className={styles.formSection}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Nombre Completo</label>
              <input 
                type="text" 
                placeholder="Tu nombre" 
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                required 
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Correo Electrónico</label>
              <input 
                type="email" 
                placeholder="correo@ejemplo.com" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required 
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Asunto</label>
              <select 
                value={formData.asunto}
                onChange={(e) => setFormData({...formData, asunto: e.target.value})}
              >
                <option value="soporte">Soporte Técnico</option>
                <option value="conductor">Ser Conductor</option>
                <option value="empresa">Convenios Empresa</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label>Mensaje</label>
              <textarea 
                rows="5" 
                placeholder="¿En qué podemos ayudarte?"
                value={formData.mensaje}
                onChange={(e) => setFormData({...formData, mensaje: e.target.value})}
                required
              ></textarea>
            </div>

            <button type="submit" className={styles.submitBtn}>Enviar Mensaje</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contacto;