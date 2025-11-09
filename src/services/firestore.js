import { db } from "../firebase";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";

// Funções para gerenciar entradas de veículos
export const entriesCollection = collection(db, "entries");

/**
 * Register an entry. If entryDate is provided (JS Date), it will be stored
 * as the entry time. Otherwise serverTimestamp() is used.
 */
export async function registerEntry(plate, entryDate) {
  const payload = {
    plate: plate.toUpperCase(),
    active: true,
    exitAt: null,
    amount: 0,
  };

  if (entryDate instanceof Date) {
    payload.entryAt = entryDate;
  } else {
    payload.entryAt = serverTimestamp();
  }

  return await addDoc(entriesCollection, payload);
}

export async function registerExit(entryId, totalAmount) {
  const entryRef = doc(db, "entries", entryId);
  return await updateDoc(entryRef, {
    exitAt: serverTimestamp(),
    active: false,
    amount: totalAmount,
  });
}

export async function getActiveEntries() {
  // Tenta buscar documentos com o novo esquema (campo boolean `active`).
  // Para compatibilidade com documentos antigos que usam `status: 'active'` ou `entryTime`,
  // fazemos duas consultas e unimos os resultados.
  const resultsMap = new Map();

  try {
    const q1 = query(entriesCollection, where("active", "==", true));
    const snap1 = await getDocs(q1);
    snap1.docs.forEach((d) => resultsMap.set(d.id, { id: d.id, ...d.data() }));
  } catch (e) {
    // ignorar erros específicos de indexação aqui e continuar com outras consultas
    console.warn("getActiveEntries: consulta active falhou:", e);
  }

  try {
    const q2 = query(entriesCollection, where("status", "==", "active"));
    const snap2 = await getDocs(q2);
    snap2.docs.forEach((d) => resultsMap.set(d.id, { id: d.id, ...d.data() }));
  } catch (e) {
    console.warn("getActiveEntries: consulta status falhou:", e);
  }

  // Se ainda estiver vazio, tenta pegar documentos recentes e filtrar localmente
  if (resultsMap.size === 0) {
    try {
      const snapAll = await getDocs(entriesCollection);
      snapAll.docs.forEach((d) => {
        const data = d.data();
        const isActive =
          data.active === true ||
          data.status === "active" ||
          (data.active === undefined &&
            data.status === undefined &&
            data.exitAt === null);
        if (isActive) resultsMap.set(d.id, { id: d.id, ...data });
      });
    } catch (e) {
      console.warn("getActiveEntries: consulta fallback falhou:", e);
    }
  }

  // Retorna array ordenado por entryAt se disponível
  const result = Array.from(resultsMap.values());
  result.sort((a, b) => {
    const at = (x) => {
      if (!x) return 0;
      if (x.entryAt && x.entryAt.seconds) return x.entryAt.seconds * 1000;
      if (x.entryAt && x.entryAt.toDate) return x.entryAt.toDate().getTime();
      if (x.entryTime && x.entryTime.seconds) return x.entryTime.seconds * 1000;
      if (x.entryTime && x.entryTime.toDate)
        return x.entryTime.toDate().getTime();
      if (typeof x.entryAt === "string") return new Date(x.entryAt).getTime();
      return 0;
    };
    return at(b) - at(a);
  });

  return result;
}

// Funções para gerenciar tarifas
export const ratesCollection = collection(db, "rates");

export async function setHourlyRate(rate) {
  // Usa um ID fixo para sempre atualizar o mesmo documento
  const rateRef = doc(db, "rates", "current");
  try {
    // setDoc garante que o documento `current` exista e contenha hourlyRate
    await setDoc(rateRef, { hourlyRate: rate }, { merge: true });
    return true;
  } catch (e) {
    console.error("Erro ao salvar tarifa:", e);
    // fallback: tenta criar um documento na coleção rates
    try {
      await addDoc(ratesCollection, { hourlyRate: rate });
      return true;
    } catch (err) {
      console.error("Erro ao criar tarifa fallback:", err);
      throw err;
    }
  }
}

export async function getHourlyRate() {
  const rateRef = doc(db, "rates", "current");
  const rateDoc = await getDoc(rateRef);
  if (rateDoc.exists()) {
    const val = rateDoc.data().hourlyRate;
    return typeof val === "number" ? val : parseFloat(val) || 0;
  }

  // Fallback: se não existir `current`, tenta pegar qualquer documento da coleção rates
  try {
    const q = query(ratesCollection, orderBy("_createdAt", "desc"), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docData = snap.docs[0].data();
      const val = docData.hourlyRate;
      return typeof val === "number" ? val : parseFloat(val) || 0;
    }
  } catch (e) {
    // se orderBy falhar por falta de campo, só pega primeiro documento
    try {
      const snap2 = await getDocs(ratesCollection);
      if (!snap2.empty) {
        const val = snap2.docs[0].data().hourlyRate;
        return typeof val === "number" ? val : parseFloat(val) || 0;
      }
    } catch (err) {
      console.warn("getHourlyRate fallback failed:", err);
    }
  }

  return 0;
}

// Funções para gerenciar resumos diários
export const summariesCollection = collection(db, "dailySummaries");

export async function updateDailySummary(date, amount) {
  const summaryRef = doc(db, "dailySummaries", date);
  try {
    const summaryDoc = await getDoc(summaryRef);
    if (summaryDoc.exists()) {
      await updateDoc(summaryRef, {
        total: summaryDoc.data().total + amount,
        count: summaryDoc.data().count + 1,
      });
    } else {
      await addDoc(summariesCollection, {
        date,
        total: amount,
        count: 1,
      });
    }
  } catch (e) {
    console.error("Erro ao atualizar resumo diário:", e);
  }
}

export async function getDailySummary(date) {
  const summaryRef = doc(db, "dailySummaries", date);
  const summaryDoc = await getDoc(summaryRef);
  return summaryDoc.exists() ? summaryDoc.data() : { date, total: 0, count: 0 };
}
