import { Picker } from "@react-native-picker/picker";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import axios from "axios";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Define your stack's param list type
type RootStackParamList = {
  home: undefined;
  // add other routes here if needed
};

export default function App() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [soil, setSoil] = useState("Loamy");
  const [N, setN] = useState("");
  const [P, setP] = useState("");
  const [K, setK] = useState("");
  const [ph, setPh] = useState("");
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
      const res = await axios.post("http://192.168.0.101:8000/recommend", {
        soil,
        N: parseFloat(N),
        P: parseFloat(P),
        K: parseFloat(K),
        ph: phValue,
      });

      setRecommendations(res.data.recommendations);
    } catch (err) {
      console.error(err);
      Alert.alert("Failed to get recommendations.");
    }

    setLoading(false);
  };

  // For better iOS selection bug handling, move Picker outside styled container and set backgroundColor, or use an extra wrapper.
  // Also, set the Picker style prop correctly for iOS.

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.88)" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Crop Recommendation</Text>

        <Text style={styles.label}>Select Soil Type:</Text>
        {/** Move Picker out of styled View for iOS */}
        <View style={[styles.pickerContainer, Platform.OS === 'ios' && { paddingHorizontal: 0, paddingVertical: 0, borderWidth: 0, backgroundColor: "transparent" }]}>
          <Picker
            selectedValue={soil}
            onValueChange={(itemValue: string) => setSoil(itemValue)}
            mode={Platform.OS === "ios" ? "dialog" : "dropdown"} // use "dialog" for iOS
            style={[
              styles.picker,
              Platform.OS === "ios" && { backgroundColor: "#F1F8E9", borderRadius: 12, width: "100%" },
            ]}
            itemStyle={Platform.OS === "ios" ? { color: "#2E7D32", backgroundColor: "#F1F8E9" } : undefined}
            dropdownIconColor="#2E7D32"
          >
            <Picker.Item label="Loamy" value="Loamy" />
            <Picker.Item label="Sandy" value="Sandy" />
            <Picker.Item label="Clay" value="Clay" />
            <Picker.Item label="Silty" value="Silty" />
            <Picker.Item label="Peaty" value="Peaty" />
            <Picker.Item label="Chalky" value="Chalky" />
            <Picker.Item label="Black" value="Black" />
            <Picker.Item label="Red" value="Red" />
            <Picker.Item label="Alluvial" value="Alluvial" />
            <Picker.Item label="Laterite" value="Laterite" />
          </Picker>
        </View>

        <Text style={styles.label}>Enter N (Nitrogen):</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={N}
          onChangeText={setN}
          placeholder="e.g. 20"
          placeholderTextColor="#9E9E9E"
        />

        <Text style={styles.label}>Enter P (Phosphorus):</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={P}
          onChangeText={setP}
          placeholder="e.g. 15"
          placeholderTextColor="#9E9E9E"
        />

        <Text style={styles.label}>Enter K (Potassium):</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={K}
          onChangeText={setK}
          placeholder="e.g. 10"
          placeholderTextColor="#9E9E9E"
        />

        <Text style={styles.label}>Enter pH value (5.5-7.5):</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={ph}
          onChangeText={setPh}
          placeholder="e.g. 6.5"
          placeholderTextColor="#9E9E9E"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRecommend}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Processing..." : "Get Recommendations"}
          </Text>
        </TouchableOpacity>

        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

        {recommendations.length > 0 && (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>Top Recommended Crops:</Text>
            {recommendations.map((crop, index) => (
              <Text key={index} style={styles.cropItem}>
                {crop}
              </Text>
            ))}
          </View>
        )}

        {/* Back Button at the bottom with styling */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("home")}>
          <Text style={styles.backButtonText}>← Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1B5E20", // deep forest green
    marginBottom: 30,
    textAlign: "center",
  },
  label: {
    alignSelf: "flex-start",
    marginTop: 12,
    marginBottom: 5,
    fontSize: 16,
    color: "#4E342E",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    backgroundColor: "#F1F8E9", // soft green input background
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: "#2E7D32",
  },
  pickerContainer: {
    width: "100%",
    backgroundColor: "#F1F8E9",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
    height: 60,
    justifyContent: "center",
  },
  picker: {
    height: 60,
    width: "100%",
    color: "#2E7D32",
    fontSize: 16,
  },
  button: {
    width: "100%",
    backgroundColor: "#4CAF50", // harmonious green button
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
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
    letterSpacing: 0.5,
  },
  error: {
    color: "#B71C1C",
    fontSize: 16,
    marginTop: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  resultBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#F1F8E9",
    borderRadius: 12,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 12,
  },
  cropItem: {
    fontSize: 16,
    color: "#4E342E",
    marginBottom: 8,
  },
  backButton: {
    marginTop: 30,
    backgroundColor: "#1B5E20",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    width: "100%",
  },
  backButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});
