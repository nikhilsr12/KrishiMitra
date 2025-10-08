// components/Loading.js
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
