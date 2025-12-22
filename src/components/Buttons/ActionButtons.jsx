import React from 'react';

const CreateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zM13.75 3.19l-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
    <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995zm-2.487 1a.5.5 0 0 1 .528.47l.8 10a1 1 0 0 0 .997.93h6.23a1 1 0 0 0 .997-.93l.8-10a.5.5 0 0 1 .528-.47H3.513z"/>
    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5"/>
  </svg>
);

const ClearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
  </svg>
);

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 0a2 2 0 0 0-2 2v2H2v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V4L8 0zM7 2a1 1 0 0 1 1-1h4.5L14 4H8V2z"/>
    <path d="M5 8.5a.5.5 0 0 1 .5-.5H10a.5.5 0 0 1 0 1H5.5a.5.5 0 0 1-.5-.5z"/>
  </svg>
);

const PrintIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M2 7a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1v1.5A1.5 1.5 0 0 0 5.5 15H10a1 1 0 0 0 1-1v-1h1a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H2zm11 1v3H3V8h10z"/>
    <path d="M5 1a1 1 0 0 0-1 1v3h8V2a1 1 0 0 0-1-1H5z"/>
  </svg>
);


export const ActionButtons = ({ children, activeButton, onButtonClick }) => {
  // Clone and modify children to add active state and click handler
  const modifiedChildren = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      const originalOnClick = child.props.onClick;
      return React.cloneElement(child, {
        isActive: activeButton === 'all' || child.props.buttonType === activeButton,
        onClick: (e) => {
          if (typeof originalOnClick === 'function') originalOnClick(e);
          if (typeof onButtonClick === 'function') onButtonClick(child.props.buttonType);
        }
      });
    }
    return child;
  });

  return (
    <div style={styles.buttonContainer}>
      {modifiedChildren}
    </div>
  );
};

export const ActionButtons1 = React.forwardRef(({ onClear, onSave, onPrint, activeButton, onButtonClick, disabledClear, disabledSave, disabledPrint }, ref) => {
  const handleClick = (type, handler) => () => {
    if (typeof handler === 'function') handler();
    if (typeof onButtonClick === 'function') onButtonClick(type);
  };

  return (
    <div style={styles.buttonContainer}>
      <ClearButton onClick={handleClick('clear', onClear)} disabled={disabledClear} isActive={activeButton === 'all' || activeButton === 'clear'} />
      <SaveButton ref={ref} onClick={handleClick('save', onSave)} disabled={disabledSave} isActive={activeButton === 'all' || activeButton === 'save'} />
      <PrintButton onClick={handleClick('print', onPrint)} disabled={disabledPrint} isActive={activeButton === 'all' || activeButton === 'print'} />
    </div>
  );
});

export const AddButton = ({ onClick, disabled, isActive, buttonType = 'add' }) => (
  <button 
    style={{ 
      ...styles.btn, 
      ...(!isActive ? styles.inactiveBtn : styles.addBtn),
      ...(disabled ? styles.disabled : {}) 
    }} 
    onClick={onClick} 
    disabled={disabled}
  >
    <CreateIcon /> Add
  </button>
);

export const EditButton = ({ onClick, disabled, isActive, buttonType = 'edit' }) => (
  <button 
    style={{ 
      ...styles.btn, 
      ...(!isActive ? styles.inactiveBtn : styles.editBtn),
      ...(disabled ? styles.disabled : {}) 
    }} 
    onClick={onClick}
    disabled={disabled}
  >
    <EditIcon /> Edit
  </button>
);

export const DeleteButton = ({ onClick, disabled, isActive, buttonType = 'delete' }) => (
  <button 
    style={{ 
      ...styles.btn, 
      ...(!isActive ? styles.inactiveBtn : styles.deleteBtn),
      ...(disabled ? styles.disabled : {}) 
    }} 
    onClick={onClick}
    disabled={disabled}
  >
    <DeleteIcon /> Delete
  </button>
);

export const ClearButton = ({ onClick, disabled, isActive, buttonType = 'clear' }) => (
  <button 
    style={{ 
      ...styles.btn, 
      ...(!isActive ? styles.inactiveBtn : styles.clearBtn),
      ...(disabled ? styles.disabled : {}) 
    }} 
    onClick={onClick}
    disabled={disabled}
  >
    <ClearIcon /> Clear
  </button>
);

export const SaveButton = React.forwardRef(({ onClick, disabled, isActive, buttonType = 'save' }, ref) => (
  <button 
    ref={ref}
    style={{ 
      ...styles.btn, 
      ...(!isActive ? styles.inactiveBtn : styles.saveBtn),
      ...(disabled ? styles.disabled : {}) 
    }} 
    onClick={onClick}
    disabled={disabled}
  >
    <SaveIcon /> Save
  </button>
));

export const PrintButton = ({ onClick, disabled, isActive, buttonType = 'print' }) => (
  <button 
    style={{ 
      ...styles.btn, 
      ...(!isActive ? styles.inactiveBtn : styles.printBtn),
      ...(disabled ? styles.disabled : {}) 
    }} 
    onClick={onClick}
    disabled={disabled}
  >
    <PrintIcon /> Print
  </button>
);

const styles = {
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '0.6rem 1.2rem',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '50px',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },
  inactiveBtn: {
    background: 'transparent',
    color: '#6c757d',
    boxShadow: 'none'
  },
  addBtn: {
    background: '#02a85a',
    color: 'white',
    boxShadow: '0 4px 20px rgba(2, 168, 90, 0.2)'
  },
  editBtn: {
    background: '#fbc02d',
    color: 'white',
    boxShadow: '0 4px 20px rgba(251, 192, 45, 0.2)'
  },
  deleteBtn: {
    background: '#e53935',
    color: 'white',
    boxShadow: '0 4px 20px rgba(229, 57, 53, 0.2)'
  },
  clearBtn: {
    background: '#e53935',
    color: 'white',
    boxShadow: '0 4px 20px rgba(229, 57, 53, 0.2)'
  },
  saveBtn: {
    background: '#1976d2',
    color: 'white',
    boxShadow: '0 4px 20px rgba(25, 118, 210, 0.18)'
  },
  printBtn: {
    background: '#6a1b9a',
    color: 'white',
    boxShadow: '0 4px 20px rgba(106, 27, 154, 0.18)'
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    pointerEvents: 'none'
  },
  buttonContainer: {
    display: 'flex',
    gap: '10px',
    backgroundColor: '#ffffff',
    padding: '0.4rem',
    borderRadius: '50px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
  }
};   