import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  getActiveEntries,
  registerExit,
  getHourlyRate,
} from "../services/firestore";

export default function ExitScreen({ navigation }) {
  const [activeEntries, setActiveEntries] = useState([]);
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState(null);
  const [exitDate, setExitDate] = useState("");
  const [exitTime, setExitTime] = useState("");
  const [calculated, setCalculated] = useState(null);

  // Parse Firestore Timestamp / string / Date to JS Date
  function parseEntryAt(raw) {
    if (!raw) return new Date();
    if (raw.seconds) return new Date(raw.seconds * 1000);
    if (raw.toDate) return raw.toDate();
    if (typeof raw === "string") return new Date(raw);
    return new Date(raw);
  }

  function computeAmount(perHour, entryAt, exitAt) {
    const ms = exitAt.getTime() - entryAt.getTime();
    if (ms < 0) return null; // invalid
    const hours = Math.max(1, Math.ceil(ms / (1000 * 60 * 60)));
    return hours * perHour;
  }

  async function loadActive() {
    try {
      const list = await getActiveEntries();
      setActiveEntries(list);
    } catch (e) {
      console.warn(e);
      setMessage("Erro ao carregar entradas ativas");
    }
  }

  useEffect(() => {
    // real-time listen to entries collection and reload active list on changes
    const col = collection(db, "entries");
    const unsub = onSnapshot(col, () => {
      loadActive();
    });
    loadActive();
    return () => unsub();
  }, []);

  async function prepareExit(item) {
    setSelected(item);
    const now = new Date();
    setExitDate(now.toISOString().slice(0, 10));
    setExitTime(now.toTimeString().slice(0, 5));
    try {
      const perHour = await getHourlyRate();
      const entryAt = parseEntryAt(item.entryAt || item.entryTime);
      const amount = computeAmount(perHour, entryAt, now);
      setCalculated({ perHour, amount, exitAt: now });
      setMessage("");
    } catch (e) {
      console.warn(e);
      setMessage("Erro ao calcular valor");
    }
  }

  async function previewAmount() {
    if (!selected) return;
    let exitAt;
    try {
      const d = exitDate.trim()
        ? exitDate.trim()
        : new Date().toISOString().slice(0, 10);
      const t = exitTime.trim() ? exitTime.trim() : "00:00";
      exitAt = new Date(`${d}T${t}:00`);
      if (isNaN(exitAt.getTime())) throw new Error("invalid");
    } catch (e) {
      setMessage("Data/hora de saída inválida");
      return;
    }
    try {
      const perHour = await getHourlyRate();
      const entryAt = parseEntryAt(selected.entryAt || selected.entryTime);
      const amount = computeAmount(perHour, entryAt, exitAt);
      setCalculated({ perHour, amount, exitAt });
      setMessage("");
    } catch (e) {
      console.warn(e);
      setMessage("Erro ao calcular valor");
    }
  }

  async function confirmExit(item) {
    if (!item) return;
    // use calculated.exitAt if available, otherwise now
    const exitAt = (calculated && calculated.exitAt) || new Date();
    try {
      const perHour = await getHourlyRate();
      const entryAt = parseEntryAt(item.entryAt || item.entryTime);
      const amount = computeAmount(perHour, entryAt, exitAt);
      if (amount === null) {
        setMessage("Data/hora inválida. Verifique e tente novamente.");
        return;
      }

      await registerExit(item.id, amount);
      await addDoc(collection(db, "payments"), {
        plate: item.plate,
        entryId: item.id,
        entryAt: item.entryAt || item.entryTime || null,
        exitAt,
        amount,
        createdAt: serverTimestamp(),
      });

      setMessage(`Saída registrada. Valor: R$ ${amount.toFixed(2)}`);
      setSelected(null);
      setCalculated(null);
      await loadActive();
      if (navigation && navigation.canGoBack()) {
        setTimeout(() => {
          navigation.goBack();
        }, 600);
      }
    } catch (e) {
      console.warn(e);
      setMessage("Erro ao registrar saída");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecionar placa para saída</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}

      <FlatList
        data={activeEntries}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => {
          const entryAt = parseEntryAt(item.entryAt || item.entryTime);
          return (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.plate}>{item.plate}</Text>
                <Text style={styles.small}>{entryAt.toLocaleString()}</Text>
              </View>
              <TouchableOpacity
                style={styles.selectBtn}
                onPress={() => prepareExit(item)}
              >
                <Text style={styles.selectBtnText}>Selecionar</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.small}>Nenhum carro estacionado.</Text>
        }
      />

      {selected ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>{selected.plate}</Text>
          <Text style={styles.small}>
            Entrada:{" "}
            {parseEntryAt(
              selected.entryAt || selected.entryTime
            ).toLocaleString()}
          </Text>

          <TextInput
            placeholder="DATA saída (YYYY-MM-DD)"
            value={exitDate}
            onChangeText={setExitDate}
            style={styles.input}
          />
          <TextInput
            placeholder="HORA saída (HH:MM)"
            value={exitTime}
            onChangeText={setExitTime}
            style={styles.input}
          />

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                setSelected(null);
                setCalculated(null);
                setMessage("");
              }}
            >
              <Text>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={previewAmount}>
              <Text>Calcular</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.primary]}
              onPress={() => confirmExit(selected)}
            >
              <Text style={{ color: "#fff" }}>Confirmar Saída</Text>
            </TouchableOpacity>
          </View>

          {calculated && typeof calculated.amount === "number" ? (
            <Text style={{ marginTop: 8 }}>
              Valor a cobrar: R$ {calculated.amount.toFixed(2)}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, marginBottom: 8 },
  message: { color: "#444", marginBottom: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  plate: { fontSize: 16, fontWeight: "600" },
  small: { fontSize: 12, color: "#666" },
  selectBtn: {
    backgroundColor: "#eee",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  selectBtnText: { color: "#111" },
  panel: {
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
  },
  panelTitle: { fontSize: 18, fontWeight: "600" },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 8,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 4,
    backgroundColor: "#f2f2f2",
  },
  primary: { backgroundColor: "#2b8aef" },
});
