import { ScrollView, Text, View, TouchableOpacity, Pressable } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";

interface Transaction {
  id: string;
  type: "income" | "expense" | "investment";
  category: string;
  amount: number;
  description: string;
  date: string;
}

export default function HomeScreen() {
  const [totalBalance, setTotalBalance] = useState(0);
  const [monthExpenses, setMonthExpenses] = useState(0);
  const [monthIncome, setMonthIncome] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const transactionsData = await AsyncStorage.getItem("transactions");
      const transactions = transactionsData ? JSON.parse(transactionsData) : [];

      // Calculate totals
      let balance = 0;
      let expenses = 0;
      let income = 0;
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      transactions.forEach((t: Transaction) => {
        const transDate = new Date(t.date);
        const isCurrentMonth = transDate.getMonth() === currentMonth && transDate.getFullYear() === currentYear;

        if (t.type === "income") {
          balance += t.amount;
          if (isCurrentMonth) income += t.amount;
        } else if (t.type === "expense") {
          balance -= t.amount;
          if (isCurrentMonth) expenses += t.amount;
        }
      });

      setTotalBalance(balance);
      setMonthExpenses(expenses);
      setMonthIncome(income);
      setRecentTransactions(transactions.slice(-5).reverse());
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const handleAddTransaction = () => {
    router.push("./transactions");
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

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-20">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-sm text-muted">Seu Patrimônio</Text>
            <Text className="text-4xl font-bold text-foreground">
              R$ {totalBalance.toFixed(2).replace(".", ",")}
            </Text>
          </View>

          {/* Summary Cards */}
          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
              <Text className="text-xs text-muted mb-1">Receitas</Text>
              <Text className="text-lg font-semibold text-success">
                +R$ {monthIncome.toFixed(2).replace(".", ",")}
              </Text>
            </View>
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
              <Text className="text-xs text-muted mb-1">Despesas</Text>
              <Text className="text-lg font-semibold text-error">
                -R$ {monthExpenses.toFixed(2).replace(".", ",")}
              </Text>
            </View>
          </View>

          {/* Recent Transactions */}
          <View className="gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-semibold text-foreground">Transações Recentes</Text>
              <TouchableOpacity onPress={() => router.push("./transactions")}>
                <Text className="text-primary text-sm font-medium">Ver tudo</Text>
              </TouchableOpacity>
            </View>

            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <View
                  key={transaction.id}
                  className="flex-row items-center justify-between bg-surface rounded-lg p-3 border border-border"
                >
                  <View className="flex-row items-center flex-1 gap-3">
                    <Text className="text-2xl">{getCategoryIcon(transaction.category)}</Text>
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-foreground">{transaction.category}</Text>
                      <Text className="text-xs text-muted">{transaction.description}</Text>
                    </View>
                  </View>
                  <Text
                    className={`text-sm font-semibold ${
                      transaction.type === "expense" ? "text-error" : "text-success"
                    }`}
                  >
                    {transaction.type === "expense" ? "-" : "+"}R$ {transaction.amount.toFixed(2).replace(".", ",")}
                  </Text>
                </View>
              ))
            ) : (
              <View className="bg-surface rounded-lg p-6 items-center justify-center border border-border">
                <Text className="text-muted text-sm">Nenhuma transação registrada</Text>
              </View>
            )}
          </View>

          {/* Add Transaction Button */}
          <Pressable
            onPress={handleAddTransaction}
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            className="bg-primary rounded-lg p-4 items-center"
          >
            <Text className="text-background font-semibold text-base">+ Adicionar Transação</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
