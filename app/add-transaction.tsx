import { ScrollView, Text, View, TouchableOpacity, TextInput, Pressable, Alert } from "react-native";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";

export default function AddTransactionScreen() {
  const [type, setType] = useState<"income" | "expense" | "investment">("expense");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const router = useRouter();

  const expenseCategories = ["Alimentação", "Transporte", "Moradia", "Saúde", "Educação", "Entretenimento", "Compras", "Outros"];
  const incomeCategories = ["Salário", "Freelance", "Presente", "Outros"];
  const investmentCategories = ["Ações", "Criptomoedas", "Renda Fixa", "Poupança", "Mercado Pago"];

  const getCategories = () => {
    if (type === "expense") return expenseCategories;
    if (type === "income") return incomeCategories;
    return investmentCategories;
  };

  const handleSaveTransaction = async () => {
    if (!category || !amount || !description) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    try {
      const newTransaction = {
        id: Date.now().toString(),
        type,
        category,
        amount: parseFloat(amount),
        description,
        date,
      };

      const existingData = await AsyncStorage.getItem("transactions");
      const transactions = existingData ? JSON.parse(existingData) : [];
      transactions.push(newTransaction);

      await AsyncStorage.setItem("transactions", JSON.stringify(transactions));

      Alert.alert("Sucesso", "Transação adicionada com sucesso");
      router.back();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar a transação");
      console.error("Error saving transaction:", error);
    }
  };

  const categories = getCategories();

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-20">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-foreground">Adicionar Transação</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-primary font-semibold text-lg">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Type Selection */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Tipo</Text>
            <View className="flex-row gap-2">
              {["expense", "income", "investment"].map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => {
                    setType(t as "expense" | "income" | "investment");
                    setCategory("");
                  }}
                  className={`flex-1 py-3 rounded-lg items-center ${
                    type === t ? "bg-primary" : "bg-surface border border-border"
                  }`}
                >
                  <Text
                    className={`font-medium text-sm ${
                      type === t ? "text-background" : "text-foreground"
                    }`}
                  >
                    {t === "expense" ? "Despesa" : t === "income" ? "Receita" : "Investimento"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category Selection */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Categoria</Text>
            <View className="flex-row flex-wrap gap-2">
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full ${
                    category === cat ? "bg-primary" : "bg-surface border border-border"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      category === cat ? "text-background" : "text-foreground"
                    }`}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Amount Input */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Valor</Text>
            <View className="flex-row items-center bg-surface rounded-lg border border-border p-4">
              <Text className="text-lg font-semibold text-foreground mr-2">R$</Text>
              <TextInput
                placeholder="0,00"
                placeholderTextColor="#687076"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                className="flex-1 text-lg font-semibold text-foreground"
              />
            </View>
          </View>

          {/* Description Input */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Descrição</Text>
            <TextInput
              placeholder="Ex: Compra no supermercado"
              placeholderTextColor="#687076"
              value={description}
              onChangeText={setDescription}
              className="bg-surface rounded-lg border border-border p-4 text-foreground"
              multiline
            />
          </View>

          {/* Date Input */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Data</Text>
            <TextInput
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#687076"
              value={date}
              onChangeText={setDate}
              className="bg-surface rounded-lg border border-border p-4 text-foreground"
            />
          </View>

          {/* Save Button */}
          <Pressable
            onPress={handleSaveTransaction}
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            className="bg-primary rounded-lg p-4 items-center mt-4"
          >
            <Text className="text-background font-semibold text-base">Salvar Transação</Text>
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
