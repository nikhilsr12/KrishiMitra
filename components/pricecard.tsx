import React from "react";
import { StyleSheet, Text, View } from "react-native";

type PriceCardProps = {
  market: string;
  price: number | string;
};

const PriceCard: React.FC<PriceCardProps> = ({ market, price }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.market}>{market}</Text>
      <Text style={styles.price}>₹{price}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F1F8E9", // soft green input background tone
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  market: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1B5E20", // deep forest green matching app theme
  },
  price: {
    fontSize: 16,
    color: "#4E342E", // brown tone consistent with app style
  },
});

export default PriceCard;
