import React, { useState, useMemo, useEffect, useRef } from 'react';
// Renders the QR code on your screen
import { QRCodeSVG } from 'qrcode.react'; 
// Handles your mobile phone's camera to scan actual barcodes
import { Html5Qrcode } from "html5-qrcode"; 

export default function StockApp() {
  // --- 1. YOUR STOCK DATABASE ---
  const [stockDatabase, setStockDatabase] = useState([
    {
      item_number: "10204",
      item_name: "Wireless Mouse ABC Pro",
      dept_code: "D04",
      dept_name: "Electronics",
      supplier_name: "Logitech Dist",
      supplier_code: "SUP-88",
      barcode: "1234567890"
    },
    {
      item_number: "20003",
      item_name: "Organic Olive Oil",
      dept_code: "G01",
      dept_name: "Groceries",
      supplier_name: "Alibaba Sourcing",
      supplier_code: "SUP-12",
      barcode: "0987654321"
    }
  ]);

  // --- 2. APP STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [deptQuery, setDeptQuery] = useState(''); 
  const [selectedDeptCode, setSelectedDeptCode] = useState(null); 
  const [resultLimit, setResultLimit] = useState(10); 
  
  // Camera scanner states
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const html5QrCodeRef = useRef(null);

  const departments = [
    { code: 'D04', name: 'Electronics' },
    { code: 'G01', name: 'Groceries' },
    { code: 'H05', name: 'Home Goods' }
  ];

  // --- 3. CAMERA BARCODE SCANNER LOGIC ---
  const startScanner = async () => {
    setIsScanning(true);
    setScannerError('');
    // Short delay to ensure the DOM element for the video feed is fully rendered
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("camera-reader");
        html5QrCodeRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" }, // Forces use of the rear phone camera
          {
            fps: 10,
            qrbox: { width: 280, height: 150 }, // Aspect ratio shaped for 1D barcodes
          },
          (decodedText) => {
            // Success: Put the scanned barcode into the search query
            setSearchQuery(decodedText);
            stopScanner();
          },
          (errorMessage) => {
            // Frame analysis failures are silent to avoid UI clutter
          }
        );
      } catch (err) {
        setScannerError("Camera access denied or unavailable.");
        setIsScanning(false);
      }
    }, 300);
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.error("Error stopping camera", err);
      }
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  };

  // Clean up the camera connection if the user closes the page
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // --- 4. THE SEARCH LOGIC ---
  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    const matched = stockDatabase.filter(item => {
      const matchesSearch = 
        item.item_name.toLowerCase().includes(query) ||
        item.item_number.toString().includes(query) ||
        item.supplier_name.toLowerCase().includes(query) ||
        item.supplier_code.toLowerCase().includes(query) ||
        item.barcode.includes(query);

      const matchesDepartment = !selectedDeptCode || item.dept_code === selectedDeptCode;

      return matchesSearch && matchesDepartment;
    });

    return matched.slice(0, resultLimit);
  }, [searchQuery, selectedDeptCode, resultLimit, stockDatabase]);

  return (
    <div className="p-4 max-w-md mx-auto bg-slate-950 text-white min-h-screen font-sans">
      
      {/* --- BRANDING HEADER --- */}
      <header className="text-center my-6">
        <h1 className="text-3xl font-extrabold tracking-wider text-cyan-400">Shehryar Zaheer</h1>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Private Mobile Stock Portal</p>
      </header>

      <hr className="border-slate-800 mb-6" />

      {/* --- CAMERA SCANNING PANEL --- */}
      {isScanning && (
        <div className="mb-4 bg-slate-900 border border-cyan-500/30 p-4 rounded-xl relative">
          <h2 className="text-xs font-bold text-cyan-400 mb-2 text-center">Aim camera at the Barcode</h2>
          
          {/* Active camera view container */}
          <div id="camera-reader" className="w-full overflow-hidden rounded-lg bg-black" style={{ minHeight: '220px' }}></div>
          
          <button 
            onClick={stopScanner}
            className="w-full mt-3 bg-red-950 hover:bg-red-900 text-red-400 border border-red-900/50 py-2 rounded-lg text-xs font-bold"
          >
            Cancel Scanning
          </button>
        </div>
      )}
      {scannerError && (
        <div className="mb-4 text-xs text-red-400 bg-red-950/20 border border-red-900/40 p-2 rounded text-center">
          {scannerError}
        </div>
      )}

      {/* --- SEARCH BOX & LIMIT SELECTOR & SCAN BUTTON --- */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search item, code, supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 bg-slate-900 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-cyan-500 text-sm pr-16"
          />
          {/* Inline scanner trigger button */}
          {!isScanning && (
            <button
              onClick={startScanner}
              className="absolute right-2 top-2 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-800/40 px-2 py-1.5 rounded text-xs font-bold"
            >
              📷 Scan
            </button>
          )}
        </div>
        
        {/* Max Results Selector */}
        <div className="flex flex-col justify-center">
          <select
            value={resultLimit}
            onChange={(e) => setResultLimit(Number(e.target.value))}
            className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-white text-xs font-bold cursor-pointer focus:outline-none focus:border-cyan-500"
          >
            <option value={10}>10 Results</option>
            <option value={30}>30 Results</option>
            <option value={50}>50 Results</option>
          </select>
        </div>
      </div>

      {/* --- DEPARTMENT FILTER --- */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Filter by Dept Code or Name (e.g., D04)"
          value={deptQuery}
          onChange={(e) => {
            setDeptQuery(e.target.value);
            const found = departments.find(
              d => d.code.toLowerCase() === e.target.value.toLowerCase() || 
                   d.name.toLowerCase().includes(e.target.value.toLowerCase())
            );
            if (found) setSelectedDeptCode(found.code);
          }}
          className="flex-1 p-2 bg-slate-900 rounded-lg border border-slate-800 text-xs focus:outline-none"
        />
        {selectedDeptCode && (
          <button 
            onClick={() => { setSelectedDeptCode(null); setDeptQuery(''); }}
            className="bg-red-950 text-red-400 border border-red-900 px-3 rounded-lg text-xs font-bold"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* --- QUICK CHIPS --- */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
        <button
          onClick={() => { setSelectedDeptCode(null); setDeptQuery(''); }}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
            !selectedDeptCode ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400'
          }`}
        >
          All Departments
        </button>
        {departments.map((dept) => (
          <button
            key={dept.code}
            onClick={() => {
              setSelectedDeptCode(dept.code);
              setDeptQuery(dept.name);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
              selectedDeptCode === dept.code ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400'
            }`}
          >
            {dept.code} - {dept.name}
          </button>
        ))}
      </div>

      {/* --- STOCK LIST DISPLAY --- */}
      <div className="space-y-3">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.item_number} className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                {/* Clearly displays Department Name and Code */}
                <div className="flex gap-2 items-center">
                  <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/40 px-2 py-0.5 rounded font-bold">
                    Dept: {item.dept_name} ({item.dept_code})
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                    #{item.item_number}
                  </span>
                </div>
                
                <h3 className="font-bold text-base mt-2 text-white">{item.item_name}</h3>
                <p className="text-xs text-slate-500 mt-1">Supplier: {item.supplier_name} ({item.supplier_code})</p>
                
                {/* Clearly displays Barcode number under details */}
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Barcode: <span className="text-cyan-500 font-bold">{item.barcode}</span>
                </p>
              </div>
              
              {/* Dynamic QR Code */}
              <div className="bg-white p-1.5 rounded-lg shadow-lg">
                <QRCodeSVG value={item.barcode} size={55} />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-slate-500 text-sm">
            No matching stock items found.
          </div>
        )}
      </div>

      {/* --- BRANDING FOOTER --- */}
      <footer className="text-center mt-12 mb-6">
        <p className="text-xs text-slate-600">by Shehryar Zaheer</p>
      </footer>

    </div>
  );
}