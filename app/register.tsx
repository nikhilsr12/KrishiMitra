import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
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

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.replace("/login"); // Redirect to login after registration
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/mainlogo.png")}
      style={StyleSheet.absoluteFill}
      resizeMode="center"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Create Account</Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          mode="outlined"
          outlineColor="#A5D6A7"
          activeOutlineColor="#2E7D32"
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
          outlineColor="#A5D6A7"
          activeOutlineColor="#2E7D32"
        />

        {loading ? (
          <ActivityIndicator size="large" color="#2E7D32" />
        ) : (
          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={styles.loginText}>
            Already have an account?
            <Text style={{ fontWeight: "bold", color: "#1B5E20" }}> Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
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
  registerButton: {
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
  registerButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  loginText: {
    color: "#4E342E",
    fontSize: 14,
    marginTop: 10,
  },
});
