import { ScrollView, Text, View, TouchableOpacity, Dimensions } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { BarChart } from "react-native-chart-kit";

interface Transaction {
  id: string;
  type: "income" | "expense" | "investment";
  category: string;
  amount: number;
  description: string;
  date: string;
}

interface CategoryTotal {
  category: string;
  amount: number;
}

export default function ReportsScreen() {
  const [monthExpenses, setMonthExpenses] = useState(0);
  const [monthIncome, setMonthIncome] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    loadReportData();
  }, [selectedMonth]);

  const loadReportData = async () => {
    try {
      const data = await AsyncStorage.getItem("transactions");
      const transactions = data ? JSON.parse(data) : [];

      let expenses = 0;
      let income = 0;
      const categories: Record<string, number> = {};

      const month = selectedMonth.getMonth();
      const year = selectedMonth.getFullYear();

      transactions.forEach((t: Transaction) => {
        const transDate = new Date(t.date);
        if (transDate.getMonth() === month && transDate.getFullYear() === year) {
          if (t.type === "expense") {
            expenses += t.amount;
            categories[t.category] = (categories[t.category] || 0) + t.amount;
          } else if (t.type === "income") {
            income += t.amount;
          }
        }
      });

      setMonthExpenses(expenses);
      setMonthIncome(income);

      const sorted = Object.entries(categories)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);

      setCategoryTotals(sorted);
    } catch (error) {
      console.error("Error loading report data:", error);
    }
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedMonth(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedMonth(newDate);
  };

  const monthName = selectedMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const balance = monthIncome - monthExpenses;

  // Prepare data for bar chart (top 5 categories)
  const topCategories = categoryTotals.slice(0, 5);
  const chartData = {
    labels: topCategories.map((c) => c.category.substring(0, 6)),
    datasets: [
      {
        data: topCategories.map((c) => c.amount),
      },
    ],
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-20">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">Relatórios</Text>
          </View>

          {/* Month Selector */}
          <View className="flex-row items-center justify-between bg-surface rounded-lg p-4 border border-border">
            <TouchableOpacity onPress={handlePreviousMonth}>
              <Text className="text-primary font-semibold text-lg">←</Text>
            </TouchableOpacity>
            <Text className="text-base font-semibold text-foreground capitalize">{monthName}</Text>
            <TouchableOpacity onPress={handleNextMonth}>
              <Text className="text-primary font-semibold text-lg">→</Text>
            </TouchableOpacity>
          </View>

          {/* Summary Cards */}
          <View className="gap-3">
            <View className="bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted mb-1">Receitas</Text>
              <Text className="text-2xl font-bold text-success">R$ {monthIncome.toFixed(2).replace(".", ",")}</Text>
            </View>

            <View className="bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted mb-1">Despesas</Text>
              <Text className="text-2xl font-bold text-error">R$ {monthExpenses.toFixed(2).replace(".", ",")}</Text>
            </View>

            <View className={`rounded-lg p-4 border border-border ${balance >= 0 ? "bg-green-50" : "bg-red-50"}`}>
              <Text className="text-xs text-muted mb-1">Saldo</Text>
              <Text className={`text-2xl font-bold ${balance >= 0 ? "text-success" : "text-error"}`}>
                {balance >= 0 ? "+" : ""}R$ {balance.toFixed(2).replace(".", ",")}
              </Text>
            </View>
          </View>

          {/* Bar Chart */}
          {topCategories.length > 0 && (
            <View className="bg-surface rounded-lg p-4 border border-border">
              <Text className="text-sm font-semibold text-foreground mb-4">Top 5 Categorias</Text>
              <BarChart
                data={chartData}
                width={Dimensions.get("window").width - 32}
                height={220}
                chartConfig={{
                  backgroundColor: "transparent",
                  backgroundGradientFrom: "transparent",
                  backgroundGradientTo: "transparent",
                  color: () => "#0a7ea4",
                  labelColor: () => "#687076",
                  barPercentage: 0.7,
                  decimalPlaces: 0,
                }}
                verticalLabelRotation={30}
                yAxisLabel="R$"
                yAxisSuffix=""
              />
            </View>
          )}

          {/* Category Breakdown */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Despesas por Categoria</Text>

            {categoryTotals.length > 0 ? (
              categoryTotals.map((item, index) => {
                const percentage = ((item.amount / monthExpenses) * 100).toFixed(1);
                return (
                  <View key={index} className="bg-surface rounded-lg p-3 border border-border">
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-sm font-medium text-foreground">{item.category}</Text>
                      <Text className="text-sm font-semibold text-foreground">R$ {item.amount.toFixed(2).replace(".", ",")}</Text>
                    </View>
                    <View className="h-2 bg-border rounded-full overflow-hidden">
                      <View
                        className="h-full bg-primary"
                        style={{ width: `${percentage}%` } as any}
                      />
                    </View>
                    <Text className="text-xs text-muted mt-1">{percentage}% do total</Text>
                  </View>
                );
              })
            ) : (
              <View className="items-center justify-center py-8 bg-surface rounded-lg border border-border">
                <Text className="text-muted text-sm">Nenhuma despesa neste período</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
