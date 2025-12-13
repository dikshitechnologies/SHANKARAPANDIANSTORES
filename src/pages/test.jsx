import React, { useState } from 'react';
import PopupListSelector from '../components/Listpopup/PopupListSelector.jsx';
import { 
  ActionButtons, 
  AddButton, 
  EditButton, 
  DeleteButton,
  ActionButtons1
} from '../components/Buttons/ActionButtons.jsx';
import ConfirmationPopup from '../components/ConfirmationPopup/ConfirmationPopup.jsx';
import { toast } from "react-toastify";
const ExampleUsage = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeButton, setActiveButton] = useState("add");
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Add loading state

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

  const handleClear = () => {
    setSelectedItem(null);
    console.log('Cleared selection');
  };

  const handleSave = () => {
    // Your save logic here
  };

  const handlePrint = () => {
    // Your print logic here
  };

  // Function to handle confirmation popup action with loading
  const handleConfirmAction = async () => {
    setIsLoading(true); // Start loading
    
    try {
      // Simulate API call or async operation
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Your actual save logic here
      console.log('Changes saved successfully!');
      
      // Close the popup after successful save
      setIsConfirmationOpen(false);
    } catch (error) {
      console.error('Error saving changes:', error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold', width: '300px' }}>
        <ActionButtons 
          activeButton={activeButton}
          onButtonClick={(type) => setActiveButton(type)}
        >
          <AddButton buttonType="add" />
          <EditButton buttonType="edit" />
          <DeleteButton buttonType="delete" />
        </ActionButtons>
      </div>
      <button onClick={() => toast.success("Data saved successfully!")}>
  Success Alert
</button>

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
      <br />
      <button 
        variant="contained" 
        onClick={() => setIsConfirmationOpen(true)}
        style={{
          background: 'linear-gradient(135deg, #53c830ff 0%, #0eea06ff 100%)',
          marginBottom: '16px',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Open ConfirmationPopup
      </button>
      
      <div style={{ marginTop: '12px', marginBottom: '20px', width: '300px' }}>
        <ActionButtons1
          onClear={handleClear}
          onSave={handleSave}
          onPrint={handlePrint}
          activeButton={activeButton}
          onButtonClick={(type) => setActiveButton(type)}
        />
      </div>
      
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

      <ConfirmationPopup
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={handleConfirmAction}
        title="Save Changes"
        message="Are you sure you want to save these changes? This action cannot be undone."
        type="success"
        confirmText={isLoading ? "Saving..." : "Save"} 
        showLoading={isLoading} 
        disableBackdropClose={isLoading} 
        defaultFocusedButton="cancel"
        borderColor="#8b5cf6"
        customStyles={{
          modal: {
            borderTop: '4px solid #48e6ecff'
          },
          confirmButton: {
            style: {
              background: 'linear-gradient(90deg, #9fec48ff, #6c27dbff)'
            }
          }
        }}
      />
      
    </div>
  );
};

export default ExampleUsage;


//# For confirmation dialogs:
// ✅ "success" - Successful operations
// ❌ "danger"  - Destructive actions
// ⚠️  "warning" - Warning messages
// ℹ️  "info"    - Information messages
// ❓ "question" - Help/assistance

// # For user interactions:
// ❤️  "heart"    - Favorite/like actions
// ⭐  "star"     - Rating/feedback
// 🔒  "lock"     - Security actions
// ⚙️  "settings" - Configuration changes

// # For file operations:
// ⬇️  "download" - Download actions
// ⬆️  "upload"   - Upload actions
// 📄  "document" - File/document actions

// # For notifications/alerts:
// 🔔  "bell"     - Notifications
// 📧  "mail"     - Email/messages
// 👥  "users"    - Team/people actions

// # For scheduling:
// 📅  "calendar" - Events/scheduling
// ⏰  "clock"    - Time-related actions

// # For security:
// 🛡️  "shield"   - Security alerts
// 🔑  "key"      - Access/permissions

// # For transactions:
// 💳  "creditCard" - Payments/billing
// 🎁  "gift"       - Rewards/gifts