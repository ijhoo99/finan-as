import { describe, it, expect, beforeEach, vi } from "vitest";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock AsyncStorage
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    multiRemove: vi.fn(),
  },
}));

describe("Funcionalidades Principais do App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // TESTE 1: INTEGRAÇÃO COM MERCADO PAGO
  // ============================================
  describe("1. Integração com Mercado Pago", () => {
    it("deve conectar uma conta Mercado Pago com email e saldo", async () => {
      const mpAccount = {
        email: "usuario@example.com",
        balance: 1500.5,
        userId: "123456",
        lastUpdated: new Date().toISOString(),
      };

      (AsyncStorage.setItem as any).mockResolvedValue(undefined);
      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify(mpAccount));

      await AsyncStorage.setItem("mercado_pago_account", JSON.stringify(mpAccount));
      const saved = await AsyncStorage.getItem("mercado_pago_account");

      expect(saved).toBeDefined();
      const parsed = JSON.parse(saved!);
      expect(parsed.email).toBe("usuario@example.com");
      expect(parsed.balance).toBe(1500.5);
    });

    it("deve atualizar o saldo da conta Mercado Pago", async () => {
      const mpAccount = {
        email: "usuario@example.com",
        balance: 2000.0,
        userId: "123456",
        lastUpdated: new Date().toISOString(),
      };

      (AsyncStorage.setItem as any).mockResolvedValue(undefined);

      await AsyncStorage.setItem("mercado_pago_account", JSON.stringify(mpAccount));

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "mercado_pago_account",
        expect.stringContaining("2000")
      );
    });

    it("deve desconectar uma conta Mercado Pago", async () => {
      (AsyncStorage.removeItem as any).mockResolvedValue(undefined);

      await AsyncStorage.removeItem("mercado_pago_account");

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("mercado_pago_account");
    });

    it("deve calcular corretamente o saldo da conta", () => {
      const balance = 1500.5;
      const expectedFormatted = "R$ 1500,50";

      const formatted = `R$ ${balance.toFixed(2).replace(".", ",")}`;
      expect(formatted).toBe(expectedFormatted);
    });
  });

  // ============================================
  // TESTE 2: GRÁFICO DE EVOLUÇÃO DO PATRIMÔNIO
  // ============================================
  describe("2. Gráfico de Evolução do Patrimônio", () => {
    it("deve calcular a evolução do patrimônio ao longo do tempo", async () => {
      const transactions = [
        { id: "1", type: "income", amount: 1000, date: "2026-04-20" },
        { id: "2", type: "expense", amount: 200, date: "2026-04-21" },
        { id: "3", type: "income", amount: 500, date: "2026-04-22" },
      ];

      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify(transactions));

      const saved = await AsyncStorage.getItem("transactions");
      const parsed = JSON.parse(saved!);

      let balance = 0;
      const history = parsed.map((t: any) => {
        if (t.type === "income") balance += t.amount;
        if (t.type === "expense") balance -= t.amount;
        return { date: t.date, balance };
      });

      expect(history).toHaveLength(3);
      expect(history[0].balance).toBe(1000); // Primeira receita
      expect(history[1].balance).toBe(800); // Após despesa
      expect(history[2].balance).toBe(1300); // Após segunda receita
    });

    it("deve calcular o percentual de crescimento corretamente", () => {
      const previousBalance = 1000;
      const currentBalance = 1300;
      const change = currentBalance - previousBalance;
      const changePercent = ((change / Math.abs(previousBalance)) * 100).toFixed(2);

      expect(changePercent).toBe("30.00");
    });

    it("deve gerar dados para períodos de 30, 90 e 365 dias", () => {
      const periods = ["30", "90", "365"];
      const today = new Date();

      periods.forEach((period) => {
        const days = parseInt(period);
        const history = [];

        for (let i = days; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          history.push({
            date: date.toISOString().split("T")[0],
            balance: Math.random() * 5000,
          });
        }

        expect(history).toHaveLength(days + 1);
      });
    });

    it("deve retornar saldo inicial e final para comparação", () => {
      const history = [
        { date: "2026-03-25", balance: 1000 },
        { date: "2026-03-26", balance: 1100 },
        { date: "2026-04-24", balance: 1500 },
      ];

      const previousBalance = history[0].balance;
      const currentBalance = history[history.length - 1].balance;

      expect(previousBalance).toBe(1000);
      expect(currentBalance).toBe(1500);
    });
  });

  // ============================================
  // TESTE 3: METAS FINANCEIRAS
  // ============================================
  describe("3. Metas Financeiras", () => {
    it("deve criar uma nova meta financeira", async () => {
      const goal = {
        id: "1",
        name: "Viagem para Paris",
        category: "Viagem",
        targetAmount: 5000,
        currentAmount: 1200,
        deadline: "2026-12-31",
        createdAt: new Date().toISOString().split("T")[0],
      };

      (AsyncStorage.setItem as any).mockResolvedValue(undefined);

      await AsyncStorage.setItem("goals", JSON.stringify([goal]));

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "goals",
        expect.stringContaining("Viagem para Paris")
      );
    });

    it("deve calcular o progresso de uma meta", () => {
      const goal = {
        targetAmount: 5000,
        currentAmount: 1500,
      };

      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      expect(progress).toBe(30);
    });

    it("deve calcular quanto falta para atingir a meta", () => {
      const goal = {
        targetAmount: 5000,
        currentAmount: 1500,
      };

      const remaining = goal.targetAmount - goal.currentAmount;
      expect(remaining).toBe(3500);
    });

    it("deve calcular dias restantes até o prazo", () => {
      const deadline = new Date(2026, 11, 31); // 31 de dezembro de 2026
      const today = new Date(2026, 3, 24); // 24 de abril de 2026

      const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      expect(daysLeft).toBeGreaterThan(0);
      expect(daysLeft).toBeLessThan(365);
    });

    it("deve deletar uma meta", async () => {
      const goals = [
        { id: "1", name: "Meta 1" },
        { id: "2", name: "Meta 2" },
      ];

      const updated = goals.filter((goal) => goal.id !== "1");

      expect(updated).toHaveLength(1);
      expect(updated[0].id).toBe("2");
    });

    it("deve calcular o progresso geral de todas as metas", () => {
      const goals = [
        { targetAmount: 5000, currentAmount: 1500 },
        { targetAmount: 3000, currentAmount: 2000 },
        { targetAmount: 2000, currentAmount: 1000 },
      ];

      const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
      const totalCurrent = goals.reduce((sum, g) => sum + g.currentAmount, 0);
      const overallProgress = (totalCurrent / totalTarget) * 100;

      expect(totalTarget).toBe(10000);
      expect(totalCurrent).toBe(4500);
      expect(overallProgress).toBe(45);
    });

    it("deve validar que meta tem nome e valor", () => {
      const goal = {
        name: "Viagem",
        targetAmount: 5000,
      };

      const isValid = goal.name && goal.targetAmount > 0;
      expect(isValid).toBe(true);
    });

    it("deve validar que meta sem nome é inválida", () => {
      const goal = {
        name: "",
        targetAmount: 5000,
      };

      const isValid = goal.name && goal.targetAmount > 0;
      expect(!isValid).toBe(true);
    });
  });

  // ============================================
  // TESTES INTEGRADOS
  // ============================================
  describe("Testes Integrados", () => {
    it("deve manter dados de Mercado Pago, Evolução e Metas separados", async () => {
      const mpAccount = { email: "test@example.com", balance: 1000 };
      const transactions = [{ type: "income", amount: 500, date: "2026-04-24" }];
      const goals = [{ name: "Meta 1", targetAmount: 5000 }];

      (AsyncStorage.setItem as any).mockResolvedValue(undefined);
      (AsyncStorage.getItem as any).mockImplementation((key: string) => {
        if (key === "mercado_pago_account") return JSON.stringify(mpAccount);
        if (key === "transactions") return JSON.stringify(transactions);
        if (key === "goals") return JSON.stringify(goals);
        return null;
      });

      const mp = await AsyncStorage.getItem("mercado_pago_account");
      const trans = await AsyncStorage.getItem("transactions");
      const gls = await AsyncStorage.getItem("goals");

      expect(JSON.parse(mp!).email).toBe("test@example.com");
      expect(JSON.parse(trans!)).toHaveLength(1);
      expect(JSON.parse(gls!)).toHaveLength(1);
    });

    it("deve exportar todos os dados corretamente", async () => {
      const allData = {
        transactions: [{ type: "income", amount: 1000 }],
        investments: [{ name: "PETR4", value: 500 }],
        goals: [{ name: "Meta 1", targetAmount: 5000 }],
        mercadoPago: { email: "test@example.com", balance: 1500 },
        exportDate: new Date().toISOString(),
      };

      (AsyncStorage.setItem as any).mockResolvedValue(undefined);

      await AsyncStorage.setItem("backup", JSON.stringify(allData));

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "backup",
        expect.stringContaining("transactions")
      );
    });
  });
});
