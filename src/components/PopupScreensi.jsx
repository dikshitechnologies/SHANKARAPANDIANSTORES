import React, { useState,useRef, useEffect } from 'react';
import { FaPencilRuler, FaRecycle, FaTags, FaThList, FaBoxOpen } from 'react-icons/fa';

const BASE = '/SPSTORE/#/embed';

const screens = {
  design: { url: `${BASE}/design`, icon: <FaPencilRuler />, label: 'Design Creation' },
  scrap: { url: `${BASE}/scrap`, icon: <FaRecycle />, label: 'Scrap Page' },
  brand: { url: `${BASE}/brand`, icon: <FaTags />, label: 'Brand' },
  category: { url: `${BASE}/category`, icon: <FaThList />, label: 'Category' },
  product: { url: `${BASE}/product`, icon: <FaBoxOpen />, label: 'Product' },
  model: { url: `${BASE}/masters/model-creation`, icon: <FaBoxOpen />, label: 'Model' },
  size: { url: `${BASE}/masters/size-creation`, icon: <FaBoxOpen />, label: 'Size' },
  unit: { url: `${BASE}/masters/unit-creation`, icon: <FaBoxOpen />, label: 'Unit' }
}




const PopupScreensi = ({ open, onClose, screen }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.focus();
    }
  }, [open]);
  useEffect(() => {
  if (open) document.body.style.overflow = 'hidden';
  return () => document.body.style.overflow = '';
}, [open]);


 if (!open) return null;

  const { url, icon, label } = screens[screen];

  return (
  <div
    className="modal-overlay"
    tabIndex={-1}
    ref={modalRef}
    onMouseDown={onClose}
    onKeyDown={e => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    }}
    // REMOVE onClick={onClose} here!
    style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    }}
  >
    <div
      className="modal"
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: 0,
        maxWidth: 900,
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        position: 'relative',
        alignSelf: 'center',
        display: 'flex',
        flexDirection: 'column'
      }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottom: '1px solid #eee' ,
         position: 'relative',   // ✅ REQUIRED
    zIndex: 10  
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>{icon}</span>
          <h2 style={{ margin: 0, fontSize: 20 }}>{label}</h2>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            fontSize: 24,
            lineHeight: 1
          }}
          aria-label="Close"
          type="button"
          onMouseDown={e => {
                e.stopPropagation();
                onClose();
            }}
        >×</button>
      </div>
      <iframe
        src={url}
        title={label}
        style={{
          border: 'none',
          width: '100%',
          
          flex: 1,
          background: '#f9fafb',
          position: 'relative',   // ✅ REQUIRED
          zIndex: 1   
        }}
      />
    </div>
  </div>
);
};

// Export an icon button that opens the popup
export const PopupScreensiIcon = ({ screen = "design", icon, ...props }) => {
  const [open, setOpen] = useState(false);
  const screenObj = screens[screen];
  return (
    <>
      <button
        type="button"
        className="btn"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: 8, borderRadius: 8,border:"none",minWidth:'0px' }}
        onClick={() => setOpen(true)}
        {...props}
        title={screenObj?.label || "Open"}
      >
        {icon || screenObj?.icon}
      </button>
      <PopupScreensi open={open} onClose={() =>{ setOpen(false);
         console.log("close");
      }} screen={screen} />
    </>
  );
};

export default PopupScreensi;




// import { PopupScreensiIcon } from '../../components/PopupScreensi';

// Place this wherever you want the icon button:
{/* <PopupScreensiIcon screen="design" /> */}