import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type SchemeItem = {
  id: number;
  title: { en: string; hi: string };
  description: { en: string; hi: string };
  link: string;
};

type Props = {
  scheme: SchemeItem;
  language?: "en" | "hi"; // default to English
};

const SchemeCard: React.FC<Props> = ({ scheme, language = "en" }) => {
  const openLink = async () => {
    const supported = await Linking.canOpenURL(scheme.link);
    if (supported) {
      await Linking.openURL(scheme.link);
    } else {
      alert("Cannot open link: " + scheme.link);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{scheme.title[language]}</Text>
      <Text style={styles.description}>{scheme.description[language]}</Text>
      <TouchableOpacity style={styles.button} onPress={openLink}>
        <Text style={styles.buttonText}>Visit Scheme</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(241, 248, 233, 1)", // soft green input background tone
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1B5E20", // deep forest green matching app theme
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    color: "#4E342E", // matching brown tone for text
  },
  button: {
    backgroundColor: "#4CAF50", // consistent green button color
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});

export default SchemeCard;
