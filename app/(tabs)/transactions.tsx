import { ScrollView, Text, View, TouchableOpacity, Pressable, FlatList } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter, useFocusEffect } from "expo-router";

interface Transaction {
  id: string;
  type: "income" | "expense" | "investment";
  category: string;
  amount: number;
  description: string;
  date: string;
}

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [filterType, setFilterType] = useState<"all" | "income" | "expense" | "investment">("all");
  const router = useRouter();

  useFocusEffect(() => {
    loadTransactions();
  });

  const loadTransactions = async () => {
    try {
      const data = await AsyncStorage.getItem("transactions");
      const allTransactions = data ? JSON.parse(data) : [];
      setTransactions(allTransactions);
      filterTransactions(allTransactions, filterType);
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };

  const filterTransactions = (items: Transaction[], type: string) => {
    if (type === "all") {
      setFilteredTransactions(items.reverse());
    } else {
      setFilteredTransactions(items.filter((t) => t.type === type).reverse());
    }
  };

  const handleFilterChange = (type: "all" | "income" | "expense" | "investment") => {
    setFilterType(type);
    filterTransactions(transactions, type);
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const updated = transactions.filter((t) => t.id !== id);
      await AsyncStorage.setItem("transactions", JSON.stringify(updated));
      loadTransactions();
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      "Alimentação": "🍔",
      "Transporte": "🚗",
      "Moradia": "🏠",
      "Saúde": "💊",
      "Educação": "🎓",
      "Entretenimento": "🎮",
      "Compras": "🛍️",
      "Salário": "💼",
      "Freelance": "📈",
      "Presente": "🎁",
      "Ações": "📊",
      "Criptomoedas": "💎",
      "Renda Fixa": "💵",
      "Poupança": "🏦",
      "Mercado Pago": "📱",
    };
    return icons[category] || "💰";
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View className="bg-surface rounded-lg p-3 mb-2 border border-border flex-row items-center justify-between">
      <View className="flex-row items-center flex-1 gap-3">
        <Text className="text-2xl">{getCategoryIcon(item.category)}</Text>
        <View className="flex-1">
          <Text className="text-sm font-medium text-foreground">{item.category}</Text>
          <Text className="text-xs text-muted">{item.description}</Text>
        </View>
      </View>
      <View className="items-end gap-1">
        <Text className={`text-sm font-semibold ${item.type === "expense" ? "text-error" : "text-success"}`}>
          {item.type === "expense" ? "-" : "+"}R$ {item.amount.toFixed(2).replace(".", ",")}
        </Text>
        <TouchableOpacity onPress={() => handleDeleteTransaction(item.id)}>
          <Text className="text-xs text-error">Deletar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenContainer className="p-4">
      <View className="gap-4 flex-1">
        {/* Header */}
        <View className="gap-2">
          <Text className="text-2xl font-bold text-foreground">Transações</Text>
        </View>

        {/* Filters */}
        <View className="flex-row gap-2">
          {["all", "income", "expense", "investment"].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => handleFilterChange(type as "all" | "income" | "expense" | "investment")}
              className={`px-3 py-2 rounded-full ${
                filterType === type ? "bg-primary" : "bg-surface border border-border"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  filterType === type ? "text-background" : "text-foreground"
                }`}
              >
                {type === "all" ? "Todas" : type === "income" ? "Receitas" : type === "expense" ? "Despesas" : "Investimentos"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transactions List */}
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-8">
              <Text className="text-muted text-sm">Nenhuma transação encontrada</Text>
            </View>
          }
        />

        {/* Add Button */}
        <Pressable
          onPress={() => router.push("./add-transaction")}
          style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
          className="bg-primary rounded-lg p-4 items-center mt-4"
        >
          <Text className="text-background font-semibold text-base">+ Adicionar Transação</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
