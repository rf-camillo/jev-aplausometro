# Checagem de sensibilidade

Rodada em 2026-10-01 com o Jev de verdade (`npm run sensitivity`). Cada linha compara dois posts que diferem em um só aspecto e diz se a plateia se moveu como um leitor esperaria. O resultado é publicado como saiu, inclusive o que falhou.

**5 de 5 checagens passaram.** Latência mediana: 334 ms por avaliação, com as 17 perguntas numa chamada só.

| Checagem          | Esperado                                     | Aplauso | Revira os olhos | Clichê     | Parece IA | Chamada para ação | Distância |     |
| ----------------- | -------------------------------------------- | ------- | --------------- | ---------- | --------- | ----------------- | --------- | --- |
| Clichê            | clichê e revirar de olhos sobem, aplauso cai | 79 → 45 | 2% → 36%        | 11% → 50%  | 31% → 55% | 3% → 2%           | 0.412     | ✅  |
| Paráfrase         | aplauso muda no máximo 10 pontos             | 79 → 75 | 2% → 4%         | 11% → 27%  | 31% → 34% | 3% → 3%           | 0.073     | ✅  |
| Chamada para ação | chamada para ação sobe mais de 20 pontos     | 36 → 34 | 23% → 31%       | 25% → 46%  | 29% → 32% | 7% → 98%          | 0.128     | ✅  |
| Tom de IA         | “parece IA” sobe mais de 20 pontos           | 47 → 2  | 25% → 76%       | 22% → 100% | 21% → 85% | 2% → 3%           | 0.566     | ✅  |
| Repetição         | o aplauso muda no máximo 2 pontos            | 79 → 79 | 3% → 2%         | 10% → 11%  | 30% → 30% | 3% → 3%           | 0.032     | ✅  |

A **distância** é a média, entre as 12 personas, da distância de variação total entre as duas distribuições de reação: 0 é a mesma plateia, 1 é uma plateia completamente diferente.

## As perguntas

- **Clichê:** Frases de efeito e hashtags motivacionais pioram a recepção?
- **Paráfrase:** O mesmo conteúdo com outras palavras mantém a plateia?
- **Chamada para ação:** Pedir uma ação clara é percebido?
- **Tom de IA:** Um texto com cara de IA é reconhecido?
- **Repetição:** O mesmo post avaliado duas vezes dá o mesmo resultado?

## Os posts

### Clichê

**A.** Terminei a migração do nosso sistema de pagamentos para filas assíncronas. O tempo de resposta do checkout caiu de 2,1 s para 380 ms, e os erros em horário de pico sumiram. O que mais ajudou foi medir antes de mexer: descobrimos que 70% do tempo estava em chamadas que podiam esperar.

**B.** Terminei a migração do nosso sistema de pagamentos para filas assíncronas. O tempo de resposta do checkout caiu de 2,1 s para 380 ms, e os erros em horário de pico sumiram. O que mais ajudou foi medir antes de mexer: descobrimos que 70% do tempo estava em chamadas que podiam esperar. Gratidão ao universo por essa jornada! 🙏 Nunca desista dos seus sonhos, o sucesso é uma escolha diária. #resiliencia #mindset #gratidao #foco

### Paráfrase

**A.** Terminei a migração do nosso sistema de pagamentos para filas assíncronas. O tempo de resposta do checkout caiu de 2,1 s para 380 ms, e os erros em horário de pico sumiram. O que mais ajudou foi medir antes de mexer: descobrimos que 70% do tempo estava em chamadas que podiam esperar.

**B.** Migrei o sistema de pagamentos para filas assíncronas. O checkout passou de 2,1 s para 380 ms de resposta, e os erros nos horários de pico acabaram. A lição: medir antes de mudar. 70% do tempo estava em chamadas que podiam esperar.

### Chamada para ação

**A.** Estamos contratando uma pessoa desenvolvedora backend Node.js, remoto, CLT, com plano de saúde e horário flexível.

**B.** Estamos contratando uma pessoa desenvolvedora backend Node.js, remoto, CLT, com plano de saúde e horário flexível. Candidate-se pelo link nos comentários até sexta-feira!

### Tom de IA

**A.** Semana puxada: o deploy de sexta quebrou o login de metade dos clientes e passei o sábado com o time consertando. Aprendi a não subir nada grande na sexta.

**B.** Em um mundo cada vez mais dinâmico e desafiador, é fundamental destacar a importância de práticas robustas de deploy. Nesse contexto, vale ressaltar que a resiliência é essencial para potencializar resultados e alavancar a excelência operacional.

### Repetição

**A.** Terminei a migração do nosso sistema de pagamentos para filas assíncronas. O tempo de resposta do checkout caiu de 2,1 s para 380 ms, e os erros em horário de pico sumiram. O que mais ajudou foi medir antes de mexer: descobrimos que 70% do tempo estava em chamadas que podiam esperar.

**B.** Terminei a migração do nosso sistema de pagamentos para filas assíncronas. O tempo de resposta do checkout caiu de 2,1 s para 380 ms, e os erros em horário de pico sumiram. O que mais ajudou foi medir antes de mexer: descobrimos que 70% do tempo estava em chamadas que podiam esperar.
