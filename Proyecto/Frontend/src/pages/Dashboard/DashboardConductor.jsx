import { useState, useEffect, useCallback } from 'react';
import styles from './DashboardConductor.module.css';
import { useAuth } from '../../context/AuthContext';
import StatsCard from '../../components/StatsCard/StatsCard';
import RegistrarVehiculo from '../Registro/RegistrarVehiculo';

const DashboardConductor = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('vehiculo');
  const [viajesDisponibles, setViajesDisponibles] = useState([]);
  const [viajesEnCurso, setViajesEnCurso] = useState([]); 
  const [vehiculoRegistrado, setVehiculoRegistrado] = useState(null);
  const [loadingVehiculo, setLoadingVehiculo] = useState(true);
  const [loadingViajes, setLoadingViajes] = useState(false);

  const [metricas, setMetricas] = useState({ viajesMes: 0, gananciasAcumuladas: 0, calificacion: 5.0 });

  const consultarVehiculo = useCallback(async () => {
    if (!user?.token) return;
    try {
      const response = await fetch("https://tourmatch-dw83.onrender.com/api/vehiculos/mi-vehiculo", {
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

  const consultarViajesYActivos = useCallback(async () => {
    if (!user?.token) return;
    setLoadingViajes(true);
    try {
      // 🌟 CORREGIDO: Mapeo exacto a 'capacidad' en español tal como está en tu modelo Java
      const capacidadFiltro = (vehiculoRegistrado && vehiculoRegistrado.capacidad) ? vehiculoRegistrado.capacidad : 4;

      // 1. Obtener solicitudes generales pendientes usando el parámetro 'capacity'
      const resDisponibles = await fetch(`https://tourmatch-dw83.onrender.com/api/reservas/disponibles?capacity=${capacidadFiltro}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${user.token}` }
      });
      if (resDisponibles.ok) {
        const dataDisp = await resDisponibles.json();
        setViajesDisponibles(dataDisp);
      }

      // 2. Obtener los viajes que este conductor ya aceptó y están activos
      const resActivos = await fetch(`https://tourmatch-dw83.onrender.com/api/reservas/mis-viajes-activos`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${user.token}` }
      });
      if (resActivos.ok) {
        const dataActivos = await resActivos.json();
        setViajesEnCurso(dataActivos);
      }
    } catch (error) {
      console.error("Error al sincronizar listas de reservas:", error);
    } finally {
      setLoadingViajes(false);
    }
  }, [user?.token, vehiculoRegistrado]);

  useEffect(() => {
    consultarVehiculo();
  }, [consultarVehiculo]);

  useEffect(() => {
    if (activeTab === 'viajes') {
      consultarViajesYActivos();
    }
  }, [activeTab, consultarViajesYActivos]);

  const handleAceptarViaje = async (id) => {
    if (!user?.token) return;
    try {
      const response = await fetch(`https://tourmatch-dw83.onrender.com/api/reservas/${id}/aceptar`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${user.token}` }
      });
      if (response.ok) {
        alert("¡Has aceptado el traslado con éxito!");
        await consultarViajesYActivos(); 
      } else {
        const errTxt = await response.text();
        alert(`Error al procesar: ${errTxt}`);
      }
    } catch (error) {
      console.error("Error al aceptar viaje:", error);
    }
  };

  const handleFinalizarViaje = async (id) => {
    if (!user?.token) return;
    try {
      const response = await fetch(`https://tourmatch-dw83.onrender.com/api/reservas/${id}/finalizar`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${user.token}` }
      });

      if (response.ok) {
        const viajeCompletado = viajesEnCurso.find(v => v.id === id);
        alert("🎉 ¡Viaje concluido y guardado exitosamente!");
        
        setMetricas(prev => ({ 
          ...prev, 
          viajesMes: prev.viajesMes + 1,
          gananciasAcumuladas: prev.gananciasAcumuladas + (viajeCompletado?.precioTotal || 0)
        }));
        
        setViajesEnCurso(prev => prev.filter(v => v.id !== id));
      } else {
        const errorMsg = await response.text();
        alert(`❌ Error al completar: ${errorMsg}`);
      }
    } catch (error) {
      console.error("Error en red al finalizar viaje:", error);
    }
  };

  const esFechaPasada = (fechaViajeStr) => {
    if (!fechaViajeStr) return false;
    return new Date() >= new Date(fechaViajeStr);
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
                  {/* 🌟 CORREGIDO: Uso dinámico de 'capacidad' y 'tipo' según el modelo de la BD */}
                  <p><strong>Capacidad:</strong> {vehiculoRegistrado.capacidad} pasajeros</p>
                  <p><strong>Categoría Homologada:</strong> <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{vehiculoRegistrado.tipo === 'XL' ? '🚐 XL (5-12 Pasajeros)' : '🚗 BASICO (1-4 Pasajeros)'}</span></p>
                </div>
              </div>
            ) : (
              <RegistrarVehiculo onRegistroExitoso={consultarVehiculo} />
            )}
          </div>
        )}

        {activeTab === 'viajes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            <div className={styles.card}>
              <h2>Solicitudes en Tiempo Real {vehiculoRegistrado?.tipo === 'XL' ? '📦 (Filtro: XL)' : '🚗 (Filtro: Básico)'}</h2>
              <div className={styles.tripList}>
                {loadingViajes ? (
                  <p>Buscando solicitudes en Neon.tech...</p>
                ) : viajesDisponibles.length > 0 ? (
                  viajesDisponibles.map(viaje => (
                    <div key={viaje.id} className={styles.tripItem} style={{ padding: '20px', marginBottom: '15px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <div style={{ marginBottom: '12px' }}>
                        <strong style={{ color: '#1e293b', display: 'block', marginBottom: '4px' }}>🗺️ Hoja de Ruta:</strong>
                        <span style={{ fontSize: '0.82rem', color: '#64748b', display: 'block', marginBottom: '8px' }}>⏰ Programado para: {new Date(viaje.fechaViaje).toLocaleString('es-CL')}</span>
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

                      <button className={styles.acceptBtn} onClick={() => handleAceptarViaje(viaje.id)} style={{ marginTop: '15px', width: '100%', padding: '12px', fontWeight: 'bold', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        Aceptar Viaje
                      </button>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <p>No se registran solicitudes de rutas pendientes aptas para tu categoría de vehículo.</p>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.card} style={{ borderColor: '#10b981' }}>
              <h2>Mis Traslados Próximos y en Curso</h2>
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '15px' }}>🔒 Los traslados se bloquean por seguridad y solo se habilitarán para finalización el día de la cita agendada.</p>
              
              <div className={styles.tripList}>
                {viajesEnCurso.length > 0 ? (
                  viajesEnCurso.map(viaje => {
                    const listo = esFechaPasada(viaje.fechaViaje);
                    return (
                      <div key={viaje.id} style={{ padding: '20px', marginBottom: '15px', border: '1px solid #10b981', borderRadius: '8px', backgroundColor: '#f0fdf4' }}>
                        <div style={{ marginBottom: '12px' }}>
                          <span style={{ float: 'right', backgroundColor: '#bbf7d0', color: '#16a34a', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>ACEPTADO</span>
                          <strong style={{ color: '#1e293b', display: 'block', marginBottom: '4px' }}>📆 Cita Programada:</strong>
                          <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#0f172a' }}>
                            {new Date(viaje.fechaViaje).toLocaleString('es-CL')}
                          </span>
                        </div>

                        <div style={{ paddingLeft: '8px', borderLeft: '3px solid #10b981', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '15px' }}>
                          {viaje.waypoints?.sort((a,b)=> a.orden - b.orden).map((wp, idx) => (
                            <span key={wp.id || idx} style={{ fontSize: '0.88rem', color: '#334155' }}>
                              {idx + 1}. {wp.direccion}
                            </span>
                          ))}
                        </div>

                        <button 
                          onClick={() => handleFinalizarViaje(viaje.id)}
                          disabled={!listo}
                          style={{
                            width: '100%', padding: '12px', fontWeight: 'bold', borderRadius: '6px', border: 'none', color: 'white',
                            backgroundColor: listo ? '#16a34a' : '#94a3b8',
                            cursor: listo ? 'pointer' : 'not-allowed'
                          }}
                        >
                          {listo ? "🏁 Finalizar Traslado Ahora" : "🔒 Esperando Fecha del Viaje para Finalizar"}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p style={{ color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>No registras itinerarios agendados por realizar en este momento.</p>
                )}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardConductor;