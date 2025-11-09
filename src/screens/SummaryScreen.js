import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Headline, Paragraph, Card } from "react-native-paper";
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
      <Headline>Resumo Diário</Headline>
      <Card style={styles.card}>
        <Card.Content>
          <Paragraph>Quantidade de saídas hoje: {count}</Paragraph>
        </Card.Content>
      </Card>
      <Card style={styles.card}>
        <Card.Content>
          <Paragraph>Valor total cobrado: R$ {total.toFixed(2)}</Paragraph>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { marginTop: 12 },
});
