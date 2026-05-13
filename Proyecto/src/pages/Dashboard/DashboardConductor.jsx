import { useState, useEffect } from 'react'; // Añadimos useEffect
import styles from './DashboardConductor.module.css';
import { useAuth } from '../../context/AuthContext';
import StatsCard from '../../components/StatsCard/StatsCard';

const DashboardConductor = () => {
  const { user } = useAuth();
  
  // ESTADOS
  const [activeTab, setActiveTab] = useState('vehiculo');
  const [vehiculo, setVehiculo] = useState({ patente: '', capacidad: '', tipo: 'van' });
  const [errorPatente, setErrorPatente] = useState('');
  
  // NUEVO ESTADO PARA VIAJES REALES
  const [viajesDisponibles, setViajesDisponibles] = useState([]);

  // Lógica para cargar viajes del localStorage cuando entras a la pestaña
  useEffect(() => {
    if (activeTab === 'viajes') {
      const solicitudes = JSON.parse(localStorage.getItem('solicitudes_viaje')) || [];
      // Filtramos para mostrar solo los que están pendientes
      setViajesDisponibles(solicitudes.filter(v => v.estado === 'pendiente'));
    }
  }, [activeTab]);

  // DATOS DE EJEMPLO PARA GANANCIAS
  const historialGanancias = [
    { id: 1, fecha: '12 May 2026', ruta: 'Centro ➔ Aeropuerto', monto: '$18.000', estado: 'Pagado' },
    { id: 2, fecha: '11 May 2026', ruta: 'Providencia ➔ Farellones', monto: '$55.000', estado: 'Pagado' },
    { id: 3, fecha: '10 May 2026', ruta: 'Santiago ➔ Valparaíso', monto: '$72.000', estado: 'Pendiente' },
  ];

  const validarPatente = (valor) => {
    const regex = /^[A-Z]{4}-\d{2}$|^[A-Z]{2}[A-Z]{2}-\d{2}$/;
    setVehiculo({ ...vehiculo, patente: valor.toUpperCase() });
    
    if (valor && !regex.test(valor.toUpperCase())) {
      setErrorPatente('Formato inválido (Ej: ABCD-12)');
    } else {
      setErrorPatente('');
    }
  };

  const handleUpdateVehiculo = (e) => {
    e.preventDefault();
    if (errorPatente) return alert("Corrige los errores antes de continuar");
    alert("Datos del vehículo actualizados correctamente en el sistema.");
  };

  const handleAceptarViaje = (id) => {
    alert("¡Viaje aceptado! Se ha notificado al turista y la ruta ha sido asignada a tu vehículo.");
    // Aquí podrías quitarlo de la lista localmente si quisieras
    setViajesDisponibles(viajesDisponibles.filter(v => v.id !== id));
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h3>TourMatch</h3>
        <p className={styles.welcome}>Bienvenido, <strong>{user?.nombre}</strong> 🚐</p>
        <nav>
          <ul>
            <li className={activeTab === 'vehiculo' ? styles.active : ''} onClick={() => setActiveTab('vehiculo')}>Mi Vehículo</li>
            <li className={activeTab === 'viajes' ? styles.active : ''} onClick={() => setActiveTab('viajes')}>Viajes Disponibles</li>
            <li className={activeTab === 'ganancias' ? styles.active : ''} onClick={() => setActiveTab('ganancias')}>Ganancias</li>
          </ul>
        </nav>
      </aside>

      <main className={styles.content}>
        <h1>Panel de Conductor</h1>

        <div className={styles.statsGrid}>
          <StatsCard title="Viajes del Mes" value="12" icon="🚐" color="#2563eb" />
          <StatsCard title="Ganancias Acumuladas" value="$145.000" icon="💰" color="#10b981" />
          <StatsCard title="Calificación" value="4.9" icon="⭐" color="#f59e0b" />
        </div>

        {activeTab === 'vehiculo' && (
          <div className={styles.grid}>
            <div className={styles.card}>
              <h2>Registrar mi Vehículo</h2>
              <form className={styles.form} onSubmit={handleUpdateVehiculo}>
                <label>Patente Chilena</label>
                <input 
                  type="text" 
                  placeholder="ABCD-12" 
                  value={vehiculo.patente}
                  onChange={(e) => validarPatente(e.target.value)}
                  required 
                />
                {errorPatente && <span className={styles.error}>{errorPatente}</span>}
                <label>Capacidad de Pasajeros</label>
                <input type="number" placeholder="Ej: 7" required />
                <label>Tipo de Vehículo</label>
                <select>
                  <option value="van">Van Turística</option>
                  <option value="auto">Sedán Privado</option>
                </select>
                <button type="submit" className={styles.submitBtn}>Actualizar Datos</button>
              </form>
            </div>
            <div className={styles.card}>
              <h2>Estado del Vehículo</h2>
              <div className={styles.statusCheck}>
                <p>✅ Documentación al día</p>
                <p>✅ Seguro de pasajeros activo</p>
                <p>⚠️ Revisión técnica vence en 20 días</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'viajes' && (
          <div className={styles.card}>
            <h2>Solicitudes en tiempo real 📡</h2>
            <div className={styles.tripList}>
              {viajesDisponibles.length > 0 ? (
                viajesDisponibles.map(viaje => (
                  <div key={viaje.id} className={styles.tripItem}>
                    <div className={styles.tripDetails}>
                      <p><strong>Ruta:</strong> {viaje.ruta}</p>
                      <span>Turista: {viaje.cliente} | Fecha: {viaje.fecha}</span>
                    </div>
                    <button 
                      className={styles.acceptBtn} 
                      onClick={() => handleAceptarViaje(viaje.id)}
                    >
                      Aceptar Viaje
                    </button>
                  </div>
                ))
              ) : (
                <div style={{textAlign: 'center', padding: '2rem'}}>
                  <p>No hay rutas solicitadas por turistas en este momento.</p>
                  <small>Cuando un turista cotice una ruta, aparecerá aquí automáticamente.</small>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ganancias' && (
          <div className={styles.card}>
            <h2>Historial de Ganancias</h2>
            <div className={styles.incomeList}>
              {historialGanancias.map(item => (
                <div key={item.id} className={item.incomeItem || styles.tripItem}>
                  <div>
                    <span className={styles.date}>{item.fecha}</span>
                    <p>{item.ruta}</p>
                  </div>
                  <div className={styles.amountBox}>
                    <span className={styles.amount}>{item.monto}</span>
                    <span className={item.estado === 'Pagado' ? styles.paid : styles.pending}>
                      {item.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardConductor;