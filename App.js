import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { QRCodeSVG } from 'qrcode.react';
import initialStockData from './products.json';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptCode, setSelectedDeptCode] = useState(null);
  const [resultLimit, setResultLimit] = useState(10);

  // Automatically find all unique departments directly from your data file
  const departments = useMemo(() => {
    const deptMap = new Map();
    initialStockData.forEach(item => {
      if (item["DEPT"] && item["DEPT_NAME"]) {
        deptMap.set(String(item["DEPT"]), String(item["DEPT_NAME"]).trim());
      }
    });
    return Array.from(deptMap.entries()).map(([code, name]) => ({ code, name }));
  }, []);

  // Search and Filter Logic
  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    const matched = initialStockData.filter(item => {
      const matchesSearch = !query ||
        (item["ITEM DESC"] && item["ITEM DESC"].toLowerCase().includes(query)) ||
        (item["ITEM"] && item["ITEM"].toString().includes(query)) ||
        (item["SUPPLIER NAME"] && item["SUPPLIER NAME"].toLowerCase().includes(query)) ||
        (item["PRIMARY BAR"] && item["PRIMARY BAR"].toString().includes(query));

      const matchesDepartment = !selectedDeptCode || String(item["DEPT"]) === String(selectedDeptCode);

      return matchesSearch && matchesDepartment;
    });

    return matched.slice(0, resultLimit);
  }, [searchQuery, selectedDeptCode, resultLimit]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Shehryar Zaheer</Text>
      <Text style={styles.subtitle}>PRIVATE MOBILE STOCK PORTAL</Text>

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Description, Item #, Barcode..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <select
          value={resultLimit}
          onChange={(e) => setResultLimit(Number(e.target.value))}
          style={webStyles.select}
        >
          <option value={10}>10 Max</option>
          <option value={25}>25 Max</option>
          <option value={50}>50 Max</option>
          <option value={100}>100 Max</option>
        </select>
      </View>

      {/* Dynamic Department Buttons generated from data */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.deptContainer}>
        <TouchableOpacity
          style={[styles.deptButton, !selectedDeptCode && styles.activeDeptButton]}
          onPress={() => setSelectedDeptCode(null)}
        >
          <Text style={styles.deptButtonText}>All Depts</Text>
        </TouchableOpacity>
        {departments.map(dept => (
          <TouchableOpacity
            key={dept.code}
            style={[styles.deptButton, selectedDeptCode === dept.code && styles.activeDeptButton]}
            onPress={() => setSelectedDeptCode(dept.code)}
          >
            <Text style={styles.deptButtonText}>{dept.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Inventory Display Cards */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.itemTitle}>{item["ITEM DESC"] || "No Description"}</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Item #: </Text>
                <Text style={styles.value}>{item["ITEM"]}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Barcode: </Text>
                <Text style={styles.value}>{item["PRIMARY BAR"] || "N/A"}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Dept: </Text>
                <Text style={styles.value}>{item["DEPT_NAME"]} ({item["DEPT"]})</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Supplier: </Text>
                <Text style={styles.value}>{item["SUPPLIER NAME"]}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Status: </Text>
                <Text style={styles.value}>{item["STAT"] || "Active"}</Text>
              </View>
            </View>
            
            {item["PRIMARY BAR"] && (
              <View style={styles.qrContainer}>
                <QRCodeSVG value={String(item["PRIMARY BAR"])} size={70} bgcolor="#fff" fgcolor="#000" />
              </View>
            )}
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

const webStyles = {
  select: {
    backgroundColor: '#1e293b',
    color: '#fff',
    borderRadius: 8,
    padding: 10,
    border: '1px solid #334155',
    outline: 'none',
    cursor: 'pointer',
    marginLeft: 10,
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 20, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#38bdf8', textAlign: 'center' },
  subtitle: { fontSize: 10, color: '#64748b', textAlign: 'center', marginBottom: 20, letterSpacing: 1 },
  searchContainer: { flexDirection: 'row', marginBottom: 15, alignItems: 'center' },
  searchInput: { flex: 1, backgroundColor: '#1e293b', color: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  deptContainer: { flexDirection: 'row', marginBottom: 15, maxHeight: 45 },
  deptButton: { backgroundColor: '#1e293b', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 8, height: 35 },
  activeDeptButton: { backgroundColor: '#0ea5e9' },
  deptButtonText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  card: { backgroundColor: '#1e293b', padding: 15, borderRadius: 12, marginBottom: 10, flexDirection: 'row', borderLeftWidth: 4, borderLeftColor: '#38bdf8' },
  cardInfo: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  row: { flexDirection: 'row', marginBottom: 3 },
  label: { color: '#64748b', fontWeight: '600', fontSize: 13 },
  value: { color: '#cbd5e1', fontSize: 13 },
  qrContainer: { justifyContent: 'center', alignItems: 'center', marginLeft: 10, backgroundColor: '#fff', padding: 5, borderRadius: 8, height: 80, width: 80 },
  emptyText: { color: '#64748b', textAlign: 'center', marginTop: 40 },
  footer: { color: '#334155', textAlign: 'center', fontSize: 10, marginTop: 20, marginBottom: 10 }
});
