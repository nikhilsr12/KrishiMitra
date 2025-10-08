import { MaterialCommunityIcons } from "@expo/vector-icons"; // ✅ Agriculture icons
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TextInput } from "react-native-paper";
import { auth } from "../firebaseConfig";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Set this value (0 = fully transparent, 1 = fully opaque)
  const backgroundImageOpacity = 1;

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/home");
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.background}>
      <ImageBackground
        source={require("../assets/images/mainlogo.png")}
        style={StyleSheet.absoluteFill}
        resizeMode="contain"
      >
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: `rgba(0,0,0,${1 - backgroundImageOpacity})` },
          ]}
        />
      </ImageBackground>
      <View style={styles.overlay}>
        <Text style={styles.title}>🌱 Welcome Back, Farmer</Text>

        {/* Email Input with Icon */}
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          mode="outlined"
          outlineColor="#A5D6A7"
          activeOutlineColor="#2E7D32"
          left={
            <TextInput.Icon
              icon={() => (
                <MaterialCommunityIcons
                  name="email"
                  size={20}
                  color="#2E7D32"
                />
              )}
            />
          }
        />

        {/* Password Input with Icon */}
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
          outlineColor="#A5D6A7"
          activeOutlineColor="#2E7D32"
          left={
            <TextInput.Icon
              icon={() => (
                <MaterialCommunityIcons
                  name="lock"
                  size={20}
                  color="#2E7D32"
                />
              )}
            />
          }
        />

        {loading ? (
          <ActivityIndicator size="large" color="#2E7D32" />
        ) : (
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={styles.registerText}>
            Don’t have an account?{" "}
            <Text style={{ fontWeight: "bold", color: "#1B5E20" }}>
              Sign up
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, position: "relative" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(232, 244, 232, 0.88)",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  title: {
    fontSize: 28,
    color: "#1B5E20", // deep forest green
    fontWeight: "bold",
    marginBottom: 35,
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "#F1F8E9", // soft green input background
    borderRadius: 12,
    marginBottom: 20,
  },
  loginButton: {
    width: "100%",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 15,
    backgroundColor: "#4CAF50", // green button
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 5,
  },
  loginButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  registerText: {
    color: "#4E342E",
    fontSize: 14,
    marginTop: 10,
  },
});
