import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'; import PropTypes from 'prop-types';
 import styles from '../../styles/components/NewsSlider.module.css';
 /**
 * NewsSlider: Carrusel mejorado para mostrar noticias o banners con mejor UX.
 *
 * Props:
 * - items: Array<{ id?: string|number, title: string, subtitle?: string, imageUrl?: string, ctaText?: string, onClick?: Function }>
 * - autoPlay: boolean (default true)
 * - autoPlayMs: number (default 5000)
 * - showDots: boolean (default true)
 * - showArrows: boolean (default true)
 * - showProgress: boolean (default true)
 */
 const NewsSlider = ({
 items,
 autoPlay = true,
 autoPlayMs = 5000,
 showDots = true,
 showArrows = true,
 showProgress = true
 }) => {
 const safeItems = useMemo(() => Array.isArray(items) ? items.filter(Boolean) : [], [items]);
 const [currentIndex, setCurrentIndex] = useState(0);
 const [isPaused, setIsPaused] = useState(false);
 const [progress, setProgress] = useState(0);
 const intervalRef = useRef(null);
 const progressRef = useRef(null);
 const containerRef = useRef(null);
 const formatDate = useCallback((value) => {
 try {
 const d = new Date(value);
 if (isNaN(d.getTime())) return null;
 return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
 } catch (_) { return null; }
 }, []);
 const goTo = useCallback((index) => {
 if (safeItems.length === 0) return;
 const next = (index + safeItems.length) % safeItems.length;
 setCurrentIndex(next);
 setProgress(0);
 }, [safeItems.length]);
 const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
 const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);
 // Control de autoplay mejorado
 useEffect(() => {
 if (!autoPlay || safeItems.length <= 1 || isPaused) return;
 const startTime = Date.now();
 const duration = autoPlayMs;
 intervalRef.current = setInterval(() => {
 const elapsed = Date.now() - startTime;
 const newProgress = (elapsed / duration) * 100;
 if (newProgress >= 100) {
 setCurrentIndex((i) => (i + 1) % safeItems.length);
 setProgress(0);
 } else {
 setProgress(newProgress);
 }
 }, 50); // Actualizar cada 50ms para animación suave
 return () => {
 if (intervalRef.current) clearInterval(intervalRef.current);
 };
 }, [autoPlay, autoPlayMs, safeItems.length, isPaused, currentIndex]);
 const handleMouseEnter = () => {
 setIsPaused(true);
 if (intervalRef.current) clearInterval(intervalRef.current);
 };
 const handleMouseLeave = () => {
 setIsPaused(false);
 };
 // Teclas de accesibilidad
 useEffect(() => {
 const node = containerRef.current;
 if (!node) return;
 const onKeyDown = (e) => {
 if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
 if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
 if (e.key === ' ') { e.preventDefault(); setIsPaused(!isPaused); }
 };
 node.addEventListener('keydown', onKeyDown);
 return () => node.removeEventListener('keydown', onKeyDown);
 }, [goNext, goPrev, isPaused]);
 // Touch/swipe support
 const [touchStart, setTouchStart] = useState(null);
 const [touchEnd, setTouchEnd] = useState(null);
 const minSwipeDistance = 50;
 const onTouchStart = (e) => {
 setTouchEnd(null);
 setTouchStart(e.targetTouches[0].clientX);
 };
 const onTouchMove = (e) => {
 setTouchEnd(e.targetTouches[0].clientX);
 };
 const onTouchEnd = () => {
 if (!touchStart || !touchEnd) return;
 const distance = touchStart - touchEnd;
 const isLeftSwipe = distance > minSwipeDistance;
 const isRightSwipe = distance < -minSwipeDistance;
 if (isLeftSwipe) {
 goNext();
 }
 if (isRightSwipe) {
 goPrev();
 }
 };
 if (safeItems.length === 0) {
 return (
 <section className={styles.sliderContainer} aria-label="Noticias de la empresa">
 <div className={styles.slide}>
 <div className={styles.imagePlaceholder} />
 <div className={styles.contentOverlay}>
 <div className={styles.contentPanel}>
 <h3 className={styles.title}>Bienvenido</h3>
 <p className={styles.subtitle}>No hay noticias disponibles por ahora</p>
 </div>
 </div>
 </div>
 </section>
 );
 }
 const current = safeItems[currentIndex] || {};
 return (
 <section
 className={styles.sliderContainer}
 onMouseEnter={handleMouseEnter}
 onMouseLeave={handleMouseLeave}
 onTouchStart={onTouchStart}
 onTouchMove={onTouchMove}
 onTouchEnd={onTouchEnd}
 tabIndex={0}
 ref={containerRef}
 aria-roledescription="carousel"
 aria-label="Noticias de la empresa"
 >
 {/* Indicador de progreso */}
 {showProgress && safeItems.length > 1 && (
 <div className={styles.progressContainer}>
 <div
 className={styles.progressBar}
 style={{ width: `${progress}%` }}
 ref={progressRef}
 />
 </div>
 )}
 <div className={styles.slide}>
 {current.imageUrl ? (
 <img src={current.imageUrl} alt={current.title || 'Noticia'} className={styles.image} />
 ) : (
 <div className={styles.imagePlaceholder} />
 )}
 <div className={styles.contentOverlay}>
 <div className={styles.contentPanel}>
 {current.title && <h3 className={styles.title}>{current.title}</h3>}
 {current.subtitle && <p className={styles.subtitle}>{current.subtitle}</p>}
 {(current.publishedAt || current.date) && (
 <div className={styles.metaRow}>
 <svg className={styles.metaIcon} viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
 <path fill="currentColor" d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V3a1 1 0 0 1 1-1m12 6H5v11h14zm-2 3v2h-4v-2z"/>
 </svg>
 <span className={styles.metaText}>Publicado el {formatDate(current.publishedAt || current.date)}</span>
 </div>
 )}
 {current.ctaText && (
 <button
 className={styles.ctaButton}
 type="button"
 onClick={() => { try { current.onClick && current.onClick(current); } catch (_) {} }}
 aria-label={current.ctaText}
 >
 {current.ctaText}
 <svg className={styles.ctaIcon} viewBox="0 0 24 24" width="16" height="16">
 <path fill="currentColor" d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
 </svg>
 </button>
 )}
 </div>
 </div>
 </div>
 {/* Contador de slides */}
 {safeItems.length > 1 && (
 <div className={styles.slideCounter}>
 <span className={styles.currentSlide}>{currentIndex + 1}</span>
 <span className={styles.totalSlides}>/ {safeItems.length}</span>
 </div>
 )}
 {showArrows && safeItems.length > 1 && (
 <>
 <button className={`${styles.navArrow} ${styles.prev}`} aria-label="Anterior" onClick={goPrev}>
 <svg viewBox="0 0 24 24" width="20" height="20">
 <path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
 </svg>
 </button>
 <button className={`${styles.navArrow} ${styles.next}`} aria-label="Siguiente" onClick={goNext}>
 <svg viewBox="0 0 24 24" width="20" height="20">
 <path fill="currentColor" d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
 </svg>
 </button>
 </>
 )}
 {showDots && safeItems.length > 1 && (
 <div className={styles.dots} role="tablist" aria-label="Selector de noticias">
 {safeItems.map((_, idx) => (
 <button
 key={idx}
 type="button"
 className={`${styles.dot} ${idx === currentIndex ? styles.active : ''}`}
 onClick={() => goTo(idx)}
 role="tab"
 aria-selected={idx === currentIndex}
 aria-controls={`slide-${idx}`}
 />
 ))}
 </div>
 )}
 {/* Indicador de pausa */}
 {isPaused && autoPlay && (
 <div className={styles.pauseIndicator}>
 <svg viewBox="0 0 24 24" width="24" height="24">
 <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
 </svg>
 </div>
 )}
 </section>
 );
 };
 NewsSlider.propTypes = {
 items: PropTypes.arrayOf(PropTypes.shape({
 id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
 title: PropTypes.string,
 subtitle: PropTypes.string,
 imageUrl: PropTypes.string,
 ctaText: PropTypes.string,
 onClick: PropTypes.func,
 })).isRequired,
 autoPlay: PropTypes.bool,
 autoPlayMs: PropTypes.number,
 showDots: PropTypes.bool,
 showArrows: PropTypes.bool,
 showProgress: PropTypes.bool,
 };
 export default NewsSlider;