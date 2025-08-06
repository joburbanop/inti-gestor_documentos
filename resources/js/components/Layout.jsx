import React from 'react';
import PropTypes from 'prop-types';
import Navbar from './Navbar';
import styles from '../styles/components/Layout.module.css';

const Layout = ({ children, title = "Intranet Inti" }) => {
    return (
        <div className={styles.layoutContainer}>
            <Navbar title={title} />
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
};

Layout.propTypes = {
    children: PropTypes.node.isRequired,
    title: PropTypes.string
};

export default Layout; 