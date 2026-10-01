import type { Measures } from "./measure";

/** One aspect of a post changed at a time; the audience should move the way a reader would. */
export interface Check {
  name: string;
  question: string;
  a: string;
  b: string;
  expect: (a: Measures, b: Measures) => boolean;
  expectation: string;
}

const BASE =
  "Terminei a migração do nosso sistema de pagamentos para filas assíncronas. O tempo de resposta do checkout caiu de 2,1 s para 380 ms, e os erros em horário de pico sumiram. O que mais ajudou foi medir antes de mexer: descobrimos que 70% do tempo estava em chamadas que podiam esperar.";

export const CHECKS: Check[] = [
  {
    name: "Clichê",
    question: "Frases de efeito e hashtags motivacionais pioram a recepção?",
    a: BASE,
    b: `${BASE} Gratidão ao universo por essa jornada! 🙏 Nunca desista dos seus sonhos, o sucesso é uma escolha diária. #resiliencia #mindset #gratidao #foco`,
    expect: (a, b) => b.cliche > a.cliche && b.eyeroll > a.eyeroll && b.applause < a.applause,
    expectation: "clichê e revirar de olhos sobem, aplauso cai",
  },
  {
    name: "Paráfrase",
    question: "O mesmo conteúdo com outras palavras mantém a plateia?",
    a: BASE,
    b: "Migrei o sistema de pagamentos para filas assíncronas. O checkout passou de 2,1 s para 380 ms de resposta, e os erros nos horários de pico acabaram. A lição: medir antes de mudar. 70% do tempo estava em chamadas que podiam esperar.",
    expect: (a, b) => Math.abs(a.applause - b.applause) <= 10,
    expectation: "aplauso muda no máximo 10 pontos",
  },
  {
    name: "Chamada para ação",
    question: "Pedir uma ação clara é percebido?",
    a: "Estamos contratando uma pessoa desenvolvedora backend Node.js, remoto, CLT, com plano de saúde e horário flexível.",
    b: "Estamos contratando uma pessoa desenvolvedora backend Node.js, remoto, CLT, com plano de saúde e horário flexível. Candidate-se pelo link nos comentários até sexta-feira!",
    expect: (a, b) => b.callToAction > a.callToAction + 0.2,
    expectation: "chamada para ação sobe mais de 20 pontos",
  },
  {
    name: "Tom de IA",
    question: "Um texto com cara de IA é reconhecido?",
    a: "Semana puxada: o deploy de sexta quebrou o login de metade dos clientes e passei o sábado com o time consertando. Aprendi a não subir nada grande na sexta.",
    b: "Em um mundo cada vez mais dinâmico e desafiador, é fundamental destacar a importância de práticas robustas de deploy. Nesse contexto, vale ressaltar que a resiliência é essencial para potencializar resultados e alavancar a excelência operacional.",
    expect: (a, b) => b.soundsLikeAi > a.soundsLikeAi + 0.2,
    expectation: "“parece IA” sobe mais de 20 pontos",
  },
  {
    name: "Repetição",
    question: "O mesmo post avaliado duas vezes dá o mesmo resultado?",
    a: BASE,
    b: BASE,
    // Jev varies a little between calls (a drift of about 0.03), which can move the rounded meter.
    expect: (a, b) => Math.abs(a.applause - b.applause) <= 2,
    expectation: "o aplauso muda no máximo 2 pontos",
  },
];
