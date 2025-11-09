import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
} from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

export default function ResetPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  async function handleReset() {
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("O email é obrigatório");
      return;
    }

    if (!validateEmail(email.trim())) {
      setError("Digite um email válido");
      return;
    }

    try {
      // Opcional: passar actionCodeSettings para controlar o redirect após o clique no email.
      // Usamos o domínio default do Firebase Hosting do seu projeto (funciona sem verificação DNS).
      const actionCodeSettings = {
        // Redireciona para o hosting firebase do projeto. O Firebase tratará o restante (oobCode, mode, etc).
        url: "https://estacionamentoapp-e819a.firebaseapp.com/",
        handleCodeInApp: false,
      };

      await sendPasswordResetEmail(auth, email.trim(), actionCodeSettings);
      setMessage(
        "Email de recuperação enviado. Verifique sua caixa de entrada."
      );
    } catch (e) {
      switch (e.code) {
        case "auth/invalid-email":
          setError("Email inválido");
          break;
        case "auth/user-not-found":
          setError("Usuário não encontrado");
          break;
        default:
          setError("Erro ao enviar email de recuperação. Tente novamente.");
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resetar senha</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {message ? <Text style={styles.messageText}>{message}</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>Enviar email</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
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
  messageText: {
    color: "#4caf50",
    textAlign: "center",
    marginBottom: 10,
  },
  errorText: {
    color: "#f44336",
    textAlign: "center",
    marginBottom: 10,
  },
});
