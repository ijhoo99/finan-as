import { ScrollView, Text, View, TouchableOpacity, Pressable, FlatList, Dimensions } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter, useFocusEffect } from "expo-router";
import { PieChart } from "react-native-chart-kit";

interface Investment {
  id: string;
  name: string;
  type: string;
  amountInvested: number;
  currentValue: number;
  date: string;
}

export default function InvestmentsScreen() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [totalInvested, setTotalInvested] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const router = useRouter();

  useFocusEffect(() => {
    loadInvestments();
  });

  const loadInvestments = async () => {
    try {
      const data = await AsyncStorage.getItem("investments");
      const allInvestments = data ? JSON.parse(data) : [];
      setInvestments(allInvestments);

      let invested = 0;
      let value = 0;
      allInvestments.forEach((inv: Investment) => {
        invested += inv.amountInvested;
        value += inv.currentValue;
      });

      setTotalInvested(invested);
      setTotalValue(value);
    } catch (error) {
      console.error("Error loading investments:", error);
    }
  };

  const handleDeleteInvestment = async (id: string) => {
    try {
      const updated = investments.filter((inv) => inv.id !== id);
      await AsyncStorage.setItem("investments", JSON.stringify(updated));
      loadInvestments();
    } catch (error) {
      console.error("Error deleting investment:", error);
    }
  };

  const getInvestmentIcon = (type: string) => {
    const icons: Record<string, string> = {
      "Ações": "📊",
      "Criptomoedas": "💎",
      "Renda Fixa": "💵",
      "Poupança": "🏦",
      "Mercado Pago": "📱",
    };
    return icons[type] || "💰";
  };

  const renderInvestment = ({ item }: { item: Investment }) => {
    const gain = item.currentValue - item.amountInvested;
    const percentage = ((gain / item.amountInvested) * 100).toFixed(2);

    return (
      <View className="bg-surface rounded-lg p-4 mb-3 border border-border">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-3 flex-1">
            <Text className="text-2xl">{getInvestmentIcon(item.type)}</Text>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground">{item.name}</Text>
              <Text className="text-xs text-muted">{item.type}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => handleDeleteInvestment(item.id)}>
            <Text className="text-xs text-error font-medium">Deletar</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between items-end">
          <View>
            <Text className="text-xs text-muted mb-1">Investido</Text>
            <Text className="text-sm font-semibold text-foreground">R$ {item.amountInvested.toFixed(2).replace(".", ",")}</Text>
          </View>
          <View>
            <Text className="text-xs text-muted mb-1">Valor Atual</Text>
            <Text className="text-sm font-semibold text-foreground">R$ {item.currentValue.toFixed(2).replace(".", ",")}</Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-muted mb-1">Rendimento</Text>
            <Text className={`text-sm font-semibold ${gain >= 0 ? "text-success" : "text-error"}`}>
              {gain >= 0 ? "+" : ""}{percentage}%
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const totalGain = totalValue - totalInvested;
  const totalPercentage = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : "0";

  const chartData = investments.length > 0 ? investments.map((inv, idx) => ({
    name: inv.name.substring(0, 8),
    value: inv.currentValue,
    color: ["#0a7ea4", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6"][idx % 5],
    legendFontColor: "#11181C",
    legendFontSize: 12,
  })) : [];

  return (
    <ScreenContainer className="p-4">
      <View className="gap-4 flex-1">
        {/* Header */}
        <View className="gap-2">
          <Text className="text-2xl font-bold text-foreground">Investimentos</Text>
        </View>

        {/* Summary */}
        <View className="bg-surface rounded-lg p-4 border border-border gap-3">
          <View className="flex-row justify-between">
            <View>
              <Text className="text-xs text-muted mb-1">Total Investido</Text>
              <Text className="text-lg font-semibold text-foreground">R$ {totalInvested.toFixed(2).replace(".", ",")}</Text>
            </View>
            <View>
              <Text className="text-xs text-muted mb-1">Valor Atual</Text>
              <Text className="text-lg font-semibold text-foreground">R$ {totalValue.toFixed(2).replace(".", ",")}</Text>
            </View>
          </View>
          <View className="flex-row justify-between items-end">
            <View>
              <Text className="text-xs text-muted">Rendimento Total</Text>
              <Text className={`text-base font-semibold ${totalGain >= 0 ? "text-success" : "text-error"}`}>
                {totalGain >= 0 ? "+" : ""}{totalPercentage}%
              </Text>
            </View>
            <Text className={`text-base font-semibold ${totalGain >= 0 ? "text-success" : "text-error"}`}>
              {totalGain >= 0 ? "+" : ""}R$ {Math.abs(totalGain).toFixed(2).replace(".", ",")}
            </Text>
          </View>
        </View>

        {/* Pie Chart */}
        {investments.length > 0 && (
          <View className="bg-surface rounded-lg p-4 border border-border items-center">
            <Text className="text-sm font-semibold text-foreground mb-4">Composição da Carteira</Text>
            <PieChart
              data={chartData}
              width={Dimensions.get("window").width - 32}
              height={220}
              chartConfig={{
                backgroundColor: "transparent",
                backgroundGradientFrom: "transparent",
                backgroundGradientTo: "transparent",
                color: () => "#11181C",
              }}
              accessor="value"
              backgroundColor="transparent"
              paddingLeft="0"
              absolute
            />
          </View>
        )}

        {/* Investments List */}
        <FlatList
          data={investments}
          renderItem={renderInvestment}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-8">
              <Text className="text-muted text-sm">Nenhum investimento registrado</Text>
            </View>
          }
        />

        {/* Add Button */}
        <Pressable
          onPress={() => router.push("./add-investment")}
          style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
          className="bg-primary rounded-lg p-4 items-center mt-4"
        >
          <Text className="text-background font-semibold text-base">+ Adicionar Investimento</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
