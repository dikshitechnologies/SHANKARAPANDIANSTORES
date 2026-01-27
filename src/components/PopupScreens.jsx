import React, { useState } from 'react';
import Design from '../pages/DesignCreation/DesignCreation';
import ScrapPage from '../pages/scrappage/scrappage';
import BrandPage from '../pages/Brand/Brand';
import Category from '../pages/category/category';
import Product from '../pages/Product/Product';
import ItemCreation from '../pages/ItemCreation/ItemCreation';
import LedgerCreation from '../pages/Ledgercreation/Ledgercreation';
import { FaPencilRuler, FaRecycle, FaTags, FaThList, FaBoxOpen, FaCubes, FaTimes,FaUser  } from 'react-icons/fa';

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
    icon: <FaCubes />,
    component: ItemCreation,
  },
  {
    key: 'ledger',
    label: 'Ledger Creation',
    icon: <FaUser />,
    component: LedgerCreation,
  }
];

// Simple modal component
export function PopupScreenModal({ screenIndex = 6, iconOnly = true, buttonStyle = {}, modalStyle = {} }) {
  const [open, setOpen] = useState(false);
  const ScreenComponent = popupScreens[screenIndex].component;
  const IconComp = popupScreens[screenIndex].icon;
  const label = popupScreens[screenIndex].label;

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
              overflow: 'auto',
              position: 'relative',
              boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
              padding: 24,
            }}
          >
            <button
              onClick={() => setOpen(false)}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: 'none',
                border: 'none',
                fontSize: 20,
                color: '#888',
                cursor: 'pointer',
              }}
              aria-label="Close"
            >
              <FaTimes />
            </button>
            {/* <h3 style={{ marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              {IconComp} {label}
            </h3> */}
            <ScreenComponent />
          </div>
        </div>
      )}
    </>
  );
}

export default popupScreens;