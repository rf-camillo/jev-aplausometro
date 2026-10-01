/**
 * Every persona gets the same ten seats, so each seat is a tenth of its reactions: "7 of 10
 * recruiters rolled their eyes". It also gives every persona the same weight in the meter.
 */
export const SEATS_PER_PERSONA = 10;

interface PersonaSpec {
  id: string;
  name: string;
  /** Who this reader is, in the words Jev reads. */
  reader: string;
  /** Who this reader is, in a few words for the page. */
  blurb: string;
  seats: number;
  /** False for the readers who react for the fun of it: they sit in the audience but stay out of the meter. */
  inMeter: boolean;
}

export const PERSONAS = [
  {
    id: "recruiter",
    name: "Recrutadora",
    reader: "uma recrutadora de tecnologia que lê dezenas de posts por dia procurando candidatos",
    blurb: "Lê dezenas de posts por dia",
    seats: SEATS_PER_PERSONA,
    inMeter: true,
  },
  {
    id: "senior_dev",
    name: "Dev Sênior",
    reader: "um desenvolvedor sênior cético, que não tem paciência para frases motivacionais",
    blurb: "Sem paciência para frase feita",
    seats: SEATS_PER_PERSONA,
    inMeter: true,
  },
  {
    id: "junior_dev",
    name: "Dev Júnior",
    reader: "um desenvolvedor júnior procurando o primeiro emprego e inspiração",
    blurb: "Atrás do primeiro emprego",
    seats: SEATS_PER_PERSONA,
    inMeter: true,
  },
  {
    id: "founder",
    name: "Fundadora",
    reader: "uma fundadora de startup ocupada, que valoriza resultado e objetividade",
    blurb: "Quer resultado, sem rodeio",
    seats: SEATS_PER_PERSONA,
    inMeter: true,
  },
  {
    id: "investor",
    name: "Investidor",
    reader: "um investidor de venture capital atento a tração, números e ambição",
    blurb: "De olho em tração e números",
    seats: SEATS_PER_PERSONA,
    inMeter: true,
  },
  {
    id: "hr_manager",
    name: "Gerente de RH",
    reader: "uma gerente de RH que gosta de posts sobre cultura, carreira e pessoas",
    blurb: "Gosta de cultura e pessoas",
    seats: SEATS_PER_PERSONA,
    inMeter: true,
  },
  {
    id: "product_manager",
    name: "PM",
    reader: "um product manager que gosta de aprendizados práticos e bem explicados",
    blurb: "Quer aprendizado prático",
    seats: SEATS_PER_PERSONA,
    inMeter: true,
  },
  {
    id: "designer",
    name: "Designer",
    reader: "uma designer que repara em clareza, forma e autenticidade do texto",
    blurb: "Repara em clareza e forma",
    seats: SEATS_PER_PERSONA,
    inMeter: true,
  },
  {
    id: "client",
    name: "Cliente",
    reader: "um gestor de uma empresa cliente, avaliando se confiaria no autor",
    blurb: "Decide se confia no autor",
    seats: SEATS_PER_PERSONA,
    inMeter: true,
  },
  {
    id: "uncle",
    name: "Tio do Zap",
    reader: "o tio do grupo da família no WhatsApp, que adora uma lição de vida",
    blurb: "Adora uma lição de vida",
    seats: SEATS_PER_PERSONA,
    inMeter: false,
  },
  {
    id: "mom",
    name: "Mãe",
    reader: "a mãe do autor, orgulhosa de tudo que o filho publica",
    blurb: "Orgulhosa de tudo que você posta",
    seats: SEATS_PER_PERSONA,
    inMeter: false,
  },
  {
    id: "coach",
    name: "Coach",
    reader: "um coach de LinkedIn que publica frases motivacionais todos os dias",
    blurb: "Frase motivacional todo dia",
    seats: SEATS_PER_PERSONA,
    inMeter: false,
  },
] as const satisfies readonly PersonaSpec[];

export type Persona = (typeof PERSONAS)[number];
/** Every persona's id, so a map keyed by persona that misses one does not compile. */
export type PersonaId = Persona["id"];

const BY_ID = new Map<string, Persona>(PERSONAS.map((persona) => [persona.id, persona]));

export function findPersona(id: string): Persona | undefined {
  return BY_ID.get(id);
}

export const TOTAL_SEATS = PERSONAS.reduce((sum, persona) => sum + persona.seats, 0);

export const METER_SEATS = PERSONAS.reduce(
  (sum, persona) => sum + (persona.inMeter ? persona.seats : 0),
  0,
);
