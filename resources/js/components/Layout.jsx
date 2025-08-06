import React from 'react';
import PropTypes from 'prop-types';
import Navbar from './Navbar';
import { INTILED_COLORS } from '../config/colors';

const Layout = ({ children, title = "Intranet Inti" }) => {
    return (
        <div
            className="min-h-screen"
            style={{
                backgroundColor: INTILED_COLORS.white,
                paddingTop: '4rem' // Espacio para el navbar fijo
            }}
        >
            <Navbar title={title} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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