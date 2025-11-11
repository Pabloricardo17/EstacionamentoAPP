import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  reload,
} from "firebase/auth";
import { auth } from "../firebase";

export default function LoginScreen({ navigation, route }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);

  // Caso venha da tela de registro
  React.useEffect(() => {
    if (route?.params?.justRegistered && route?.params?.email) {
      setEmail(route.params.email);
      setInfo(
        "Conta criada. Enviamos um e-mail de verificação. Verifique e depois faça login."
      );
      setPendingVerification(false); // Ainda não logou, então não mostra caixa de ações
    }
  }, [route]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  async function handleLogin() {
    setError("");
    setInfo("");
    setPendingVerification(false);

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

    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const user = cred.user;
      if (user && !user.emailVerified) {
        // Envia/verifica e-mail e informa o usuário
        try {
          await sendEmailVerification(user);
          setInfo(
            "Seu e-mail ainda não foi verificado. Enviamos um novo e-mail de verificação."
          );
          setPendingVerification(true);
        } catch (e) {
          // Se falhar envio, apenas segue com a mensagem padrão
          setError(
            "Seu e-mail não está verificado. Tente novamente após verificar."
          );
          setPendingVerification(true);
        }
        return; // Não navega enquanto não estiver verificado
      }
      navigation.replace("Home");
    } catch (e) {
      switch (e.code) {
        case "auth/invalid-email":
          setError("Email inválido");
          break;
        case "auth/user-not-found":
          setError("Usuário não encontrado");
          break;
        case "auth/wrong-password":
          setError("Senha incorreta");
          break;
        default:
          setError("E-mail ou senha Incorreta. Tente novamente.");
      }
    }
  }

  async function handleResendVerification() {
    setError("");
    setInfo("");
    try {
      if (auth.currentUser) {
        const actionCodeSettings = {
          url: "https://estacionamentoapp-e819a.firebaseapp.com/",
          handleCodeInApp: false,
        };
        await sendEmailVerification(auth.currentUser, actionCodeSettings);
        setInfo(
          "Reenviamos o e-mail de verificação. Verifique sua caixa de entrada."
        );
      } else {
        setError("Faça login para reenviar a verificação.");
      }
    } catch (e) {
      setError("Não foi possível reenviar a verificação agora.");
    }
  }

  async function handleCheckVerified() {
    setError("");
    setInfo("");
    try {
      if (auth.currentUser) {
        await reload(auth.currentUser);
        if (auth.currentUser.emailVerified) {
          navigation.replace("Home");
          return;
        }
        setError(
          "Ainda não verificado. Confirme seu e-mail e tente novamente."
        );
      } else {
        setError("Faça login para confirmar a verificação.");
      }
    } catch (e) {
      setError("Não foi possível atualizar o status agora.");
    }
  }

  return (
    <ImageBackground
      source={require("../../assets/estacionamento-fundatec.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formCard}>
              <Text style={styles.title}>Entrar</Text>
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
              {info ? <Text style={styles.infoText}>{info}</Text> : null}
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Entrar</Text>
              </TouchableOpacity>

              {/* Links lado a lado */}
              <View style={styles.linksRow}>
                <TouchableOpacity
                  style={styles.linkLeft}
                  onPress={() => navigation.navigate("ResetPassword")}
                >
                  <Text style={styles.linkButtonText}>Esqueci minha senha</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.linkRight}
                  onPress={() => navigation.navigate("Register")}
                >
                  <Text style={styles.linkButtonText}>Criar conta</Text>
                </TouchableOpacity>
              </View>

              {pendingVerification ? (
                <View style={styles.verifyBox}>
                  <Text style={styles.verifyText}>
                    Após clicar no link do e-mail, toque em "Já confirmei".
                  </Text>
                  <View style={styles.verifyActions}>
                    <TouchableOpacity
                      style={styles.outlineBtn}
                      onPress={handleResendVerification}
                    >
                      <Text style={styles.outlineBtnText}>
                        Reenviar verificação
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.secondaryBtn}
                      onPress={handleCheckVerified}
                    >
                      <Text style={styles.secondaryBtnText}>Já confirmei</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  formCard: {
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
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
  linkButtonText: {
    color: "#2196F3",
    fontSize: 14,
  },
  errorText: {
    color: "#f44336",
    textAlign: "center",
    marginBottom: 10,
  },
  infoText: {
    color: "#2e7d32",
    textAlign: "center",
    marginBottom: 10,
  },
  linksRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  linkLeft: { paddingVertical: 8, paddingRight: 8 },
  linkRight: { paddingVertical: 8, paddingLeft: 8 },
  verifyBox: {
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#c8e6c9",
    backgroundColor: "#e8f5e9",
    borderRadius: 6,
  },
  verifyText: { color: "#2e7d32", marginBottom: 8, textAlign: "center" },
  verifyActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: "#2196F3",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  outlineBtnText: { color: "#2196F3", fontWeight: "500" },
  secondaryBtn: {
    backgroundColor: "#2196F3",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  secondaryBtnText: { color: "#fff", fontWeight: "600" },
});
