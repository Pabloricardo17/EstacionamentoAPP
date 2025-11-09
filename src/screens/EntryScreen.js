import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { registerEntry } from "../services/firestore";

export default function EntryScreen({ navigation }) {
  const [plate, setPlate] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");

  // formata DATA para DD/MM/AAAA enquanto digita
  function formatDateInput(text) {
    const digits = text.replace(/[^0-9]/g, "");
    let out = digits.slice(0, 8);
    if (out.length >= 5) {
      out = `${out.slice(0, 2)}/${out.slice(2, 4)}/${out.slice(4, 8)}`;
    } else if (out.length >= 3) {
      out = `${out.slice(0, 2)}/${out.slice(2, 4)}`;
    }
    return out;
  }

  // formata HORA para HH:MM
  function formatTimeInput(text) {
    const digits = text.replace(/[^0-9]/g, "");
    let out = digits.slice(0, 4);
    if (out.length >= 3) {
      out = `${out.slice(0, 2)}:${out.slice(2, 4)}`;
    }
    return out;
  }

  const validatePlate = (plate) => {
    // Padrão de placa: ABC1234 ou ABC-1234
    const plateRegex = /^[A-Za-z]{3}[-]?\d{4}$/;
    return plateRegex.test(plate);
  };

  async function handleSave() {
    setError("");

    if (!plate.trim()) {
      setError("A placa é obrigatória");
      return;
    }

    if (!validatePlate(plate.trim())) {
      setError("Placa inválida. Use o formato ABC1234 ou ABC-1234");
      return;
    }

    // Validate date/time if provided
    let entryDate = null;
    if (date.trim() || time.trim()) {
      // validate date format DD/MM/AAAA
      if (date.trim()) {
        const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
        if (!dateRegex.test(date.trim())) {
          setError(
            "Formato de data inválido. Use DD/MM/AAAA ou deixe em branco para agora."
          );
          return;
        }
      }
      // validate time format HH:MM
      if (time.trim()) {
        const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
        if (!timeRegex.test(time.trim())) {
          setError(
            "Formato de hora inválido. Use HH:MM (24h) ou deixe em branco."
          );
          return;
        }
      }

      // build Date
      try {
        // Converte DD/MM/AAAA -> AAAA-MM-DD para compor ISO
        const isoDate = date.trim()
          ? `${date.trim().slice(6, 10)}-${date.trim().slice(3, 5)}-${date
              .trim()
              .slice(0, 2)}`
          : new Date().toISOString().slice(0, 10);
        const t = time.trim() ? time.trim() : "00:00";
        entryDate = new Date(`${isoDate}T${t}:00`);
        if (isNaN(entryDate.getTime())) throw new Error("invalid date");
      } catch (e) {
        setError("Data/hora inválida. Verifique os valores.");
        return;
      }
    }

    try {
      await registerEntry(plate, entryDate);
      Alert.alert("Sucesso", "Entrada registrada com sucesso!");
      navigation.goBack();
    } catch (e) {
      console.error("Erro ao registrar entrada:", e);
      setError("Erro ao registrar entrada. Tente novamente.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Entrada</Text>
      <TextInput
        placeholder="Placa do Veículo"
        value={plate}
        onChangeText={setPlate}
        style={styles.input}
        autoCapitalize="characters"
        maxLength={8}
      />
      <TextInput
        placeholder="DATA (DD/MM/AAAA) - opcional"
        value={date}
        onChangeText={(t) => setDate(formatDateInput(t))}
        style={styles.input}
        keyboardType="numeric"
        maxLength={10}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="HORA (HH:MM) - opcional"
        value={time}
        onChangeText={(t) => setTime(formatTimeInput(t))}
        style={styles.input}
        keyboardType="numeric"
        maxLength={5}
        autoCapitalize="none"
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Registrar Entrada</Text>
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
