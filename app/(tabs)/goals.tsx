import { ScrollView, Text, View, TouchableOpacity, Pressable, FlatList, Alert } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter, useFocusEffect } from "expo-router";

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  deadline: string;
  createdAt: string;
}

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [totalTarget, setTotalTarget] = useState(0);
  const [totalCurrent, setTotalCurrent] = useState(0);
  const router = useRouter();

  useFocusEffect(() => {
    loadGoals();
  });

  const loadGoals = async () => {
    try {
      const data = await AsyncStorage.getItem("goals");
      const allGoals = data ? JSON.parse(data) : [];
      setGoals(allGoals);

      let target = 0;
      let current = 0;
      allGoals.forEach((goal: Goal) => {
        target += goal.targetAmount;
        current += goal.currentAmount;
      });

      setTotalTarget(target);
      setTotalCurrent(current);
    } catch (error) {
      console.error("Error loading goals:", error);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      const updated = goals.filter((goal) => goal.id !== id);
      await AsyncStorage.setItem("goals", JSON.stringify(updated));
      loadGoals();
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  const getGoalIcon = (category: string) => {
    const icons: Record<string, string> = {
      "Viagem": "✈️",
      "Carro": "🚗",
      "Casa": "🏠",
      "Educação": "🎓",
      "Saúde": "💊",
      "Poupança": "🏦",
      "Investimento": "📈",
      "Lazer": "🎮",
      "Outro": "🎯",
    };
    return icons[category] || "🎯";
  };

  const renderGoal = ({ item }: { item: Goal }) => {
    const progress = (item.currentAmount / item.targetAmount) * 100;
    const remaining = item.targetAmount - item.currentAmount;
    const daysLeft = Math.ceil(
      (new Date(item.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    return (
      <View className="bg-surface rounded-lg p-4 mb-3 border border-border">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-3 flex-1">
            <Text className="text-2xl">{getGoalIcon(item.category)}</Text>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground">{item.name}</Text>
              <Text className="text-xs text-muted">{item.category}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => handleDeleteGoal(item.id)}>
            <Text className="text-xs text-error font-medium">Deletar</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View className="mb-3">
          <View className="flex-row justify-between mb-2">
            <Text className="text-xs text-muted">Progresso</Text>
            <Text className="text-xs font-semibold text-foreground">{progress.toFixed(0)}%</Text>
          </View>
          <View className="h-2 bg-border rounded-full overflow-hidden">
            <View
              className="h-full bg-primary"
              style={{ width: `${Math.min(progress, 100)}%` } as any}
            />
          </View>
        </View>

        {/* Details */}
        <View className="flex-row justify-between items-end">
          <View>
            <Text className="text-xs text-muted mb-1">Economizado</Text>
            <Text className="text-sm font-semibold text-success">R$ {item.currentAmount.toFixed(2).replace(".", ",")}</Text>
          </View>
          <View className="items-center">
            <Text className="text-xs text-muted mb-1">Faltam</Text>
            <Text className="text-sm font-semibold text-foreground">R$ {remaining.toFixed(2).replace(".", ",")}</Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-muted mb-1">Prazo</Text>
            <Text className={`text-sm font-semibold ${daysLeft > 0 ? "text-foreground" : "text-error"}`}>
              {daysLeft > 0 ? `${daysLeft}d` : "Vencido"}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

  return (
    <ScreenContainer className="p-4">
      <View className="gap-4 flex-1">
        {/* Header */}
        <View className="gap-2">
          <Text className="text-2xl font-bold text-foreground">Metas Financeiras</Text>
        </View>

        {/* Overall Summary */}
        <View className="bg-surface rounded-lg p-4 border border-border gap-3">
          <View className="flex-row justify-between">
            <View>
              <Text className="text-xs text-muted mb-1">Meta Total</Text>
              <Text className="text-lg font-semibold text-foreground">R$ {totalTarget.toFixed(2).replace(".", ",")}</Text>
            </View>
            <View>
              <Text className="text-xs text-muted mb-1">Economizado</Text>
              <Text className="text-lg font-semibold text-success">R$ {totalCurrent.toFixed(2).replace(".", ",")}</Text>
            </View>
          </View>

          {/* Overall Progress Bar */}
          <View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-xs text-muted">Progresso Geral</Text>
              <Text className="text-xs font-semibold text-foreground">{overallProgress.toFixed(0)}%</Text>
            </View>
            <View className="h-2 bg-border rounded-full overflow-hidden">
              <View
                className="h-full bg-primary"
                style={{ width: `${Math.min(overallProgress, 100)}%` } as any}
              />
            </View>
          </View>
        </View>

        {/* Goals List */}
        <FlatList
          data={goals}
          renderItem={renderGoal}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-8">
              <Text className="text-muted text-sm">Nenhuma meta criada ainda</Text>
            </View>
          }
        />

        {/* Add Button */}
        <Pressable
          onPress={() => router.push("./add-goal")}
          style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
          className="bg-primary rounded-lg p-4 items-center mt-4"
        >
          <Text className="text-background font-semibold text-base">+ Adicionar Meta</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
