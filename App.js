// Backup do App original
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppNavigation from "./src/navigation";
import app from "./src/firebase";
import { Provider as PaperProvider } from "react-native-paper";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "" };
  }
  componentDidCatch(error, info) {
    console.error("App error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.fallback}>
          <Text style={styles.fallbackTitle}>Ops, algo deu errado</Text>
          <Text style={styles.fallbackMsg}>
            Reinicie o app. Se persistir, avise o suporte.
          </Text>
          {this.state.message ? (
            <Text style={styles.fallbackDetail}>{this.state.message}</Text>
          ) : null}
        </View>
      );
    }
    return this.props.children;
  }
}

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
        <ImageBackground
          source={require("./assets/estacionamento-fundatec.png")}
          style={styles.loadingBackground}
          resizeMode="cover"
        >
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        </ImageBackground>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <ErrorBoundary>
          <AppNavigation />
        </ErrorBoundary>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingBackground: { flex: 1, justifyContent: "flex-end" },
  loadingOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    paddingVertical: 32,
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  fallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  fallbackTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  fallbackMsg: { color: "#444", textAlign: "center", marginBottom: 8 },
  fallbackDetail: { color: "#888", textAlign: "center" },
});
