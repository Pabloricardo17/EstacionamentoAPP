import React, { useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Image } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { purgeAllData } from "../services/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen({ navigation }) {
  useEffect(() => {
    // Executa uma limpeza única dos dados para iniciar "sem dados"
    // Mantém o comportamento do app; apenas garante base vazia uma vez.
    (async () => {
      try {
        const flag = await AsyncStorage.getItem("purged_v1");
        if (!flag) {
          await purgeAllData();
          await AsyncStorage.setItem("purged_v1", "1");
        }
      } catch {}
    })();
  }, []);
  async function handleSignOut() {
    await signOut(auth);
    navigation.replace("Login");
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={require("../../assets/estacionamento-fundatec.png")}
            style={styles.logo}
          />
          <Text style={styles.headerTitle}>Estacionamento</Text>
        </View>
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        <HomeAction
          label="Registrar Entrada"
          color="#2E86DE"
          onPress={() => navigation.navigate("Entry")}
        />
        <HomeAction
          label="Registrar Saída"
          color="#E74C3C"
          onPress={() => navigation.navigate("Exit")}
        />
        <HomeAction
          label="Configurar Tarifa"
          color="#27AE60"
          onPress={() => navigation.navigate("RateConfig")}
        />
        <HomeAction
          label="Resumo Diário"
          color="#8E44AD"
          onPress={() => navigation.navigate("Summary")}
        />
      </View>
    </View>
  );
}

function HomeAction({ label, onPress, color }) {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={styles.cardText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#f9fbfd",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 12,
  },
  logo: { width: 40, height: 40, marginRight: 10 },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1b1e21",
  },
  signOutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#eee",
    borderRadius: 6,
  },
  signOutText: { color: "#333", fontWeight: "500" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8,
  },
  card: {
    width: "48%",
    height: 110,
    borderRadius: 14,
    marginBottom: 12,
    padding: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    justifyContent: "flex-end",
  },
  cardText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
