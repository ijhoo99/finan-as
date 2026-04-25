import { ScrollView, Text, View, TouchableOpacity, TextInput, Pressable, Alert } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useFocusEffect } from "expo-router";

interface MPAccount {
  accessToken: string;
  email: string;
  userId: string;
  balance: number;
  lastUpdated: string;
}

export default function MercadoPagoScreen() {
  const [isConnected, setIsConnected] = useState(false);
  const [mpAccount, setMpAccount] = useState<MPAccount | null>(null);
  const [accessToken, setAccessToken] = useState("");
  const [email, setEmail] = useState("");
  const [balance, setBalance] = useState("");

  useFocusEffect(() => {
    loadMPAccount();
  });

  const loadMPAccount = async () => {
    try {
      const data = await AsyncStorage.getItem("mercado_pago_account");
      if (data) {
        const account = JSON.parse(data);
        setMpAccount(account);
        setIsConnected(true);
        setEmail(account.email);
        setBalance(account.balance.toString());
      }
    } catch (error) {
      console.error("Error loading MP account:", error);
    }
  };

  const handleConnect = async () => {
    if (!accessToken || !email || !balance) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    try {
      const newAccount: MPAccount = {
        accessToken,
        email,
        userId: Date.now().toString(),
        balance: parseFloat(balance),
        lastUpdated: new Date().toISOString(),
      };

      await AsyncStorage.setItem("mercado_pago_account", JSON.stringify(newAccount));
      setMpAccount(newAccount);
      setIsConnected(true);
      setAccessToken("");

      Alert.alert("Sucesso", "Conta Mercado Pago conectada!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível conectar a conta");
      console.error("Error connecting MP account:", error);
    }
  };

  const handleDisconnect = async () => {
    Alert.alert("Desconectar", "Tem certeza que deseja desconectar sua conta Mercado Pago?", [
      { text: "Cancelar", onPress: () => {}, style: "cancel" },
      {
        text: "Desconectar",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("mercado_pago_account");
            setMpAccount(null);
            setIsConnected(false);
            setEmail("");
            setBalance("");
            Alert.alert("Sucesso", "Conta desconectada");
          } catch (error) {
            Alert.alert("Erro", "Não foi possível desconectar");
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleUpdateBalance = async () => {
    if (!balance) {
      Alert.alert("Erro", "Digite o novo saldo");
      return;
    }

    try {
      if (mpAccount) {
        const updated: MPAccount = {
          ...mpAccount,
          balance: parseFloat(balance),
          lastUpdated: new Date().toISOString(),
        };
        await AsyncStorage.setItem("mercado_pago_account", JSON.stringify(updated));
        setMpAccount(updated);
        Alert.alert("Sucesso", "Saldo atualizado!");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o saldo");
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-20">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">Mercado Pago</Text>
            <Text className="text-sm text-muted">Conecte sua conta para sincronizar saldo</Text>
          </View>

          {isConnected && mpAccount ? (
            <>
              {/* Connected Account Info */}
              <View className="bg-surface rounded-lg p-4 border border-border gap-4">
                <View className="items-center">
                  <Text className="text-4xl mb-2">📱</Text>
                  <Text className="text-sm font-semibold text-foreground">Conta Conectada</Text>
                </View>

                <View className="gap-3">
                  <View>
                    <Text className="text-xs text-muted mb-1">Email</Text>
                    <Text className="text-sm font-semibold text-foreground">{mpAccount.email}</Text>
                  </View>

                  <View>
                    <Text className="text-xs text-muted mb-1">Saldo Mercado Pago</Text>
                    <Text className="text-2xl font-bold text-primary">R$ {mpAccount.balance.toFixed(2).replace(".", ",")}</Text>
                  </View>

                  <View>
                    <Text className="text-xs text-muted mb-1">Última Atualização</Text>
                    <Text className="text-xs text-muted">
                      {new Date(mpAccount.lastUpdated).toLocaleDateString("pt-BR")} às{" "}
                      {new Date(mpAccount.lastUpdated).toLocaleTimeString("pt-BR")}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Update Balance */}
              <View className="gap-3">
                <Text className="text-sm font-semibold text-foreground">Atualizar Saldo</Text>

                <View className="flex-row items-center bg-surface rounded-lg border border-border p-4">
                  <Text className="text-lg font-semibold text-foreground mr-2">R$</Text>
                  <TextInput
                    placeholder="0,00"
                    placeholderTextColor="#687076"
                    value={balance}
                    onChangeText={setBalance}
                    keyboardType="decimal-pad"
                    className="flex-1 text-lg font-semibold text-foreground"
                  />
                </View>

                <Pressable
                  onPress={handleUpdateBalance}
                  style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                  className="bg-primary rounded-lg p-4 items-center"
                >
                  <Text className="text-background font-semibold text-base">Atualizar Saldo</Text>
                </Pressable>
              </View>

              {/* Info */}
              <View className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <Text className="text-xs text-blue-900">
                  💡 Dica: Atualize seu saldo regularmente para manter os dados sincronizados. Você pode adicionar transações normalmente sem precisar atualizar manualmente.
                </Text>
              </View>

              {/* Disconnect Button */}
              <Pressable
                onPress={handleDisconnect}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                className="bg-surface rounded-lg p-4 items-center border border-error"
              >
                <Text className="text-error font-semibold text-base">Desconectar Conta</Text>
              </Pressable>
            </>
          ) : (
            <>
              {/* Connection Form */}
              <View className="bg-surface rounded-lg p-4 border border-border gap-4">
                <View className="items-center mb-2">
                  <Text className="text-4xl mb-2">🔗</Text>
                  <Text className="text-sm font-semibold text-foreground">Conectar Mercado Pago</Text>
                </View>

                <Text className="text-xs text-muted text-center">
                  Conecte sua conta Mercado Pago para sincronizar seu saldo automaticamente.
                </Text>
              </View>

              {/* Email Input */}
              <View className="gap-3">
                <Text className="text-sm font-semibold text-foreground">Email Mercado Pago</Text>
                <TextInput
                  placeholder="seu.email@example.com"
                  placeholderTextColor="#687076"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  className="bg-surface rounded-lg border border-border p-4 text-foreground"
                />
              </View>

              {/* Access Token Input */}
              <View className="gap-3">
                <Text className="text-sm font-semibold text-foreground">Token de Acesso</Text>
                <TextInput
                  placeholder="Seu token de acesso"
                  placeholderTextColor="#687076"
                  value={accessToken}
                  onChangeText={setAccessToken}
                  secureTextEntry
                  className="bg-surface rounded-lg border border-border p-4 text-foreground"
                />
                <Text className="text-xs text-muted">
                  Você pode gerar um token em: Configurações → Integrações → Chaves de API
                </Text>
              </View>

              {/* Initial Balance Input */}
              <View className="gap-3">
                <Text className="text-sm font-semibold text-foreground">Saldo Atual</Text>
                <View className="flex-row items-center bg-surface rounded-lg border border-border p-4">
                  <Text className="text-lg font-semibold text-foreground mr-2">R$</Text>
                  <TextInput
                    placeholder="0,00"
                    placeholderTextColor="#687076"
                    value={balance}
                    onChangeText={setBalance}
                    keyboardType="decimal-pad"
                    className="flex-1 text-lg font-semibold text-foreground"
                  />
                </View>
              </View>

              {/* Info */}
              <View className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <Text className="text-xs text-blue-900">
                  ℹ️ Seus dados são armazenados localmente e nunca são compartilhados com terceiros. A conexão é apenas para referência pessoal.
                </Text>
              </View>

              {/* Connect Button */}
              <Pressable
                onPress={handleConnect}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                className="bg-primary rounded-lg p-4 items-center"
              >
                <Text className="text-background font-semibold text-base">Conectar Conta</Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
