import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { QRCodeSVG } from 'qrcode.react';
import rawStockData from './products.json';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [resultLimit, setResultLimit] = useState(25);
  const [expandedItemId, setExpandedItemId] = useState(null);

  // Safely parse the stock array
  const initialStockData = useMemo(() => {
    if (!rawStockData) return [];
    if (Array.isArray(rawStockData)) return rawStockData;
    if (rawStockData.products && Array.isArray(rawStockData.products)) return rawStockData.products;
    if (rawStockData.data && Array.isArray(rawStockData.data)) return rawStockData.data;
    return Object.values(rawStockData).filter(item => typeof item === 'object' && item !== null);
  }, []);

  // Filter items matching exact keys from Excel screenshot
  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return initialStockData.slice(0, resultLimit);

    return initialStockData.filter(item => {
      if (!item) return false;
      return (
        (item["ITEM DESC"] && String(item["ITEM DESC"]).toLowerCase().includes(query)) ||
        (item["ITEM"] && String(item["ITEM"]).toLowerCase().includes(query)) ||
        (item["SUPPLIER_NAME"] && String(item["SUPPLIER_NAME"]).toLowerCase().includes(query)) ||
        (item["PRIMARY BAR"] && String(item["PRIMARY BAR"]).toLowerCase().includes(query))
      );
    }).slice(0, resultLimit);
  }, [searchQuery, resultLimit, initialStockData]);

  const handleItemPress = (id) => {
    setExpandedItemId(prevId => (prevId === id ? null : id));
  };

  return (
    <View style={styles.container}>
      {/* App Header */}
      <Text style={styles.title}>Shehryar Zaheer</Text>
      <Text style={styles.subtitle}>PRIVATE MOBILE STOCK PORTAL</Text>

      {/* Search Input Layout */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Item Description, Number, Barcode..."
          placeholderTextColor="#64748b"
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            setExpandedItemId(null);
          }}
        />
        <select
          value={resultLimit}
          onChange={(e) => {
            setResultLimit(Number(e.target.value));
            setExpandedItemId(null);
          }}
          style={webStyles.select}
        >
          <option value={10}>10 Results</option>
          <option value={25}>25 Results</option>
          <option value={50}>50 Results</option>
          <option value={100}>100 Results</option>
        </select>
      </View>

      {/* Interactive Item List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => {
          const isExpanded = expandedItemId === index;
          
          // Exact matching variables from your spreadsheet headers
          const itemDesc = item["ITEM DESC"] || "No Description Available";
          const itemNum = item["ITEM"] || "N/A";
          const barcodeNum = item["PRIMARY BAR"] || "N/A";
          const deptCode = item["DEPT"] || "N/A";
          const deptName = item["DEPT_NAME"] || "N/A";
          const supplierName = item["SUPPLIER_NAME"] || "N/A";
          const supplierCode = item["SUP"] || "N/A";
          const casePack = item["CAS"] || "1";
          const itemStatus = item["STAT"] || "Active";

          return (
            <View style={styles.cardContainer}>
              {/* Main row click target */}
              <TouchableOpacity 
                style={[styles.clickableRow, isExpanded && styles.activeClickableRow]} 
                onPress={() => handleItemPress(index)}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{itemDesc}</Text>
                  <Text style={styles.itemSnippet}>Item #: {itemNum}</Text>
                </View>
                <Text style={styles.arrowIcon}>{isExpanded ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {/* Expansion Detail Section */}
              {isExpanded && (
                <View style={styles.detailsPanel}>
                  <View style={styles.infoGrid}>
                    <View style={styles.detailBlock}>
                      <Text style={styles.label}>ITEM NUMBER</Text>
                      <Text style={styles.value}>{itemNum}</Text>
                    </View>
                    <View style={styles.detailBlock}>
                      <Text style={styles.label}>BARCODE NUMBER</Text>
                      <Text style={styles.value}>{barcodeNum}</Text>
                    </View>
                    <View style={styles.detailBlock}>
                      <Text style={styles.label}>DEPARTMENT</Text>
                      <Text style={styles.value}>{deptName} ({deptCode})</Text>
                    </View>
                    <View style={styles.detailBlock}>
                      <Text style={styles.label}>SUPPLIER NAME</Text>
                      <Text style={styles.value}>{supplierName}</Text>
                    </View>
                    <View style={styles.detailBlock}>
                      <Text style={styles.label}>SUPPLIER CODE</Text>
                      <Text style={styles.value}>{supplierCode}</Text>
                    </View>
                    <View style={styles.detailBlock}>
                      <Text style={styles.label}>CAS (CASE PACK)</Text>
                      <Text style={styles.value}>{casePack}</Text>
                    </View>
                    <View style={styles.detailBlock}>
                      <Text style={styles.label}>STATUS</Text>
                      <Text style={styles.value}>{itemStatus}</Text>
                    </View>
                  </View>

                  {/* QR barcode mapping */}
                  {barcodeNum !== "N/A" && (
                    <View style={styles.qrSection}>
                      <Text style={styles.qrLabel}>SCAN BARCODE</Text>
                      <View style={styles.qrWrapper}>
                        <QRCodeSVG value={String(barcodeNum)} size={110} bgcolor="#fff" fgcolor="#000" />
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No matching items found. ({initialStockData.length} items verified inside memory)</Text>
        }
      />
    </View>
  );
}

const webStyles = {
  select: {
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    border: '1px solid #334155',
    outline: 'none',
    cursor: 'pointer',
    marginLeft: 10,
    fontSize: '13px',
    fontWeight: '600'
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 15, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#38bdf8', textAlign: 'center' },
  subtitle: { fontSize: 10, color: '#64748b', textAlign: 'center', marginBottom: 25, fontWeight: '600', letterSpacing: 1.5 },
  searchContainer: { flexDirection: 'row', marginBottom: 20, alignItems: 'center' },
  searchInput: { flex: 1, backgroundColor: '#1e293b', color: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#334155', fontSize: 14 },
  cardContainer: { backgroundColor: '#1e293b', borderRadius: 10, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#334155' },
  clickableRow: { padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderLeftWidth: 4, borderLeftColor: '#38bdf8' },
  activeClickableRow: { backgroundColor: '#1e293b', borderLeftColor: '#0ea5e9' },
  itemTitle: { fontSize: 14, fontWeight: '700', color: '#f8fafc', marginBottom: 4 },
  itemSnippet: { fontSize: 11, color: '#64748b', fontWeight: '600' },
  arrowIcon: { color: '#64748b', fontSize: 12, fontWeight: 'bold' },
  detailsPanel: { padding: 15, backgroundColor: '#0f172a', borderTopWidth: 1, borderColor: '#334155' },
  infoGrid: { rowGap: 10, marginBottom: 15 },
  detailBlock: { borderBottomWidth: 1, borderBottomColor: '#1e293b', paddingBottom: 6 },
  label: { color: '#38bdf8', fontWeight: '700', fontSize: 9, letterSpacing: 0.5, marginBottom: 2 },
  value: { color: '#cbd5e1', fontSize: 13, fontWeight: '500' },
  qrSection: { alignItems: 'center', marginTop: 10, backgroundColor: '#1e293b', padding: 12, borderRadius: 8 },
  qrLabel: { color: '#64748b', fontWeight: '700', fontSize: 10, marginBottom: 8 },
  qrWrapper: { backgroundColor: '#fff', padding: 10, borderRadius: 6 },
  emptyText: { color: '#64748b', textAlign: 'center', marginTop: 40, fontSize: 13 }
});
