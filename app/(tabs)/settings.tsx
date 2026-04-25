import { ScrollView, Text, View, TouchableOpacity, Alert, Switch, TextInput, Pressable } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter, useFocusEffect } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"main" | "mercado-pago" | "evolution" | "goals">("main");
  const [mpAccount, setMpAccount] = useState<any>(null);
  const [mpEmail, setMpEmail] = useState("");
  const [mpBalance, setMpBalance] = useState("");
  const colorScheme = useColorScheme();
  const router = useRouter();

  useFocusEffect(() => {
    loadSettings();
  });

  const loadSettings = async () => {
    try {
      setDarkMode(colorScheme === "dark");

      const mpData = await AsyncStorage.getItem("mercado_pago_account");
      if (mpData) {
        const account = JSON.parse(mpData);
        setMpAccount(account);
        setMpEmail(account.email);
        setMpBalance(account.balance.toString());
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleExportData = async () => {
    try {
      const transactions = await AsyncStorage.getItem("transactions");
      const investments = await AsyncStorage.getItem("investments");
      const goals = await AsyncStorage.getItem("goals");
      const mpAccount = await AsyncStorage.getItem("mercado_pago_account");

      const data = {
        transactions: transactions ? JSON.parse(transactions) : [],
        investments: investments ? JSON.parse(investments) : [],
        goals: goals ? JSON.parse(goals) : [],
        mercadoPago: mpAccount ? JSON.parse(mpAccount) : null,
        exportDate: new Date().toISOString(),
      };

      const fileName = `financas_backup_${new Date().toISOString().split("T")[0]}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(data, null, 2));

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath);
      }

      Alert.alert("Sucesso", "Dados exportados com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível exportar os dados");
      console.error("Export error:", error);
    }
  };

  const handleClearData = () => {
    Alert.alert("Limpar Dados", "Tem certeza que deseja deletar TODOS os dados? Esta ação não pode ser desfeita!", [
      { text: "Cancelar", onPress: () => {}, style: "cancel" },
      {
        text: "Deletar Tudo",
        onPress: async () => {
          try {
            await AsyncStorage.multiRemove(["transactions", "investments", "goals", "mercado_pago_account"]);
            Alert.alert("Sucesso", "Todos os dados foram deletados");
          } catch (error) {
            Alert.alert("Erro", "Não foi possível limpar os dados");
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleSaveMPAccount = async () => {
    if (!mpEmail || !mpBalance) {
      Alert.alert("Erro", "Preencha email e saldo");
      return;
    }

    try {
      const account = {
        email: mpEmail,
        balance: parseFloat(mpBalance),
        userId: Date.now().toString(),
        lastUpdated: new Date().toISOString(),
      };

      await AsyncStorage.setItem("mercado_pago_account", JSON.stringify(account));
      setMpAccount(account);
      Alert.alert("Sucesso", "Conta Mercado Pago salva!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar a conta");
    }
  };

  const handleDisconnectMP = async () => {
    Alert.alert("Desconectar", "Desconectar sua conta Mercado Pago?", [
      { text: "Cancelar", onPress: () => {}, style: "cancel" },
      {
        text: "Desconectar",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("mercado_pago_account");
            setMpAccount(null);
            setMpEmail("");
            setMpBalance("");
            Alert.alert("Sucesso", "Conta desconectada");
          } catch (error) {
            Alert.alert("Erro", "Não foi possível desconectar");
          }
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-20">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">Mais Opções</Text>
          </View>

          {/* Tab Navigation */}
          <View className="flex-row gap-2 bg-surface rounded-lg p-1 border border-border">
            <TouchableOpacity
              onPress={() => setActiveTab("main")}
              className={`flex-1 py-2 rounded items-center ${activeTab === "main" ? "bg-primary" : ""}`}
            >
              <Text className={`text-xs font-semibold ${activeTab === "main" ? "text-background" : "text-foreground"}`}>
                Geral
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("mercado-pago")}
              className={`flex-1 py-2 rounded items-center ${activeTab === "mercado-pago" ? "bg-primary" : ""}`}
            >
              <Text className={`text-xs font-semibold ${activeTab === "mercado-pago" ? "text-background" : "text-foreground"}`}>
                MP
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("evolution")}
              className={`flex-1 py-2 rounded items-center ${activeTab === "evolution" ? "bg-primary" : ""}`}
            >
              <Text className={`text-xs font-semibold ${activeTab === "evolution" ? "text-background" : "text-foreground"}`}>
                📈
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("goals")}
              className={`flex-1 py-2 rounded items-center ${activeTab === "goals" ? "bg-primary" : ""}`}
            >
              <Text className={`text-xs font-semibold ${activeTab === "goals" ? "text-background" : "text-foreground"}`}>
                🎯
              </Text>
            </TouchableOpacity>
          </View>

          {/* Main Tab */}
          {activeTab === "main" && (
            <View className="gap-4">
              {/* Appearance Section */}
              <View className="gap-3">
                <Text className="text-lg font-semibold text-foreground">Aparência</Text>

                <View className="bg-surface rounded-lg p-4 border border-border flex-row items-center justify-between">
                  <View>
                    <Text className="text-sm font-medium text-foreground">Modo Escuro</Text>
                    <Text className="text-xs text-muted">Ativar tema escuro</Text>
                  </View>
                  <Switch
                    value={darkMode}
                    onValueChange={handleToggleDarkMode}
                    trackColor={{ false: "#E5E7EB", true: "#0a7ea4" }}
                  />
                </View>
              </View>

              {/* Data Section */}
              <View className="gap-3">
                <Text className="text-lg font-semibold text-foreground">Dados</Text>

                <TouchableOpacity
                  onPress={handleExportData}
                  className="bg-surface rounded-lg p-4 border border-border flex-row items-center justify-between active:opacity-70"
                >
                  <View>
                    <Text className="text-sm font-medium text-foreground">Exportar Dados</Text>
                    <Text className="text-xs text-muted">Salvar backup JSON</Text>
                  </View>
                  <Text className="text-primary font-semibold">→</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleClearData}
                  className="bg-surface rounded-lg p-4 border border-error flex-row items-center justify-between active:opacity-70"
                >
                  <View>
                    <Text className="text-sm font-medium text-error">Limpar Todos os Dados</Text>
                    <Text className="text-xs text-muted">Deletar permanentemente</Text>
                  </View>
                  <Text className="text-error font-semibold">→</Text>
                </TouchableOpacity>
              </View>

              {/* About Section */}
              <View className="gap-3">
                <Text className="text-lg font-semibold text-foreground">Sobre</Text>

                <View className="bg-surface rounded-lg p-4 border border-border">
                  <View className="gap-3">
                    <View>
                      <Text className="text-xs text-muted mb-1">Versão</Text>
                      <Text className="text-sm font-medium text-foreground">1.0.0</Text>
                    </View>

                    <View>
                      <Text className="text-xs text-muted mb-1">Aplicativo</Text>
                      <Text className="text-sm font-medium text-foreground">Gestor de Finanças</Text>
                    </View>

                    <View>
                      <Text className="text-xs text-muted mb-1">Descrição</Text>
                      <Text className="text-sm text-foreground">Gerenciamento financeiro gratuito com investimentos, metas e evolução.</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Mercado Pago Tab */}
          {activeTab === "mercado-pago" && (
            <View className="gap-4">
              <View className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <Text className="text-xs text-blue-900 font-semibold mb-1">💳 Integração Mercado Pago</Text>
                <Text className="text-xs text-blue-900">
                  Conecte sua conta para sincronizar saldo e acompanhar seu dinheiro em um único lugar.
                </Text>
              </View>

              {mpAccount ? (
                <>
                  <View className="bg-surface rounded-lg p-4 border border-border gap-3">
                    <Text className="text-sm font-semibold text-success">✅ Conectado</Text>
                    <View className="gap-2">
                      <View>
                        <Text className="text-xs text-muted">Email</Text>
                        <Text className="text-sm font-semibold text-foreground">{mpAccount.email}</Text>
                      </View>
                      <View>
                        <Text className="text-xs text-muted">Saldo</Text>
                        <Text className="text-2xl font-bold text-primary">R$ {mpAccount.balance.toFixed(2).replace(".", ",")}</Text>
                      </View>
                      <View>
                        <Text className="text-xs text-muted">Última Atualização</Text>
                        <Text className="text-xs text-muted">
                          {new Date(mpAccount.lastUpdated).toLocaleDateString("pt-BR")}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={handleDisconnectMP}
                    className="bg-surface rounded-lg p-4 border border-error items-center"
                  >
                    <Text className="text-error font-semibold">Desconectar Conta</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View className="gap-3">
                    <Text className="text-xs text-muted font-semibold">Email Mercado Pago</Text>
                    <TextInput
                      placeholder="seu.email@example.com"
                      placeholderTextColor="#687076"
                      value={mpEmail}
                      onChangeText={setMpEmail}
                      keyboardType="email-address"
                      className="bg-surface rounded-lg border border-border p-3 text-foreground"
                    />
                  </View>

                  <View className="gap-3">
                    <Text className="text-xs text-muted font-semibold">Saldo Atual (R$)</Text>
                    <TextInput
                      placeholder="0,00"
                      placeholderTextColor="#687076"
                      value={mpBalance}
                      onChangeText={setMpBalance}
                      keyboardType="decimal-pad"
                      className="bg-surface rounded-lg border border-border p-3 text-foreground"
                    />
                  </View>

                  <Pressable
                    onPress={handleSaveMPAccount}
                    style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                    className="bg-primary rounded-lg p-4 items-center"
                  >
                    <Text className="text-background font-semibold">Conectar Conta</Text>
                  </Pressable>
                </>
              )}
            </View>
          )}

          {/* Evolution Tab */}
          {activeTab === "evolution" && (
            <View className="gap-4">
              <View className="bg-blue-50 rounded-lg p-4 border border-blue-200 gap-2">
                <Text className="text-sm font-semibold text-blue-900">📈 Evolução do Patrimônio</Text>
                <Text className="text-xs text-blue-900">
                  Visualize como seu patrimônio evoluiu ao longo do tempo com gráficos interativos. Selecione períodos de 30, 90 ou 365 dias.
                </Text>
              </View>

              <View className="bg-surface rounded-lg p-4 border border-border gap-3">
                <Text className="text-sm font-semibold text-foreground">Como Funciona:</Text>
                <Text className="text-xs text-muted">
                  • O gráfico mostra seu saldo acumulado a cada dia{"\n"}
                  • Registre transações para ver a evolução{"\n"}
                  • Compare períodos diferentes{"\n"}
                  • Veja o percentual de crescimento
                </Text>
              </View>

              <Pressable
                onPress={() => router.push("./evolution")}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                className="bg-primary rounded-lg p-4 items-center"
              >
                <Text className="text-background font-semibold">Abrir Evolução →</Text>
              </Pressable>
            </View>
          )}

          {/* Goals Tab */}
          {activeTab === "goals" && (
            <View className="gap-4">
              <View className="bg-blue-50 rounded-lg p-4 border border-blue-200 gap-2">
                <Text className="text-sm font-semibold text-blue-900">🎯 Metas Financeiras</Text>
                <Text className="text-xs text-blue-900">
                  Defina metas (viagem, carro, casa) e acompanhe o progresso com barras visuais.
                </Text>
              </View>

              <View className="bg-surface rounded-lg p-4 border border-border gap-3">
                <Text className="text-sm font-semibold text-foreground">Como Usar:</Text>
                <Text className="text-xs text-muted">
                  • Crie uma meta com valor e prazo{"\n"}
                  • Registre quanto já economizou{"\n"}
                  • Veja o progresso em tempo real{"\n"}
                  • Acompanhe múltiplas metas
                </Text>
              </View>

              <Pressable
                onPress={() => router.push("./goals")}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                className="bg-primary rounded-lg p-4 items-center"
              >
                <Text className="text-background font-semibold">Abrir Metas →</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
