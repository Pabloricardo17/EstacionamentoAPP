import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { Card } from "react-native-paper";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function SummaryScreen() {
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadSummary();
  }, []);

  async function loadSummary() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    // payments today
    const q = query(collection(db, "payments"));
    const snap = await getDocs(q);
    let tot = 0;
    let cnt = 0;
    snap.docs.forEach((d) => {
      const data = d.data();
      console.log("SummaryScreen - Registro de pagamento:", data);

      const created =
        data.createdAt && data.createdAt.seconds
          ? new Date(data.createdAt.seconds * 1000)
          : data.exitAt
          ? new Date(data.exitAt.seconds * 1000)
          : null;

      if (created && created >= start && created <= end) {
        const amount = data.amount;
        console.log("SummaryScreen - Valor bruto:", amount, typeof amount);

        // Garante que amount é um número válido
        if (typeof amount === "number" && !isNaN(amount)) {
          tot += amount;
          cnt += 1;
        } else if (typeof amount === "string") {
          const parsed = parseFloat(amount);
          if (!isNaN(parsed)) {
            tot += parsed;
            cnt += 1;
          }
        }
      }
    });

    setCount(cnt);
    setTotal(tot);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumo Diário</Text>
      <Card style={styles.card}>
        <View style={styles.boxInner}>
          <Text style={styles.label}>Quantidade de saídas hoje:</Text>
          <Text style={styles.value}>{count}</Text>
        </View>
      </Card>
      <Card style={styles.card}>
        <View style={styles.boxInner}>
          <Text style={styles.label}>Valor total cobrado:</Text>
          <Text style={styles.value}>R$ {total.toFixed(2)}</Text>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "700" },
  card: { marginTop: 12 },
  boxInner: { padding: 16 },
  label: { fontSize: 14, color: "#444" },
  value: { fontSize: 16, fontWeight: "600", marginTop: 4 },
});
