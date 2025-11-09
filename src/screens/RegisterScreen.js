import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
} from "react-native";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../firebase";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  async function handleRegister() {
    setError("");
    setInfo("");

    if (!email.trim()) {
      setError("O email é obrigatório");
      return;
    }

    if (!validateEmail(email.trim())) {
      setError("Digite um email válido");
      return;
    }

    if (!password) {
      setError("A senha é obrigatória");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      if (userCred.user) {
        try {
          const actionCodeSettings = {
            url: "https://estacionamentoapp-e819a.firebaseapp.com/",
            handleCodeInApp: false,
          };
          await sendEmailVerification(userCred.user, actionCodeSettings);
        } catch (e) {
          // Silencia erro de envio para evitar confusão com estados duplicados
        }
        // Redireciona para Login com mensagem clara e pré-preenche email
        navigation.replace("Login", {
          justRegistered: true,
          email: email.trim(),
        });
        return;
      }
      // Segurança: se por algum motivo não houver user, não altera navegação
    } catch (e) {
      switch (e.code) {
        case "auth/invalid-email":
          setError("Email inválido");
          break;
        case "auth/email-already-in-use":
          setError("Este email já está em uso");
          break;
        case "auth/weak-password":
          setError("A senha é muito fraca");
          break;
        default:
          setError("Erro ao criar conta. Tente novamente.");
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastrar</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        autoCapitalize="none"
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Cadastrar</Text>
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
  errorText: {
    color: "#f44336",
    textAlign: "center",
    marginBottom: 10,
  },
});
