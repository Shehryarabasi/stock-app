import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { QRCodeSVG } from 'qrcode.react';
import rawStockData from './products.json';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [resultLimit, setResultLimit] = useState(10);

  const initialStockData = useMemo(() => {
    if (!rawStockData) return [];
    if (Array.isArray(rawStockData)) return rawStockData;
    if (rawStockData.products && Array.isArray(rawStockData.products)) return rawStockData.products;
    if (rawStockData.data && Array.isArray(rawStockData.data)) return rawStockData.data;
    return Object.values(rawStockData).filter(item => typeof item === 'object' && item !== null);
  }, []);

  // Inspect the very first item to see its exact keys
  const detectedKeys = useMemo(() => {
    if (initialStockData.length > 0 && initialStockData[0]) {
      return Object.keys(initialStockData[0]).join(', ');
    }
    return 'No keys found';
  }, [initialStockData]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return initialStockData.slice(0, resultLimit);

    return initialStockData.filter(item => {
      if (!item) return false;
      return Object.values(item).some(val => 
        String(val).toLowerCase().includes(query)
      );
    }).slice(0, resultLimit);
  }, [searchQuery, resultLimit, initialStockData]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shehryar Zaheer</Text>
      <Text style={styles.subtitle}>PRIVATE MOBILE STOCK PORTAL</Text>

      {/* DEBUG BOX: Shows exactly what the columns are named in JSON */}
      <View style={{ backgroundColor: '#ef4444', padding: 10, borderRadius: 8, marginBottom: 15 }}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>FOUND COLUMNS IN YOUR JSON FILE:</Text>
        <Text style={{ color: '#fff', fontSize: 11, marginTop: 4 }}>{detectedKeys}</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search anything..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <ScrollView style={{ maxHeight: 150 }}>
              {Object.entries(item).map(([key, val]) => (
                <View key={key} style={styles.row}>
                  <Text style={styles.label}>{key}: </Text>
                  <Text style={styles.value}>{String(val)}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No matches. (Total loaded: {initialStockData.length})</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 20, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#38bdf8', textAlign: 'center' },
  subtitle: { fontSize: 10, color: '#64748b', textAlign: 'center', marginBottom: 20 },
  searchContainer: { flexDirection: 'row', marginBottom: 15, alignItems: 'center' },
  searchInput: { flex: 1, backgroundColor: '#1e293b', color: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  card: { backgroundColor: '#1e293b', padding: 15, borderRadius: 12, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#38bdf8' },
  row: { flexDirection: 'row', marginBottom: 3, flexWrap: 'wrap' },
  label: { color: '#38bdf8', fontWeight: '600', fontSize: 12 },
  value: { color: '#cbd5e1', fontSize: 12 },
  emptyText: { color: '#64748b', textAlign: 'center', marginTop: 40 }
});
