import { ScrollView, Text, View, TouchableOpacity, TextInput, Pressable, Alert } from "react-native";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";

export default function AddInvestmentScreen() {
  const [name, setName] = useState("");
  const [type, setType] = useState("Ações");
  const [amountInvested, setAmountInvested] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const router = useRouter();

  const investmentTypes = ["Ações", "Criptomoedas", "Renda Fixa", "Poupança", "Mercado Pago"];

  const handleSaveInvestment = async () => {
    if (!name || !amountInvested || !currentValue) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    try {
      const newInvestment = {
        id: Date.now().toString(),
        name,
        type,
        amountInvested: parseFloat(amountInvested),
        currentValue: parseFloat(currentValue),
        date: new Date().toISOString().split("T")[0],
      };

      const existingData = await AsyncStorage.getItem("investments");
      const investments = existingData ? JSON.parse(existingData) : [];
      investments.push(newInvestment);

      await AsyncStorage.setItem("investments", JSON.stringify(investments));

      Alert.alert("Sucesso", "Investimento adicionado com sucesso");
      router.back();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar o investimento");
      console.error("Error saving investment:", error);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-20">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-foreground">Adicionar Investimento</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-primary font-semibold text-lg">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Name Input */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Nome do Investimento</Text>
            <TextInput
              placeholder="Ex: PETR4, Bitcoin, Tesouro Direto"
              placeholderTextColor="#687076"
              value={name}
              onChangeText={setName}
              className="bg-surface rounded-lg border border-border p-4 text-foreground"
            />
          </View>

          {/* Type Selection */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Tipo</Text>
            <View className="flex-row flex-wrap gap-2">
              {investmentTypes.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setType(t)}
                  className={`px-4 py-2 rounded-full ${
                    type === t ? "bg-primary" : "bg-surface border border-border"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      type === t ? "text-background" : "text-foreground"
                    }`}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Amount Invested */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Valor Investido</Text>
            <View className="flex-row items-center bg-surface rounded-lg border border-border p-4">
              <Text className="text-lg font-semibold text-foreground mr-2">R$</Text>
              <TextInput
                placeholder="0,00"
                placeholderTextColor="#687076"
                value={amountInvested}
                onChangeText={setAmountInvested}
                keyboardType="decimal-pad"
                className="flex-1 text-lg font-semibold text-foreground"
              />
            </View>
          </View>

          {/* Current Value */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Valor Atual</Text>
            <View className="flex-row items-center bg-surface rounded-lg border border-border p-4">
              <Text className="text-lg font-semibold text-foreground mr-2">R$</Text>
              <TextInput
                placeholder="0,00"
                placeholderTextColor="#687076"
                value={currentValue}
                onChangeText={setCurrentValue}
                keyboardType="decimal-pad"
                className="flex-1 text-lg font-semibold text-foreground"
              />
            </View>
          </View>

          {/* Info */}
          {amountInvested && currentValue && (
            <View className="bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted mb-2">Resumo</Text>
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-xs text-muted">Rendimento</Text>
                  <Text className={`text-base font-semibold ${parseFloat(currentValue) - parseFloat(amountInvested) >= 0 ? "text-success" : "text-error"}`}>
                    {parseFloat(currentValue) - parseFloat(amountInvested) >= 0 ? "+" : ""}
                    R$ {(parseFloat(currentValue) - parseFloat(amountInvested)).toFixed(2).replace(".", ",")}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs text-muted">Percentual</Text>
                  <Text className={`text-base font-semibold ${((parseFloat(currentValue) - parseFloat(amountInvested)) / parseFloat(amountInvested)) * 100 >= 0 ? "text-success" : "text-error"}`}>
                    {((parseFloat(currentValue) - parseFloat(amountInvested)) / parseFloat(amountInvested)) * 100 >= 0 ? "+" : ""}
                    {(((parseFloat(currentValue) - parseFloat(amountInvested)) / parseFloat(amountInvested)) * 100).toFixed(2)}%
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Save Button */}
          <Pressable
            onPress={handleSaveInvestment}
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            className="bg-primary rounded-lg p-4 items-center mt-4"
          >
            <Text className="text-background font-semibold text-base">Salvar Investimento</Text>
          </Pressable>

          {/* Cancel Button */}
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            className="bg-surface rounded-lg p-4 items-center border border-border"
          >
            <Text className="text-foreground font-semibold text-base">Cancelar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
