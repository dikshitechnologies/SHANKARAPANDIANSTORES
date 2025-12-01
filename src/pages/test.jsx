import React, { useState } from 'react';

import PopupListSelector from '../components/PopupListSelector.jsx';

const ExampleUsage = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Mock API function
  const fetchItems = async (page, search) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockData = [
      { id: 1, name: 'John Doe', email: 'john@example.com', phone: '123-456-7890',Address:'Chennai' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '987-654-3210' , Address:'Chennai'},
      // ... more items
    ];
    
    return mockData.filter(item => 
      !search || 
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase())
    );
  };

  const handleSelect = (item) => {
    setSelectedItem(item);
    console.log('Selected:', item);
  };

  return (
    <div>
      <button 
        variant="contained" 
        onClick={() => setIsPopupOpen(true)}
        style={{
          background: 'linear-gradient(135deg, #307AC8 0%, #06A7EA 100%)',
          marginBottom: '16px'
        }}
      >
        Open Item Selector
      </button>
      
      {selectedItem && (
        <div>
          Selected: {selectedItem.name} - {selectedItem.email}
        </div>
      )}

       <PopupListSelector
        open={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSelect={handleSelect}
        fetchItems={fetchItems}
        title="Select Customer"
        displayFieldKeys={['name', 'email', 'phone', 'Address']}
        searchFields={['name', 'email', 'phone', 'Address']}
        headerNames={['Name', 'Email', 'Phone', 'Address']}
        columnWidths={{
          name: '25%',
          email: '25%',
          phone: '25%',
          Address: '25%',
        }}
        tableStyles={{
          headerBackground: 'linear-gradient(135deg, #307AC8 0%, #06A7EA 100%)',
          itemHoverBackground: 'rgba(48, 122, 200, 0.1)',
          itemSelectedBackground: 'rgba(48, 122, 200, 0.2)',
        }}
        maxHeight="60vh"
        searchPlaceholder="Search customers by name, email, phone, or address..."
        responsiveBreakpoint={768}
      />
    </div>
  );
};

export default ExampleUsage;