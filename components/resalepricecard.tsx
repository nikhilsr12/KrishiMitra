import { LinearGradient } from "expo-linear-gradient";
import { TrendingDown } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  market: string;
  price: string | number;
};

// Formats the price
const formatPrice = (price: string | number) => {
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) {
    return price;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(numericPrice);
};

export default function ResalePriceCard({ market, price }: Props) {
  return (
    <View style={styles.card}>
      <LinearGradient
        colors={["#8D6E63", "#BCAAA4"]} // Brown-tone
        style={styles.iconContainer}
      >
        <TrendingDown color="#FFFFFF" size={24} />
      </LinearGradient>
      <View style={styles.textContainer}>
        <Text style={styles.marketText} numberOfLines={1}>{market}</Text>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.priceText}>{formatPrice(price)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    // --- UPDATED ---
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1, // Separator line
    borderTopColor: "#F5F5F5",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  marketText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#5D4037", // Dark brown text
  },
  priceContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(121, 85, 72, 0.1)", // Light brown
    borderRadius: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#795548", // Main brown color
  },
});