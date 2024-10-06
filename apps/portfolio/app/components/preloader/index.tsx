import styles from './styles.module.scss';

export const Preloader = () => {
  const text = 'Loading...';
  return (
    <section className={styles.loader}>
      <div className={styles.preloader}>
        <div className={styles.preloader__ring}>
          {Array(30)
            .fill('')
            .map((letter, index) => (
              <div key={index} className={styles.preloader__sector}>
                {text[index] || letter}
              </div>
            ))}
        </div>
        <div className={styles.preloader__ring}>
          {Array(30)
            .fill('')
            .map((letter, index) => (
              <div key={index} className={styles.preloader__sector}>
                {text[index] || letter}
              </div>
            ))}
        </div>
      </div>
      <div className={styles.progress} />
    </section>
  );
};
