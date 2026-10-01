export interface Example {
  label: string;
  post: string;
}

export const EXAMPLES: readonly Example[] = [
  {
    label: "Lição de vida",
    post: "Fui demitido hoje. E sabe o que eu aprendi? Que a vida é feita de ciclos. Gratidão a cada um que fez parte dessa jornada! 🙏 #resiliencia #gratidao",
  },
  {
    label: "Projeto técnico",
    post: "Publiquei um projeto open source: um harness que avalia agentes de IA com cenários, checagens determinísticas e um juiz calibrado. O achado mais interessante: uma regra de prompt escrita para evitar respostas inventadas fazia o agente inventá-las. Código e estudo de caso no GitHub.",
  },
  {
    label: "Vaga aberta",
    post: "Estamos contratando! Vaga para pessoa desenvolvedora backend Node.js, remoto, CLT, com plano de saúde e horário flexível. Candidaturas pelo link nos comentários.",
  },
];
