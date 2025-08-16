import { useState, useCallback } from 'react'; const useConfirmModal = () => {
 const [modalState, setModalState] = useState({
 isOpen: false,
 title: '',
 message: '',
 confirmText: 'Confirmar',
 cancelText: 'Cancelar',
 type: 'danger',
 onConfirm: null,
 icon: null
 });
 const showConfirmModal = useCallback(({
 title,
 message,
 confirmText = 'Confirmar',
 cancelText = 'Cancelar',
 type = 'danger',
 onConfirm,
 icon = null
 }) => {
 setModalState({
 isOpen: true,
 title,
 message,
 confirmText,
 cancelText,
 type,
 onConfirm,
 icon
 });
 }, []);
 const hideConfirmModal = useCallback(() => {
 setModalState(prev => ({
 ...prev,
 isOpen: false
 }));
 }, []);
 const executeConfirm = useCallback(() => {
 if (modalState.onConfirm) {
 modalState.onConfirm();
 }
 hideConfirmModal();
 }, [modalState.onConfirm, hideConfirmModal]);
 return {
 modalState,
 showConfirmModal,
 hideConfirmModal,
 executeConfirm
 };
 };
 export default useConfirmModal;