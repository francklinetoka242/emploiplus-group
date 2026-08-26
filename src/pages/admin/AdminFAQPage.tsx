import React from "react";
import { faqService, type FAQ, type FAQCategory } from "@/features/faq/api/faqService";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, X, FolderOpen } from "lucide-react";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";

const DEFAULT_FAQ_CATEGORIES = ["Compte", "Services", "Autres"];

export default function AdminFAQPage() {
  const { confirm, confirmationDialog } = useConfirmDialog();
  const [faqs, setFaqs] = React.useState<FAQ[]>([]);
  const [categories, setCategories] = React.useState<FAQCategory[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [question, setQuestion] = React.useState("");
  const [answer, setAnswer] = React.useState("");
  const [category, setCategory] = React.useState<string>(DEFAULT_FAQ_CATEGORIES[0]);
  const [sortOrder, setSortOrder] = React.useState(1);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editQuestion, setEditQuestion] = React.useState("");
  const [editAnswer, setEditAnswer] = React.useState("");
  const [editCategory, setEditCategory] = React.useState<string>(DEFAULT_FAQ_CATEGORIES[0]);
  const [editSortOrder, setEditSortOrder] = React.useState(1);
  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [showForm, setShowForm] = React.useState(false);
  const [showCategories, setShowCategories] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [faqsData, categoriesData] = await Promise.all([
        faqService.list(),
        faqService.listCategories(),
      ]);
      setFaqs(faqsData);
      const nextCategories = categoriesData.length > 0 ? categoriesData : DEFAULT_FAQ_CATEGORIES;
      setCategories(nextCategories);
      if (!nextCategories.some((entry) => entry.name === category)) {
        setCategory(nextCategories[0]?.name ?? DEFAULT_FAQ_CATEGORIES[0]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [category]);

  React.useEffect(() => void load(), [load]);

  const availableCategories = React.useMemo(() => {
    const normalized = categories.length > 0 ? categories : DEFAULT_FAQ_CATEGORIES.map((name, index) => ({ id: `${name}-${index}`, name, sort_order: index + 1 }));
    return normalized.sort((a, b) => a.sort_order - b.sort_order);
  }, [categories]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      setError("La question et la réponse sont requises.");
      return;
    }

    setError(null);
    try {
      await faqService.create({
        question: question.trim(),
        answer: answer.trim(),
        category,
        sort_order: sortOrder,
      });
      setQuestion("");
      setAnswer("");
      setCategory(availableCategories[0]?.name ?? DEFAULT_FAQ_CATEGORIES[0]);
      setSortOrder(1);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingId(faq.id);
    setEditQuestion(faq.question);
    setEditAnswer(faq.answer);
    setEditCategory(faq.category || availableCategories[0]?.name || DEFAULT_FAQ_CATEGORIES[0]);
    setEditSortOrder(faq.sort_order);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editQuestion.trim() || !editAnswer.trim()) {
      setError("La question et la réponse sont requises.");
      return;
    }

    setError(null);
    try {
      await faqService.update(editingId, {
        question: editQuestion.trim(),
        answer: editAnswer.trim(),
        category: editCategory,
        sort_order: editSortOrder,
      });
      setEditingId(null);
      setEditQuestion("");
      setEditAnswer("");
      setEditCategory(availableCategories[0]?.name || DEFAULT_FAQ_CATEGORIES[0]);
      setEditSortOrder(1);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditQuestion("");
    setEditAnswer("");
    setEditCategory(availableCategories[0]?.name || DEFAULT_FAQ_CATEGORIES[0]);
    setEditSortOrder(1);
  };

  const handleDelete = async (id: string) => {
    if (!(await confirm("Supprimer cette FAQ ?"))) return;
    setError(null);
    try {
      await faqService.remove(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setError("Le nom de la catégorie est requis.");
      return;
    }

    try {
      const created = await faqService.createCategory(trimmed, availableCategories.length + 1);
      if (!created) {
        throw new Error("Impossible d'ajouter la catégorie.");
      }
      setNewCategoryName("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleRemoveCategory = async (categoryId: string, categoryName: string) => {
    if (!(await confirm(`Supprimer la catégorie « ${categoryName} » ?`))) return;

    if (categoryId.startsWith("default-")) {
      setCategories((current) => current.filter((categoryEntry) => categoryEntry.id !== categoryId));
      setError(null);
      return;
    }

    try {
      await faqService.removeCategory(categoryId);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="space-y-4">
      {confirmationDialog}
      <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-sm md:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-slate-500">
              Administration
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
              FAQ — Gestion
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowCategories((prev) => !prev)}
              className="h-10 w-10 rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              aria-label={showCategories ? "Fermer les catégories" : "Afficher les catégories"}
              title={showCategories ? "Fermer les catégories" : "Afficher les catégories"}
            >
              <FolderOpen className={`h-4 w-4 transition-transform ${showCategories ? "scale-110" : ""}`} />
            </Button>

            <Button
              type="button"
              size="icon"
              onClick={() => setShowForm((prev) => !prev)}
              className="h-10 w-10 rounded-full bg-slate-900 text-white hover:bg-slate-800"
              aria-label={showForm ? "Fermer le formulaire" : "Ajouter une FAQ"}
              title={showForm ? "Fermer le formulaire" : "Ajouter une FAQ"}
            >
              <Plus className={`h-4 w-4 transition-transform ${showForm ? "rotate-45" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="space-y-3 rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-sm md:p-5">
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="space-y-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Question"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-slate-400"
            />
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Réponse"
              className="min-h-[110px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1.5 text-sm text-slate-700">
              <span>Catégorie</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
              >
                {availableCategories.map((option) => (
                  <option key={option.id} value={option.name}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5 text-sm text-slate-700">
              <span>Ordre d'affichage</span>
              <input
                type="number"
                min={1}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value) || 1)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
              />
            </label>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="rounded-full bg-slate-900 text-white hover:bg-slate-800">
              Ajouter
            </Button>
          </div>
        </form>
      )}

      {showCategories && (
        <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-sm md:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-900">Catégories</h2>
          </div>

          <form onSubmit={handleAddCategory} className="flex flex-col gap-2 sm:flex-row">
            <input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nouvelle catégorie"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            />
            <Button type="submit" variant="outline" className="rounded-full border-slate-200 bg-white hover:bg-slate-50">
              Ajouter une catégorie
            </Button>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            {availableCategories.map((option) => (
              <div key={option.id} className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700">
                <span>{option.name}</span>
                <button
                  type="button"
                  className="flex h-5 w-5 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
                  onClick={() => handleRemoveCategory(option.id, option.name)}
                  aria-label={`Supprimer la catégorie ${option.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
            Chargement…
          </div>
        ) : (
          faqs.map((faq) => (
            <div key={faq.id} className="rounded-[1.25rem] border border-slate-200 bg-white/90 p-3 shadow-sm">
              {editingId === faq.id ? (
                <div className="space-y-3">
                  <input
                    value={editQuestion}
                    onChange={(e) => setEditQuestion(e.target.value)}
                    placeholder="Question"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                  />
                  <textarea
                    value={editAnswer}
                    onChange={(e) => setEditAnswer(e.target.value)}
                    placeholder="Réponse"
                    className="min-h-[110px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="space-y-1.5 text-sm text-slate-700">
                      <span>Catégorie</span>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                      >
                        {availableCategories.map((option) => (
                          <option key={option.id} value={option.name}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-1.5 text-sm text-slate-700">
                      <span>Ordre d'affichage</span>
                      <input
                        type="number"
                        min={1}
                        value={editSortOrder}
                        onChange={(e) => setEditSortOrder(Number(e.target.value) || 1)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                      />
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleSaveEdit} className="rounded-full bg-slate-900 text-white hover:bg-slate-800">
                      Enregistrer
                    </Button>
                    <Button variant="secondary" onClick={handleCancelEdit} className="rounded-full">
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-600">
                      {faq.category}
                    </span>
                    <span>Ordre : {faq.sort_order}</span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">{faq.question}</h3>
                  <p className="text-sm leading-6 text-slate-600">{faq.answer}</p>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => handleEdit(faq)}
                      className="h-9 w-9 rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                      aria-label="Modifier la FAQ"
                      title="Modifier la FAQ"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDelete(faq.id)}
                      className="h-9 w-9 rounded-full"
                      aria-label="Supprimer la FAQ"
                      title="Supprimer la FAQ"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
