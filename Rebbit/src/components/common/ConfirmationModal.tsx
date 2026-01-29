import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }: ConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)', 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(3px)' 
    }} onClick={onClose}>
      
      <div style={{
        backgroundColor: '#1a1a1b',
        border: '1px solid #343536',
        borderRadius: '12px',
        padding: '24px',
        width: '100%',
        maxWidth: '400px',
        position: 'relative',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Заголовок */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ background: '#3e1818', padding: '8px', borderRadius: '50%', color: '#ff585b' }}>
            <AlertTriangle size={24} />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{title}</h2>
        </div>

        {/* Текст */}
        <p style={{ color: '#818384', lineHeight: '1.5', marginBottom: '24px' }}>
          {message}
        </p>

        {/* Кнопки */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: '20px',
              border: '1px solid #343536',
              background: 'transparent',
              color: '#d7dadc',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Отмена
          </button>
          
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            style={{
              padding: '10px 20px',
              borderRadius: '20px',
              border: 'none',
              background: '#ff585b',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <X size={18} /> Удалить
          </button>
        </div>
      </div>
    </div>
  );
};