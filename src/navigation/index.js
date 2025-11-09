import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import HomeScreen from "../screens/HomeScreen";
import EntryScreen from "../screens/EntryScreen";
import RateConfigScreen from "../screens/RateConfigScreen";
import ExitScreen from "../screens/ExitScreen";
import SummaryScreen from "../screens/SummaryScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerTitleStyle: {
            fontSize: 18,
          },
          headerTintColor: "#000",
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPasswordScreen}
          options={{ title: "Resetar senha" }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Entry"
          component={EntryScreen}
          options={{ title: "Registrar Entrada" }}
        />
        <Stack.Screen
          name="RateConfig"
          component={RateConfigScreen}
          options={{ title: "Configurar Tarifa" }}
        />
        <Stack.Screen
          name="Exit"
          component={ExitScreen}
          options={{ title: "Registrar Saída" }}
        />
        <Stack.Screen
          name="Summary"
          component={SummaryScreen}
          options={{ title: "Resumo" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
