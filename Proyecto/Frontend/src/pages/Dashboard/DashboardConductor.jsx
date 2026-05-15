import { useState, useEffect } from 'react';
import styles from './DashboardConductor.module.css';
import { useAuth } from '../../context/AuthContext';
import StatsCard from '../../components/StatsCard/StatsCard';

import RegistrarVehiculo from '../Registro/RegistrarVehiculo';

const DashboardConductor = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('vehiculo');
  const [viajesDisponibles, setViajesDisponibles] = useState([]);

  // Carga de viajes (Mantenemos tu lógica de localStorage por ahora)
  useEffect(() => {
    if (activeTab === 'viajes') {
      const solicitudes = JSON.parse(localStorage.getItem('solicitudes_viaje')) || [];
      setViajesDisponibles(solicitudes.filter(v => v.estado === 'pendiente'));
    }
  }, [activeTab]);

  // DATOS DE EJEMPLO PARA GANANCIAS
  const historialGanancias = [
    { id: 1, fecha: '12 May 2026', ruta: 'Centro ➔ Aeropuerto', monto: '$18.000', estado: 'Pagado' },
    { id: 2, fecha: '11 May 2026', ruta: 'Providencia ➔ Farellones', monto: '$55.000', estado: 'Pagado' },
    { id: 3, fecha: '10 May 2026', ruta: 'Santiago ➔ Valparaíso', monto: '$72.000', estado: 'Pendiente' },
  ];

  const handleAceptarViaje = (id) => {
    alert("¡Viaje aceptado! Se ha notificado al turista.");
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
            {/* AQUÍ LLAMAMOS AL COMPONENTE QUE HACE EL POST AL BACKEND */}
            <RegistrarVehiculo />

            <div className={styles.card}>
              <h2>Estado del Vehículo</h2>
              <div className={styles.statusCheck}>
                <p>✅ Cuenta verificada</p>
                <p>✅ Seguro de pasajeros activo</p>
                <p>⚠️ Sube tus documentos para validación final</p>
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
                  <p>No hay rutas solicitadas en este momento.</p>
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
                <div key={item.id} className={styles.tripItem}>
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