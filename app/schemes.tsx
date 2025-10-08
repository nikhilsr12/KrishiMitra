import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import SchemeCard from "../components/schemecard";

type SchemeItem = {
  id: number;
  title: { en: string; hi: string };
  description: { en: string; hi: string };
  link: string;
};

const BACKEND_IP = "192.168.0.101";
const BACKEND_PORT = "5000";

const Schemes: React.FC = () => {
  const [schemes, setSchemes] = useState<SchemeItem[]>([]);

  const fetchSchemes = async () => {
    try {
      const response = await fetch(`http://${BACKEND_IP}:${BACKEND_PORT}/schemes`);
      if (!response.ok) throw new Error("Failed to fetch schemes");
      const data: SchemeItem[] = await response.json();
      setSchemes(data);
    } catch (err) {
      console.log("Error fetching schemes:", err);
      setSchemes([]);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Government Schemes</Text>
      <FlatList
        data={schemes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <SchemeCard scheme={item} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No schemes available</Text>
        }
        contentContainerStyle={schemes.length === 0 && styles.emptyContainer}
      />
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
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#4E342E", // matching app's brown tone
  },
});

export default Schemes;
