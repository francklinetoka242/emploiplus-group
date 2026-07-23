import React from "react";
import { faqService, type FAQ, type FAQCategory } from "@/features/faq/api/faqService";
import { Button } from "@/components/ui/button";

const DEFAULT_FAQ_CATEGORIES = ["Compte", "Services", "Autres"];

export default function AdminFAQPage() {
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
    if (!confirm("Supprimer cette FAQ ?")) return;
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
    if (!confirm(`Supprimer la catégorie « ${categoryName} » ?`)) return;

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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">FAQ — Gestion</h1>

      <form onSubmit={handleCreate} className="space-y-2 mb-6">
        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Question" className="w-full p-2 border rounded" />
        <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Réponse" className="w-full p-2 border rounded" />
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span>Catégorie</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded">
              {availableCategories.map((option) => (
                <option key={option.id} value={option.name}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span>Ordre d'affichage</span>
            <input
              type="number"
              min={1}
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value) || 1)}
              className="w-full p-2 border rounded"
            />
          </label>
        </div>
        <Button type="submit">Ajouter</Button>
      </form>

      <div className="rounded-2xl border p-4 space-y-3">
        <h2 className="font-semibold">Catégories</h2>
        <form onSubmit={handleAddCategory} className="flex flex-wrap gap-2">
          <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Nouvelle catégorie" className="min-w-64 p-2 border rounded" />
          <Button type="submit">Ajouter une catégorie</Button>
        </form>
        <div className="flex flex-wrap gap-2">
          {availableCategories.map((option) => (
            <div key={option.id} className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
              <span>{option.name}</span>
              <button type="button" className="text-destructive" onClick={() => handleRemoveCategory(option.id, option.name)}>
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p>Chargement…</p>
        ) : (
          faqs.map((faq) => (
            <div key={faq.id} className="p-3 border rounded">
              {editingId === faq.id ? (
                <div className="space-y-3">
                  <input
                    value={editQuestion}
                    onChange={(e) => setEditQuestion(e.target.value)}
                    placeholder="Question"
                    className="w-full p-2 border rounded"
                  />
                  <textarea
                    value={editAnswer}
                    onChange={(e) => setEditAnswer(e.target.value)}
                    placeholder="Réponse"
                    className="w-full p-2 border rounded"
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-1">
                      <span>Catégorie</span>
                      <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="w-full p-2 border rounded">
                        {availableCategories.map((option) => (
                          <option key={option.id} value={option.name}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-1">
                      <span>Ordre d'affichage</span>
                      <input
                        type="number"
                        min={1}
                        value={editSortOrder}
                        onChange={(e) => setEditSortOrder(Number(e.target.value) || 1)}
                        className="w-full p-2 border rounded"
                      />
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleSaveEdit}>Enregistrer</Button>
                    <Button variant="secondary" onClick={handleCancelEdit}>Annuler</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="font-semibold">Catégorie :</span> {faq.category}
                    <span className="font-semibold">Ordre :</span> {faq.sort_order}
                  </div>
                  <h3 className="font-semibold">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button onClick={() => handleEdit(faq)}>Modifier</Button>
                    <Button variant="destructive" onClick={() => handleDelete(faq.id)}>Supprimer</Button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
