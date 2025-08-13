import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from '../../styles/components/InfoCards.module.css';

const InfoCards = ({ items = [] }) => {
  const [visibleCards, setVisibleCards] = useState([]);

  useEffect(() => {
    // Animación de entrada escalonada
    const timer = setTimeout(() => {
      setVisibleCards(items.map((_, index) => index));
    }, 100);

    return () => clearTimeout(timer);
  }, [items]);

  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <section className={styles.cardsSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Misión y Visión</h2>
        <p className={styles.sectionSubtitle}>Los fundamentos de nuestra empresa</p>
      </div>
      
      <div className={styles.grid}>
        {items.map((item, idx) => (
          <article 
            key={idx} 
            className={`${styles.card} ${visibleCards.includes(idx) ? styles.visible : ''}`}
            style={{ animationDelay: `${idx * 0.2}s` }}
          >
            <div className={styles.cardBackground}>
              <div className={styles.accentGradient} />
              <div className={styles.patternOverlay} />
            </div>
            
            <div className={styles.cardContent}>
              {item.icon && (
                <div className={styles.iconWrap} aria-hidden="true">
                  <div className={styles.iconBackground}>
                    {item.icon}
                  </div>
                  <div className={styles.iconGlow} />
                </div>
              )}
              
              {item.title && (
                <h3 className={styles.title}>
                  {item.title}
                  <span className={styles.titleAccent} />
                </h3>
              )}
              
              {item.text && (
                <div className={styles.textContainer}>
                  <p className={styles.text}>{item.text}</p>
                </div>
              )}
            </div>
            
            <div className={styles.cardHoverEffect} />
          </article>
        ))}
      </div>
    </section>
  );
};

InfoCards.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string,
    text: PropTypes.string,
    icon: PropTypes.node,
  }))
};

export default InfoCards;
