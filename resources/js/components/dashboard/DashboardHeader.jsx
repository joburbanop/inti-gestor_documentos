import React from 'react'; import PropTypes from 'prop-types';
 const DashboardHeader = ({ title, subtitle = '', rightSlot = null }) => {
 return (
 <div style={{
 padding: '1.25rem 1rem',
 borderBottom: '1px solid rgba(0,0,0,0.06)',
 background: 'transparent',
 }}>
 <div style={{
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'space-between',
 gap: '1rem',
 maxWidth: '1200px',
 margin: '0 auto'
 }}>
 <div>
 <h1 style={{
 fontSize: '1.5rem',
 lineHeight: 1.2,
 fontWeight: 700,
 margin: 0,
 color: '#0f172a'
 }}>{title}</h1>
 {subtitle && (
 <p style={{
 margin: '0.25rem 0 0',
 color: '#475569'
 }}>{subtitle}</p>
 )}
 </div>
 {rightSlot}
 </div>
 </div>
 );
 };
 DashboardHeader.propTypes = {
 title: PropTypes.string.isRequired,
 subtitle: PropTypes.string,
 rightSlot: PropTypes.node,
 };
 export default DashboardHeader;