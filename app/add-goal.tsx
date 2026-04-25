import { ScrollView, Text, View, TouchableOpacity, TextInput, Pressable, Alert } from "react-native";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";

export default function AddGoalScreen() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Poupança");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  const router = useRouter();

  const categories = ["Viagem", "Carro", "Casa", "Educação", "Saúde", "Poupança", "Investimento", "Lazer", "Outro"];

  const handleSaveGoal = async () => {
    if (!name || !targetAmount) {
      Alert.alert("Erro", "Preencha o nome e a meta");
      return;
    }

    try {
      const newGoal = {
        id: Date.now().toString(),
        name,
        category,
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount) || 0,
        deadline,
        createdAt: new Date().toISOString().split("T")[0],
      };

      const existingData = await AsyncStorage.getItem("goals");
      const goals = existingData ? JSON.parse(existingData) : [];
      goals.push(newGoal);

      await AsyncStorage.setItem("goals", JSON.stringify(goals));

      Alert.alert("Sucesso", "Meta adicionada com sucesso");
      router.back();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar a meta");
      console.error("Error saving goal:", error);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-20">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-foreground">Adicionar Meta</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-primary font-semibold text-lg">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Name Input */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Nome da Meta</Text>
            <TextInput
              placeholder="Ex: Viagem para Paris"
              placeholderTextColor="#687076"
              value={name}
              onChangeText={setName}
              className="bg-surface rounded-lg border border-border p-4 text-foreground"
            />
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

          {/* Target Amount */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Meta (Valor Total)</Text>
            <View className="flex-row items-center bg-surface rounded-lg border border-border p-4">
              <Text className="text-lg font-semibold text-foreground mr-2">R$</Text>
              <TextInput
                placeholder="0,00"
                placeholderTextColor="#687076"
                value={targetAmount}
                onChangeText={setTargetAmount}
                keyboardType="decimal-pad"
                className="flex-1 text-lg font-semibold text-foreground"
              />
            </View>
          </View>

          {/* Current Amount */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Já Economizado (Opcional)</Text>
            <View className="flex-row items-center bg-surface rounded-lg border border-border p-4">
              <Text className="text-lg font-semibold text-foreground mr-2">R$</Text>
              <TextInput
                placeholder="0,00"
                placeholderTextColor="#687076"
                value={currentAmount}
                onChangeText={setCurrentAmount}
                keyboardType="decimal-pad"
                className="flex-1 text-lg font-semibold text-foreground"
              />
            </View>
          </View>

          {/* Deadline */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Prazo</Text>
            <TextInput
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#687076"
              value={deadline}
              onChangeText={setDeadline}
              className="bg-surface rounded-lg border border-border p-4 text-foreground"
            />
          </View>

          {/* Progress Preview */}
          {targetAmount && (
            <View className="bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted mb-2">Prévia do Progresso</Text>
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm font-medium text-foreground">
                  R$ {(parseFloat(currentAmount) || 0).toFixed(2).replace(".", ",")} / R$ {parseFloat(targetAmount).toFixed(2).replace(".", ",")}
                </Text>
                <Text className="text-sm font-semibold text-foreground">
                  {((parseFloat(currentAmount) || 0) / parseFloat(targetAmount) * 100).toFixed(0)}%
                </Text>
              </View>
              <View className="h-2 bg-border rounded-full overflow-hidden">
                <View
                  className="h-full bg-primary"
                  style={{ width: `${Math.min(((parseFloat(currentAmount) || 0) / parseFloat(targetAmount)) * 100, 100)}%` } as any}
                />
              </View>
            </View>
          )}

          {/* Save Button */}
          <Pressable
            onPress={handleSaveGoal}
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            className="bg-primary rounded-lg p-4 items-center mt-4"
          >
            <Text className="text-background font-semibold text-base">Salvar Meta</Text>
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
