import React, { useState, useEffect } from 'react';
// This forces Vercel to bundle the data directly into the build
import rawStockData from './products.json'; 

function App() {
  const [searchTerm, setSearchTerm] = useState('atyab');
  const [filteredData, setFilteredData] = useState([]);
  const [displayCount, setDisplayCount] = useState(25);

  // Filter logic runs immediately using the imported data
  useEffect(() => {
    const dataArray = Array.isArray(rawStockData) ? rawStockData : [];
    
    if (!searchTerm.trim()) {
      setFilteredData(dataArray);
      return;
    }

    const lowerSearch = searchTerm.toLowerCase();
    const filtered = dataArray.filter((item) => {
      return Object.values(item).some((val) => 
        String(val).toLowerCase().includes(lowerSearch)
      );
    });
    setFilteredData(filtered);
  }, [searchTerm]);

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#070d19', color: '#fff', fontFamily: 'sans-serif', margin: 0, padding: 0, overflow: 'hidden' }}>
      
      {/* SIDEBAR CONTAINER */}
      <div style={{ width: '320px', minWidth: '320px', backgroundColor: '#0b132b', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', borderRight: '1px solid #1c2541', boxSizing: 'border-box' }}>
        <div>
          <h1 style={{ color: '#4ea8de', margin: '0', fontSize: '22px', fontWeight: 'bold' }}>Shehryar Zaheer</h1>
          <p style={{ color: '#64dfdf', margin: '5px 0 0 0', fontSize: '11px', letterSpacing: '1px' }}>PRIVATE MOBILE STOCK PORTAL</p>
        </div>

        {/* Input Controls */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search stock..." 
            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #1c2541', backgroundColor: '#1c2541', color: '#fff', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
          />
          <select 
            value={displayCount} 
            onChange={(e) => setDisplayCount(Number(e.target.value))}
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #1c2541', backgroundColor: '#1c2541', color: '#fff', fontSize: '14px' }}
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {filteredData.length === 0 && (
          <p style={{ color: '#a5a5a5', fontSize: '13px', margin: '10px 0 0 0' }}>No matching items found.</p>
        )}
      </div>

      {/* MAIN CONTENT VIEW AREA */}
      <div style={{ flex: 1, padding: '30px', backgroundColor: '#070d19', overflowY: 'auto', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '1200px', margin: '0 auto' }}>
          
          {filteredData.slice(0, displayCount).map((item, index) => {
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
              <h3 style={{ margin: '0 0 10px 0' }}>No items match your criteria.</h3>
              <p style={{ fontSize: '14px', margin: '0' }}>Try adjusting your search terms or verify your data file configuration.</p>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

export default App;
