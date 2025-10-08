import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../firebaseConfig";

export default function Home() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        router.replace("/login");
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../assets/images/mainlogo.png")}
      style={styles.background}
      resizeMode="contain"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>
          {userEmail ? `Hello, ${userEmail}` : "Loading..."}
        </Text>

        {/* <TouchableOpacity style={styles.featureButton}>
          <Text style={styles.featureText}>🌱 View Crops</Text>
        </TouchableOpacity> */}

        {/* <TouchableOpacity style={styles.featureButton}>
          <Text style={styles.featureText}>📊 Market Prices</Text>
        </TouchableOpacity> */}

        {/* New Chat Bot Button */}
        <TouchableOpacity
          style={styles.featureButton}
          onPress={() => router.push("/ChatScreen" as any)}
        >
          <Text style={styles.featureText}>💬 Chat Support</Text>
        </TouchableOpacity>

        {/* New Detect Disease Button */}
        <TouchableOpacity
          style={styles.featureButton}
          onPress={() => router.push("/diseasedetect" as any)}
        >
          <Text style={styles.featureText}>🩺 Detect Disease</Text>
        </TouchableOpacity>

        {/* New Crop Recommendation Button */}
        <TouchableOpacity
          style={styles.featureButton}
          onPress={() => router.push("/croprecommend" as any)}
        >
          <Text style={styles.featureText}>🌾 Crop Recommendation</Text>
        </TouchableOpacity>

        {/* New Market Prices Button */}
        <TouchableOpacity
          style={styles.featureButton}
          onPress={() => router.push("/marketprice" as any)}
        >
          <Text style={styles.featureText}>📊 Market Prices</Text>
        </TouchableOpacity>

        {/* New Government Schemes Button */}
        <TouchableOpacity
          style={styles.featureButton}
          onPress={() => router.push("/schemes" as any)}
        >
          <Text style={styles.featureText}>📜 Government Schemes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.featureButton, { backgroundColor: "#B71C1C" }]}
          onPress={handleLogout}
        >
          <Text style={styles.featureText}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.88)",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  title: {
    fontSize: 28,
    color: "#1B5E20", // deep forest green
    fontWeight: "bold",
    marginBottom: 35,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#4E342E", // matching login/register subtitle tone
    marginBottom: 30,
    textAlign: "center",
  },
  featureButton: {
    width: "100%",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 15,
    backgroundColor: "#63eb7fff", // green button matching login/register
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 5,
  },
  featureText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
