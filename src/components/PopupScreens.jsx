import React, { useState } from 'react';
import Design from '../pages/DesignCreation/DesignCreation';
import ScrapPage from '../pages/scrappage/scrappage';
import BrandPage from '../pages/Brand/Brand';
import Category from '../pages/category/category';
import Product from '../pages/Product/Product';
import ItemCreation from '../pages/ItemCreation/ItemCreation';
import LedgerCreation from '../pages/Ledgercreation/Ledgercreation';
import { FaPencilRuler, FaRecycle, FaTags, FaThList, FaBoxOpen, FaTimes,FaUserPlus  } from 'react-icons/fa';
import { HiMiniSquaresPlus } from "react-icons/hi2";
import { FaPersonCirclePlus } from "react-icons/fa6";
import SalesmanCreation from '../pages/SalesmanCreation/SalesmanCreation';
// Array of popup screens with icons and components
export const popupScreens = [
  {
    key: 'design',
    label: 'Design Creation',
    icon: <FaPencilRuler />,
    component: Design,
  },
  {
    key: 'scrap',
    label: 'Scrap Page',
    icon: <FaRecycle />,
    component: ScrapPage,
  },
  {
    key: 'brand',
    label: 'Brand Creation',
    icon: <FaTags />,
    component: BrandPage,
  },
  {
    key: 'category',
    label: 'Category Creation',
    icon: <FaThList />,
    component: Category,
  },
  {
    key: 'product',
    label: 'Product Creation',
    icon: <FaBoxOpen />,
    component: Product,
  },
  {
    key: 'item',
    label: 'Item Creation',
    icon: <HiMiniSquaresPlus  />,
    component: ItemCreation,
  },
  {
    key: 'ledger',
    label: 'Ledger Creation',
    icon: <FaUserPlus />,
    component: LedgerCreation,
  },
  {
    key: 'Sales',
    label: 'Salesman Creation',
    icon: <FaPersonCirclePlus />,
    component: SalesmanCreation,
  }
];

// Simple modal component
export function PopupScreenModal({ screenIndex = 7, iconOnly = true, buttonStyle = {}, modalStyle = {} }) {
  const [open, setOpen] = useState(false);
  const ScreenComponent = popupScreens[screenIndex].component;
  const IconComp = popupScreens[screenIndex].icon;
  const label = popupScreens[screenIndex].label;

  // Close modal on ESC key
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <>
     <button
        type="button"
        title={label}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 20,
          color: '#1B91DA',
          ...buttonStyle,
        }}
        onClick={() => setOpen(true)}
      >
        {IconComp}
      </button>
     
      {open && (
        <div
          style={{
            position: 'fixed',
            zIndex: 9999,
            left: 0,
            top: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...modalStyle,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 8,
              minWidth: 520,
              minHeight: 150,
              maxWidth: '90vw',
              maxHeight: '80vh',
              position: 'relative',
              boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
              padding: 0, // Remove padding here
              overflow: 'visible', // Make sure the close button is not clipped
            }}
          >
            {/* X icon always visible */}
            <button
              onClick={() => setOpen(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 16,
                background: 'none',
                border: 'none',
                fontSize: 28,
                color: '#888',
                cursor: 'pointer',
                zIndex: 2,
              }}
              aria-label="Close"
            >
              <FaTimes />
            </button>
            {/* Scrollable content */}
            <div
              style={{
                padding: 24,
                maxHeight: '80vh',
                overflow: 'auto',
              }}
            >
              <ScreenComponent />
            </div>
          </div>
        </div>
      )}

            
    </>
  );
}

export default popupScreens;