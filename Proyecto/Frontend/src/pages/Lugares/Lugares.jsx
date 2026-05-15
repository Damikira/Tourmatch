import styles from './Lugares.module.css';

const Lugares = () => {
  return (
    <div className={styles.container}>
      <h1>Explora Destinos</h1>
      <p>Descubre los puntos más icónicos donde podemos llevarte.</p>
      <div className={styles.placeholderGrid}>
        {/* Aquí irán las fotos del Costanera Center, Museos, etc. */}
        <div className={styles.box}>Galería de Fotos (Cargando...)</div>
      </div>
    </div>
  );
};

export default Lugares;