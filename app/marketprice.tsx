import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { AlertCircle, ChevronLeft, DatabaseZap, LineChart } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import PriceCard from "../components/pricecard"; // Your PriceCard component
import ResalePriceCard from "../components/resalepricecard"; // --- IMPORT THE NEW CARD ---

type PriceItem = {
  market: string;
  price: string | number;
};

// Your backend LAN IP (No change)
const BACKEND_IP = "172.20.10.4";
const BACKEND_PORT = "5000";

// --- Full list of crops from your market_data.json ---
const CROP_NAMES = [
  "Wheat", "Rice", "Maize", "Barley", "Millet", "Sugarcane", "Cotton", 
  "Soybean", "Tomato", "Potato", "Onion", "Chili", "Garlic", "Ginger", 
  "Maize Flour", "Green Gram", "Black Gram", "Red Gram", "Soybean Oil", 
  "Sunflower Oil", "Mustard", "Peanut", "Cashew", "Coconut", "Coffee", 
  "Tea", "Apple", "Banana", "Mango", "Guava", "Pineapple", "Papaya", 
  "Lemon", "Carrot", "Cabbage", "Cauliflower", "Spinach", "Capsicum", 
  "Brinjal", "Cucumber", "Bottle Gourd", "Bitter Gourd", "Snake Gourd", 
  "Ridge Gourd", "Drumstick", "Fenugreek", "Coriander", "Mint", "Bajra", 
  "Jowar", "Ragi", "Kodo Millet", "Foxtail Millet", "Little Millet", 
  "Barnyard Millet"
];

const MarketPrices: React.FC = () => {
  const router = useRouter();
  const [crop, setCrop] = useState<string>("Wheat");
  const [prices, setPrices] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async (selectedCrop: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://${BACKEND_IP}:${BACKEND_PORT}/market-prices/${selectedCrop}`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data: PriceItem[] = await response.json();
      setPrices(data);
    } catch (err) {
      console.log("Error fetching prices:", err);
      setError(
        "Unable to fetch prices. Make sure your device is on the same network as the backend."
      );
      setPrices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices(crop);
  }, [crop]);

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <ChevronLeft color="#333" size={28} />
      </TouchableOpacity>
      <Text style={styles.title}>Market Prices</Text>
      <View style={{ width: 40 }} />
    </View>
  );

  const renderContent = () => {
    let listContent;

    if (error) {
      listContent = (
        <View style={styles.messageContainer}>
          <AlertCircle color="#D32F2F" size={48} />
          <Text style={styles.messageText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchPrices(crop)}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    else if (loading) {
      listContent = (
        <View style={styles.messageContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.messageText}>Loading prices...</Text>
        </View>
      );
    }
    else if (prices.length === 0) {
      listContent = (
        <View style={styles.messageContainer}>
          <DatabaseZap color="#555" size={48} />
          <Text style={styles.messageText}>No prices available for {crop}.</Text>
        </View>
      );
    }
    else {
      // --- UPDATED RENDER LOGIC ---
      listContent = (
        <View style={styles.listContainer}>
          {prices.map((item) => {
            const currentPrice = Number(item.price);
            let resalePrice: string | number = "N/A";
            
            if (!isNaN(currentPrice)) {
              // Using a 12% reduction for the resale price
              resalePrice = currentPrice * 0.88; 
            }
            
            return (
              // This group adds the shadow and spacing
              <View key={item.market} style={styles.cardGroup}>
                <PriceCard 
                  market={item.market} 
                  price={item.price} 
                />
                <ResalePriceCard 
                  market={`${item.market} (Resale)`} 
                  price={resalePrice} 
                />
              </View>
            );
          })}
        </View>
      );
    }

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.selectionContainer}>
          <View style={styles.selectedCropDisplay}>
            <View style={styles.selectedCropIcon}>
              <LineChart color="#F57F17" size={24} />
            </View>
            <View>
              <Text style={styles.selectedCropLabel}>Showing prices for</Text>
              <Text style={styles.selectedCropName}>{crop}</Text>
            </View>
          </View>
          
          <Text style={styles.pickerLabel}>Change Crop</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={crop}
              onValueChange={(val) => setCrop(val)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
              dropdownIconColor="#2E7D32"
            >
              {CROP_NAMES.map((cropName) => (
                <Picker.Item key={cropName} label={cropName} value={cropName} />
              ))}
            </Picker>
          </View>
        </View>
        
        <View style={styles.divider} />
        {listContent}
      </ScrollView>
    );
  };

  return (
    <LinearGradient
      colors={["#FDFDFB", "#F5F8F5"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        {renderContent()}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
  },
  selectionContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  selectedCropDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  selectedCropIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(245, 127, 23, 0.1)",
    marginRight: 12,
  },
  selectedCropLabel: {
    fontSize: 14,
    color: "#555",
  },
  selectedCropName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
    marginBottom: 8,
  },
  pickerWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    height: 60,
    color: "#2E7D32",
  },
  pickerItem: {
    color: "#2E7D32",
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  // --- NEW STYLING FOR THE CARD GROUP ---
  cardGroup: {
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderRadius: 16, // This applies the rounding to the group
    backgroundColor: "#FFFFFF", // Required for shadow to work
  },
  // ---
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  messageContainer: {
    minHeight: 200,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  messageText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 16,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: "#2E7D32",
    borderRadius: 100,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default MarketPrices;