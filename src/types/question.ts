import type { Timestamp } from "firebase/firestore";

export const OPTION_LABELS = ["A", "B", "C", "D"] as const;
export const OPTION_COUNT = OPTION_LABELS.length;

export type QuestionOptions = [string, string, string, string];

export interface QuestionInput {
  statement: string;
  subject: string;
  options: QuestionOptions;
  correctOptionIndex: number;
}

export interface Question extends QuestionInput {
  id: string;
  ownerUid: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export function validateQuestion(input: QuestionInput): string | null {
  if (!input.statement.trim()) {
    return "Escreva o enunciado da questão.";
  }

  if (input.statement.trim().length < 8) {
    return "O enunciado precisa ter pelo menos 8 caracteres.";
  }

  if (input.statement.trim().length > 2000) {
    return "O enunciado deve ter no máximo 2.000 caracteres.";
  }

  if (input.subject.trim().length > 60) {
    return "O assunto deve ter no máximo 60 caracteres.";
  }

  if (input.options.length !== OPTION_COUNT || input.options.some((option) => !option.trim())) {
    return "Preencha as quatro alternativas antes de salvar.";
  }

  if (input.options.some((option) => option.trim().length > 400)) {
    return "Cada alternativa deve ter no máximo 400 caracteres.";
  }

  const normalizedOptions = input.options.map((option) => option.trim().toLocaleLowerCase("pt-BR"));
  if (new Set(normalizedOptions).size !== OPTION_COUNT) {
    return "As alternativas precisam ser diferentes entre si.";
  }

  if (!Number.isInteger(input.correctOptionIndex) || input.correctOptionIndex < 0 || input.correctOptionIndex >= OPTION_COUNT) {
    return "Marque qual alternativa é a resposta correta.";
  }

  return null;
}
