import { Check, Pencil, Trash2 } from "lucide-react";
import { OPTION_LABELS, type Question } from "../types/question";

interface QuestionCardProps {
  question: Question;
  number: number;
  onEdit: (question: Question) => void;
  onDelete: (question: Question) => void;
}

export default function QuestionCard({ question, number, onEdit, onDelete }: QuestionCardProps) {
  return (
    <article className="question-card">
      <div className="question-card-topline">
        <div className="question-index">
          <span className="index-label">QUESTÃO</span>
          <span className="index-number">{String(number).padStart(2, "0")}</span>
        </div>
        {question.subject ? <span className="subject-chip">{question.subject}</span> : <span className="subject-chip muted-chip">Sem assunto</span>}
        <div className="card-actions">
          <button className="icon-button small-icon-button" type="button" onClick={() => onEdit(question)} aria-label={`Editar questão ${number}`}>
            <Pencil size={16} aria-hidden="true" />
          </button>
          <button className="icon-button small-icon-button danger-icon-button" type="button" onClick={() => onDelete(question)} aria-label={`Excluir questão ${number}`}>
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <h3 className="question-statement">{question.statement}</h3>

      <ol className="answer-list" aria-label="Alternativas">
        {question.options.map((option, index) => (
          <li className={`answer-item ${question.correctOptionIndex === index ? "correct-answer" : ""}`} key={`${question.id}-${index}`}>
            <span className="answer-letter">{OPTION_LABELS[index]}</span>
            <span className="answer-copy">{option}</span>
            {question.correctOptionIndex === index ? <span className="answer-check" aria-label="Resposta correta"><Check size={14} aria-hidden="true" /></span> : null}
          </li>
        ))}
      </ol>

      <div className="question-card-foot">
        <span className="answer-summary"><span className="answer-summary-dot" /> Gabarito: {OPTION_LABELS[question.correctOptionIndex]}</span>
        <span className="saved-label">Salva no Firestore</span>
      </div>
    </article>
  );
}
