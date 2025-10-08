import { NavigationProp, useNavigation } from "@react-navigation/native";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
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

  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Denied", "You need to allow gallery access to upload images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      Alert.alert("Please select an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", {
      uri: selectedImage.uri,
      name: "image.jpg",
      type: "image/jpeg",
    } as any);

    setLoading(true);
    setPrediction(null);
    setDetails(null);

    try {
      const res = await axios.post("http://192.168.0.101:8001/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.error) {
        Alert.alert("Error", res.data.error);
      } else {
        setPrediction(res.data.prediction);
        setDetails(res.data.details);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Failed to get prediction.");
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Plant Disease Detection</Text>

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Pick Image from Gallery</Text>
      </TouchableOpacity>

      {selectedImage && (
        <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
      )}

      <TouchableOpacity style={styles.button} onPress={handleUpload} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? "Processing..." : "Upload & Predict"}
        </Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 10 }} />
      )}

      {prediction && (
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>Prediction: {prediction}</Text>
          {details && (
            <View style={styles.detailsBox}>
              <Text style={styles.detailItem}>Cause: {details.cause}</Text>
              <Text style={styles.detailItem}>Symptoms: {details.symptoms}</Text>
              <Text style={styles.detailItem}>Management: {details.management}</Text>
            </View>
          )}
        </View>
      )}

      {/* Back Button at the bottom */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("home")}>
        <Text style={styles.backButtonText}>← Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 30,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.88)",
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1B5E20", // deep forest green
    marginBottom: 25,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#4CAF50", // green button
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  previewImage: {
    width: 200,
    height: 200,
    marginVertical: 15,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#A5D6A7",
  },
  resultBox: {
    marginTop: 25,
    padding: 16,
    backgroundColor: "#F1F8E9", // soft green
    borderRadius: 12,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  resultText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 10,
  },
  detailsBox: {
    marginTop: 6,
  },
  detailItem: {
    fontSize: 15,
    color: "#4E342E",
    marginBottom: 4,
  },
  backButton: {
    marginTop: 32,
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
