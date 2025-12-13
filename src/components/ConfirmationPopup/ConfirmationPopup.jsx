import React from 'react';

const ConfirmationPopup = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "default", // "default", "warning", "danger", "success", "info", "question", "lock", "star", "heart", "download", "upload", "settings"
  showIcon = true,
  customStyles = {},
  disableBackdropClose = false,
  showLoading = false,
  iconSize = 24,
  hideCancelButton = false
}) => {
  if (!isOpen) return null;

  // Enhanced SVG Icons with more types
  const Icons = {
    // Basic types
    warning: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 9v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5l-6.928-12c-.77-1.333-2.694-1.333-3.464 0l-6.928 12c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    danger: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    success: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    default: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    info: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
    
    // Additional types
    question: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    lock: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    star: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    heart: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    download: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    upload: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
    settings: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    calendar: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    bell: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    mail: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    users: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    creditCard: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    shield: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    gift: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    )
  };

  // Styles object
  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.3s ease',
      backdropFilter: 'blur(4px)'
    },
    
    modal: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      width: '90%',
      maxWidth: '450px',
      padding: '30px',
      animation: 'slideUp 0.3s ease',
      overflow: 'hidden',
      ...customStyles.modal
    },
    
    header: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
      marginBottom: '20px',
      ...customStyles.header
    },
    
    iconContainer: {
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      ...customStyles.iconContainer
    },
    
    content: {
      flex: 1,
      ...customStyles.content
    },
    
    title: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#111827',
      margin: '0 0 8px 0',
      lineHeight: '1.3',
      ...customStyles.title
    },
    
    message: {
      fontSize: '15px',
      color: '#6b7280',
      lineHeight: '1.6',
      margin: 0,
      ...customStyles.message
    },
    
    footer: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      marginTop: '32px',
      ...customStyles.footer
    },
    
    buttonBase: {
      padding: '12px 28px',
      borderRadius: '10px',
      border: 'none',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      minWidth: '100px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      letterSpacing: '0.3px'
    },
    
    cancelButton: {
      backgroundColor: '#f9fafb',
      color: '#374151',
      border: '1px solid #d1d5db',
      ...customStyles.cancelButton
    },
    
    confirmButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      ...customStyles.confirmButton
    },
    
    spinner: {
      width: '18px',
      height: '18px',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderTopColor: 'white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }
  };

  // Get icon and colors based on type
  const getTypeStyles = () => {
    const typeConfigs = {
      // Basic types
      warning: {
        icon: Icons.warning,
        iconBg: '#fffbeb',
        iconColor: '#f59e0b',
        buttonBg: '#f59e0b',
        buttonHover: '#d97706'
      },
      danger: {
        icon: Icons.danger,
        iconBg: '#fef2f2',
        iconColor: '#ef4444',
        buttonBg: '#ef4444',
        buttonHover: '#dc2626'
      },
      success: {
        icon: Icons.success,
        iconBg: '#f0fdf4',
        iconColor: '#10b981',
        buttonBg: '#10b981',
        buttonHover: '#059669'
      },
      info: {
        icon: Icons.info,
        iconBg: '#eff6ff',
        iconColor: '#3b82f6',
        buttonBg: '#3b82f6',
        buttonHover: '#2563eb'
      },
      default: {
        icon: Icons.default,
        iconBg: '#f8fafc',
        iconColor: '#64748b',
        buttonBg: '#64748b',
        buttonHover: '#475569'
      },
      
      // Additional types
      question: {
        icon: Icons.question,
        iconBg: '#f0f9ff',
        iconColor: '#0ea5e9',
        buttonBg: '#0ea5e9',
        buttonHover: '#0284c7'
      },
      lock: {
        icon: Icons.lock,
        iconBg: '#f5f3ff',
        iconColor: '#8b5cf6',
        buttonBg: '#8b5cf6',
        buttonHover: '#7c3aed'
      },
      star: {
        icon: Icons.star,
        iconBg: '#fefce8',
        iconColor: '#eab308',
        buttonBg: '#eab308',
        buttonHover: '#ca8a04'
      },
      heart: {
        icon: Icons.heart,
        iconBg: '#fdf2f8',
        iconColor: '#ec4899',
        buttonBg: '#ec4899',
        buttonHover: '#db2777'
      },
      download: {
        icon: Icons.download,
        iconBg: '#f0fdfa',
        iconColor: '#14b8a6',
        buttonBg: '#14b8a6',
        buttonHover: '#0d9488'
      },
      upload: {
        icon: Icons.upload,
        iconBg: '#f0f9ff',
        iconColor: '#0ea5e9',
        buttonBg: '#0ea5e9',
        buttonHover: '#0284c7'
      },
      settings: {
        icon: Icons.settings,
        iconBg: '#f8fafc',
        iconColor: '#64748b',
        buttonBg: '#64748b',
        buttonHover: '#475569'
      },
      calendar: {
        icon: Icons.calendar,
        iconBg: '#f0f9ff',
        iconColor: '#0ea5e9',
        buttonBg: '#0ea5e9',
        buttonHover: '#0284c7'
      },
      bell: {
        icon: Icons.bell,
        iconBg: '#fef3c7',
        iconColor: '#d97706',
        buttonBg: '#d97706',
        buttonHover: '#b45309'
      },
      mail: {
        icon: Icons.mail,
        iconBg: '#e0f2fe',
        iconColor: '#0369a1',
        buttonBg: '#0369a1',
        buttonHover: '#075985'
      },
      users: {
        icon: Icons.users,
        iconBg: '#f0f9ff',
        iconColor: '#0ea5e9',
        buttonBg: '#0ea5e9',
        buttonHover: '#0284c7'
      },
      creditCard: {
        icon: Icons.creditCard,
        iconBg: '#f0fdf4',
        iconColor: '#16a34a',
        buttonBg: '#16a34a',
        buttonHover: '#15803d'
      },
      shield: {
        icon: Icons.shield,
        iconBg: '#fef3c7',
        iconColor: '#d97706',
        buttonBg: '#d97706',
        buttonHover: '#b45309'
      },
      gift: {
        icon: Icons.gift,
        iconBg: '#fdf2f8',
        iconColor: '#db2777',
        buttonBg: '#db2777',
        buttonHover: '#be185d'
      }
    };

    return typeConfigs[type] || typeConfigs.default;
  };

  const typeStyles = getTypeStyles();

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !disableBackdropClose) {
      onClose();
    }
  };

  // Handle confirm with loading state
  const handleConfirm = async () => {
    if (showLoading) {
      await onConfirm();
    } else {
      onConfirm();
    }
  };

  // Keyframes for animations
  const keyframesStyle = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    @keyframes iconPulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
  `;

  return (
    <>
      <style>{keyframesStyle}</style>
      <div 
        style={styles.overlay} 
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
      >
        <div style={styles.modal}>
          <div style={styles.header}>
            {showIcon && (
              <div 
                style={{
                  ...styles.iconContainer,
                  backgroundColor: typeStyles.iconBg,
                  color: typeStyles.iconColor,
                  animation: 'iconPulse 0.6s ease'
                }}
              >
                {typeStyles.icon}
              </div>
            )}
            <div style={styles.content}>
              <h2 
                id="confirmation-title"
                style={styles.title}
              >
                {title}
              </h2>
              <p style={styles.message}>
                {message}
              </p>
            </div>
          </div>
          
          <div style={styles.footer}>
            {!hideCancelButton && cancelText && (
              <button
                onClick={onClose}
                style={{
                  ...styles.buttonBase,
                  ...styles.cancelButton,
                  ...(customStyles.cancelButton?.style || {})
                }}
                disabled={showLoading}
                onMouseEnter={(e) => {
                  if (!customStyles.cancelButton?.style) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!customStyles.cancelButton?.style) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {cancelText}
              </button>
            )}
            
            <button
              onClick={handleConfirm}
              style={{
                ...styles.buttonBase,
                ...styles.confirmButton,
                backgroundColor: typeStyles.buttonBg,
                backgroundImage: showLoading 
                  ? `linear-gradient(90deg, ${typeStyles.buttonBg} 0%, ${typeStyles.buttonHover} 50%, ${typeStyles.buttonBg} 100%)`
                  : 'none',
                backgroundSize: showLoading ? '200% auto' : 'auto',
                animation: showLoading ? 'shimmer 2s linear infinite' : 'none',
                ...(customStyles.confirmButton?.style || {}),
                opacity: showLoading ? 0.9 : 1,
                cursor: showLoading ? 'not-allowed' : 'pointer'
              }}
              disabled={showLoading}
              onMouseEnter={(e) => {
                if (!showLoading && !customStyles.confirmButton?.style) {
                  e.currentTarget.style.backgroundColor = typeStyles.buttonHover;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 6px 20px ${typeStyles.buttonBg}40`;
                }
              }}
              onMouseLeave={(e) => {
                if (!customStyles.confirmButton?.style) {
                  e.currentTarget.style.backgroundColor = typeStyles.buttonBg;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {showLoading && (
                <div style={styles.spinner}></div>
              )}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmationPopup;