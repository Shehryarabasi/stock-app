import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { QRCodeSVG } from 'qrcode.react';

// Sample stock data structured for your app
const initialStockData = [
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
];

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [deptQuery, setDeptQuery] = useState('');
  const [selectedDeptCode, setSelectedDeptCode] = useState(null);
  const [resultLimit, setResultLimit] = useState(10);

  const departments = [
    { code: 'D04', name: 'Electronics' },
    { code: 'G01', name: 'Groceries' },
    { code: 'H05', name: 'Home Goods' }
  ];

  // Search Logic
  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    const matched = initialStockData.filter(item => {
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
  }, [searchQuery, selectedDeptCode, resultLimit]);

  return (
    <View style={styles.container}>
      {/* Branding Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Shehryar Zaheer</Text>
        <Text style={styles.subtitle}>Private Mobile Stock Portal</Text>
      </View>

      {/* Main Search Bar and Result Limit Row */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search item, code, supplier..."
          placeholderTextColor="#64748b"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.selectContainer}>
          <select
            value={resultLimit}
            onChange={(e) => setResultLimit(Number(e.target.value))}
            style={styles.htmlSelect}
          >
            <option value={10}>10 Max</option>
            <option value={30}>30 Max</option>
            <option value={50}>50 Max</option>
          </select>
        </View>
      </View>

      {/* Department Filter Input */}
      <View style={styles.searchRow}>
        <TextInput
          style={[styles.searchInput, { fontSize: 12 }]}
          placeholder="Filter by Dept Code or Name (e.g. D04)"
          placeholderTextColor="#64748b"
          value={deptQuery}
          onChangeText={(text) => {
            setDeptQuery(text);
            const found = departments.find(
              d => d.code.toLowerCase() === text.toLowerCase() || 
                   d.name.toLowerCase().includes(text.toLowerCase())
            );
            if (found) setSelectedDeptCode(found.code);
          }}
        />
        {selectedDeptCode && (
          <TouchableOpacity 
            style={styles.clearBtn}
            onPress={() => { setSelectedDeptCode(null); setDeptQuery(''); }}
          >
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Department Quick Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        <TouchableOpacity
          style={[styles.chip, !selectedDeptCode && styles.activeChip]}
          onPress={() => { setSelectedDeptCode(null); setDeptQuery(''); }}
        >
          <Text style={[styles.chipText, !selectedDeptCode && styles.activeChipText]}>All Depts</Text>
        </TouchableOpacity>
        {departments.map((dept) => (
          <TouchableOpacity
            key={dept.code}
            style={[styles.chip, selectedDeptCode === dept.code && styles.activeChip]}
            onPress={() => {
              setSelectedDeptCode(dept.code);
              setDeptQuery(dept.name);
            }}
          >
            <Text style={[styles.chipText, selectedDeptCode === dept.code && styles.activeChipText]}>
              {dept.code} - {dept.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stock List Display */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.item_number}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={styles.badgeRow}>
                <View style={styles.deptBadge}>
                  <Text style={styles.deptBadgeText}>Dept: {item.dept_name} ({item.dept_code})</Text>
                </View>
                <Text style={styles.itemNumberText}>#{item.item_number}</Text>
              </View>
              <Text style={styles.itemName}>{item.item_name}</Text>
              <Text style={styles.cardDetails}>Supplier: {item.supplier_name} ({item.supplier_code})</Text>
              <Text style={styles.cardDetails}>
                Barcode: <Text style={styles.barcodeHighlight}>{item.barcode}</Text>
              </Text>
            </View>
            <View style={styles.qrContainer}>
              <QRCodeSVG value={item.barcode} size={50} />
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No matching stock items found.</Text>
        }
      />

      <Text style={styles.footer}>by Shehryar Zaheer</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 16,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#22d3ee',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 4,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 8,
    color: '#ffffff',
    padding: 12,
    fontSize: 14,
  },
  selectContainer: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
  },
  htmlSelect: {
    backgroundColor: 'transparent',
    color: '#ffffff',
    borderWidth: 0,
    padding: 12,
    fontSize: 12,
    fontWeight: 'bold',
    outline: 'none',
    cursor: 'pointer',
  },
  clearBtn: {
    backgroundColor: '#451a03',
    borderColor: '#78350f',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  clearBtnText: {
    color: '#f97316',
    fontWeight: 'bold',
    fontSize: 12,
  },
  chipScroll: {
    maxHeight: 40,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    height: 30,
    justifyContent: 'center',
  },
  activeChip: {
    backgroundColor: '#22d3ee',
  },
  chipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeChipText: {
    color: '#020617',
  },
  card: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flex: 1,
    paddingRight: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deptBadge: {
    backgroundColor: '#083344',
    borderColor: '#0e7490',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  deptBadgeText: {
    color: '#22d3ee',
    fontSize: 9,
    fontWeight: 'bold',
  },
  itemNumberText: {
    color: '#64748b',
    fontFamily: 'monospace',
    fontSize: 10,
  },
  itemName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 6,
  },
  cardDetails: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
  },
  barcodeHighlight: {
    color: '#22d3ee',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  qrContainer: {
    backgroundColor: '#ffffff',
    padding: 6,
    borderRadius: 8,
  },
  emptyText: {
    color: '#475569',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
  footer: {
    textAlign: 'center',
    color: '#334155',
    fontSize: 11,
    marginTop: 24,
    marginBottom: 8,
  }
});