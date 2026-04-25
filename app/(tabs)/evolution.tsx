import { ScrollView, Text, View, TouchableOpacity, Dimensions } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { LineChart } from "react-native-chart-kit";

interface HistoryEntry {
  date: string;
  balance: number;
}

interface Transaction {
  id: string;
  type: "income" | "expense" | "investment";
  category: string;
  amount: number;
  description: string;
  date: string;
}

export default function EvolutionScreen() {
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
  const [period, setPeriod] = useState<"30" | "90" | "365">("30");
  const [currentBalance, setCurrentBalance] = useState(0);
  const [previousBalance, setPreviousBalance] = useState(0);

  useEffect(() => {
    loadEvolutionData();
  }, [period]);

  const loadEvolutionData = async () => {
    try {
      const transactionsData = await AsyncStorage.getItem("transactions");
      const transactions = transactionsData ? JSON.parse(transactionsData) : [];

      const days = parseInt(period);
      const history: HistoryEntry[] = [];
      const today = new Date();

      // Generate history for the selected period
      for (let i = days; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        let balance = 0;
        transactions.forEach((t: Transaction) => {
          const transDate = new Date(t.date).toISOString().split("T")[0];
          if (transDate <= dateStr) {
            if (t.type === "income") {
              balance += t.amount;
            } else if (t.type === "expense") {
              balance -= t.amount;
            }
          }
        });

        history.push({ date: dateStr, balance });
      }

      setHistoryData(history);

      // Calculate current and previous balance
      if (history.length > 0) {
        setCurrentBalance(history[history.length - 1].balance);
        if (history.length > 1) {
          setPreviousBalance(history[0].balance);
        }
      }
    } catch (error) {
      console.error("Error loading evolution data:", error);
    }
  };

  const change = currentBalance - previousBalance;
  const changePercent = previousBalance !== 0 ? ((change / Math.abs(previousBalance)) * 100).toFixed(2) : "0";

  // Prepare chart data
  const chartLabels = historyData
    .filter((_, idx) => idx % Math.ceil(historyData.length / 6) === 0)
    .map((entry) => entry.date.substring(5));

  const chartData = {
    labels: chartLabels.length > 0 ? chartLabels : [""],
    datasets: [
      {
        data: historyData.map((entry) => entry.balance),
        strokeWidth: 2,
      },
    ],
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-20">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">Evolução do Patrimônio</Text>
          </View>

          {/* Current Balance */}
          <View className="bg-surface rounded-lg p-4 border border-border gap-3">
            <View>
              <Text className="text-xs text-muted mb-1">Saldo Atual</Text>
              <Text className="text-3xl font-bold text-foreground">
                R$ {currentBalance.toFixed(2).replace(".", ",")}
              </Text>
            </View>

            <View className="flex-row justify-between items-end pt-3 border-t border-border">
              <View>
                <Text className="text-xs text-muted mb-1">Variação</Text>
                <Text className={`text-lg font-semibold ${change >= 0 ? "text-success" : "text-error"}`}>
                  {change >= 0 ? "+" : ""}R$ {Math.abs(change).toFixed(2).replace(".", ",")}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-xs text-muted mb-1">Percentual</Text>
                <Text className={`text-lg font-semibold ${change >= 0 ? "text-success" : "text-error"}`}>
                  {change >= 0 ? "+" : ""}{changePercent}%
                </Text>
              </View>
            </View>
          </View>

          {/* Period Selector */}
          <View className="flex-row gap-2">
            {["30", "90", "365"].map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setPeriod(p as "30" | "90" | "365")}
                className={`flex-1 py-2 rounded-lg items-center ${
                  period === p ? "bg-primary" : "bg-surface border border-border"
                }`}
              >
                <Text
                  className={`font-medium text-sm ${
                    period === p ? "text-background" : "text-foreground"
                  }`}
                >
                  {p === "30" ? "30 dias" : p === "90" ? "90 dias" : "1 ano"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Line Chart */}
          {historyData.length > 1 ? (
            <View className="bg-surface rounded-lg p-4 border border-border">
              <Text className="text-sm font-semibold text-foreground mb-4">Gráfico de Evolução</Text>
              <LineChart
                data={chartData}
                width={Dimensions.get("window").width - 32}
                height={220}
                chartConfig={{
                  backgroundColor: "transparent",
                  backgroundGradientFrom: "transparent",
                  backgroundGradientTo: "transparent",
                  color: () => "#0a7ea4",
                  labelColor: () => "#687076",
                  decimalPlaces: 0,
                  propsForDots: {
                    r: "4",
                    strokeWidth: "2",
                    stroke: "#0a7ea4",
                  },
                }}
                bezier
                yAxisLabel="R$"
                yAxisSuffix=""
              />
            </View>
          ) : (
            <View className="bg-surface rounded-lg p-6 border border-border items-center justify-center">
              <Text className="text-muted text-sm">Registre transações para ver o gráfico de evolução</Text>
            </View>
          )}

          {/* Statistics */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Estatísticas</Text>

            <View className="bg-surface rounded-lg p-4 border border-border">
              <View className="flex-row justify-between mb-3">
                <Text className="text-sm text-muted">Saldo Inicial</Text>
                <Text className="text-sm font-semibold text-foreground">
                  R$ {previousBalance.toFixed(2).replace(".", ",")}
                </Text>
              </View>
              <View className="flex-row justify-between mb-3">
                <Text className="text-sm text-muted">Saldo Final</Text>
                <Text className="text-sm font-semibold text-foreground">
                  R$ {currentBalance.toFixed(2).replace(".", ",")}
                </Text>
              </View>
              <View className="flex-row justify-between pt-3 border-t border-border">
                <Text className="text-sm text-muted">Crescimento</Text>
                <Text className={`text-sm font-semibold ${change >= 0 ? "text-success" : "text-error"}`}>
                  {change >= 0 ? "+" : ""}{changePercent}%
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
