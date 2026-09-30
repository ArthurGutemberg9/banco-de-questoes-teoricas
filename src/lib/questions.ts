import * as sdk from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { UserVisibleError } from "./errors";
import { getFirebaseApp } from "./firebase";
import { validateQuestion, type Question, type QuestionInput, type QuestionOptions } from "../types/question";

const QUESTIONS_COLLECTION = "questions";

async function loadFirestore() {
  const app = await getFirebaseApp();
  return { db: sdk.getFirestore(app), sdk };
}

function readQuestion(id: string, data: DocumentData, ownerUid: string): Question {
  const options = data.options;
  const validOptions = Array.isArray(options) && options.length === 4 && options.every((value) => typeof value === "string");
  const validIndex = Number.isInteger(data.correctOptionIndex) && data.correctOptionIndex >= 0 && data.correctOptionIndex < 4;

  if (
    typeof data.ownerUid !== "string" ||
    data.ownerUid !== ownerUid ||
    typeof data.statement !== "string" ||
    typeof data.subject !== "string" ||
    !validOptions ||
    !validIndex
  ) {
    throw new UserVisibleError("Uma questão salva está fora do formato esperado. Revise os dados no Firestore.");
  }

  const input: QuestionInput = {
    statement: data.statement,
    subject: data.subject,
    options: [...options] as QuestionOptions,
    correctOptionIndex: data.correctOptionIndex,
  };
  const validationError = validateQuestion(input);
  const fieldsAreNormalized =
    input.statement === input.statement.trim() &&
    input.subject === input.subject.trim() &&
    input.options.every((option) => option === option.trim());

  if (
    validationError ||
    !fieldsAreNormalized ||
    !(data.createdAt instanceof sdk.Timestamp) ||
    !(data.updatedAt instanceof sdk.Timestamp)
  ) {
    throw new UserVisibleError("Uma questão salva está fora do formato esperado. Revise os dados no Firestore.");
  }

  return {
    ...input,
    id,
    ownerUid,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function subscribeToQuestions(
  ownerUid: string,
  onQuestions: (questions: Question[]) => void,
  onError: (error: Error) => void,
): Promise<() => void> {
  const { db, sdk } = await loadFirestore();
  const questionsQuery = sdk.query(
    sdk.collection(db, QUESTIONS_COLLECTION),
    sdk.where("ownerUid", "==", ownerUid),
  );

  return sdk.onSnapshot(
    questionsQuery,
    (snapshot) => {
      try {
        const questions = snapshot.docs.map((questionDoc) =>
          readQuestion(questionDoc.id, questionDoc.data({ serverTimestamps: "estimate" }), ownerUid),
        );
        questions.sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis());
        onQuestions(questions);
      } catch (error) {
        onError(error instanceof Error ? error : new UserVisibleError("Não foi possível ler as questões salvas."));
      }
    },
    (error) => onError(error),
  );
}

export async function createQuestion(ownerUid: string, input: QuestionInput): Promise<void> {
  if (!ownerUid.trim()) throw new UserVisibleError("A sessão do Firebase não está pronta. Aguarde a conexão e tente novamente.");
  const validationError = validateQuestion(input);
  if (validationError) throw new UserVisibleError(validationError);
  const { db, sdk } = await loadFirestore();
  await sdk.addDoc(sdk.collection(db, QUESTIONS_COLLECTION), {
    ...input,
    statement: input.statement.trim(),
    subject: input.subject.trim(),
    options: input.options.map((option) => option.trim()),
    ownerUid,
    createdAt: sdk.serverTimestamp(),
    updatedAt: sdk.serverTimestamp(),
  });
}

export async function updateQuestion(questionId: string, input: QuestionInput): Promise<void> {
  const validationError = validateQuestion(input);
  if (validationError) throw new UserVisibleError(validationError);
  const { db, sdk } = await loadFirestore();
  await sdk.updateDoc(sdk.doc(db, QUESTIONS_COLLECTION, questionId), {
    ...input,
    statement: input.statement.trim(),
    subject: input.subject.trim(),
    options: input.options.map((option) => option.trim()),
    updatedAt: sdk.serverTimestamp(),
  });
}

export async function deleteQuestion(questionId: string): Promise<void> {
  const { db, sdk } = await loadFirestore();
  await sdk.deleteDoc(sdk.doc(db, QUESTIONS_COLLECTION, questionId));
}
