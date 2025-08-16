import React from 'react'; import PropTypes from 'prop-types';
 import Navbar from './Navbar';
 // import SessionTimeoutWarning from './common/SessionTimeoutWarning'; // TEMPORALMENTE DESHABILITADO
 import styles from '../styles/components/Layout.module.css';
 const Layout = ({ children, title = "Intranet Inti" }) => {
 return (
 <div className={styles.layoutContainer}>
 <Navbar title={title} />
 <main className={styles.mainContent}>
 {children}
 </main>
 {/* <SessionTimeoutWarning /> TEMPORALMENTE DESHABILITADO */}
 </div>
 );
 };
 Layout.propTypes = {
 children: PropTypes.node.isRequired,
 title: PropTypes.string
 };
 export default Layout;