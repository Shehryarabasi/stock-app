import React, { useState, useEffect } from 'react';

function App() {
  const [searchTerm, setSearchTerm] = useState('ATYAB');
  const [stockData, setStockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [displayCount, setDisplayCount] = useState(25);

  // 1. Fetch the JSON data safely
  useEffect(() => {
    fetch('/data.json') // Make sure your JSON file is named correctly in your public folder
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => setStockData(data))
      .catch((err) => console.error("Error loading JSON:", err));
  }, []);

  // 2. Filter data dynamically based on search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(stockData);
      return;
    }

    const lowerSearch = searchTerm.toLowerCase();
    const filtered = stockData.filter((item) => {
      // Check every single value in the object to see if it matches the search term
      return Object.values(item).some((val) => 
        String(val).toLowerCase().includes(lowerSearch)
      );
    });
    
    setFilteredData(filtered);
  }, [searchTerm, stockData]);

  return (
    <div style={{ backgroundColor: '#0b132b', color: '#fff', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#4ea8de', margin: '0', fontSize: '24px' }}>Shehryar Zaheer</h1>
        <p style={{ color: '#64dfdf', margin: '5px 0', fontSize: '12px', letterSpacing: '1px' }}>PRIVATE MOBILE STOCK PORTAL</p>
      </div>

      {/* Search Bar & Dropdown Control */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search stock..." 
          style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #1c2541', backgroundColor: '#1c2541', color: '#fff' }}
        />
        <select 
          value={displayCount} 
          onChange={(e) => setDisplayCount(Number(e.target.value))}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #1c2541', backgroundColor: '#1c2541', color: '#fff' }}
        >
          <option value={25}>25 Results</option>
          <option value={50}>50 Results</option>
          <option value={100}>100 Results</option>
        </select>
      </div>

      {/* Results List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredData.slice(0, displayCount).map((item, index) => {
          
          // DYNAMIC KEY FALLBACKS (Fixes the "No Description Available" / "N/A" bugs)
          const description = item.description || item.Description || item.DESCRIPTION || item["ITEM DESCRIPTION"] || "No Description Available";
          const itemCode = item.itemCode || item.ItemCode || item["Item #"] || item["Item No"] || item["ITEM CODE"] || item.id || "N/A";
          
          return (
            <div 
              key={index} 
              style={{ 
                backgroundColor: '#1c2541', 
                padding: '15px', 
                borderRadius: '4px', 
                borderLeft: '4px solid #4ea8de',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <h5 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold', color: '#ffffff' }}>
                {description}
              </h5>
              <p style={{ margin: '0', fontSize: '12px', color: '#a5a5a5' }}>
                Item #: <span style={{ color: '#64dfdf' }}>{itemCode}</span>
              </p>
            </div>
          );
        })}

        {filteredData.length === 0 && (
          <p style={{ textAlign: 'center', color: '#a5a5a5', marginTop: '20px' }}>No matching items found.</p>
        )}
      </div>

    </div>
  );
}

export default App;
