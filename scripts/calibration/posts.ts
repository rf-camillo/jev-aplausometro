import type { Metric } from "../../src/lib/audience/metrics";
import type { PersonaId } from "../../src/lib/audience/personas";

/**
 * What a reader would expect from a post. A persona is pleased from `PLEASED` of its applause
 * up and displeased up to `DISPLEASED`; a metric is high from `HIGH` and low up to `LOW`.
 */
export interface Expectation {
  applause?: [min: number, max: number];
  pleased?: PersonaId[];
  displeased?: PersonaId[];
  /** The first persona applauds more than the second. */
  above?: [PersonaId, PersonaId][];
  metrics?: Partial<Record<Metric, "high" | "low">>;
}

export interface CalibrationPost {
  id: string;
  text: string;
  expect: Expectation;
}

export const PLEASED = 0.6;
export const DISPLEASED = 0.35;
export const HIGH = 0.6;
export const LOW = 0.4;

export const POSTS: CalibrationPost[] = [
  {
    id: "tecnico-com-numeros",
    text: "Terminei a migração do nosso sistema de pagamentos para filas assíncronas. O tempo de resposta do checkout caiu de 2,1 s para 380 ms, e os erros em horário de pico sumiram. O que mais ajudou foi medir antes de mexer: descobrimos que 70% do tempo estava em chamadas que podiam esperar.",
    expect: {
      applause: [55, 100],
      pleased: ["senior_dev"],
      metrics: { clarity: "high", cliche: "low", soundsLikeAi: "low" },
    },
  },
  {
    id: "tecnico-com-cliche",
    text: "Terminei a migração do nosso sistema de pagamentos para filas assíncronas. O tempo de resposta do checkout caiu de 2,1 s para 380 ms, e os erros em horário de pico sumiram. Gratidão ao universo por essa jornada! 🙏 Nunca desista dos seus sonhos, o sucesso é uma escolha diária. #resiliencia #mindset #gratidao #foco",
    // Half of it is real technical work, so the cliché reads in the middle: no expectation on it.
    expect: { above: [["coach", "senior_dev"]] },
  },
  {
    id: "demissao-gratidao",
    text: "Hoje fui demitido. E sabe o que eu senti? Gratidão. 🙏 A vida é feita de ciclos, e quando uma porta se fecha, outra se abre. Não é sobre o cargo, é sobre a jornada. Obrigado a todos que fizeram parte dessa caminhada. O melhor ainda está por vir! #gratidao #recomeço #carreira",
    expect: {
      applause: [10, 50],
      displeased: ["senior_dev"],
      above: [["uncle", "senior_dev"]],
      metrics: { cliche: "high", authenticity: "low" },
    },
  },
  {
    id: "humblebrag",
    text: "Essa semana recusei três propostas de big techs. Não é sobre dinheiro, é sobre propósito. Quando você entende o seu valor, para de aceitar menos do que merece. Fica a reflexão.",
    expect: {
      applause: [0, 45],
      displeased: ["senior_dev", "recruiter"],
      metrics: { cliche: "high" },
    },
  },
  {
    id: "texto-de-ia",
    text: "Em um mundo cada vez mais dinâmico e desafiador, é fundamental destacar a importância de práticas robustas de deploy. Nesse contexto, vale ressaltar que a resiliência é essencial para potencializar resultados e alavancar a excelência operacional.",
    expect: {
      applause: [0, 45],
      displeased: ["senior_dev"],
      metrics: { soundsLikeAi: "high", authenticity: "low" },
    },
  },
  {
    id: "vaga-com-chamada",
    text: "Estamos contratando uma pessoa desenvolvedora backend Node.js, pleno, remoto, CLT, salário de R$ 9 a 12 mil, plano de saúde e horário flexível. Processo em duas etapas, com retorno para todo mundo. Candidate-se pelo link nos comentários até sexta-feira.",
    expect: {
      pleased: ["recruiter"],
      above: [["recruiter", "investor"]],
      metrics: { callToAction: "high", clarity: "high" },
    },
  },
  {
    id: "vaga-sem-chamada",
    text: "Estamos contratando uma pessoa desenvolvedora backend Node.js, pleno, remoto, CLT, com plano de saúde e horário flexível.",
    expect: { metrics: { callToAction: "low" } },
  },
  {
    id: "rodada-de-investimento",
    text: "Fechamos nossa rodada seed de R$ 4 milhões. Em 14 meses saímos de zero para R$ 180 mil de receita recorrente mensal, crescendo 15% ao mês, com churn de 1,8%. O dinheiro vai para dobrar o time de produto e abrir o mercado do Chile.",
    expect: {
      pleased: ["investor", "founder"],
      above: [["investor", "hr_manager"]],
      metrics: { clarity: "high", cliche: "low" },
    },
  },
  {
    id: "aprendizado-de-produto",
    text: "Fiz 50 entrevistas com usuários nos últimos dois meses. Três coisas que mudaram o nosso roadmap: 1) quem cancela não reclama do preço, reclama de não achar o relatório; 2) ninguém usa o filtro avançado, todo mundo exporta para planilha; 3) o onboarding perde 40% das pessoas no segundo passo. Cortamos duas features e redesenhamos o onboarding.",
    expect: {
      applause: [50, 100],
      pleased: ["product_manager"],
      metrics: { clarity: "high", cliche: "low", authenticity: "high" },
    },
  },
  {
    id: "acessibilidade",
    text: "Aumentamos o contraste e o tamanho da fonte do nosso app depois de ver gravações de sessões de pessoas com mais de 60 anos. A conversão desse público subiu 12%, e a dos outros não caiu. Acessibilidade não é caridade, é produto.",
    expect: { pleased: ["designer", "product_manager"], metrics: { clarity: "high" } },
  },
  {
    id: "semana-de-quatro-dias",
    text: "Há seis meses testamos a semana de quatro dias com o time de 40 pessoas. As entregas por sprint ficaram iguais, os pedidos de demissão caíram de 9 para 2 no período e o eNPS foi de 12 para 48. Vamos manter, e escrevi tudo o que deu errado no caminho no link abaixo.",
    expect: { pleased: ["hr_manager"], metrics: { clarity: "high", cliche: "low" } },
  },
  {
    id: "primeiro-emprego",
    text: "Depois de 140 candidaturas e 11 entrevistas, consegui meu primeiro emprego como desenvolvedor. O que mudou o jogo foi parar de mandar currículo genérico e mostrar um projeto que resolvia um problema da empresa. Se você está nessa, posso revisar seu portfólio.",
    expect: {
      applause: [50, 100],
      pleased: ["junior_dev"],
      metrics: { authenticity: "high", soundsLikeAi: "low" },
    },
  },
  {
    id: "certificacao",
    text: "Passei na certificação AWS Solutions Architect Associate, depois de três meses estudando à noite. O que mais caiu foi rede e custos; deixo nos comentários o material que usei.",
    expect: { pleased: ["junior_dev"], metrics: { clarity: "high" } },
  },
  {
    id: "caso-de-cliente",
    text: "Uma rede de clínicas perdia 28% das consultas por falta. Trocamos o lembrete por SMS por uma conversa no WhatsApp que confirma, remarca ou cancela, e em três meses as faltas caíram para 11%. A parte difícil não foi a tecnologia: foi convencer a recepção a confiar no remarcamento automático.",
    expect: {
      pleased: ["client", "founder"],
      metrics: { clarity: "high", authenticity: "high", cliche: "low" },
    },
  },
  {
    id: "curso-milagroso",
    text: "Quer sair do zero e virar dev sênior em 30 dias? 🚀 Meu método já transformou mais de 5 mil vidas! Últimas vagas com 70% de desconto, só até meia-noite. Comenta EU QUERO que eu te mando o link! 🔥🔥🔥",
    expect: {
      applause: [0, 40],
      displeased: ["senior_dev", "recruiter"],
      metrics: { callToAction: "high", cliche: "high" },
    },
  },
  {
    id: "opiniao-arrogante",
    text: "Se você ainda escreve testes unitários em 2026, sinto muito, mas está ficando para trás. Quem é bom de verdade não precisa de teste. O mercado vai separar quem entendeu isso de quem não entendeu.",
    expect: { applause: [0, 45], displeased: ["senior_dev"] },
  },
  {
    id: "bom-dia-generico",
    text: "Bom dia, rede! Segunda-feira é dia de foco e determinação. Vamos com tudo! 💪",
    expect: {
      applause: [0, 50],
      displeased: ["senior_dev", "investor"],
      metrics: { cliche: "high" },
    },
  },
  {
    id: "licao-do-motorista",
    text: "O motorista do Uber me ensinou mais sobre liderança do que meu MBA. Ele chegou cinco minutos antes, ofereceu água e perguntou se a temperatura estava boa. Liderança é isso: servir. Concorda?",
    expect: {
      above: [["uncle", "senior_dev"]],
      displeased: ["senior_dev"],
      metrics: { cliche: "high" },
    },
  },
  {
    id: "desabafo-burnout",
    text: "Passei três meses fingindo que estava tudo bem. Dormia quatro horas, respondia mensagem de madrugada e achava que isso era ser dedicado. Quem percebeu foi minha filha, que perguntou por que eu não ria mais. Tirei duas semanas, comecei terapia e ainda estou aprendendo a desligar.",
    expect: {
      pleased: ["hr_manager"],
      metrics: { authenticity: "high", soundsLikeAi: "low", cliche: "low" },
    },
  },
  {
    id: "texto-confuso",
    text: "Então sobre aquilo que eu falei semana passada do lance da arquitetura que a gente tava vendo com o pessoal do outro time e que ninguém concordou mas depois meio que sim, enfim, acho que é isso, deu certo mais ou menos, depois explico melhor.",
    expect: { applause: [0, 45], metrics: { clarity: "low" } },
  },
  {
    id: "artigo-sem-opiniao",
    text: "Interessante esse artigo sobre índices no PostgreSQL 18.",
    expect: { applause: [0, 55] },
  },
];

/** Pairs of posts in which the first should get more applause than the second. */
export const ORDER: [string, string][] = [
  ["tecnico-com-numeros", "tecnico-com-cliche"],
  ["aprendizado-de-produto", "bom-dia-generico"],
  ["primeiro-emprego", "humblebrag"],
  ["caso-de-cliente", "curso-milagroso"],
  ["tecnico-com-numeros", "texto-de-ia"],
  ["desabafo-burnout", "demissao-gratidao"],
];
