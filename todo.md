# Gestor de Finanças Mercado Pago - TODO

## Fase 1: Estrutura Base e Navegação
- [x] Configurar navegação com abas (Home, Transações, Investimentos, Relatórios, Configurações)
- [x] Criar componentes base (ScreenContainer, buttons, inputs)
- [x] Implementar tema claro/escuro
- [x] Configurar AsyncStorage para persistência local

## Fase 2: Tela Home (Dashboard)
- [x] Exibir saldo total em destaque
- [x] Criar cards de resumo (Saldo MP, Despesas, Rendimentos)
- [ ] Implementar gráfico de evolução (últimos 30 dias)
- [x] Listar últimas 5 transações
- [x] Adicionar botão flutuante para nova transação

## Fase 3: Gerenciamento de Transações
- [x] Criar tela de listagem de transações com filtros
- [x] Implementar tela de adicionar/editar transação
- [x] Adicionar categorias de transações (Receita, Despesa, Investimento)
- [x] Implementar exclusão de transações
- [x] Validar e salvar transações no AsyncStorage

## Fase 4: Gerenciamento de Investimentos
- [x] Criar tela de investimentos com resumo
- [ ] Implementar gráfico de composição da carteira (pizza)
- [x] Adicionar funcionalidade de novo investimento
- [x] Listar investimentos com rendimento calculado
- [x] Editar e deletar investimentos

## Fase 5: Relatórios e Análises
- [x] Criar tela de relatórios com gráficos
- [x] Implementar gráfico de barras (gastos por categoria)
- [ ] Implementar gráfico de pizza (distribuição de gastos)
- [x] Adicionar resumo mensal (receita, despesa, saldo)
- [x] Seletor de período (mês/ano)

## Fase 6: Configurações e Extras
- [x] Criar tela de configurações
- [x] Implementar toggle de tema claro/escuro
- [x] Adicionar opção de exportar dados (CSV)
- [x] Adicionar opção de limpar dados
- [x] Tela "Sobre o app"

## Fase 7: Branding e Polimento
- [x] Gerar logo/ícone do app
- [x] Atualizar app.config.ts com branding
- [x] Revisar cores e tipografia
- [ ] Testar responsividade em diferentes tamanhos
- [ ] Revisar acessibilidade

## Fase 8: Testes e Entrega
- [x] Testar fluxos principais end-to-end
- [x] Validar persistência de dados
- [x] Testar em iOS e Android
- [x] Criar checkpoint final
- [x] Entregar ao usuário com instruções

## Fase 9: Integração com Mercado Pago
- [x] Criar tela de conexão com Mercado Pago
- [x] Armazenar saldo da conta Mercado Pago localmente
- [x] Atualizar saldo manualmente
- [x] Exibir saldo MP na tela dedicada

## Fase 10: Gráficos de Evolução
- [x] Criar tela de gráfico de linha (evolução do patrimônio)
- [x] Registrar histórico diário de saldo
- [x] Gráfico mostrando últimos 30/90/365 dias
- [x] Comparação com período anterior

## Fase 11: Metas Financeiras
- [x] Criar tela de metas
- [x] Adicionar/editar/deletar metas
- [x] Calcular progresso das metas
- [ ] Notificações quando atingir metas
- [ ] Visualizar metas na Home
