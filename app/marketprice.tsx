import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import PriceCard from "../components/pricecard";

type PriceItem = {
  market: string;
  price: string | number;
};

// Your backend LAN IP
const BACKEND_IP = "192.168.0.101";
const BACKEND_PORT = "5000";

const MarketPrices: React.FC = () => {
  const [crop, setCrop] = useState<string>("Wheat");
  const [prices, setPrices] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://${BACKEND_IP}:${BACKEND_PORT}/market-prices/${crop}`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data: PriceItem[] = await response.json();
      setPrices(data);
    } catch (err) {
      console.log("Error fetching prices:", err);
      Alert.alert(
        "Network Error",
        "Unable to fetch prices. Make sure your device is on the same network as the backend."
      );
      setPrices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [crop]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Market Prices</Text>
      <Picker
        selectedValue={crop}
        onValueChange={(val) => setCrop(val)}
        style={styles.picker}
        itemStyle={styles.pickerItem}
        dropdownIconColor="#2E7D32"
      >
        <Picker.Item label="Wheat" value="Wheat" />
        <Picker.Item label="Rice" value="Rice" />
        <Picker.Item label="Maize" value="Maize" />
        <Picker.Item label="Barley" value="Barley" />
        <Picker.Item label="Millet" value="Millet" />
        <Picker.Item label="Sugarcane" value="Sugarcane" />
        <Picker.Item label="Cotton" value="Cotton" />
        <Picker.Item label="Soybean" value="Soybean" />
        <Picker.Item label="Tomato" value="Tomato" />
        <Picker.Item label="Potato" value="Potato" />
        <Picker.Item label="Onion" value="Onion" />
        <Picker.Item label="Chili" value="Chili" />
        <Picker.Item label="Garlic" value="Garlic" />
        <Picker.Item label="Ginger" value="Ginger" />
        <Picker.Item label="Maize Flour" value="Maize Flour" />
        <Picker.Item label="Green Gram" value="Green Gram" />
        <Picker.Item label="Black Gram" value="Black Gram" />
        <Picker.Item label="Red Gram" value="Red Gram" />
        <Picker.Item label="Soybean Oil" value="Soybean Oil" />
        <Picker.Item label="Sunflower Oil" value="Sunflower Oil" />
        <Picker.Item label="Mustard" value="Mustard" />
        <Picker.Item label="Peanut" value="Peanut" />
        <Picker.Item label="Cashew" value="Cashew" />
        <Picker.Item label="Coconut" value="Coconut" />
        <Picker.Item label="Coffee" value="Coffee" />
        <Picker.Item label="Tea" value="Tea" />
        <Picker.Item label="Apple" value="Apple" />
        <Picker.Item label="Banana" value="Banana" />
        <Picker.Item label="Mango" value="Mango" />
        <Picker.Item label="Guava" value="Guava" />
        <Picker.Item label="Pineapple" value="Pineapple" />
        <Picker.Item label="Papaya" value="Papaya" />
        <Picker.Item label="Lemon" value="Lemon" />
        <Picker.Item label="Carrot" value="Carrot" />
        <Picker.Item label="Cabbage" value="Cabbage" />
        <Picker.Item label="Cauliflower" value="Cauliflower" />
        <Picker.Item label="Spinach" value="Spinach" />
        <Picker.Item label="Capsicum" value="Capsicum" />
        <Picker.Item label="Brinjal" value="Brinjal" />
        <Picker.Item label="Cucumber" value="Cucumber" />
        <Picker.Item label="Bottle Gourd" value="Bottle Gourd" />
        <Picker.Item label="Bitter Gourd" value="Bitter Gourd" />
        <Picker.Item label="Snake Gourd" value="Snake Gourd" />
        <Picker.Item label="Ridge Gourd" value="Ridge Gourd" />
        <Picker.Item label="Drumstick" value="Drumstick" />
        <Picker.Item label="Fenugreek" value="Fenugreek" />
        <Picker.Item label="Coriander" value="Coriander" />
        <Picker.Item label="Mint" value="Mint" />
        <Picker.Item label="Bajra" value="Bajra" />
        <Picker.Item label="Jowar" value="Jowar" />
        <Picker.Item label="Ragi" value="Ragi" />
        <Picker.Item label="Kodo Millet" value="Kodo Millet" />
        <Picker.Item label="Foxtail Millet" value="Foxtail Millet" />
        <Picker.Item label="Little Millet" value="Little Millet" />
        <Picker.Item label="Barnyard Millet" value="Barnyard Millet" />
      </Picker>

      {loading ? (
        <Text style={styles.loadingText}>Loading prices...</Text>
      ) : prices.length === 0 ? (
        <Text style={styles.emptyText}>No prices available</Text>
      ) : (
        <FlatList
          data={prices}
          keyExtractor={(item) => item.market}
          renderItem={({ item }) => (
            <PriceCard market={item.market} price={item.price} />
          )}
          contentContainerStyle={prices.length === 0 && styles.emptyContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: "rgba(255,255,255,0.88)",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1B5E20", // deep forest green
    marginBottom: 25,
  },
  picker: {
    backgroundColor: "#F1F8E9",
    borderRadius: 12,
    marginBottom: 20,
  },
  pickerItem: {
    color: "#2E7D32",
    fontSize: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#4E342E",
    textAlign: "center",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#4E342E",
    textAlign: "center",
    marginTop: 20,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MarketPrices;
