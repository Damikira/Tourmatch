import styles from './Card.module.css';

const Card = ({ title, price, image, duration }) => {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img src={image} alt={title} />
        <span className={styles.price}>${price}</span>
      </div>
      <div className={styles.content}>
        <h3>{title}</h3>
        <p>⏱ Duración: {duration}</p>
        <button className={styles.detailBtn}>Ver detalles</button>
      </div>
    </div>
  );
};

export default Card;