import { useState, useEffect, useCallback } from 'react';
import styles from './DashboardTurista.module.css';
import { useAuth } from '../../context/AuthContext';
import StatsCard from '../../components/StatsCard/StatsCard';

const DashboardTurista = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('buscar');
  const [historialViajes, setHistorialViajes] = useState([]);
  const [cantidadPasajeros, setCantidadPasajeros] = useState(1);
  
  // Establecer por defecto una fecha válida (mañana a esta misma hora) para pasar el filtro de las 10 horas
  const calcularFechaManana = () => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 1);
    return fecha.toISOString().slice(0, 16); 
  };
  const [fechaViaje, setFechaViaje] = useState(calcularFechaManana());

  // Iniciamos la ruta con los dos extremos obligatorios
  const [waypoints, setWaypoints] = useState([
    { direccion: '', tipo: 'ORIGEN' },
    { direccion: '', tipo: 'DESTINO' }
  ]);

  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  const consultarHistorial = useCallback(async () => {
    if (!user?.token) return;
    setLoadingHistorial(true);
    try {
      const response = await fetch("http://localhost:8080/api/reservas/mis-reservas", { 
        method: "GET",
        headers: {
          "Authorization": `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHistorialViajes(data);
      }
    } catch (error) {
      console.error("Error al obtener el historial de reservas:", error);
    } finally { 
      setLoadingHistorial(false);
    }
  }, [user?.token]);

  useEffect(() => {
    if (activeTab === 'historial') {
       consultarHistorial();
    }
  }, [activeTab, consultarHistorial]);

  const handleWaypointChange = (index, value) => {
    const nuevosWaypoints = [...waypoints];
    nuevosWaypoints[index].direccion = value;
    setWaypoints(nuevosWaypoints);
  };

  const agregarParadaIntermedia = () => {
    const nuevosWaypoints = [...waypoints];
    // Se inserta de manera ordenada antes del destino final
    nuevosWaypoints.splice(nuevosWaypoints.length - 1, 0, { direccion: '', tipo: 'PARADA' });
    setWaypoints(nuevosWaypoints);
  };

  const eliminarParada = (index) => {
    if (waypoints[index].tipo === 'PARADA') {
      setWaypoints(waypoints.filter((_, i) => i !== index));
    }
  };

  const handleSolicitarViaje = async (e) => {
    e.preventDefault();
    if (!user?.token) {
      return setMensaje({ texto: "Sesión inválida. Por favor, vuelve a iniciar sesión.", tipo: 'error' });
    }

    setMensaje({ texto: '', tipo: '' });

    if (waypoints.some(wp => wp.direccion.trim() === '')) {
      return setMensaje({ texto: "Por favor, completa todas las direcciones de la ruta.", tipo: 'error' });
    }

    // Mapeo adaptado con precisión a las columnas de Waypoint.java (direccion, latitud, longitud, orden)
    const waypointsFormateados = waypoints.map((wp, index) => ({
      direccion: wp.direccion,
      orden: index + 1,
      latitud: -33.4489,  
      longitud: -70.6693
    }));

    // Estructura adaptada estrictamente a Reserva.java
    const nuevaReserva = {
      fechaViaje: fechaViaje, // En formato 'YYYY-MM-DDTHH:mm' compatible con LocalDateTime
      cantidadPasajeros: parseInt(cantidadPasajeros),
      precioTotal: 12000.0 + (waypoints.length * 4000), 
      estado: "PENDIENTE", 
      waypoints: waypointsFormateados
    };

    try {
      const response = await fetch("http://localhost:8080/api/reservas/crear", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify(nuevaReserva)
      });

      if (response.ok) {
        setMensaje({ texto: "¡Tu solicitud de traslado multi-parada ha sido guardada en Neon.tech! Esperando asignación de conductor.", tipo: 'success' });
        setWaypoints([
          { direccion: '', tipo: 'ORIGEN' },
          { direccion: '', tipo: 'DESTINO' }
        ]);
        setCantidadPasajeros(1);
        setFechaViaje(calcularFechaManana());
      } else {
        const errorText = await response.text();
        setMensaje({ texto: errorText || "Error al procesar la solicitud en el servidor.", tipo: 'error' });
      }
    } catch (error) {
      setMensaje({ texto: "Error de comunicación con el servidor. Verifica tu conexión.", tipo: 'error' });
    }
  };

  const nombreFormateado = user?.nombre 
    ? user.nombre.charAt(0).toUpperCase() + user.nombre.slice(1).toLowerCase()
    : "Pasajero";

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h3>TourMatch</h3>
        <p className={styles.welcome}>Bienvenido, <strong>{nombreFormateado}</strong> 🌎</p>
        <nav>
          <ul>
            <li className={activeTab === 'buscar' ? styles.active : ''} onClick={() => setActiveTab('buscar')}>Solicitar Traslado</li>
            <li className={activeTab === 'historial' ? styles.active : ''} onClick={() => setActiveTab('historial')}>Mis Viajes</li>
          </ul>
        </nav>
      </aside>

      <main className={styles.content}>
        <h1>Panel de Pasajero</h1>

        <div className={styles.statsGrid}>
          <StatsCard title="Viajes Realizados" value={historialViajes.length.toString()} icon="🗺️" color="#2563eb" />
          <StatsCard title="Estado de Cuenta" value="Activa" icon="✓" color="#10b981" />
        </div>

        {activeTab === 'buscar' && (
          <div className={styles.card}>
            <h2>Personaliza tu Ruta Multi-Parada</h2>
            <p style={{color: '#64748b', marginBottom: '20px'}}>Agrega las paradas donde recoger pasajeros y los atractivos que deseas visitar.</p>
            
            <form onSubmit={handleSolicitarViaje} className={styles.form}>
              
              {waypoints.map((wp, index) => (
                <div key={index} className={styles.inputGroup} style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>
                      {wp.tipo === 'ORIGEN' && "📍 Punto de Inicio / Recogida Pasajero 1"}
                      {wp.tipo === 'PARADA' && `🛑 Parada Intermedia / Dirección Extra`}
                      {wp.tipo === 'DESTINO' && "🏁 Destino Final de la Ruta"}
                    </span>
                    {wp.tipo === 'PARADA' && (
                      <button 
                        type="button" 
                        onClick={() => eliminarParada(index)} 
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        (Remover)
                      </button>
                    )}
                  </label>
                  <input 
                    type="text" 
                    value={wp.direccion} 
                    onChange={(e) => handleWaypointChange(index, e.target.value)} 
                    required 
                    placeholder={
                      wp.tipo === 'ORIGEN' ? "Ej: Tu dirección de origen o punto de encuentro" :
                      wp.tipo === 'PARADA' ? "Ej: Dirección Pasajero 2 o parada en Costanera Center" :
                      "Ej: Destino final (Jardín Japonés / Aeropuerto)"
                    } 
                  />
                </div>
              ))}

              <button 
                type="button" 
                onClick={agregarParadaIntermedia} 
                style={{ background: '#f8fafc', color: '#0f172a', border: '1px dashed #cbd5e1', padding: '10px', borderRadius: '6px', cursor: 'pointer', marginBottom: '25px', width: '100%', fontWeight: '600' }}
              >
                ➕ Agregar otra Parada o Destino Turístico
              </button>

              <div className={styles.inputGroup} style={{ marginBottom: '15px' }}>
                <label>Fecha y Hora del Viaje (Min. 10 horas de anticipación)</label>
                <input 
                  type="datetime-local" 
                  value={fechaViaje} 
                  onChange={(e) => setFechaViaje(e.target.value)} 
                  required 
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Cantidad Total de Pasajeros</label>
                <input type="number" value={cantidadPasajeros} onChange={(e) => setCantidadPasajeros(e.target.value)} required min="1" max="15" />
              </div>

              <button type="submit" className={styles.submitBtn} style={{ marginTop: '20px' }}>
                Solicitar Ruta Personalizada
              </button>
            </form>
            {mensaje.texto && <p className={mensaje.tipo === 'success' ? styles.success : styles.error}>{mensaje.texto}</p>}
          </div>
        )}

        {activeTab === 'historial' && (
          <div className={styles.card}>
            <h2>Historial de Rutas Tomadas</h2>
            <div className={styles.tripList}>
              {loadingHistorial ? (
                <p>Cargando tus viajes desde el servidor...</p>
              ) : historialViajes.length > 0 ? (
                historialViajes.map(viaje => (
                  <div key={viaje.id} className={styles.tripItem}>
                    <div>
                      <span className={styles.date}>{new Date(viaje.fechaViaje).toLocaleString('es-CL')}</span>
                      <p style={{ marginTop: '5px' }}>
                        <strong>Ruta asignada:</strong>
                        {viaje.waypoints?.map((w, idx) => (
                          <span key={w.id} style={{ fontSize: '0.88rem', display: 'block', color: '#475569', paddingLeft: '10px' }}>
                            {idx + 1}. {w.direccion}
                          </span>
                        ))}
                      </p>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Pasajeros: {viaje.cantidadPasajeros} | Total: ${viaje.precioTotal.toLocaleString('es-CL')}</span>
                    </div>
                    <span className={styles.statusBadge}>{viaje.estado}</span>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p>Aún no registras viajes históricos en tu cuenta.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardTurista;