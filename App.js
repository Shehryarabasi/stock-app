import React, { useState, useEffect } from 'react';

function App() {
  const [searchTerm, setSearchTerm] = useState('ATYAB');
  const [stockData, setStockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [displayCount, setDisplayCount] = useState(25);

  // 1. Safe JSON Fetch
  useEffect(() => {
    fetch('/data.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load data.json');
        return res.json();
      })
      .then((data) => {
        setStockData(data);
        // Safely seed the initial search view
        filterItems('ATYAB', data);
      })
      .catch((err) => console.error("Error loading JSON:", err));
  }, []);

  // 2. Optimized, case-insensitive filter logic
  const filterItems = (query, dataToFilter = stockData) => {
    if (!query.trim()) {
      setFilteredData(dataToFilter);
      return;
    }
    const lowerSearch = query.toLowerCase();
    const filtered = dataToFilter.filter((item) => {
      return Object.values(item).some((val) => 
        String(val).toLowerCase().includes(lowerSearch)
      );
    });
    setFilteredData(filtered);
  };

  // Handle live search changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterItems(value);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#070d19', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {/* SIDEBAR CONTAINER */}
      <div style={{ width: '320px', backgroundColor: '#0b132b', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', borderRight: '1px solid #1c2541' }}>
        <div>
          <h1 style={{ color: '#4ea8de', margin: '0', fontSize: '22px', fontWeight: 'bold' }}>Shehryar Zaheer</h1>
          <p style={{ color: '#64dfdf', margin: '5px 0 0 0', fontSize: '11px', letterSpacing: '1px' }}>PRIVATE MOBILE STOCK PORTAL</p>
        </div>

        {/* Input Controls */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search stock..." 
            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #1c2541', backgroundColor: '#1c2541', color: '#fff', fontSize: '14px' }}
          />
          <select 
            value={displayCount} 
            onChange={(e) => setDisplayCount(Number(e.target.value))}
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #1c2541', backgroundColor: '#1c2541', color: '#fff', fontSize: '14px' }}
          >
            <option value={25}>25 Results</option>
            <option value={50}>50 Results</option>
            <option value={100}>100 Results</option>
          </select>
        </div>

        {/* Short fallback feedback in sidebar if empty */}
        {filteredData.length === 0 && (
          <p style={{ color: '#a5a5a5', fontSize: '13px', margin: '10px 0 0 0' }}>No matching items found.</p>
        )}
      </div>

      {/* MAIN CONTENT VIEW AREA */}
      <div style={{ flex: 1, padding: '30px', backgroundColor: '#070d19', overflowY: 'auto', maxHeight: '100vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '1200px', margin: '0 auto' }}>
          
          {filteredData.slice(0, displayCount).map((item, index) => {
            
            // Auto-detect property mappings dynamically
            const description = item.description || item.Description || item.DESCRIPTION || item["ITEM DESCRIPTION"] || item["Item Name"] || "No Description Available";
            const itemCode = item.itemCode || item.ItemCode || item["Item #"] || item["Item No"] || item["ITEM CODE"] || item.id || "N/A";
            
            return (
              <div 
                key={index} 
                style={{ 
                  backgroundColor: '#1c2541', 
                  padding: '18px 24px', 
                  borderRadius: '6px', 
                  borderLeft: '4px solid #4ea8de',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <h5 style={{ margin: '0', fontSize: '16px', fontWeight: '600', color: '#ffffff', letterSpacing: '0.5px' }}>
                  {description}
                </h5>
                <p style={{ margin: '0', fontSize: '13px', color: '#8ecae6' }}>
                  Item #: <span style={{ color: '#64dfdf', fontWeight: 'bold' }}>{itemCode}</span>
                </p>
              </div>
            );
          })}

          {filteredData.length === 0 && (
            <div style={{ textAlign: 'center', color: '#a5a5a5', marginTop: '40px' }}>
              <h3>No items match your criteria.</h3>
              <p style={{ fontSize: '14px' }}>Try adjusting your search terms or verify your data file configuration.</p>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

export default App;
