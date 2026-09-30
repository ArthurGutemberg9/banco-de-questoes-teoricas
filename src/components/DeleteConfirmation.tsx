import { LoaderCircle, Trash2, X } from "lucide-react";
import type { Question } from "../types/question";

interface DeleteConfirmationProps {
  question: Question;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmation({ question, deleting, onCancel, onConfirm }: DeleteConfirmationProps) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !deleting) onCancel();
    }}>
      <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-dialog-title" aria-describedby="delete-dialog-description">
        <button className="icon-button confirm-close" type="button" onClick={onCancel} disabled={deleting} aria-label="Fechar confirmação">
          <X size={18} aria-hidden="true" />
        </button>
        <div className="confirm-icon"><Trash2 size={22} aria-hidden="true" /></div>
        <span className="dialog-kicker">ATENÇÃO</span>
        <h2 id="delete-dialog-title">Excluir esta questão?</h2>
        <p id="delete-dialog-description">“{question.statement}”</p>
        <p className="confirm-note">Essa ação remove a questão do Firestore e não pode ser desfeita.</p>
        <div className="dialog-actions confirm-actions">
          <button className="button button-secondary" type="button" onClick={onCancel} disabled={deleting}>Manter questão</button>
          <button className="button button-danger" type="button" onClick={onConfirm} disabled={deleting}>
            {deleting ? <LoaderCircle className="spin" size={17} aria-hidden="true" /> : <Trash2 size={16} aria-hidden="true" />}
            {deleting ? "Excluindo..." : "Excluir questão"}
          </button>
        </div>
      </section>
    </div>
  );
}
