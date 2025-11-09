import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { setHourlyRate, getHourlyRate } from "../services/firestore";

export default function RateConfigScreen() {
  const [rate, setRate] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadRate();
  }, []);

  async function loadRate() {
    try {
      const currentRate = await getHourlyRate();
      if (currentRate > 0) {
        setRate(currentRate.toFixed(2));
      }
    } catch (e) {
      console.error("Erro ao carregar tarifa:", e);
      setError("Erro ao carregar tarifa atual");
    }
  }

  async function handleSave() {
    setError("");
    try {
      // Remove qualquer caractere não numérico exceto ponto e vírgula
      const cleaned = rate
        .replace(/[^\d.,]/g, "")
        .replace(",", ".")
        .trim();

      // Valida formato do número
      if (!cleaned.match(/^\d*\.?\d+$/)) {
        setError("Digite um valor numérico válido (ex: 5.50)");
        return;
      }

      // Converte para número e valida
      const num = parseFloat(cleaned);

      if (isNaN(num) || num <= 0) {
        setError("O valor deve ser maior que zero");
        return;
      }

      await setHourlyRate(num);
      Alert.alert("Sucesso", `Tarifa configurada: R$ ${num.toFixed(2)}/hora`);
    } catch (e) {
      console.error("Erro ao salvar tarifa:", e);
      setError("Erro ao salvar tarifa. Tente novamente.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurar Valor da Hora</Text>
      <TextInput
        placeholder="Valor por hora (ex: 5.50)"
        value={rate}
        onChangeText={setRate}
        style={styles.input}
        keyboardType="decimal-pad"
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Salvar Tarifa</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 50,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 4,
    marginTop: 12,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
  errorText: {
    color: "#f44336",
    textAlign: "center",
    marginBottom: 10,
  },
});
