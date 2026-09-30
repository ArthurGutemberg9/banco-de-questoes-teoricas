import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CircleAlert,
  CircleCheck,
  Cloud,
  CloudOff,
  Database,
  LoaderCircle,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import DeleteConfirmation from "./components/DeleteConfirmation";
import QuestionCard from "./components/QuestionCard";
import QuestionForm from "./components/QuestionForm";
import { ensureAnonymousUser, firebaseConfigured } from "./lib/firebase";
import { UserVisibleError } from "./lib/errors";
import type { Question, QuestionInput } from "./types/question";

interface ToastMessage {
  kind: "success" | "error";
  message: string;
}

function firebaseMessage(error: unknown): string {
  const code = typeof error === "object" && error !== null && "code" in error
    ? String((error as { code?: unknown }).code)
    : "";

  if (code === "auth/operation-not-allowed") {
    return "Ative o método de login Anônimo em Authentication no Firebase Console.";
  }
  if (code === "permission-denied" || code === "firestore/permission-denied") {
    return "O Firestore recusou o acesso. Confira se as regras de firestore.rules foram publicadas e se o login anônimo está ativo.";
  }
  if (code === "unavailable" || code === "auth/network-request-failed") {
    return "Sem conexão com o Firebase no momento. Verifique a internet e tente novamente.";
  }
  if (code === "failed-precondition") {
    return "O Firestore ainda não está pronto. Confira se o banco foi criado no projeto Firebase.";
  }
  if (error instanceof UserVisibleError) return error.message;
  return "Não foi possível concluir a operação. Confira a configuração do Firebase e tente novamente.";
}

function formatCount(count: number): string {
  return `${count} ${count === 1 ? "questão" : "questões"}`;
}

export default function App() {
  const [ownerUid, setOwnerUid] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [snapshotReady, setSnapshotReady] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastTimer = useRef<number | null>(null);

  const ready = firebaseConfigured && ownerUid !== null && snapshotReady && dataError === null && sessionError === null;

  useEffect(() => {
    if (!firebaseConfigured) return;
    let mounted = true;
    void ensureAnonymousUser()
      .then((uid) => {
        if (mounted) {
          setOwnerUid(uid);
          setSessionError(null);
        }
      })
      .catch((error: unknown) => {
        if (mounted) setSessionError(firebaseMessage(error));
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!ownerUid) return;
    let active = true;
    let unsubscribe: (() => void) | null = null;
    setLoadingQuestions(true);
    setSnapshotReady(false);
    setDataError(null);

    void import("./lib/questions")
      .then(({ subscribeToQuestions }) => {
        if (!active) return;
        return subscribeToQuestions(
          ownerUid,
          (items) => {
            if (!active) return;
            setQuestions(items);
            setLoadingQuestions(false);
            setSnapshotReady(true);
            setDataError(null);
          },
          (error) => {
            if (!active) return;
            setLoadingQuestions(false);
            setSnapshotReady(false);
            setDataError(firebaseMessage(error));
          },
        ).then((stopListening) => {
          if (active) unsubscribe = stopListening;
          else stopListening();
        });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadingQuestions(false);
        setSnapshotReady(false);
        setDataError(firebaseMessage(error));
      });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [ownerUid]);

  useEffect(() => () => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
  }, []);

  const subjects = useMemo(
    () => [...new Set(questions.map((question) => question.subject.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [questions],
  );

  const filteredQuestions = useMemo(() => {
    const normalizedSearch = searchText.trim().toLocaleLowerCase("pt-BR");
    return questions.filter((question) => {
      const matchesSubject = selectedSubject === "all" || question.subject === selectedSubject;
      const matchesSearch = !normalizedSearch || `${question.statement} ${question.subject}`.toLocaleLowerCase("pt-BR").includes(normalizedSearch);
      return matchesSubject && matchesSearch;
    });
  }, [questions, searchText, selectedSubject]);

  const notify = (message: string, kind: ToastMessage["kind"]) => {
    setToast({ message, kind });
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 4500);
  };

  const openNewQuestion = () => {
    if (!ready) return;
    setEditingQuestion(null);
    setFormOpen(true);
  };

  const openEditQuestion = (question: Question) => {
    if (!ready) return;
    setEditingQuestion(question);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    setEditingQuestion(null);
  };

  const saveQuestion = async (values: QuestionInput) => {
    if (!ready || !ownerUid) throw new Error("Conecte o Firebase e aguarde a sincronização antes de salvar.");
    setSaving(true);
    try {
      const questionsApi = await import("./lib/questions");
      if (editingQuestion) {
        await questionsApi.updateQuestion(editingQuestion.id, values);
        notify("Questão atualizada e salva no Firestore.", "success");
      } else {
        await questionsApi.createQuestion(ownerUid, values);
        notify("Questão criada e salva no Firestore.", "success");
      }
      setFormOpen(false);
      setEditingQuestion(null);
    } catch (error) {
      const message = firebaseMessage(error);
      notify(message, "error");
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!questionToDelete) return;
    if (!ready) {
      notify("A conexão com o Firestore não está pronta. A questão não foi excluída; reconecte e tente novamente.", "error");
      return;
    }
    setDeleting(true);
    try {
      const questionsApi = await import("./lib/questions");
      await questionsApi.deleteQuestion(questionToDelete.id);
      notify("Questão excluída do Firestore.", "success");
      setQuestionToDelete(null);
    } catch (error) {
      const message = firebaseMessage(error);
      notify(message, "error");
    } finally {
      setDeleting(false);
    }
  };

  const connectedLabel = !firebaseConfigured
    ? "Aguardando Firebase"
    : sessionError || dataError
      ? "Verifique a conexão"
      : ready
        ? "Firestore conectado"
        : "Conectando...";

  return (
    <div className="app-shell">
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <aside className="sidebar">
        <a className="brand-lockup" href="#inicio" aria-label="Banco de Questões — início">
          <img className="brand-logo" src="/project-icon.png" alt="" />
          <span className="brand-name">Banco de <strong>Questões</strong></span>
        </a>

        <div className="sidebar-section-label">SEU ESPAÇO</div>
        <nav className="sidebar-nav" aria-label="Navegação principal">
          <a className="nav-link is-active" href="#questoes" aria-current="page">
            <BookOpen size={18} strokeWidth={1.8} aria-hidden="true" />
            <span>Questões</span>
            <span className="nav-count">{questions.length}</span>
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="sidebar-note-icon"><Database size={16} aria-hidden="true" /></span>
            <div>
              <strong>Seu caderno, sempre à mão</strong>
              <span>As questões ficam salvas no Firestore.</span>
            </div>
          </div>
          <div className={`sidebar-connection ${ready ? "is-connected" : sessionError || dataError ? "has-error" : ""}`} id="firebase-status">
            {ready ? <Cloud size={16} aria-hidden="true" /> : sessionError || dataError ? <CircleAlert size={16} aria-hidden="true" /> : <CloudOff size={16} aria-hidden="true" />}
            <span>{connectedLabel}</span>
            <span className="connection-dot" aria-hidden="true" />
          </div>
          <div className="sidebar-credit">CADERNO TÉCNICO <span>·</span> 2026</div>
        </div>
      </aside>

      <main className="main-area" id="conteudo">
        <header className="topbar" id="inicio">
          <div className="breadcrumbs"><span>Meu espaço</span><span className="breadcrumb-slash">/</span><strong>Questões</strong></div>
          <div className="topbar-user"><span className="user-avatar">Q</span><span>Área de estudo</span></div>
        </header>

        <div className="workspace" id="questoes">
          <div className="section-kicker"><span className="kicker-line" /> PAINEL DE ESTUDO</div>
          <div className="page-heading-row">
            <div>
              <h1>Banco de questões</h1>
              <p className="page-intro">Um lugar organizado para guardar e revisar boas perguntas.</p>
            </div>
            <button className="button button-primary new-question-button" type="button" onClick={openNewQuestion} disabled={!ready} title={!ready ? "Conecte o Firebase para habilitar o cadastro" : undefined}>
              <Plus size={18} aria-hidden="true" /> Nova questão
            </button>
          </div>

          <div className="summary-row">
            <div className="summary-card">
              <span className="summary-label">NO CADERNO</span>
              <strong className="summary-number">{questions.length.toString().padStart(2, "0")}</strong>
              <span className="summary-detail">{formatCount(questions.length)} cadastradas</span>
            </div>
            <div className="summary-card accent-summary-card">
              <span className="summary-label">ASSUNTOS</span>
              <strong className="summary-number">{subjects.length.toString().padStart(2, "0")}</strong>
              <span className="summary-detail">{subjects.length === 1 ? "tema organizado" : "temas organizados"}</span>
            </div>
            <div className="summary-note">
              <span className="summary-note-mark">“</span>
              <p>Uma boa pergunta<br />também é uma forma de aprender.</p>
              <span className="summary-note-source">ANOTAÇÃO DE ESTUDO</span>
            </div>
          </div>

          {!firebaseConfigured ? (
            <section className="setup-card" aria-labelledby="setup-title">
              <div className="setup-card-icon"><CloudOff size={23} aria-hidden="true" /></div>
              <div className="setup-card-content">
                <span className="dialog-kicker">PRIMEIRO PASSO</span>
                <h2 id="setup-title">Conecte um projeto Firebase</h2>
                <p>Este projeto ainda não tem configuração do Firebase. Para que o cadastro, a edição e a exclusão sejam gravados de verdade, crie um projeto e siga o guia do README.</p>
                <ol className="setup-steps">
                  <li><span>1</span><span>Crie um app Web no Firebase e ative o Firestore.</span></li>
                  <li><span>2</span><span>Ative o login anônimo e publique as regras de segurança.</span></li>
                  <li><span>3</span><span>Preencha as quatro variáveis <code>VITE_FIREBASE_*</code> e reinicie o app.</span></li>
                </ol>
                <p className="setup-honesty"><CircleCheck size={15} aria-hidden="true" /> Nenhuma pergunta será apresentada como salva antes da conexão real.</p>
              </div>
            </section>
          ) : null}

          {sessionError ? (
            <div className="inline-alert error-alert" role="alert"><CircleAlert size={18} aria-hidden="true" /><span>{sessionError}</span></div>
          ) : null}
          {dataError ? (
            <div className="inline-alert error-alert" role="alert"><CircleAlert size={18} aria-hidden="true" /><span>{dataError}</span></div>
          ) : null}

          <div className="list-heading-row">
            <div>
              <h2>Suas questões <span className="list-count">{ready ? questions.length : "—"}</span></h2>
              <p>Consulte os enunciados e confira os gabaritos.</p>
            </div>
            <div className="list-tools">
              <label className="search-field">
                <Search size={17} aria-hidden="true" />
                <span className="sr-only">Buscar por enunciado ou assunto</span>
                <input type="search" placeholder="Buscar questão..." value={searchText} onChange={(event) => setSearchText(event.target.value)} disabled={!ready} />
              </label>
              <label className="subject-filter">
                <SlidersHorizontal size={16} aria-hidden="true" />
                <span className="sr-only">Filtrar por assunto</span>
                <select value={selectedSubject} onChange={(event) => setSelectedSubject(event.target.value)} disabled={!ready}>
                  <option value="all">Todos os assuntos</option>
                  {subjects.map((subject) => <option value={subject} key={subject}>{subject}</option>)}
                </select>
              </label>
            </div>
          </div>

          {!firebaseConfigured ? (
            <div className="list-placeholder">
              <div className="placeholder-rule" />
              <span className="placeholder-icon"><BookOpen size={22} aria-hidden="true" /></span>
              <strong>O caderno está pronto para receber questões</strong>
              <span>Assim que o Firestore for conectado, suas perguntas aparecem aqui.</span>
            </div>
          ) : sessionError || dataError ? (
            <div className="empty-state error-state">
              <div className="empty-icon error-empty-icon"><CircleAlert size={24} aria-hidden="true" /></div>
              <h3>Não foi possível carregar o caderno</h3>
              <p>Confira as variáveis do Firebase, o login anônimo e as regras do Firestore no README.</p>
            </div>
          ) : loadingQuestions || !snapshotReady ? (
            <div className="empty-state loading-state" aria-live="polite"><LoaderCircle className="spin" size={23} aria-hidden="true" /><span>Sincronizando com o Firestore...</span></div>
          ) : questions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><BookOpen size={24} aria-hidden="true" /></div>
              <span className="dialog-kicker">PÁGINA EM BRANCO</span>
              <h3>Seu caderno ainda está vazio</h3>
              <p>Cadastre a primeira pergunta para começar a organizar seus estudos.</p>
              <button className="button button-secondary" type="button" onClick={openNewQuestion}><Plus size={17} aria-hidden="true" /> Cadastrar primeira questão</button>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="empty-state compact-empty">
              <div className="empty-icon"><Search size={22} aria-hidden="true" /></div>
              <h3>Nenhuma questão encontrada</h3>
              <p>Tente outro termo ou limpe o filtro de assunto.</p>
              <button className="text-button" type="button" onClick={() => { setSearchText(""); setSelectedSubject("all"); }}>Limpar filtros <ArrowRight size={15} aria-hidden="true" /></button>
            </div>
          ) : (
            <div className="question-list">
              {filteredQuestions.map((question, index) => (
                <QuestionCard key={question.id} question={question} number={index + 1} onEdit={openEditQuestion} onDelete={setQuestionToDelete} />
              ))}
            </div>
          )}

          <footer className="page-footer"><span>Banco de Questões</span><span className="footer-separator">·</span><span>Um caderno de estudo, feito para durar.</span></footer>
        </div>
      </main>

      {formOpen ? <QuestionForm key={editingQuestion?.id ?? "new-question"} initialQuestion={editingQuestion} saving={saving} onClose={closeForm} onSave={saveQuestion} /> : null}
      {questionToDelete ? <DeleteConfirmation question={questionToDelete} deleting={deleting} onCancel={() => { if (!deleting) setQuestionToDelete(null); }} onConfirm={() => { void confirmDelete(); }} /> : null}
      {toast ? <div className={`toast-message ${toast.kind === "error" ? "toast-error" : "toast-success"}`} role={toast.kind === "error" ? "alert" : "status"}>
        {toast.kind === "error" ? <CircleAlert size={18} aria-hidden="true" /> : <CircleCheck size={18} aria-hidden="true" />}
        <span>{toast.message}</span>
      </div> : null}
    </div>
  );
}
