import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { AlertCircle, ChevronLeft, Droplet, HelpCircle, Layers, Leaf } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// This file is now a page in your Expo Router app
export default function CropRecommend() {
  const router = useRouter(); // Use router for navigation

  const [soil, setSoil] = useState("Loamy");
  const [N, setN] = useState("");
  const [P, setP] = useState("");
  const [K, setK] = useState("");
  const [ph, setPh] = useState("");
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // --- No change to your core logic ---
  const handleRecommend = async () => {
    if (!N || !P || !K || !ph) {
      Alert.alert("Please enter all NPK and pH values.");
      return;
    }

    const phValue = parseFloat(ph);
    if (phValue < 5.5 || phValue > 7.5) {
      setErrorMsg("pH out of range: cannot grow crops in this pH value");
      setRecommendations([]);
      return;
    }

    setLoading(true);
    setRecommendations([]);
    setErrorMsg("");

    try {
      const res = await axios.post("http://172.20.10.4:8000/recommend", {
        soil,
        N: parseFloat(N),
        P: parseFloat(P),
        K: parseFloat(K),
        ph: phValue,
      });

      setRecommendations(res.data.recommendations);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to get recommendations. Please check your network.");
    }

    setLoading(false);
  };

  // --- This hook clears old results when any input changes ---
  useEffect(() => {
    if (recommendations.length > 0 || errorMsg) {
      setRecommendations([]);
      setErrorMsg("");
    }
  }, [soil, N, P, K, ph]); 
  
  // --- Themed Header (No change) ---
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <ChevronLeft color="#333" size={28} />
      </TouchableOpacity>
      <Text style={styles.title}>Crop Recommendation</Text>
      <View style={{ width: 40 }} />
    </View>
  );

  return (
    <LinearGradient
      colors={["#FDFDFB", "#F5F8F5"]} // Standard app background
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* --- CARD 1: Soil Type --- */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, {backgroundColor: "rgba(121, 85, 72, 0.1)"}]}>
                  <Layers color="#795548" size={24} />
                </View>
                <Text style={styles.cardTitle}>Soil Type</Text>
              </View>
              <View style={styles.pickerWrapper}>
                {/* --- UPDATED PICKER LIST --- */}
                <Picker
                  selectedValue={soil}
                  onValueChange={(itemValue: string) => setSoil(itemValue)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                  dropdownIconColor="#2E7D32"
                >
                  <Picker.Item label="Loamy" value="Loamy" />
                  <Picker.Item label="Sandy" value="Sandy" />
                  <Picker.Item label="Clay" value="Clay" />
                  <Picker.Item label="Silty" value="Silty" />
                  <Picker.Item label="Black" value="Black" />
                  <Picker.Item label="Red" value="Red" />
                  {/* Removed Peaty, Chalky, Alluvial, Laterite */}
                </Picker>
              </View>
            </View>

            {/* --- CARD 2: NPK Values --- */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, {backgroundColor: "rgba(46, 125, 50, 0.1)"}]}>
                  <Leaf color="#2E7D32" size={24} />
                </View>
                <Text style={styles.cardTitle}>Nutrient Values (NPK)</Text>
              </View>

              <Text style={styles.label}>Nitrogen (N)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={N}
                onChangeText={setN}
                placeholder="e.g. 20"
                placeholderTextColor="#9E9E9E"
              />
              
              <Text style={styles.label}>Phosphorus (P)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={P}
                onChangeText={setP}
                placeholder="e.g. 15"
                placeholderTextColor="#9E9E9E"
              />
              
              <Text style={styles.label}>Potassium (K)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={K}
                onChangeText={setK}
                placeholder="e.g. 10"
                placeholderTextColor="#9E9E9E"
              />
            </View>

            {/* --- CARD 3: pH Value --- */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, {backgroundColor: "rgba(2, 136, 209, 0.1)"}]}>
                  <Droplet color="#0288D1" size={24} />
                </View>
                <Text style={styles.cardTitle}>Soil Acidity (pH)</Text>
              </View>
              
              <Text style={styles.label}>pH value (5.5 - 7.5)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={ph}
                onChangeText={setPh}
                placeholder="e.g. 6.5"
                placeholderTextColor="#9E9E9E"
              />
            </View>

            {/* --- Styled Button --- */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRecommend}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Get Recommendations</Text>
              )}
            </TouchableOpacity>

            {/* --- Styled Error/Result --- */}
            {errorMsg ? (
              <View style={[styles.messageContainer, styles.errorContainer]}>
                <AlertCircle color="#D32F2F" size={24} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {recommendations.length > 0 && (
              <View style={styles.resultBox}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIcon, {backgroundColor: "rgba(46, 125, 50, 0.1)"}]}>
                    <Leaf color="#2E7D32" size={24} />
                  </View>
                  <Text style={styles.cardTitle}>Top Recommended Crops</Text>
                </View>
                {recommendations.map((crop, index) => (
                  <Text key={index} style={styles.cropItem}>
                    {index + 1}. {crop}
                  </Text>
                ))}
              </View>
            )}

            {/* Help/Info Card */}
            <View style={[styles.card, styles.infoCard]}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, {backgroundColor: "rgba(245, 127, 23, 0.1)"}]}>
                  <HelpCircle color="#F57F17" size={24} />
                </View>
                <Text style={styles.cardTitle}>What do these values mean?</Text>
              </View>
              <Text style={styles.infoText}>
                Use a soil testing kit to find your NPK and pH values. Accurate values give the best recommendations.
              </Text>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

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
  scrollContainer: {
    padding: 20,
  },
  // --- CARD STYLES ---
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  // ---
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
    marginBottom: 8,
    marginTop: 8, // Add space between inputs
  },
  input: {
    width: "100%",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    padding: 14,
    fontSize: 16,
    color: "#333",
  },
  pickerWrapper: {
    backgroundColor: "#F8F9FA",
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
  button: {
    width: "100%",
    backgroundColor: "#2E7D32",
    paddingVertical: 15,
    borderRadius: 100,
    alignItems: "center",
    marginVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: "#A5D6A7",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  errorContainer: {
    backgroundColor: "rgba(211, 47, 47, 0.1)",
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 10,
    flex: 1, // Allow text to wrap
  },
  resultBox: {
    marginTop: 10,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  cropItem: {
    fontSize: 18,
    color: "#333",
    marginBottom: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  infoCard: {
    backgroundColor: "rgba(255, 251, 235, 0.7)", // Light yellow info bg
    borderColor: "#FFECB3",
    borderWidth: 1,
    elevation: 0,
    shadowOpacity: 0,
    marginBottom: 50, // Add space at the bottom
  },
  infoText: {
    fontSize: 14,
    color: "#6D4C41",
    lineHeight: 20,
  },
});
