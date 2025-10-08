import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { Button, Text, View } from "react-native";
import { auth } from "../../firebaseConfig";

export default function Profile() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>User Profile</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}
