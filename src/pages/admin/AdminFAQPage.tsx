import React from "react";
import { useI18n } from "@/i18n";
import { faqService } from "@/features/faq/api/faqService";
import { Button } from "@/components/ui/button";

export default function AdminFAQPage() {
  const { t } = useI18n();
  const [faqs, setFaqs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [question, setQuestion] = React.useState("");
  const [answer, setAnswer] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await faqService.list();
      setFaqs(data);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => void load(), [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    try {
      await faqService.create({ question: question.trim(), answer: answer.trim() });
      setQuestion("");
      setAnswer("");
      await load();
    } catch (e) {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette FAQ ?")) return;
    await faqService.remove(id);
    await load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">FAQ — Gestion</h1>

      <form onSubmit={handleCreate} className="space-y-2 mb-6">
        <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Question" className="w-full p-2 border rounded" />
        <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Réponse" className="w-full p-2 border rounded" />
        <Button type="submit">Ajouter</Button>
      </form>

      <div className="space-y-3">
        {loading ? (
          <p>Chargement…</p>
        ) : (
          faqs.map((f: any) => (
            <div key={f.id} className="p-3 border rounded">
              <h3 className="font-semibold">{f.question}</h3>
              <p className="text-sm text-muted-foreground">{f.answer}</p>
              <div className="mt-2">
                <Button variant="destructive" onClick={() => handleDelete(f.id)}>Supprimer</Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
