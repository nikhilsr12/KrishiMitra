import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { AlertCircle, ChevronLeft, DatabaseZap } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import SchemeCard from "../components/schemecard";

type SchemeItem = {
  id: number;
  title: { en: string; hi: string };
  description: { en: string; hi: string };
  link: string;
};

// Your backend LAN IP (No change)
const BACKEND_IP = "172.20.10.4";
const BACKEND_PORT = "5000";

const Schemes: React.FC = () => {
  const router = useRouter();
  const [schemes, setSchemes] = useState<SchemeItem[]>([]);
  // --- NEW: Added loading and error states ---
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchemes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://${BACKEND_IP}:${BACKEND_PORT}/schemes`);
      if (!response.ok) throw new Error("Failed to fetch schemes");
      const data: SchemeItem[] = await response.json();
      setSchemes(data);
    } catch (err) {
      console.log("Error fetching schemes:", err);
      setError("Unable to fetch schemes. Please check your network and try again.");
      setSchemes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  // --- NEW: Header ---
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <ChevronLeft color="#333" size={28} />
      </TouchableOpacity>
      <Text style={styles.title}>Government Schemes</Text>
      <View style={{ width: 40 }} />
    </View>
  );

  // --- NEW: Loading/Error/Empty/List Content ---
  const renderContent = () => {
    if (error) {
      return (
        <View style={styles.messageContainer}>
          <AlertCircle color="#D32F2F" size={48} />
          <Text style={styles.messageText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchSchemes}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (loading) {
      return (
        <View style={styles.messageContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.messageText}>Loading schemes...</Text>
        </View>
      );
    }

    if (schemes.length === 0) {
      return (
        <View style={styles.messageContainer}>
          <DatabaseZap color="#555" size={48} />
          <Text style={styles.messageText}>No schemes are available at this time.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={schemes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <SchemeCard scheme={item} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <LinearGradient
      colors={["#FDFDFB", "#F5F8F5"]} // Standard app background
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
    backgroundColor: "transparent",
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  messageContainer: {
    flex: 1,
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

export default Schemes;
