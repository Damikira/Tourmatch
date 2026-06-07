import { useState, useEffect, useCallback } from 'react';
import styles from './DashboardConductor.module.css';
import { useAuth } from '../../context/AuthContext';
import StatsCard from '../../components/StatsCard/StatsCard';
import RegistrarVehiculo from '../Registro/RegistrarVehiculo';

const DashboardConductor = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('vehiculo');
  const [viajesDisponibles, setViajesDisponibles] = useState([]);
  const [vehiculoRegistrado, setVehiculoRegistrado] = useState(null);
  const [loadingVehiculo, setLoadingVehiculo] = useState(true);
  const [loadingViajes, setLoadingViajes] = useState(false);

  const [metricas, setMetricas] = useState({ viajesMes: 0, gananciasAcumuladas: 0, calificacion: 5.0 });
  const [historialGanancias] = useState([]);

  const consultarVehiculo = useCallback(async () => {
    if (!user?.token) return;
    try {
      const response = await fetch("http://localhost:8080/api/vehiculos/mi-vehiculo", {
        method: "GET",
        headers: { "Authorization": `Bearer ${user.token}` }
      });
      if (response.status === 200) {
        const data = await response.json();
        setVehiculoRegistrado(data); 
      }
    } catch (error) {
      console.error("Error al recuperar el vehículo:", error);
    } finally {
      setLoadingVehiculo(false);
    }
  }, [user?.token]);

  const consultarViajesDisponibles = useCallback(async () => {
    if (!user?.token) return;
    setLoadingViajes(true);
    try {
      const response = await fetch(`http://localhost:8080/api/reservas/disponibles?capacidad=4`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${user.token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setViajesDisponibles(data);
      }
    } catch (error) {
      console.error("Error al obtener las reservas:", error);
    } finally {
      setLoadingViajes(false);
    }
  }, [user?.token]);

  useEffect(() => {
    consultarVehiculo();
  }, [consultarVehiculo]);

  // AUTOMÁTICO: Cada vez que el conductor entra a la pestaña, carga los viajes de inmediato
  useEffect(() => {
    if (activeTab === 'viajes') {
      consultarViajesDisponibles();
    }
  }, [activeTab, consultarViajesDisponibles]);

  const handleAceptarViaje = async (id) => {
    if (!user?.token) return;
    try {
      const response = await fetch(`http://localhost:8080/api/reservas/${id}/aceptar`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${user.token}` }
      });
      if (response.ok) {
        setViajesDisponibles(prev => prev.filter(v => v.id !== id));
        alert("¡Has aceptado el traslado con éxito!");
        setMetricas(prev => ({ ...prev, viajesMes: prev.viajesMes + 1 }));
      }
    } catch (error) {
      console.error("Error al aceptar viaje:", error);
    }
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h3>TourMatch</h3>
        <p className={styles.welcome}>Bienvenido, <strong>{user?.nombre || "Conductor"}</strong> 🚐</p>
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
          <StatsCard title="Viajes del Mes" value={metricas.viajesMes.toString()} icon="🚐" color="#2563eb" />
          <StatsCard title="Ganancias" value={`$${metricas.gananciasAcumuladas.toLocaleString('es-CL')}`} icon="💰" color="#10b981" />
          <StatsCard title="Calificación" value={metricas.calificacion.toFixed(1)} icon="⭐" color="#f59e0b" />
        </div>

        {activeTab === 'vehiculo' && (
          <div className={styles.grid}>
            {loadingVehiculo ? (
              <div className={styles.card}><p>Cargando información...</p></div>
            ) : vehiculoRegistrado ? (
              <div className={styles.card}>
                <h2>Vehículo Registrado</h2>
                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                  <p><strong>Marca:</strong> {vehiculoRegistrado.marca}</p>
                  <p><strong>Modelo:</strong> {vehiculoRegistrado.modelo}</p>
                  <p><strong>Patente:</strong> {vehiculoRegistrado.patente?.toUpperCase()}</p>
                  <p><strong>Capacidad:</strong> {vehiculoRegistrado.capacidad} pasajeros</p>
                </div>
              </div>
            ) : (
              <RegistrarVehiculo onRegistroExitoso={consultarVehiculo} />
            )}
          </div>
        )}

        {activeTab === 'viajes' && (
          <div className={styles.card}>
            <h2>Solicitudes en Tiempo Real</h2>
            <div className={styles.tripList}>
              {loadingViajes ? (
                <p>Buscando solicitudes en Neon.tech...</p>
              ) : viajesDisponibles.length > 0 ? (
                viajesDisponibles.map(viaje => (
                  <div key={viaje.id} className={styles.tripItem} style={{ padding: '20px', marginBottom: '15px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <strong style={{ color: '#1e293b', display: 'block', marginBottom: '6px' }}>🗺️ Hoja de Ruta:</strong>
                      <div style={{ paddingLeft: '8px', borderLeft: '3px solid #3b82f6', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {viaje.waypoints && viaje.waypoints.length > 0 ? (
                          [...viaje.waypoints]
                            .sort((a, b) => a.orden - b.orden)
                            .map((wp, index) => (
                              <span key={wp.id || index} style={{ fontSize: '0.92rem', color: '#475569' }}>
                                {index === 0 ? "📍 Inicio: " : index === viaje.waypoints.length - 1 ? "🏁 Fin: " : `🛑 Parada ${index}: `} 
                                <strong>{wp.direccion}</strong>
                              </span>
                            ))
                        ) : (
                          <span style={{ color: '#94a3b8' }}>Sin paradas</span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
                      <span style={{ fontSize: '0.88rem' }}>
                        👤 Turista: <strong>{viaje.nombreTurista}</strong> <br/>
                        👥 Pasajeros: <strong>{viaje.cantidadPasajeros}</strong>
                      </span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#16a34a' }}>
                        ${viaje.precioTotal?.toLocaleString('es-CL')}
                      </span>
                    </div>

                    <button className={styles.acceptBtn} onClick={() => handleAceptarViaje(viaje.id)} style={{ marginTop: '15px', width: '100%', padding: '12px', fontWeight: 'bold' }}>
                      Aceptar Viaje
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p>No se registran solicitudes de rutas pendientes aptas para tu vehículo.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardConductor;