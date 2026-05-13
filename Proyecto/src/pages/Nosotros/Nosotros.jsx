import styles from './Nosotros.module.css';

const Nosotros = () => {
  return (
    <div className={styles.container}>
      <h1>Sobre TourMatch</h1>
      <section className={styles.content}>
        <div className={styles.text}>
          <h2>Seguridad y Confianza</h2>
          <p>Somos una empresa de transporte privado enfocada en brindar la mejor experiencia. 
             Nuestros conductores cuentan con años de trayectoria y pasan por filtros de seguridad estrictos.</p>
          <ul>
            <li>✅ Conductores profesionales</li>
            <li>✅ Vehículos de alto estándar</li>
            <li>✅ Monitoreo en tiempo real</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Nosotros;