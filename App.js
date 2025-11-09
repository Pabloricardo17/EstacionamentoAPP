import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppNavigation from "./src/navigation";
import app from "./src/firebase";

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Verifica se o Firebase está inicializado
    if (app) {
      console.log("Firebase está pronto");
      setIsReady(true);
    }
  }, []);

  if (!isReady) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.loadingContainer}>
          <Image
            source={require("./assets/splash-icon.png")}
            style={styles.splash}
          />
          <Text>Carregando...</Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigation />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  splash: { width: 120, height: 120, marginBottom: 12 },
});
