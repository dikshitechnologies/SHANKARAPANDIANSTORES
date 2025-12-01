import React, { useState } from 'react';

import PopupListSelector from '../components/PopupListSelector.jsx';

const ExampleUsage = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Mock API function with proper pagination
  const fetchItems = async (page, search) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // All mock data (100 items for testing)
    const allMockData = Array.from({ length: 2000 }, (_, i) => ({
      id: i + 1,
      name: i === 99 ? 'ak' : `Customer ${i + 1}`,
      email: `customer${i + 1}@example.com`,
      phone: `555-${String(i + 1).padStart(4, '0')}`,
      Address: `Address ${i + 1}, Chennai`
    }));
    
    // Filter based on search
    let filteredData = allMockData;
    if (search) {
      filteredData = allMockData.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase()) ||
        item.phone.toLowerCase().includes(search.toLowerCase()) ||
        item.Address.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Implement pagination: 20 items per page
    const itemsPerPage = 20;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    // Return only the items for the current page
    const paginatedData = filteredData.slice(startIndex, endIndex);
    
    return paginatedData;
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
          marginBottom: '16px',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Open Item Selector
      </button>
      
      {selectedItem && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px',
          backgroundColor: '#f0f8ff',
          borderRadius: '8px',
          border: '1px solid #cce5ff'
        }}>
          <strong>Selected:</strong> {selectedItem.name} - {selectedItem.email} - {selectedItem.phone}
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