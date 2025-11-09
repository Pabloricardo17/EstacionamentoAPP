# Estacionamento App

App de exemplo em React Native (Expo) para gerenciar entradas e saídas de um estacionamento usando Firebase (Auth + Firestore).

Funcionalidades:
- Login, registro e reset de senha via Firebase Auth (envio de email de verificação/recuperação)
- Registrar entrada (placa, data e hora)
- Configurar valor por hora
- Registrar saída (calcula valor a cobrar)
- Resumo diário (quantidade de saídas e total arrecadado)
- Usa componentes do `react-native-paper`

Setup rápido:

1. Instale dependências

```powershell
npm install
# ou, para projetos Expo, você pode preferir:
# expo install react-native-safe-area-context react-native-screens react-native-gesture-handler react-native-paper
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