import { useEffect, useState, type FormEvent, type MouseEvent } from "react";
import { Check, LoaderCircle, X } from "lucide-react";
import { OPTION_COUNT, OPTION_LABELS, validateQuestion, type Question, type QuestionInput, type QuestionOptions } from "../types/question";

interface QuestionFormProps {
  initialQuestion: Question | null;
  saving: boolean;
  onClose: () => void;
  onSave: (values: QuestionInput) => Promise<void>;
}

const emptyQuestion: QuestionInput = {
  statement: "",
  subject: "",
  options: ["", "", "", ""],
  correctOptionIndex: 0,
};

function toFormValues(question: Question | null): QuestionInput {
  if (!question) return { ...emptyQuestion, options: [...emptyQuestion.options] as QuestionOptions };
  return {
    statement: question.statement,
    subject: question.subject,
    options: [...question.options] as QuestionOptions,
    correctOptionIndex: question.correctOptionIndex,
  };
}

export default function QuestionForm({ initialQuestion, saving, onClose, onSave }: QuestionFormProps) {
  const [values, setValues] = useState<QuestionInput>(() => toFormValues(initialQuestion));
  const [error, setError] = useState<string | null>(null);
  const editing = initialQuestion !== null;

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, saving]);

  const updateOption = (index: number, value: string) => {
    setValues((current) => {
      const options = [...current.options] as QuestionOptions;
      options[index] = value;
      return { ...current, options };
    });
    setError(null);
  };

  const handleBackdrop = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !saving) onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateQuestion(values);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    try {
      await onSave(values);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar a questão. Tente novamente.");
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={handleBackdrop}>
      <section className="question-dialog" role="dialog" aria-modal="true" aria-labelledby="question-dialog-title">
        <div className="dialog-header">
          <div>
            <span className="dialog-kicker">{editing ? "ATUALIZAÇÃO DO CADERNO" : "NOVA FICHA DE ESTUDO"}</span>
            <h2 id="question-dialog-title">{editing ? "Editar questão" : "Nova questão"}</h2>
            <p>Preencha o enunciado e marque a alternativa correta.</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} disabled={saving} aria-label="Fechar formulário">
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <form className="question-form" onSubmit={handleSubmit} noValidate>
          <label className="form-field" htmlFor="question-subject">
            <span>Assunto <span className="optional-label">opcional</span></span>
            <input
              id="question-subject"
              type="text"
              maxLength={60}
              placeholder="Ex.: História do Brasil"
              value={values.subject}
              onChange={(event) => {
                setValues((current) => ({ ...current, subject: event.target.value }));
                setError(null);
              }}
            />
          </label>

          <label className="form-field" htmlFor="question-statement">
            <span>Enunciado <span className="required-mark">*</span></span>
            <textarea
              id="question-statement"
              rows={3}
              maxLength={2000}
              placeholder="Escreva a pergunta de forma clara..."
              value={values.statement}
              onChange={(event) => {
                setValues((current) => ({ ...current, statement: event.target.value }));
                setError(null);
              }}
              autoFocus
            />
            <span className="field-hint">{values.statement.length}/2000 caracteres</span>
          </label>

          <fieldset className="options-fieldset">
            <legend>Alternativas <span className="required-mark">*</span></legend>
            <p className="fieldset-hint">Marque a letra que corresponde ao gabarito.</p>
            <div className="option-editor-list">
              {Array.from({ length: OPTION_COUNT }, (_, index) => (
                <div className={`option-editor ${values.correctOptionIndex === index ? "selected" : ""}`} key={OPTION_LABELS[index]}>
                  <label className="correct-radio" htmlFor={`correct-${index}`}>
                    <input
                      id={`correct-${index}`}
                      type="radio"
                      name="correct-answer"
                      value={index}
                      checked={values.correctOptionIndex === index}
                      onChange={() => {
                        setValues((current) => ({ ...current, correctOptionIndex: index }));
                        setError(null);
                      }}
                    />
                    <span className="radio-mark" aria-hidden="true">{values.correctOptionIndex === index ? <Check size={13} /> : null}</span>
                    <span className="option-letter">{OPTION_LABELS[index]}</span>
                  </label>
                  <input
                    className="option-input"
                    type="text"
                    maxLength={400}
                    aria-label={`Texto da alternativa ${OPTION_LABELS[index]}`}
                    placeholder={`Alternativa ${OPTION_LABELS[index]}`}
                    value={values.options[index]}
                    onChange={(event) => updateOption(index, event.target.value)}
                  />
                  <span className={`answer-tag ${values.correctOptionIndex === index ? "visible" : ""}`}>
                    {values.correctOptionIndex === index ? "Correta" : ""}
                  </span>
                </div>
              ))}
            </div>
          </fieldset>

          {error ? <p className="form-error" role="alert">{error}</p> : null}

          <div className="dialog-actions">
            <button className="button button-secondary" type="button" onClick={onClose} disabled={saving}>Cancelar</button>
            <button className="button button-primary" type="submit" disabled={saving}>
              {saving ? <LoaderCircle className="spin" size={17} aria-hidden="true" /> : <Check size={17} aria-hidden="true" />}
              {saving ? "Salvando..." : editing ? "Salvar alterações" : "Salvar questão"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
