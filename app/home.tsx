import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  ImageBackground,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { auth } from "../firebaseConfig";

// --- Icons & Gradient ---
import { LinearGradient } from "expo-linear-gradient";
import {
  Award,
  Bug,
  CloudRain,
  Globe,
  LayoutGrid,
  Leaf,
  LineChart,
  LogOut,
  MessageSquare,
  Quote,
  Scroll,
  Sprout,
  Star,
  TrendingUp,
  Users,
  X,
} from "lucide-react-native";

// --- Reanimated (for tickers) ---
import Reanimated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

// --- 1. Data for Features Grid & Menu ---
const features = [
  {
    icon: Leaf,
    title: "Crop Recommendation",
    description: "Personalized crop suggestions for optimal yield.",
    screen: "/croprecommend",
    color: "#2E7D32",
    bgColor: "rgba(46, 125, 50, 0.1)",
  },
  {
    icon: Bug,
    title: "Pest & Disease",
    description: "AI-powered identification with treatment advice.",
    screen: "/diseasedetect",
    color: "#D32F2F",
    bgColor: "rgba(211, 47, 47, 0.1)",
  },
  {
    icon: Scroll,
    title: "Govt. Schemes",
    description: "Discover and apply to relevant subsidies.",
    screen: "/schemes",
    color: "#0288D1",
    bgColor: "rgba(2, 136, 209, 0.1)",
  },
  {
    icon: MessageSquare,
    title: "AI Chatbot",
    description: "Get instant answers to farming queries 24/7.",
    screen: "/chatscreen",
    color: "#2E7D32",
    bgColor: "rgba(46, 125, 50, 0.1)",
  },
  {
    icon: LineChart,
    title: "Market Prices",
    description: "Stay updated with current market values.",
    screen: "/marketprice",
    color: "#F57F17",
    bgColor: "rgba(245, 127, 23, 0.1)",
  },
  {
    icon: CloudRain, 
    title: "Weather Report",
    description: "Get the latest weather updates for your region.",
    screen: "/weather",
    color: "#0288D1", 
    bgColor: "rgba(2, 136, 209, 0.1)", 
  },
];

// --- 2. Data for Auto-Scrolling Stats Ticker (Old) ---
const statsTickerData = [
  {
    icon: Users,
    value: "50K+",
    label: "Active Farmers",
    color: ["#2E7D32", "#66BB6A"],
  },
  {
    icon: TrendingUp,
    value: "95%",
    label: "Accurate Predictions",
    color: ["#F57F17", "#FFB74D"],
  },
  {
    icon: Sprout,
    value: "100+",
    label: "Crop Varieties",
    color: ["#85462dff", "#b98356ff"],
  },
  {
    icon: Award,
    value: "15+",
    label: "States Covered",
    color: ["#0288D1", "#4FC3F7"],
  },
  {
    icon: LineChart,
    value: "20%",
    label: "Avg. Yield Increase",
    color: ["#f13831ff", "#e77726ff"],
  },
];

// --- 3. Data for NEW Static Stats Grid ---
const statsGridData = [
  {
    icon: Users,
    value: "50,000+",
    label: "Active Farmers",
  },
  {
    icon: LineChart, 
    value: "₹5 Crore+",
    label: "Revenue Increased",
  },
  {
    icon: Globe,
    value: "20+",
    label: "Pan-India Coverage", 
  },
  {
    icon: Award,
    value: "98%",
    label: "Satisfaction Rate",
  },
];

// --- 4. Data for NEW Testimonials ---
const testimonials = [
  {
    name: "Rajesh Kumar",
    location: "Karnataka",
    quote: "This app transformed my farming! The crop recommendations increased my yield by 40%.",
  },
  {
    name: "Priya Sharma",
    location: "Kerala",
    quote: "The pest detection feature saved my crops. Quick and accurate AI predictions are amazing!",
  },
  {
    name: "Amit Patel",
    location: "Andra Pradesh",
    quote: "Weather forecasts and market prices help me make better decisions. Highly recommended!",
  },
];

// --- 5. Data for NEW Logo Ticker ---
const partners = [
  "AgriCorp",
  "FarmTech Solutions",
  "EcoGrow",
  "RuralLink",
  "HarvestAI",
  "SoilCare",
];

// --- 6. NEW: Data for Image Gallery Ticker ---
const galleryImages = [
  require('../assets/images/market.jpeg'),
  require('../assets/images/mainlogo.png'),
  require('../assets/images/bg-login.jpg'),
  require('../assets/images/scheme.jpeg'),
  require('../assets/images/market.jpeg'),
  require('../assets/images/mainlogo.png'),
  require('../assets/images/bg-login.jpg'),
  require('../assets/images/scheme.jpeg'),
];

// --- 7. Data for Floating Notifications ---
const allNotifications = [
  {
    icon: CloudRain,
    title: "Weather Alert",
    message: "Heavy rainfall expected in 2 hours.",
    color: ["#0288D1", "#4FC3F7"],
  },
  {
    icon: LineChart,
    title: "Market Update",
    message: "Tomato prices up by 12% this week.",
    color: ["#F57F17", "#FFB74D"],
  },
  {
    icon: Award,
    title: "New Scheme",
    message: "PM Fasal Bima Yojana open for registration.",
    color: ["#6A1B9A", "#BA68C8"],
  },
  {
    icon: Sprout,
    title: "Crop Tip",
    message: "Best time to fertilize your crops.",
    color: ["#2E7D32", "#66BB6A"],
  },
];

// --- 8. Floating Notification Component (Unchanged) ---
const Notification = ({ data, onDismiss }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const Icon = data.icon;
  return (
    <Animated.View style={[styles.notificationCard, { opacity: fadeAnim }]}>
      <LinearGradient colors={data.color} style={styles.notificationGradient}>
        <View style={styles.notificationIcon}>
          <Icon color="#FFFFFF" size={20} />
        </View>
        <View style={styles.notificationTextContainer}>
          <Text style={styles.notificationTitle}>{data.title}</Text>
          <Text style={styles.notificationMessage}>{data.message}</Text>
        </View>
        <TouchableOpacity onPress={onDismiss}>
          <X color="#FFFFFF" size={18} opacity={0.7} />
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
};

// --- 9. OLD Continuous Stats Ticker (Unchanged) ---
const StatsTicker = () => {
  const translateX = useSharedValue(0);
  const [listWidth, setListWidth] = useState(0);

  const onListLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setListWidth(width);
  };

  useEffect(() => {
    if (listWidth > 0) {
      translateX.value = withRepeat(
        withTiming(-listWidth, {
          duration: listWidth * 60,
          easing: Easing.linear,
        }),
        -1
      );
    }
  }, [listWidth, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const renderStatsList = (isMeasure = false) => (
    <View
      style={styles.statsRow}
      onLayout={isMeasure ? onListLayout : undefined}
    >
      {statsTickerData.map((item, index) => { // Use statsTickerData
        const Icon = item.icon;
        return (
          <LinearGradient
            key={index}
            colors={item.color}
            style={styles.statCard}
          >
            <View style={styles.statIcon}>
              <Icon color="#FFFFFF" size={24} />
            </View>
            <View>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          </LinearGradient>
        );
      })}
    </View>
  );

  return (
    <View style={styles.statsContainer}>
      <Reanimated.View style={[styles.statsRow, animatedStyle]}>
        {renderStatsList(true)}
        {renderStatsList()}
      </Reanimated.View>
    </View>
  );
};

// --- 10. NEW Logo Ticker Component (Unchanged) ---
const LogoTicker = () => {
  const translateX = useSharedValue(0);
  const [listWidth, setListWidth] = useState(0);

  const onListLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setListWidth(width);
  };

  useEffect(() => {
    if (listWidth > 0) {
      translateX.value = withRepeat(
        withTiming(-listWidth, {
          duration: listWidth * 80, // Slower duration
          easing: Easing.linear,
        }),
        -1
      );
    }
  }, [listWidth, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const renderLogos = (isMeasure = false) => (
    <View
      style={styles.statsRow}
      onLayout={isMeasure ? onListLayout : undefined}
    >
      {partners.map((name, index) => (
        <View key={index} style={styles.logoTickerItem}>
          <Text style={styles.logoTickerLabel}>{name}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.logoTickerContainer}>
      <Text style={styles.sectionTitle}>Our Partners</Text>
      <View style={{ height: 20 }} />
      <Reanimated.View style={[styles.statsRow, animatedStyle]}>
        {renderLogos(true)}
        {renderLogos()}
      </Reanimated.View>
    </View>
  );
};

// --- 11. NEW Image Gallery Ticker Component ---
const ImageTicker = () => {
  const translateX = useSharedValue(0);
  const [listWidth, setListWidth] = useState(0);
  const IMAGE_WIDTH = 280; // Width of each image card
  const IMAGE_MARGIN = 10;
  const TOTAL_IMAGE_WIDTH = (IMAGE_WIDTH + IMAGE_MARGIN * 2) * galleryImages.length;

  const onListLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setListWidth(width);
  };

  useEffect(() => {
    // We use TOTAL_IMAGE_WIDTH for the animation distance
    translateX.value = withRepeat(
      withTiming(-TOTAL_IMAGE_WIDTH, {
        duration: TOTAL_IMAGE_WIDTH * 70, // Very slow (70ms per pixel)
        easing: Easing.linear,
      }),
      -1
    );
  }, [translateX, TOTAL_IMAGE_WIDTH]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const renderImages = (isMeasure = false) => (
    <View
      style={styles.statsRow}
      onLayout={isMeasure ? onListLayout : undefined}
    >
      {galleryImages.map((imgSrc, index) => (
        <View key={index} style={[styles.imageTickerItem, { width: IMAGE_WIDTH, marginHorizontal: IMAGE_MARGIN }]}>
          <Image
            source={imgSrc}
            style={styles.imageTickerImage}
          />
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.imageTickerContainer}>
      <Text style={styles.sectionTitle}>Our Gallery</Text>
      <View style={{ height: 20 }} />
      <Reanimated.View style={[styles.statsRow, animatedStyle]}>
        {renderImages(true)}
        {renderImages()}
      </Reanimated.View>
    </View>
  );
};


export default function Home() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeNotifications, setActiveNotifications] = useState([]);
  const [notificationIndex, setNotificationIndex] = useState(0);

  // Auth Logic
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

  // Notification Logic
  useEffect(() => {
    const showNotification = () => {
      const newNotif = {
        ...allNotifications[notificationIndex],
        id: Date.now(),
      };
      setActiveNotifications((prev) => [...prev, newNotif].slice(-2));
      setNotificationIndex((prevIndex) => (prevIndex + 1) % allNotifications.length);
    };
    const notificationInterval = setInterval(showNotification, 7000);
    return () => clearInterval(notificationInterval);
  }, [notificationIndex]);

  const dismissNotification = (id) => {
    setActiveNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  const handleMenuNavigation = (screen) => {
    setIsMenuOpen(false);
    router.push(screen as any);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  // --- Main Component Render ---
  return (
    <SafeAreaView style={styles.background}>
      {/* === HEADER (Title Updated) === */}
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <View style={styles.headerLogo}>
            <Sprout color="#FFFFFF" size={24} />
          </View>
          <Text style={styles.headerTitle}>Krishi-Mitra</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setIsMenuOpen(true)}
          >
            <LayoutGrid color="#333" size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleLogout}>
            <LogOut color="#B71C1C" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* === FLOATING NOTIFICATIONS (Unchanged) === */}
      <View style={styles.notificationContainer}>
        {activeNotifications.map((notif) => (
          <Notification
            key={notif.id}
            data={notif}
            onDismiss={() => dismissNotification(notif.id)}
          />
        ))}
      </View>

      {/* === MAIN SCROLLABLE CONTENT === */}
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ backgroundColor: "#FDFDFB" }} // Off-white bg
      >
        {/* === HERO SECTION (Updated) === */}
        <ImageBackground
          source={require("../assets/images/bg-login.jpg")} // --- NOTE: Update this path
          style={styles.heroContainer}
          resizeMode="cover"
        >
          <LinearGradient
            colors={["rgba(255, 255, 255, 0.7)", "rgba(248, 249, 250, 1)"]}
            style={styles.heroOverlay}
          >
            <View style={styles.pillTag}>
              <Sprout color="#2E7D32" size={16} />
              <Text style={styles.pillTagText}>Smart Agriculture Platform</Text>
            </View>
            <Text style={styles.heroTitle}>
              Empowering Farmers with <Text style={{ color: "#2E7D32" }}>AI-Driven</Text> Solutions
            </Text>
            <Text style={styles.heroSubtitle}>
              From crop recommendations to pest detection, access everything you need to maximize yield and make informed farming decisions.
            </Text>
            <View style={styles.heroButtonContainer}>
              <TouchableOpacity style={styles.heroButtonPrimary}>
                <Text style={styles.heroButtonPrimaryText}>Get Started</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroButtonSecondary}>
                <Text style={styles.heroButtonSecondaryText}>Watch Demo</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* === OLD STATS TICKER (As requested) === */}
        <StatsTicker />

        {/* === NEW: STATIC STATS GRID === */}
        <View style={styles.statsGridContainer}>
          {statsGridData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <View key={index} style={styles.statsGridItem}>
                <View style={styles.statsGridIcon}>
                  <Icon color="#FFFFFF" size={28} />
                </View>
                <Text style={styles.statsGridValue}>{stat.value}</Text>
                <Text style={styles.statsGridLabel}>{stat.label}</Text>
              </View>
            );
          })}
        </View>

        {/* === FEATURES SECTION (Unchanged) === */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Comprehensive Tools</Text>
          <Text style={styles.sectionSubtitle}>
            Everything you need for smart farming, right here.
          </Text>
          <View style={styles.grid}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.card}
                  onPress={() => handleMenuNavigation(feature.screen)}
                >
                  <View style={[styles.cardIcon, { backgroundColor: feature.bgColor }]}>
                    <Icon color={feature.color} size={24} />
                  </View>
                  <Text style={styles.cardTitle}>{feature.title}</Text>
                  <Text style={styles.cardDescription}>{feature.description}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* === NEW: TESTIMONIALS SECTION === */}
        <View style={styles.testimonialSection}>
          <Text style={styles.sectionTitle}>
            Trusted by <Text style={{ color: "#2E7D32" }}>Thousands of Farmers</Text>
          </Text>
          <Text style={styles.sectionSubtitle}>
            See what farmers across India are saying about our platform
          </Text>
          <View style={styles.testimonialGrid}>
            {testimonials.map((item, index) => (
              <View key={index} style={styles.testimonialCard}>
                <Quote color="#F57F17" size={28} fill="#F57F17" />
                <View style={styles.testimonialStars}>
                  <Star color="#F57F17" fill="#F57F17" size={16} />
                  <Star color="#F57F17" fill="#F57F17" size={16} />
                  <Star color="#F57F17" fill="#F57F17" size={16} />
                  <Star color="#F57F17" fill="#F57F17" size={16} />
                  <Star color="#F57F17" fill="#F57F17" size={16} />
                </View>
                <Text style={styles.testimonialQuote}>"{item.quote}"</Text>
                <Text style={styles.testimonialName}>{item.name}</Text>
                <Text style={styles.testimonialLocation}>{item.location}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* === CALL TO ACTION (CTA) SECTION (Unchanged) === */}
        <View style={styles.ctaWrapper}>
          <LinearGradient
            colors={["#388E3C", "#F9A825"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaContainer}
          >
            <Text style={styles.ctaTitle}>Ready to Transform Your Farming?</Text>
            <Text style={styles.ctaSubtitle}>
              Use our tools to increase yields and make smarter decisions.
            </Text>
          </LinearGradient>
        </View>

        {/* === NEW: IMAGE GALLERY TICKER === */}
        <ImageTicker />

        {/* === NEW: LOGO TICKER SECTION === */}
        <LogoTicker />

        {/* === FOOTER SECTION (Updated) === */}
        <View style={styles.footerContainer}>
          <View style={styles.footerBrand}>
            <View style={styles.footerLogo}>
              <Sprout color="#FFFFFF" size={24} />
            </View>
            <Text style={styles.footerTitle}>Krishi-Mitra</Text>
          </View>
          <Text style={styles.footerSubtitle}>
            Empowering farmers with smart, AI-driven agricultural solutions.
          </Text>
          <Text style={styles.copyright}>© 2025 Krishi-Mitra. All rights reserved.</Text>
        </View>
      </ScrollView>

      {/* === NAVIGATION MODAL (Unchanged) === */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isMenuOpen}
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsMenuOpen(false)}
            >
              <X color="#333" size={28} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>All Features</Text>
            <ScrollView>
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.menuItem}
                    onPress={() => handleMenuNavigation(feature.screen)}
                  >
                    <View style={[styles.menuIcon, { backgroundColor: feature.bgColor }]}>
                      <Icon color={feature.color} size={24} />
                    </View>
                    <Text style={styles.menuItemText}>{feature.title}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// --- STYLES (Heavily Updated) ---
const styles = StyleSheet.create({
  // Main Layout
  background: {
    flex: 1,
    backgroundColor: "#FDFDFB", // Off-white
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  headerBrand: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#2E7D32",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
  },
  headerActions: {
    flexDirection: "row",
  },
  headerButton: {
    padding: 8,
    marginLeft: 12,
  },
  // Notification
  notificationContainer: {
    position: "absolute",
    top: 70, // Below header
    right: 10,
    width: "90%",
    maxWidth: 350,
    zIndex: 1000,
    alignSelf: "center",
  },
  notificationCard: {
    width: "100%",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 10,
  },
  notificationGradient: {
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  notificationTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  notificationMessage: {
    fontSize: 13,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  // Hero
  heroContainer: { 
    height: 350, 
    justifyContent: "flex-end" 
  },
  heroOverlay: { 
    flex: 1, 
    justifyContent: "center", 
    padding: 20, 
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  pillTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(232, 245, 233, 0.9)", 
    borderRadius: 100,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start", 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(46, 125, 50, 0.2)",
  },
  pillTagText: {
    color: "#2E7D32",
    fontWeight: "600",
    marginLeft: 6,
  },
  heroTitle: { 
    fontSize: 34, 
    fontWeight: "bold", 
    color: "#222", 
    lineHeight: 42,
    textAlign: "left", 
  },
  heroSubtitle: { 
    fontSize: 16, 
    color: "#444", 
    marginTop: 12,
    textAlign: "left",
    lineHeight: 22,
  },
  heroButtonContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  heroButtonPrimary: {
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  heroButtonPrimaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  heroButtonSecondary: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  heroButtonSecondaryText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
  },
  // OLD Stats Ticker
  statsContainer: {
    paddingVertical: 24,
    backgroundColor: "rgba(0,0,0,0.01)",
    overflow: "hidden", 
  },
  statsRow: {
    flexDirection: "row",
  },
  statCard: {
    padding: 16,
    marginHorizontal: 10,
    height: 100,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  statValue: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  // --- NEW: Stats Grid ---
  statsGridContainer: {
    flexDirection: "row",
    backgroundColor: "#2E7D32", // Solid green background
    paddingVertical: 24,
    paddingHorizontal: 10,
  },
  statsGridItem: {
    flex: 1, 
    alignItems: "center",
    padding: 10,
  },
  statsGridIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statsGridValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statsGridLabel: {
    fontSize: 14,
    color: "#E8F5E9",
    textAlign: "center",
    marginTop: 4,
  },
  // Features Grid
  featuresSection: { padding: 20, backgroundColor: "#FDFDFB" },
  sectionTitle: { fontSize: 28, fontWeight: "bold", color: "#222", textAlign: "center" },
  sectionSubtitle: { fontSize: 16, color: "#555", textAlign: "center", marginTop: 8, marginBottom: 24 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardIcon: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#333", marginBottom: 4 },
  cardDescription: { fontSize: 14, color: "#666", lineHeight: 20 },
  // --- NEW: Testimonials ---
  testimonialSection: {
    padding: 20,
    backgroundColor: "#FFFFFF", 
  },
  testimonialGrid: {
    marginTop: 16,
  },
  testimonialCard: {
    backgroundColor: "#FDFDFB", 
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  testimonialStars: {
    flexDirection: "row",
    marginVertical: 10,
  },
  testimonialQuote: {
    fontSize: 16,
    color: "#333",
    fontStyle: "italic",
    lineHeight: 22,
    marginBottom: 12,
  },
  testimonialName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
  },
  testimonialLocation: {
    fontSize: 14,
    color: "#555",
  },
  // CTA
  ctaWrapper: { padding: 20, backgroundColor: "#FDFDFB" },
  ctaContainer: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  ctaTitle: { fontSize: 24, fontWeight: "bold", color: "#FFF", textAlign: "center" },
  ctaSubtitle: { fontSize: 16, color: "#FFF", opacity: 0.9, textAlign: "center", marginTop: 8 },
  // --- NEW: Image Ticker ---
  imageTickerContainer: {
    paddingVertical: 32,
    backgroundColor: "#FDFDFB",
    overflow: "hidden",
  },
  imageTickerItem: {
    height: 180, // 16:9 aspect ratio
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: "#F0F0F0", // Placeholder bg
  },
  imageTickerImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  // --- NEW: Logo Ticker ---
  logoTickerContainer: {
    paddingVertical: 32,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  logoTickerItem: {
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  logoTickerLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#777",
  },
  // Footer
  footerContainer: { backgroundColor: "#1C1C1C", padding: 20, marginTop: 20 },
  footerBrand: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  footerLogo: { width: 40, height: 40, borderRadius: 8, backgroundColor: "#2E7D32", alignItems: "center", justifyContent: "center", marginRight: 10 },
  footerTitle: { fontSize: 22, fontWeight: "bold", color: "#FFF" },
  footerSubtitle: { fontSize: 14, color: "#A0A0A0", marginBottom: 24 },
  copyright: { fontSize: 12, color: "#A0A0A0", textAlign: "center", paddingTop: 20, borderTopWidth: 1, borderTopColor: "#333" },
  // Modal Menu
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "70%",
    backgroundColor: "#FFFFFF",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    padding: 20,
  },
  modalCloseButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
  },
});