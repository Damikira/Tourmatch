import Card from '../../components/Card/Card'; // Importamos el componente que creamos
import styles from './Home.module.css';

const Home = () => {
  // Datos de ejemplo (Simulando lo que vendrá de la base de datos después)
  const experiencias = [
    { 
      id: 1, 
      title: "Ruta del Vino Valle Central", 
      price: "45.000", 
      duration: "6 hrs", 
      image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=500&q=80" 
    },
    { 
      id: 2, 
      title: "Tour Histórico Santiago", 
      price: "30.000", 
      duration: "4 hrs", 
      image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=500&q=80" 
    },
    { 
      id: 3, 
      title: "Escapada a la Montaña", 
      price: "55.000", 
      duration: "8 hrs", 
      image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=500&q=80" 
    },
  ];

  return (
    <main>
      {/* SECCIÓN HERO CON BUSCADOR */}
      <section className={styles.hero}>
        <h1>Tu viaje, tus reglas, tu conductor</h1>
        <p>Reserva rutas turísticas personalizadas con conductores locales de confianza.</p>

        <div className={styles.searchBox}>
          <div className={styles.inputGroup}>
            <label>Origen</label>
            <input type="text" placeholder="¿Desde dónde sales?" />
          </div>

          <div className={styles.inputGroup}>
            <label>Destino</label>
            <input type="text" placeholder="¿A dónde quieres ir?" />
          </div>

          <div className={styles.inputGroup}>
            <label>Vehículo</label>
            <select>
              <option value="basico">Económico (1-4 personas)</option>
              <option value="xl">XL (Grupos o equipaje extra)</option>
            </select>
          </div>

          <button className={styles.searchBtn}>Cotizar Viaje</button>
        </div>
      </section>

      {/* SECCIÓN DE EXPERIENCIAS (CARDS) */}
      <section className={styles.experiencesSection}>
        <h2 className={styles.sectionTitle}>Experiencias Populares</h2>
        <div className={styles.grid}>
          {experiencias.map((exp) => (
            <Card 
              key={exp.id} 
              title={exp.title} 
              price={exp.price} 
              duration={exp.duration} 
              image={exp.image} 
            />
          ))}
        </div>
      </section>
    </main>
  );
};

export default Home;