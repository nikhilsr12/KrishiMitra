import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router"; // Use Expo Router
import { AlertCircle, Bug, ChevronLeft, ImageUp, Scan } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

// Import expo-image-picker
import * as ImagePicker from "expo-image-picker";
// Import axios
import axios from "axios";

// This file is now a page in your Expo Router app
export default function DiseaseDetect() {
  const router = useRouter(); // Use router for navigation

  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null); // For backend errors

  // --- No change to your core logic ---
  const pickImage = async () => {
    setPrediction(null);
    setDetails(null);
    setErrorMsg(null);

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

  // --- No change to your core logic ---
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
    setErrorMsg(null);

    try {
      const res = await axios.post("http://172.20.10.4:8001/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.error) {
        setErrorMsg(res.data.error);
      } else {
        setPrediction(res.data.prediction);
        setDetails(res.data.details);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to get prediction. Please check your network.");
    }
    setLoading(false);
  };

  // --- Themed Header ---
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <ChevronLeft color="#333" size={28} />
      </TouchableOpacity>
      <Text style={styles.title}>Disease Detection</Text>
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
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* --- NEW: Interactive Image Upload Area --- */}
          <TouchableOpacity onPress={pickImage} style={styles.uploadArea}>
            {selectedImage ? (
              <ImageBackground
                source={{ uri: selectedImage.uri }}
                style={styles.previewImage}
                imageStyle={{ borderRadius: 12 }}
              >
                {/* Add an overlay to hint they can tap to change it */}
                <View style={styles.previewOverlay}>
                  <Text style={styles.previewOverlayText}>Tap to change image</Text>
                </View>
              </ImageBackground>
            ) : (
              <View style={styles.uploadAreaContent}>
                <ImageUp color="#2E7D32" size={48} strokeWidth={1.5} />
                <Text style={styles.uploadText}>Tap to select an image</Text>
                <Text style={styles.uploadSubText}>
                  Choose a clear photo of the affected leaf
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* --- NEW: Primary Detect Button --- */}
          <TouchableOpacity
            style={[
              styles.buttonPrimary,
              (!selectedImage || loading) && styles.buttonDisabled, // Disable if no image or loading
            ]}
            onPress={handleUpload}
            disabled={!selectedImage || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Scan color="#FFFFFF" size={18} style={{ marginRight: 8 }} />
                <Text style={styles.buttonPrimaryText}>Detect Disease</Text>
              </>
            )}
          </TouchableOpacity>

          {/* --- CARD 3: Results (Conditional) --- */}
          {errorMsg && (
            <View style={[styles.messageContainer, styles.errorContainer]}>
              <AlertCircle color="#D32F2F" size={24} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {prediction && (
            <View style={styles.resultBox}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, { backgroundColor: "rgba(211, 47, 47, 0.1)" }]}>
                  <Bug color="#D32F2F" size={24} />
                </View>
                <Text style={styles.cardTitle}>Detection Result</Text>
              </View>

              <Text style={styles.resultLabel}>Prediction:</Text>
              <Text style={styles.resultPrediction}>{prediction}</Text>

              {details && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.resultLabel}>Cause:</Text>
                  <Text style={styles.resultDetails}>{details.cause}</Text>

                  <Text style={styles.resultLabel}>Symptoms:</Text>
                  <Text style={styles.resultDetails}>{details.symptoms}</Text>

                  <Text style={styles.resultLabel}>Management:</Text>
                  <Text style={styles.resultDetails}>{details.management}</Text>
                </>
              )}
            </View>
          )}
        </ScrollView>
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
  // --- NEW Upload Area ---
  uploadArea: {
    height: 250,
    width: "100%",
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    overflow: "hidden", // To contain the image
  },
  uploadAreaContent: {
    alignItems: "center",
  },
  uploadText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E7D32",
    marginTop: 12,
  },
  uploadSubText: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  // --- NEW Image Preview ---
  previewImage: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end", // To position the overlay text
  },
  previewOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingVertical: 8,
  },
  previewOverlayText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "600",
  },
  // Button Styles
  buttonPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    backgroundColor: "#2E7D32",
    paddingVertical: 15,
    borderRadius: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonPrimaryText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: "#A5D6A7",
  },
  // Result Box
  resultBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 50,
  },
  cardHeader: { // Re-using card header style
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardIcon: { // Re-using card icon style
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTitle: { // Re-using card title style
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
    marginTop: 12,
  },
  resultPrediction: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#D32F2F", // Red for disease
    marginBottom: 12,
  },
  resultDetails: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 12,
  },
  // Error Message
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
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
});