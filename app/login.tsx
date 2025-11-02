import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Lock, Mail, Sprout } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput, // For animated button
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../firebaseConfig";

// Import Reanimated
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // --- Animation Setup ---
  const scale = useSharedValue(1);
  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const onPressIn = () => {
    scale.value = withSpring(0.98); // Press down
  };

  const onPressOut = () => {
    scale.value = withSpring(1); // Release
  };
  // --- End Animation Setup ---

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Explicitly redirect after login is successful.
      router.replace("/home"); 
      
    } catch (error) {
      if (error instanceof Error) {
        let friendlyMessage = "Login failed. Please try again.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
          friendlyMessage = "Invalid email or password. Please try again.";
        }
        Alert.alert("Login Error", friendlyMessage);
      } else {
        Alert.alert("Login Error", "An unknown error occurred.");
      }
    } finally {
      setLoading(false);
      scale.value = withSpring(1); // Ensure button returns to normal
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/bg-login.jpg")} // Use consistent hero background
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient
        // Use consistent hero overlay
        colors={["rgba(255, 255, 255, 0.7)", "rgba(248, 249, 250, 1)"]}
        style={styles.overlay}
      >
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
            >
              {/* --- Logo Area --- */}
              <View style={styles.logoContainer}>
                <View style={styles.logo}>
                  <Sprout color="#FFFFFF" size={32} />
                </View>
                <Text style={styles.brandTitle}>Krishi-Mitra</Text>
              </View>

              {/* --- Login Card --- */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Welcome Back</Text>

                {/* Email Input */}
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputContainer}>
                  <Mail color="#999" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor="#9E9E9E"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>

                {/* Password Input */}
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <Lock color="#999" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor="#9E9E9E"
                    secureTextEntry
                  />
                </View>

                {/* --- Animated Login Button --- */}
                <Reanimated.View style={[animatedButtonStyle, { marginTop: 15 }]}>
                  <Pressable
                    style={[styles.buttonPrimary, loading && styles.buttonDisabled]}
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                    onPress={handleLogin}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.buttonPrimaryText}>Login</Text>
                    )}
                  </Pressable>
                </Reanimated.View>
              </View>

              {/* Sign Up Link (This was the cause of the error) */}
              <TouchableOpacity
                style={styles.registerButton}
                onPress={() => router.push("/register")}
              >
                <Text style={styles.registerText}>
                  Don’t have an account?{" "}
                  <Text style={styles.registerLink}>Sign up</Text>
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  // Logo
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#2E7D32", // App theme color
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
    marginTop: 12,
  },
  // Card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginBottom: 24,
  },
  // Form
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#333",
  },
  // Buttons
  buttonPrimary: {
    width: "100%",
    backgroundColor: "#2E7D32",
    paddingVertical: 15,
    borderRadius: 100, // Pill shape
    alignItems: "center",
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
  // Register Link
  registerButton: {
    padding: 10,
  },
  registerText: {
    textAlign: "center",
    color: "#555",
    fontSize: 15,
    marginTop: 20,
  },
  registerLink: {
    fontWeight: "bold",
    color: "#2E7D32",
  },
});

