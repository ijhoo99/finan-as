# Design do App de Gestão Financeira

## Visão Geral
Um aplicativo móvel intuitivo para gerenciar finanças pessoais e investimentos, com foco em usuários do Mercado Pago. O app permite rastrear saldo, despesas, rendimentos e visualizar a evolução do patrimônio através de gráficos.

---

## Telas Principais

### 1. **Home (Dashboard)**
- **Objetivo**: Visão geral do patrimônio e atividades recentes
- **Conteúdo Principal**:
  - Saldo total em destaque (grande, no topo)
  - Cards de resumo: Saldo Mercado Pago, Total de Despesas (mês), Total de Rendimentos
  - Gráfico de evolução do patrimônio (últimos 30 dias)
  - Lista das últimas transações (5 mais recentes)
  - Botão flutuante para adicionar nova transação

### 2. **Transações**
- **Objetivo**: Listar todas as transações com filtros
- **Conteúdo Principal**:
  - Filtro por tipo (Receita, Despesa, Investimento)
  - Filtro por período (Hoje, Semana, Mês, Personalizado)
  - Lista de transações com ícones de categoria
  - Cada item mostra: data, descrição, categoria, valor e tipo
  - Swipe para editar ou deletar transação

### 3. **Adicionar/Editar Transação**
- **Objetivo**: Registrar nova transação ou editar existente
- **Conteúdo Principal**:
  - Campo de tipo (Receita, Despesa, Investimento)
  - Campo de categoria (dropdown com ícones)
  - Campo de valor (teclado numérico)
  - Campo de descrição (texto livre)
  - Campo de data (date picker)
  - Botão de salvar/cancelar

### 4. **Investimentos**
- **Objetivo**: Rastrear investimentos e rendimentos
- **Conteúdo Principal**:
  - Resumo total investido e rendimento acumulado
  - Lista de investimentos com ícones (Ações, Criptomoedas, Renda Fixa, etc.)
  - Cada item mostra: nome, valor investido, rendimento, percentual de retorno
  - Botão para adicionar novo investimento
  - Gráfico de composição da carteira (pizza)

### 5. **Relatórios**
- **Objetivo**: Análise detalhada de gastos e receitas
- **Conteúdo Principal**:
  - Gráfico de barras: gastos por categoria (mês selecionado)
  - Gráfico de pizza: distribuição de gastos
  - Resumo mensal: receita total, despesa total, saldo
  - Seletor de período (mês/ano)
  - Comparação com mês anterior

### 6. **Configurações**
- **Objetivo**: Personalizar o app
- **Conteúdo Principal**:
  - Modo claro/escuro
  - Moeda padrão (Real)
  - Notificações (ativar/desativar)
  - Sobre o app
  - Exportar dados (CSV)
  - Limpar dados locais

---

## Fluxos Principais

### Fluxo 1: Adicionar Transação
1. Usuário toca no botão flutuante na Home
2. Abre tela de "Adicionar Transação"
3. Seleciona tipo (Receita/Despesa/Investimento)
4. Escolhe categoria
5. Insere valor e descrição
6. Confirma data
7. Toca em "Salvar"
8. Retorna à Home com transação adicionada

### Fluxo 2: Visualizar Relatórios
1. Usuário navega para aba "Relatórios"
2. Visualiza gráficos do mês atual
3. Pode alterar período com seletor
4. Gráficos atualizam automaticamente
5. Pode exportar dados em CSV

### Fluxo 3: Gerenciar Investimentos
1. Usuário navega para aba "Investimentos"
2. Visualiza resumo e gráfico de carteira
3. Toca em "Adicionar Investimento"
4. Preenche dados (nome, valor, tipo)
5. Salva e retorna à lista

---

## Estrutura de Navegação

```
Home (Dashboard)
├── Transações
│   ├── Adicionar Transação
│   └── Editar Transação
├── Investimentos
│   └── Adicionar Investimento
├── Relatórios
└── Configurações
```

---

## Cores e Branding

### Paleta de Cores
- **Primária**: #0a7ea4 (Azul - Mercado Pago)
- **Sucesso**: #22C55E (Verde - Receitas/Ganhos)
- **Alerta**: #F59E0B (Âmbar - Atenção)
- **Erro**: #EF4444 (Vermelho - Despesas)
- **Fundo**: #ffffff (Claro) / #151718 (Escuro)
- **Superfície**: #f5f5f5 (Claro) / #1e2022 (Escuro)

### Tipografia
- **Títulos**: Font Bold, 24-32px
- **Subtítulos**: Font Semibold, 16-18px
- **Corpo**: Font Regular, 14-16px
- **Labels**: Font Medium, 12-14px

---

## Categorias de Transações

### Despesas
- 🍔 Alimentação
- 🚗 Transporte
- 🏠 Moradia
- 💊 Saúde
- 🎓 Educação
- 🎮 Entretenimento
- 🛍️ Compras
- 💳 Outros

### Receitas
- 💼 Salário
- 📈 Freelance
- 🎁 Presente
- 💰 Outros

### Investimentos
- 📊 Ações
- 💎 Criptomoedas
- 💵 Renda Fixa
- 🏦 Poupança
- 📱 Mercado Pago

---

## Considerações de Design

- **Orientação**: Portrait (9:16)
- **Uso com uma mão**: Botões e elementos interativos no terço inferior da tela
- **Acessibilidade**: Contraste adequado, textos legíveis, ícones com labels
- **Performance**: Listas virtualizadas para muitas transações
- **Responsividade**: Adaptar para tablets se necessário
- **Segurança**: Dados armazenados localmente (AsyncStorage), sem sincronização na nuvem por padrão
