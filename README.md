# Estacionamento App

App de exemplo em React Native (Expo) para gerenciar entradas e saídas de um estacionamento usando Firebase (Auth + Firestore).

Funcionalidades:
- Login, registro e reset de senha via Firebase Auth (envio de email de verificação/recuperação)
- Registrar entrada (placa, data e hora)
- Configurar valor por hora
- Registrar saída (calcula valor a cobrar)
- Resumo diário (quantidade de saídas e total arrecadado)
- Layout com componentes básicos (removido `react-native-paper` para simplificar build iOS)

Setup rápido:

1. Instale dependências

```powershell
npm install
# expo install react-native-safe-area-context react-native-screens react-native-gesture-handler
# npm install @react-navigation/native @react-navigation/native-stack firebase
```

2. Configure o Firebase
- Crie um projeto no Firebase.
- Ative Authentication (Email/Password) e Firestore.
- Copie o config do Firebase e cole em `src/firebase.js` (substitua os placeholders).

3. Rodar o app

```powershell
npm run start
```

Notas:
- As telas salvam entradas em `entries`, pagamentos em `payments` e tarifa em `settings/rate` no Firestore.
- Este é um scaffold funcional; revise regras de segurança do Firestore antes de usar em produção.

## Troubleshooting build iOS (CocoaPods)

Se o build iOS falhar em `pod install` (exit code 1), colete as últimas linhas do log da fase "Installing pods" e verifique:

1. Dependências nativas incompatíveis: para Expo SDK 54 o React Native deve ser `0.76.x`. Evite libs muito antigas.
2. Cache sujo: rode `eas build --clear-cache` ou limpe node_modules e instale novamente.
3. Falha de rede ao baixar Pods: é intermitente; re‑execute o build.
4. Podspec inválido: atualizar ou remover a lib.

Passos rápidos de diagnóstico:

```powershell
# Limpar
Remove-Item -Recurse -Force node_modules; Remove-Item package-lock.json
npm install
npx expo doctor
eas build --profile preview --platform ios
```

Se falhar novamente, copie o trecho final do log de Pods e analise mensagens como:
- "[!] CocoaPods could not find compatible versions"
- "specification not found"
- "permission denied" (rede ou certificado)

Depois aplique correções (atualizar/remover dependência) e tente novo build.