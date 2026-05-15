import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './DashboardTurista.module.css';
import StatsCard from '../../components/StatsCard/StatsCard';

const DashboardTurista = () => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('construir');
  const [isSearching, setIsSearching] = useState(false);
  const [paradas, setParadas] = useState(['']);

  const historialViajes = [
    { id: 1, fecha: '10 MAY 2026', ruta: 'Santiago ➔ Viña del Mar', conductor: 'Carlos Ruiz', estado: 'Finalizado', precio: '$45.000' },
    { id: 2, fecha: '05 MAY 2026', ruta: 'Providencia ➔ Cajón del Maipo', conductor: 'Elena Gómez', estado: 'Finalizado', precio: '$32.000' },
  ];

  const agregarParada = () => {
    if (paradas.length < 5) {
      setParadas([...paradas, '']);
    } else {
      alert("El máximo de paradas por ruta es 5 por logística.");
    }
  };

  const manejarCambioParada = (index, valor) => {
    const nuevasParadas = [...paradas];
    nuevasParadas[index] = valor;
    setParadas(nuevasParadas);
  };

  const eliminarParada = (index) => {
    const nuevasParadas = paradas.filter((_, i) => i !== index);
    setParadas(nuevasParadas);
  };

  // LÓGICA DE CONEXIÓN ACTUALIZADA
  const handleCotizar = (e) => {
    e.preventDefault();
    setIsSearching(true);

    // 1. Creamos el objeto del viaje
    const nuevaSolicitud = {
      id: Date.now(),
      cliente: user?.nombre || 'Turista Anónimo',
      ruta: paradas.filter(p => p !== '').join(' ➔ '),
      fecha: new Date().toLocaleDateString(),
      estado: 'pendiente'
    };

    // 2. Guardamos en localStorage para que el Conductor lo vea
    const solicitudesExistentes = JSON.parse(localStorage.getItem('solicitudes_viaje')) || [];
    localStorage.setItem('solicitudes_viaje', JSON.stringify([...solicitudesExistentes, nuevaSolicitud]));

    // 3. Simulamos la espera y avisamos al usuario
    setTimeout(() => {
      setIsSearching(false);
      alert(`¡Ruta enviada con éxito! Los conductores ya pueden ver tu solicitud en tiempo real.`);
      setActiveTab('viajes'); 
    }, 3500);
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>TourMatch</div>
        <p className={styles.welcome}>Hola, <strong>{user?.nombre}</strong> 🎒</p>
        <nav>
          <ul>
            <li className={activeTab === 'construir' ? styles.active : ''} onClick={() => setActiveTab('construir')}>Construir Ruta</li>
            <li className={activeTab === 'viajes' ? styles.active : ''} onClick={() => setActiveTab('viajes')}>Mis Viajes</li>
            <li className={activeTab === 'favoritos' ? styles.active : ''} onClick={() => setActiveTab('favoritos')}>Favoritos</li>
          </ul>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1>Panel de Turista</h1>
          <p>Gestiona tus viajes y diseña nuevas aventuras.</p>
        </header>

        <div className={styles.statsGrid}>
          <StatsCard title="Viajes Realizados" value="2" icon="🌎" color="#2563eb" />
          <StatsCard title="Puntos Acumulados" value="1.200" icon="✨" color="#f59e0b" />
          <StatsCard title="Próximo Viaje" value={isSearching ? "Buscando..." : "Sin programar"} icon="⏳" color="#10b981" />
        </div>
        
        {activeTab === 'construir' && (
          <section className={styles.routeBox}>
            {!isSearching ? (
              <form onSubmit={handleCotizar} className={styles.form}>
                <h2>Constructor de Itinerario</h2>
                <div className={styles.stopsWrapper}>
                  {paradas.map((parada, index) => (
                    <div key={index} className={styles.stopInputGroup}>
                      <div className={styles.stopIndicator}>{index === 0 ? '🏁' : '📍'}</div>
                      <input
                        type="text"
                        placeholder={index === 0 ? "Punto de partida" : `Siguiente parada...`}
                        value={parada}
                        onChange={(e) => manejarCambioParada(index, e.target.value)}
                        required
                      />
                      {index > 0 && (
                        <button type="button" className={styles.removeBtn} onClick={() => eliminarParada(index)}>✕</button>
                      )}
                    </div>
                  ))}
                </div>
                <div className={styles.actions}>
                  <button type="button" className={styles.addBtn} onClick={agregarParada} disabled={paradas.length >= 5}>
                    + Añadir Parada
                  </button>
                  <button type="submit" className={styles.submitBtn}>Cotizar Ruta</button>
                </div>
              </form>
            ) : (
              <div className={styles.searchLoader}>
                <div className={styles.radar}></div>
                <h3>Buscando conductores disponibles...</h3>
                <div className={styles.routePreview}>
                   {paradas.filter(p => p !== '').join(' ➔ ')}
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === 'viajes' && (
          <div className={styles.routeBox}>
            <h2>Historial de Aventuras</h2>
            <div className={styles.tripList}>
              {historialViajes.map(trip => (
                <div key={trip.id} className={styles.tripCard}>
                  <div className={styles.tripInfo}>
                    <span className={styles.tripDate}>{trip.fecha}</span>
                    <h3>{trip.ruta}</h3>
                    <p>Conductor: <strong>{trip.conductor}</strong></p>
                  </div>
                  <div className={styles.tripStatus}>
                    <span className={styles.price}>{trip.precio}</span>
                    <span className={styles.badge}>{trip.estado}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'favoritos' && (
          <div className={styles.routeBox}>
            <h2>Destinos Guardados</h2>
            <p>Aquí aparecerán los lugares que marques con favorito.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardTurista;