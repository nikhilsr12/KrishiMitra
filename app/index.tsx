// app/index.tsx
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login"); // Always open login page first
  }, []);

  return null;
}
