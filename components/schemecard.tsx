import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Linking, Alert } from "react-native";
import { Scroll, Link, ChevronDown, ChevronUp } from "lucide-react-native"; // Icons
import { LinearGradient } from "expo-linear-gradient";

type SchemeItem = {
  id: number;
  title: { en: string; hi: string };
  description: { en: string; hi: string };
  link: string;
};

type Props = {
  scheme: SchemeItem;
};

// Default to English, but you could add a toggle later
const lang = "en"; 

export default function SchemeCard({ scheme }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLinkPress = async () => {
    const supported = await Linking.canOpenURL(scheme.link);
    if (supported) {
      await Linking.openURL(scheme.link);
    } else {
      Alert.alert("Error", "Cannot open this link.");
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <LinearGradient
          // Blue-tone gradient for the icon (matches home screen)
          colors={["#0288D1", "#4FC3F7"]}
          style={styles.iconContainer}
        >
          <Scroll color="#FFFFFF" size={24} />
        </LinearGradient>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{scheme.title[lang]}</Text>
        </View>
      </View>

      <Text 
        style={styles.descriptionText} 
        numberOfLines={isExpanded ? undefined : 3}
      >
        {scheme.description[lang]}
      </Text>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.expandButton} 
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <Text style={styles.expandButtonText}>
            {isExpanded ? "Show Less" : "Show More"}
          </Text>
          {isExpanded ? (
            <ChevronUp color="#555" size={16} /> 
          ) : (
            <ChevronDown color="#555" size={16} />
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.applyButton} onPress={handleLinkPress}>
          <Text style={styles.applyButtonText}>Apply Now</Text>
          <Link color="#FFFFFF" size={14} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  descriptionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 12,
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
  },
  expandButtonText: {
    fontSize: 14,
    color: "#555",
    marginRight: 4,
  },
  applyButton: {
    backgroundColor: "#2E7D32", // `bg-primary`
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100, // Pill shape
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 6,
  },
});
