import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import styles from './Navbar.module.css';

const DropdownMenu = ({ items, onItemClick, position = 'center', isMobile = false }) => {
  const [openSubmenus, setOpenSubmenus] = useState({});

  // Initialize all groups as closed on mount
  useEffect(() => {
    const initialState = {};
    items.forEach((item) => {
      if (item.isGroup && item.children) {
        initialState[item.name] = false;
      }
    });
    setOpenSubmenus(initialState);
  }, [items]);

  const toggleSubmenu = (groupName, e) => {
    e.stopPropagation();
    setOpenSubmenus(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  return (
    <div className={`${styles['dropdown-menu']} ${styles[position]}`}>
      {items.map((item, index) => {
        if (item.isGroup && item.children) {
          const isOpen = openSubmenus[item.name];
          return (
            <div key={index} className={styles['dropdown-group']}>
              <div 
                className={styles['dropdown-group-header']}
                onClick={(e) => toggleSubmenu(item.name, e)}
              >
                {item.icon && <span className={styles['dropdown-icon']}>{item.icon}</span>}
                <span className={styles['group-name']}>{item.name}</span>
                <span className={styles['group-arrow']}>
                  {isOpen ? <UpOutlined /> : <DownOutlined />}
                </span>
              </div>
              {isOpen && (
                <div className={styles['dropdown-submenu']}>
                  {item.children.map((child, childIndex) => (
                    <Link
                      key={childIndex}
                      to={child.path}
                      className={styles['dropdown-subitem']}
                      onClick={onItemClick}
                    >
                      {child.icon && <span className={styles['dropdown-icon']}>{child.icon}</span>}
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        }
        
        return (
          <Link
            key={index}
            to={item.path}
            className={styles['dropdown-item']}
            onClick={onItemClick}
          >
            {item.icon && <span className={styles['dropdown-icon']}>{item.icon}</span>}
            {item.name}
          </Link>
        );
      })}
    </div>
  );
};

export default DropdownMenu;