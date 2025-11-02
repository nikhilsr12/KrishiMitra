import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronLeft, AlertCircle, Wind, Droplet, ThermometerSun } from 'lucide-react-native';

// Your IP Address
const API_URL = 'http://172.20.10.4:4000/weather';

// --- Type Definitions (No change) ---
interface WeatherCondition {
  text: string;
  icon: string;
}
interface CurrentWeather {
  temp_c: number;
  condition: WeatherCondition;
  wind_kph: number;
  humidity: number;
  feelslike_c: number;
}
interface WeatherLocation {
  name: string;
  region: string;
}
interface ForecastDayData {
  maxtemp_c: number;
  mintemp_c: number;
  condition: WeatherCondition;
}
interface ForecastDay {
  date: string;
  date_epoch: number;
  day: ForecastDayData;
}
interface Forecast {
  forecastday: ForecastDay[];
}
interface WeatherData {
  location: WeatherLocation;
  current: CurrentWeather;
  forecast: Forecast;
}

// --- ForecastItem Component (Restyled) ---
const ForecastItem = React.memo(({ item }: { item: ForecastDay }) => {
  const date = new Date(item.date_epoch * 1000);
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });

  return (
    <View style={styles.forecastItem}>
      <Text style={styles.forecastDay}>{dayOfWeek}</Text>
      <Image
        style={styles.forecastIcon}
        source={{ uri: `https:${item.day.condition.icon}` }}
      />
      <Text style={styles.forecastTemp}>
        {item.day.maxtemp_c.toFixed(0)}°
      </Text>
      <Text style={styles.forecastTempMin}>
        {item.day.mintemp_c.toFixed(0)}°
      </Text>
    </View>
  );
});

// --- Main Weather Component ---
export default function WeatherPage() { // Renamed to avoid conflict
  const router = useRouter(); // Use Expo Router
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- No change to your core logic ---
  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied.');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const response = await fetch(
        `${API_URL}?lat=${latitude}&lon=${longitude}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch weather');
      }

      const data: WeatherData = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: Themed Header ---
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <ChevronLeft color="#333" size={28} />
      </TouchableOpacity>
      <Text style={styles.title}>Local Weather</Text>
      <View style={{ width: 40 }} />
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.messageContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.messageText}>Fetching your local weather...</Text>
        </View>
      );
    }

    if (errorMsg) {
      return (
        <View style={styles.messageContainer}>
          <AlertCircle color="#D32F2F" size={48} />
          <Text style={styles.messageText}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadWeatherData}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (weatherData) {
      return (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {/* --- NEW: Current Weather Card (Gradient) --- */}
          <LinearGradient
            // Blue gradient for weather
            colors={['#0288D1', '#4FC3F7']}
            style={styles.currentWeatherCard}
          >
            <Text style={styles.locationText}>
              {weatherData.location.name}, {weatherData.location.region}
            </Text>
            <View style={styles.currentMain}>
              <Image
                style={styles.weatherIcon}
                source={{ uri: `https:${weatherData.current.condition.icon}` }}
              />
              <Text style={styles.tempText}>
                {weatherData.current.temp_c.toFixed(0)}°
              </Text>
            </View>
            <Text style={styles.conditionText}>
              {weatherData.current.condition.text}
            </Text>
          </LinearGradient>

          {/* --- NEW: Details Card (Floating) --- */}
          <View style={styles.detailsCard}>
            <View style={styles.detailBox}>
              <ThermometerSun color="#F57F17" size={24} />
              <Text style={styles.detailLabel}>Feels Like</Text>
              <Text style={styles.detailValue}>
                {weatherData.current.feelslike_c.toFixed(0)}°
              </Text>
            </View>
            <View style={styles.detailBox}>
              <Wind color="#0288D1" size={24} />
              <Text style={styles.detailLabel}>Wind</Text>
              <Text style={styles.detailValue}>
                {weatherData.current.wind_kph} kph
              </Text>
            </View>
            <View style={styles.detailBox}>
              <Droplet color="#2E7D32" size={24} />
              <Text style={styles.detailLabel}>Humidity</Text>
              <Text style={styles.detailValue}>
                {weatherData.current.humidity}%
              </Text>
            </View>
          </View>

          {/* --- Daily Forecast List --- */}
          <Text style={styles.forecastTitle}>Daily Forecast</Text>
          <FlatList
            data={weatherData.forecast.forecastday}
            renderItem={({ item }) => <ForecastItem item={item} />}
            keyExtractor={(item) => item.date_epoch.toString()}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 10 }}
          />
        </ScrollView>
      );
    }

    return null;
  };

  return (
    <LinearGradient
      colors={["#FDFDFB", "#F5F8F5"]} // Standard app background
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        {renderContent()}
      </SafeAreaView>
    </LinearGradient>
  );
}

// --- Styles (Themed) ---
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
    paddingBottom: 20,
  },
  messageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  // --- Current Weather Card (NEW) ---
  currentWeatherCard: {
    alignItems: 'center',
    padding: 25,
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  locationText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  currentMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  weatherIcon: {
    width: 100,
    height: 100,
  },
  tempText: {
    fontSize: 72,
    fontWeight: '200',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  conditionText: {
    fontSize: 20,
    color: '#FFFFFF',
    opacity: 0.9,
    textTransform: 'capitalize',
    marginTop: -10,
  },
  // --- Details Card (NEW) ---
  detailsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%', // Slightly smaller than 100%
    marginTop: -30, // Pulls it up over the gradient card
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  detailBox: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
    marginTop: 6,
  },
  detailValue: {
    fontSize: 18,
    color: '#222',
    marginTop: 5,
    fontWeight: '500',
  },
  // --- Message/Error Styles ---
  messageText: {
    fontSize: 16,
    color: '#555',
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: "#2E7D32",
    borderRadius: 100,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  // --- Forecast List Styles (Themed) ---
  forecastTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 30,
    marginBottom: 15,
    marginLeft: 20,
  },
  forecastItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    minWidth: 85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  forecastDay: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  forecastIcon: {
    width: 50,
    height: 50,
    marginVertical: 5,
  },
  forecastTemp: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  forecastTempMin: {
    fontSize: 14,
    color: '#777',
  },
});