import styles from './Panoramas.module.css';
import Card from '../../components/Card/Card';

const Panoramas = () => {
  const rutasPrehechas = [
    {
      id: 1,
      title: "Santiago Moderno: Vistas y Altura",
      price: "45.000",
      duration: "Full Day",
      image: "https://es.wikipedia.org/wiki/Parque_Bicentenario_%28Vitacura%29",
      description: "Parada 1: Parque Bicentenario • Parada 2: Sky Costanera • Parada 3: Barrio El Golf"
    },
    {
      id: 2,
      title: "Ruta Histórica y Tradición",
      price: "35.000",
      duration: "5 hrs",
      image: "https://images.unsplash.com/photo-1594916891413-88891f7596a7?q=80&w=800&auto=format&fit=crop",
      description: "Parada 1: Plaza de Armas • Parada 2: Cerro Santa Lucía • Parada 3: Templo Bahá'í"
    },
    {
      id: 3,
      title: "Santiago Bohemio y Cultura",
      price: "28.000",
      duration: "4 hrs",
      image: "https://images.unsplash.com/photo-1570654230464-9cf6d6f0660f?q=80&w=800&auto=format&fit=crop",
      description: "Parada 1: Barrio Bellavista • Parada 2: La Chascona • Parada 3: Patio Bellavista"
    }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Panoramas TourMatch</h1>
        <p>Rutas diseñadas por expertos en Santiago para que disfrutes sin preocupaciones.</p>
      </header>

      <div className={styles.grid}>
        {rutasPrehechas.map((ruta) => (
          <div key={ruta.id} className={styles.panoramaItem}>
            {/* Pasamos todas las propiedades al componente Card */}
            <Card {...ruta} />
            {/* Mostramos el detalle de las paradas debajo de la tarjeta */}
            <div className={styles.stopsBadge}>
               <p className={styles.stops}>{ruta.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Panoramas;