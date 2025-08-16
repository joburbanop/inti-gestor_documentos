import React from 'react'; import PropTypes from 'prop-types';
 const ConfirmModal = ({
 isOpen,
 onClose,
 onConfirm,
 title,
 message,
 confirmText = 'Confirmar',
 cancelText = 'Cancelar',
 type = 'danger', // 'danger'', 'warning', 'info'
 icon: Icon
 }) => {
 if (!isOpen) return null;
 //
 const handleBackdropClick = (e) => {
 if (e.target === e.currentTarget) {
 onClose();
 }
 };
 const handleConfirm = () => {
 onConfirm();
 onClose();
 };
 return (
 <div
 style={{
 position: 'fixed',
 top: 0,
 left: 0,
 right: 0,
 bottom: 0,
 zIndex: 9999,
 backgroundColor: 'rgba(0, 0, 0, 0.5)',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 padding: '1rem'
 }}
 onClick={handleBackdropClick}
 >
 <div
 style={{
 backgroundColor: 'white',
 borderRadius: '1rem',
 padding: '1.5rem',
 maxWidth: '28rem',
 width: '100%',
 boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
 position: 'relative',
 zIndex: 10000
 }}
 onClick={(e) => e.stopPropagation()}
 >
 {/* Header */}
 <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
 {Icon && (
 <div style={{
 flexShrink: 0,
 width: '2.5rem',
 height: '2.5rem',
 borderRadius: '50%',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 backgroundColor: type === 'danger' ? '#FEE2E2' : '#DBEAFE',
 color: type === 'danger' ? '#DC2626' : '#2563EB'
 }}>
 <Icon style={{ width: '1.5rem', height: '1.5rem' }} />
 </div>
 )}
 <div style={{ marginLeft: '0.75rem' }}>
 <h3 style={{
 fontSize: '1.125rem',
 fontWeight: '600',
 color: '#111827',
 margin: 0,
 lineHeight: '1.5'
 }}>
 {title}
 </h3>
 </div>
 </div>
 {/* Content */}
 <div style={{ marginTop: '0.5rem' }}>
 <p style={{
 fontSize: '0.875rem',
 color: '#374151',
 lineHeight: '1.6',
 margin: 0,
 fontWeight: '400'
 }}>
 {message}
 </p>
 </div>
 {/* Actions */}
 <div style={{
 display: 'flex',
 justifyContent: 'flex-end',
 gap: '0.75rem',
 marginTop: '1.5rem'
 }}>
 <button
 onClick={onClose}
 style={{
 padding: '0.5rem 1rem',
 fontSize: '0.875rem',
 fontWeight: '500',
 color: '#374151',
 backgroundColor: 'white',
 border: '1px solid #D1D5DB',
 borderRadius: '0.5rem',
 cursor: 'pointer',
 transition: 'all 0.2s ease',
 outline: 'none'
 }}
 onMouseOver={(e) => {
 e.target.style.backgroundColor = '#F9FAFB';
 e.target.style.borderColor = '#9CA3AF';
 }}
 onMouseOut={(e) => {
 e.target.style.backgroundColor = 'white';
 e.target.style.borderColor = '#D1D5DB';
 }}
 >
 {cancelText}
 </button>
 <button
 onClick={handleConfirm}
 style={{
 padding: '0.5rem 1rem',
 fontSize: '0.875rem',
 fontWeight: '600',
 color: 'white',
 backgroundColor: type === 'danger' ? '#DC2626' : '#2563EB',
 border: 'none',
 borderRadius: '0.5rem',
 cursor: 'pointer',
 transition: 'all 0.2s ease',
 outline: 'none',
 boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
 }}
 onMouseOver={(e) => {
 e.target.style.backgroundColor = type === 'danger' ? '#B91C1C' : '#1D4ED8';
 e.target.style.transform = 'translateY(-1px)';
 e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
 }}
 onMouseOut={(e) => {
 e.target.style.backgroundColor = type === 'danger' ? '#DC2626' : '#2563EB';
 e.target.style.transform = 'translateY(0)';
 e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
 }}
 >
 {confirmText}
 </button>
 </div>
 </div>
 </div>
 );
 };
 ConfirmModal.propTypes = {
 isOpen: PropTypes.bool.isRequired,
 onClose: PropTypes.func.isRequired,
 onConfirm: PropTypes.func.isRequired,
 title: PropTypes.string.isRequired,
 message: PropTypes.string.isRequired,
 confirmText: PropTypes.string,
 cancelText: PropTypes.string,
 type: PropTypes.oneOf(['danger'', 'warning', 'info']),
 icon: PropTypes.elementType
 };
 export default ConfirmModal;