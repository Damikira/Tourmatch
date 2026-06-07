import styles from './Panoramas.module.css';
import Card from '../../components/Card/Card';

const Panoramas = () => {
  // Rutas turísticas optimizadas y listas para ser comercializadas
  const rutasPrehechas = [
    {
      id: 1,
      title: "Santiago Moderno: Vistas y Altura",
      price: "45.000",
      duration: "Full Day (8 hrs)",
      // CORREGIDO: URL de imagen real y pública de Santiago financiero / Vitacura
      image: "https://images.unsplash.com/photo-1590055531920-0081e749e7bd?auto=format&fit=crop&q=80&w=800",
      description: "Parque Bicentenario • Sky Costanera • Barrio El Golf"
    },
    {
      id: 2,
      title: "Ruta Histórica y Tradición",
      price: "35.000",
      duration: "Media Jornada (5 hrs)",
      image: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?q=80&w=800&auto=format&fit=crop",
      description: "Plaza de Armas • Cerro Santa Lucía • Templo Bahá'í"
    },
    {
      id: 3,
      title: "Santiago Bohemio y Cultura",
      price: "28.000",
      duration: "Por la Tarde (4 hrs)",
      image: "https://images.unsplash.com/photo-1570654230464-9cf6d6f0660f?q=80&w=800&auto=format&fit=crop",
      description: "Barrio Bellavista • Casa Museo La Chascona • Patio Bellavista"
    },
    {
      id: 4,
      title: "Circuito del Vino: Valle del Maipo",
      price: "55.000",
      duration: "Full Day (6 hrs)",
      image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800&auto=format&fit=crop",
      description: "Viña Concha y Toro • Almuerzo Campestre • Viña Santa Rita"
    }
  ];

  return (
    <div className={styles.container}>
      {/* HEADER PREMIUM */}
      <header className={styles.headerSection}>
        <div className={styles.heroOverlay}>
          <h1>Panoramas Exclusivos</h1>
          <p className={styles.subtitle}>
            Rutas turísticas prediseñadas por expertos locales. Elige tu circuito ideal y trasládate con chofer privado sin preocuparte del tráfico ni el mapa.
          </p>
        </div>
      </header>

      {/* CONTENEDOR DE TARJETAS */}
      <main className={styles.mainContent}>
        <div className={styles.grid}>
          {rutasPrehechas.map((ruta) => (
            <div key={ruta.id} className={styles.panoramaItem}>
              
              {/* Contenedor estético de la tarjeta */}
              <div className={styles.cardWrapper}>
                <Card {...ruta} />
                
                {/* Badge dinámico inferior para desglosar el itinerario */}
                <div className={styles.stopsBadge}>
                  <span className={styles.badgeTitle}>📍 ITINERARIO DEL VIAJE:</span>
                  <p className={styles.stopsText}>{ruta.description}</p>
                </div>

                {/* Botón de acción rápido */}
                <div className={styles.actionContainer}>
                  <button className={styles.bookBtn}>Reservar Tour Completo ➔</button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Panoramas;