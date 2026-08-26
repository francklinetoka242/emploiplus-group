import { useEffect, useState, type ChangeEvent } from "react";
import { jsPDF } from "jspdf";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePageSEO } from "@/features/seo";
import { Download, Eye, Mail, MapPin, Phone, UserRound } from "lucide-react";

interface CVData {
  name: string;
  title: string;
  phone: string;
  email: string;
  address: string;
  about: string;
  education: string;
  experience: string;
  skills: string;
}

const initialCVData: CVData = {
  name: "SEBASTIAN BENNETT",
  title: "Professional Accountant",
  phone: "+123-456-7890",
  email: "hello@reallygreatsite.com",
  address: "123 Anywhere St., Any City",
  about: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  education: "Borcelle University | 2026-2030\nSenior Accountant\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nBorcelle University | 2023-2026\nSenior Accountant\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  experience: "Salford & Co. | 2033 - 2035\nSenior Accountant\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nSalford & Co. | 2030 - 2033\nFinancial Accountant\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  skills: "Auditing, Financial Accounting, Financial Reporting",
};

const compactCVData: CVData = {
  name: "LORNA ALVARADO",
  title: "Sales Representative",
  phone: "+123-456-7890",
  email: "hello@reallygreatsite.com",
  address: "www.reallygreatsite.com",
  about: "I am a Sales Representative is a professional who initializes and manages relationships with customers. They serve as their point of contact and lead from initial outreach through the making of the final purchase by them or someone in their household.",
  education: "Borcelle Business University | 2020 - 2023\nBachelor of Business Management\n\nWardiere University | 2016 - 2020\nBachelor of Business Management\n\nWardiere University | 2012 - 2016\nBachelor of Business Management",
  experience: "2020 - 2023\nSales Representative | Timmerman Industries\n• Offer outbound packages to corporate and clients\n• Meet with clients every quarter to update or renew services\n• Train junior sales agents\n\n2017 - 2019\nFMCG Sales Agent | Timmerman Industries\n• Visited corporate client offices to offer latest products\n• Built relationships with clients\n\n2014 - 2016\nSales Agent | Timmerman Industries\n• Visited corporate client offices to offer latest products\n• Built relationships with clients",
  skills: "Client Acquisition, B2B Sales, Negotiation, Relationship Management, Market Analysis, Negotiation Skills, Problem-Solving, Time Management, Networking, Market Research",
};

const sectionTitleClass = "mb-2 border-b border-slate-400 pb-1 text-sm font-bold uppercase tracking-[0.16em] text-slate-900";

function TemplateThumbnail({ compact = false }: { compact?: boolean }) {
  return (
    <div aria-hidden="true" className="aspect-[210/297] w-28 bg-white p-2 shadow-sm">
      <div className="mb-2 flex items-center gap-1 border-b border-slate-300 pb-2">
        {compact && <span className="size-5 shrink-0 rounded-full border border-slate-400 bg-slate-200" />}
        <div className="flex-1 space-y-1"><div className="h-1.5 w-3/4 bg-slate-700" /><div className="h-1 w-1/2 bg-slate-300" /></div>
      </div>
      <div className={compact ? "grid grid-cols-[0.7fr_1.3fr] gap-2" : "space-y-2"}>
        <div className="space-y-1.5"><div className="h-1 w-2/3 bg-slate-700" /><div className="h-1 w-full bg-slate-200" /><div className="h-1 w-5/6 bg-slate-200" /><div className="h-1 w-3/4 bg-slate-200" /><div className="h-1 w-full bg-slate-300" /><div className="h-1 w-4/5 bg-slate-200" /></div>
        {compact ? <div className="space-y-1.5"><div className="h-1 w-2/3 bg-slate-700" /><div className="h-1 w-full bg-slate-200" /><div className="h-1 w-5/6 bg-slate-200" /><div className="h-1 w-full bg-slate-300" /><div className="h-1 w-4/5 bg-slate-200" /><div className="h-1 w-full bg-slate-200" /></div> : <div className="space-y-1.5"><div className="h-1 w-1/3 bg-slate-700" /><div className="h-1 w-full bg-slate-200" /><div className="h-1 w-5/6 bg-slate-200" /><div className="h-1 w-3/4 bg-slate-200" /></div>}
      </div>
    </div>
  );
}

function CVPreview({ data }: { data: CVData }) {
  const renderEntries = (value: string) =>
    value.split("\n").map((line, index) => (
      <p key={`${line}-${index}`} className={line.trim() ? "min-h-4" : "h-2"}>
        {line || " "}
      </p>
    ));

  return (
    <article className="mx-auto aspect-[210/297] w-full max-w-[760px] bg-white px-[7%] py-[6%] text-[clamp(7px,1.15vw,12px)] leading-[1.45] text-slate-800 shadow-lg print:shadow-none">
      <header className="border-b border-slate-500 pb-3 text-center">
        <h1 className="text-[clamp(19px,3.5vw,38px)] font-extrabold tracking-wide text-slate-900">{data.name || "VOTRE NOM"}</h1>
        <p className="text-[clamp(10px,1.8vw,18px)] tracking-wide">{data.title || "Votre titre professionnel"}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-1 text-[clamp(6px,1vw,10px)]">
          <span className="inline-flex items-center gap-1"><Phone className="size-[1em]" />{data.phone}</span>
          <span className="inline-flex items-center gap-1"><Mail className="size-[1em]" />{data.email}</span>
          <span className="inline-flex items-center gap-1"><MapPin className="size-[1em]" />{data.address}</span>
        </div>
      </header>

      <section className="mt-4">
        <h2 className={sectionTitleClass}>About me</h2>
        <p>{data.about}</p>
      </section>
      <section className="mt-4">
        <h2 className={sectionTitleClass}>Education</h2>
        <div className="whitespace-pre-line">{renderEntries(data.education)}</div>
      </section>
      <section className="mt-4">
        <h2 className={sectionTitleClass}>Work experience</h2>
        <div className="whitespace-pre-line">{renderEntries(data.experience)}</div>
      </section>
      <section className="mt-4">
        <h2 className={sectionTitleClass}>Skills</h2>
        <ul className="grid grid-cols-3 gap-x-5 gap-y-1 pl-4">
          {data.skills.split(",").map((skill) => skill.trim()).filter(Boolean).map((skill) => <li key={skill}>{skill}</li>)}
        </ul>
      </section>
    </article>
  );
}

function CompactCVPreview({ data }: { data: CVData }) {
  return (
    <article className="mx-auto aspect-[210/297] w-full max-w-[760px] bg-white px-[7%] py-[6%] text-[clamp(6px,0.9vw,10px)] leading-[1.35] text-slate-700 shadow-lg">
      <header className="flex items-center gap-5 border-b border-slate-400 pb-4">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-500 bg-slate-100"><UserRound className="size-11 text-slate-500" /></div>
        <div className="flex-1"><h1 className="text-[clamp(16px,2.7vw,29px)] font-bold text-slate-800">{data.name}</h1><p className="tracking-[0.18em] text-slate-500">{data.title}</p></div>
      </header>
      <div className="grid grid-cols-[0.75fr_1.25fr] gap-6 pt-5">
        <div className="space-y-4">
          <section><h2 className="mb-2 text-[0.9em] font-bold uppercase tracking-wider text-slate-800">Contact</h2><p>{data.phone}</p><p>{data.email}</p><p>{data.address}</p></section>
          <section><h2 className="mb-2 text-[0.9em] font-bold uppercase tracking-wider text-slate-800">Education</h2><p className="whitespace-pre-line">{data.education}</p></section>
          <section><h2 className="mb-2 text-[0.9em] font-bold uppercase tracking-wider text-slate-800">Skills</h2><ul className="list-disc space-y-0.5 pl-3">{data.skills.split(",").map((skill) => <li key={skill}>{skill.trim()}</li>)}</ul></section>
          <section><h2 className="mb-2 text-[0.9em] font-bold uppercase tracking-wider text-slate-800">Language</h2><p>• English</p><p>• Germany (basic)</p></section>
        </div>
        <div className="space-y-4">
          <section><h2 className="mb-2 text-[0.9em] font-bold uppercase tracking-wider text-slate-800">Summary</h2><p>{data.about}</p></section>
          <section><h2 className="mb-2 text-[0.9em] font-bold uppercase tracking-wider text-slate-800">Work Experience</h2><p className="whitespace-pre-line">{data.experience}</p></section>
          <section><h2 className="mb-2 text-[0.9em] font-bold uppercase tracking-wider text-slate-800">References</h2><div className="grid grid-cols-2 gap-2"><p>Bailey Dupont<br />Phone: +123-456-7890</p><p>Harumi Kobayashi<br />Phone: +123-456-7890</p></div></section>
        </div>
      </div>
    </article>
  );
}

function downloadCV(data: CVData) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 20;
  const width = 170;
  let y = 25;
  const addWrapped = (text: string, size: number, options?: { bold?: boolean; center?: boolean }) => {
    pdf.setFont("helvetica", options?.bold ? "bold" : "normal");
    pdf.setFontSize(size);
    const lines = pdf.splitTextToSize(text || " ", width);
    pdf.text(lines, options?.center ? 105 : margin, y, { align: options?.center ? "center" : "left" });
    y += lines.length * (size * 0.45) + 3;
  };
  const addSection = (title: string, content: string) => {
    y += 3;
    pdf.setDrawColor(80, 80, 80);
    pdf.line(margin, y, 190, y);
    y += 6;
    addWrapped(title.toUpperCase(), 11, { bold: true });
    addWrapped(content, 9);
  };

  addWrapped(data.name.toUpperCase() || "VOTRE NOM", 22, { bold: true, center: true });
  addWrapped(data.title, 13, { center: true });
  addWrapped(`${data.phone}   |   ${data.email}   |   ${data.address}`, 8, { center: true });
  addSection("About me", data.about);
  addSection("Education", data.education);
  addSection("Work experience", data.experience);
  addSection("Skills", data.skills.split(",").map((skill) => `• ${skill.trim()}`).join("   "));
  pdf.save(`${(data.name || "mon-cv").toLowerCase().replace(/[^a-z0-9]+/gi, "-")}.pdf`);
}

export function CandidateCreateCVPage() {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId?: string }>();
  const selectedTemplate = templateId === "modern" ? "compact" : "classic";
  const selected = Boolean(templateId);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [data, setData] = useState<CVData>(initialCVData);

  useEffect(() => {
    if (templateId === "modern") setData(compactCVData);
    if (templateId === "professional") setData(initialCVData);
  }, [templateId]);

  usePageSEO({
    title: "Création-CV - EmploiPlus Group",
    description: "Créez votre CV professionnel avec EmploiPlus Group.",
    robots: "noindex,nofollow",
  });

  const updateField = (field: keyof CVData) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData((current) => ({ ...current, [field]: event.target.value }));
  };

  if (!selected || templateId === "minimaliste") {
    return (
      <div className="space-y-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {templateId === "minimaliste" ? "Style minimaliste" : "Création de CV"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {templateId === "minimaliste"
              ? "Choisissez l’un des deux modèles minimalistes pour commencer votre CV."
              : "Choisissez un modèle pour commencer votre CV."}
          </p>
        </div>
        <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
          {templateId === "minimaliste" && (
            <>
              <Card className="overflow-hidden transition-shadow hover:shadow-md">
                <div className="flex h-44 items-center justify-center overflow-hidden bg-slate-100 p-3"><TemplateThumbnail /></div>
                <CardHeader className="p-4"><CardTitle className="text-base">Modèle professionnel</CardTitle><CardDescription>Professionnel</CardDescription></CardHeader>
                <CardContent className="p-4 pt-0"><Button className="w-full" onClick={() => navigate("/candidate/create-cv/professional")}>Ouvrir ce modèle</Button></CardContent>
              </Card>
              <Card className="overflow-hidden transition-shadow hover:shadow-md">
                <div className="flex h-44 items-center justify-center overflow-hidden bg-slate-100 p-3"><TemplateThumbnail compact /></div>
                <CardHeader className="p-4"><CardTitle className="text-base">Modèle moderne</CardTitle><CardDescription>Professionnel · Deux colonnes</CardDescription></CardHeader>
                <CardContent className="p-4 pt-0"><Button className="w-full" onClick={() => navigate("/candidate/create-cv/modern")}>Ouvrir ce modèle</Button></CardContent>
              </Card>
            </>
          )}
          {!templateId && (
            <Card className="overflow-hidden transition-shadow hover:shadow-md">
              <div className="flex h-44 items-center justify-center overflow-hidden bg-slate-100 p-3"><TemplateThumbnail /></div>
              <CardHeader className="p-4"><CardTitle className="text-base">Style minimaliste</CardTitle><CardDescription>Minimaliste · 2 modèles disponibles</CardDescription></CardHeader>
              <CardContent className="p-4 pt-0"><Button className="w-full" onClick={() => navigate("/candidate/create-cv/minimaliste")}>Voir les modèles</Button></CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-foreground">Personnalisez votre CV</h1><p className="mt-1 text-sm text-muted-foreground">Vos données restent uniquement dans votre navigateur.</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" aria-label="Visualiser le CV" title="Visualiser le CV" onClick={() => setPreviewOpen(true)}><Eye className="size-4" /></Button>
          <Button onClick={() => downloadCV(data)} className="gap-2"><Download className="size-4" />Télécharger en PDF</Button>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(280px,390px)_1fr]">
        <Card><CardHeader><CardTitle>Informations</CardTitle><CardDescription>Remplissez les champs pour mettre à jour l’aperçu.</CardDescription></CardHeader><CardContent className="space-y-4">
          {(["name", "title", "phone", "email", "address"] as const).map((field) => <div className="space-y-1.5" key={field}><Label htmlFor={`cv-${field}`}>{({ name: "Nom complet", title: "Titre professionnel", phone: "Téléphone", email: "Email", address: "Adresse" } as Record<string, string>)[field]}</Label><Input id={`cv-${field}`} value={data[field]} onChange={updateField(field)} /></div>)}
          {(["about", "education", "experience", "skills"] as const).map((field) => <div className="space-y-1.5" key={field}><Label htmlFor={`cv-${field}`}>{({ about: "À propos de moi", education: "Formation", experience: "Expérience professionnelle", skills: "Compétences (séparées par des virgules)" } as Record<string, string>)[field]}</Label><Textarea id={`cv-${field}`} rows={field === "skills" ? 3 : 6} value={data[field]} onChange={updateField(field)} /></div>)}
        </CardContent></Card>
        <div className="overflow-auto rounded-lg bg-slate-100 p-3 sm:p-6">{selectedTemplate === "compact" ? <CompactCVPreview data={data} /> : <CVPreview data={data} />}</div>
      </div>
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}><DialogContent className="max-h-[95vh] max-w-4xl overflow-y-auto"><DialogHeader><DialogTitle>Aperçu de votre CV</DialogTitle><DialogDescription>Vérifiez votre CV avant de le télécharger.</DialogDescription></DialogHeader>{selectedTemplate === "compact" ? <CompactCVPreview data={data} /> : <CVPreview data={data} />}<Button onClick={() => downloadCV(data)} className="mx-auto gap-2"><Download className="size-4" />Télécharger en PDF</Button></DialogContent></Dialog>
    </div>
  );
}
