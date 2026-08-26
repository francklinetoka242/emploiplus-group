import { useEffect, useState, type ChangeEvent } from "react";
import { jsPDF } from "jspdf";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePageSEO } from "@/features/seo";
import { cn } from "@/lib/utils";
import { ArrowRight, Camera, Check, ChevronDown, Crown, Download, Eye, GraduationCap, Languages, Mail, MapPin, PanelRightClose, PanelRightOpen, PenLine, Phone, Plus, Trash2, UserRound, BriefcaseBusiness, X } from "lucide-react";

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
  languages: string;
  photo: string;
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
  languages: "Français, Anglais",
  photo: "",
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
  languages: "English, French",
  photo: "",
};

const emptyCVData: CVData = {
  name: "",
  title: "",
  phone: "",
  email: "",
  address: "",
  about: "",
  education: "",
  experience: "",
  skills: "",
  languages: "",
  photo: "",
};

const signatureCVData: CVData = {
  ...emptyCVData,
  name: "ALEXAR KENIVOPPER",
  title: "MANAGER/CEO",
};

const sectionTitleClass = "mb-2 border-b border-slate-400 pb-1 text-sm font-bold uppercase tracking-[0.16em] text-slate-900";

function TemplateThumbnail({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("group/thumbnail relative aspect-[210/297] w-40 overflow-hidden bg-white p-4 shadow-sm transition duration-200 ease-out group-hover:scale-[1.03] group-hover:shadow-xl", className)}
    >
      <span className="absolute inset-y-0 left-0 w-1 bg-slate-800" />
      <div className="mb-2 flex items-center gap-1 border-b border-slate-300 pb-2">
        {compact && <span className="size-8 shrink-0 rounded-full bg-slate-700" />}
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
    <article className="relative mx-auto aspect-[210/297] w-full max-w-[760px] overflow-hidden bg-white px-[7%] py-[6%] text-[clamp(7px,1.15vw,12px)] leading-[1.45] text-slate-800 shadow-lg transition duration-200 ease-out print:shadow-none">
      <span className="absolute inset-y-0 left-0 w-1 bg-primary" aria-hidden="true" />
      <header className="border-b border-slate-500 pb-3 text-center">
        <h1 className="text-[clamp(19px,3.5vw,38px)] font-extrabold tracking-wide text-slate-900">{data.name || "VOTRE NOM"}</h1>
        <p className="text-[clamp(10px,1.8vw,18px)] tracking-wide">{data.title || "Votre titre professionnel"}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-1 text-[clamp(6px,1vw,10px)]">
          <span className="inline-flex items-center gap-1"><Phone className="size-[1em]" />{data.phone}</span>
          <span className="inline-flex items-center gap-1"><Mail className="size-[1em]" />{data.email}</span>
          <span className="inline-flex items-center gap-1"><MapPin className="size-[1em]" />{data.address}</span>
        </div>
      </header>

      <section className="mt-8">
        <h2 className={sectionTitleClass}>About me</h2>
        <p>{data.about}</p>
      </section>
      <section className="mt-8">
        <h2 className={sectionTitleClass}>Education</h2>
        <div className="whitespace-pre-line">{renderEntries(data.education)}</div>
      </section>
      <section className="mt-8">
        <h2 className={sectionTitleClass}>Work experience</h2>
        <div className="whitespace-pre-line">{renderEntries(data.experience)}</div>
      </section>
      <section className="mt-8">
        <h2 className={sectionTitleClass}>Skills</h2>
        <ul className="grid grid-cols-3 gap-x-5 gap-y-1 pl-4">
          {data.skills.split(",").map((skill) => skill.trim()).filter(Boolean).map((skill) => <li key={skill}>{skill}</li>)}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className={sectionTitleClass}>Languages</h2>
        <div className="flex flex-wrap gap-1.5">
          {data.languages.split(",").map((language) => language.trim()).filter(Boolean).map((language) => (
            <span key={language} className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.9em] text-primary">{language}</span>
          ))}
        </div>
      </section>
    </article>
  );
}

function MinimalistCVPreview({ data }: { data: CVData }) {
  const renderLines = (value: string) => value.split("\n").map((line, index) => <p key={`${line}-${index}`} className={line ? "min-h-4" : "h-2"}>{line || " "}</p>);
  return (
    <article className="relative mx-auto aspect-[210/297] w-full max-w-[760px] overflow-hidden bg-white px-[9%] py-[7%] text-[clamp(7px,1.05vw,11px)] leading-[1.42] text-slate-800 shadow-lg">
      <span className="absolute inset-y-0 left-0 w-1 bg-slate-800" aria-hidden="true" />
      <header className="border-b border-slate-500 pb-3 text-center">
        <h1 className="font-display text-[clamp(20px,3.5vw,36px)] font-semibold tracking-wide">{data.name || "PRÉNOM NOM"}</h1>
        <p className="text-[clamp(10px,1.8vw,17px)]">{data.title || "Métier"}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-1 text-[0.85em] text-slate-600"><span>{data.phone || "Téléphone"}</span><span>{data.email || "email@exemple.com"}</span><span>{data.address || "Ville, Pays"}</span></div>
      </header>
      <section className="mt-7"><h2 className={sectionTitleClass}>About me</h2><p>{data.about || "Présentez votre parcours professionnel en quelques lignes."}</p></section>
      <section className="mt-7"><h2 className={sectionTitleClass}>Education</h2><div className="whitespace-pre-line">{renderLines(data.education || "Diplôme | Établissement\nAnnée\nDécrivez votre formation et vos acquis.")}</div></section>
      <section className="mt-7"><h2 className={sectionTitleClass}>Work experience</h2><div className="whitespace-pre-line">{renderLines(data.experience || "Poste de l’expérience | Entreprise\nDates\nDécrivez vos missions et vos résultats.")}</div></section>
      <section className="mt-7"><h2 className={sectionTitleClass}>Skills</h2><ul className="grid grid-cols-3 gap-x-5 gap-y-1 pl-4">{(data.skills || "Compétence, Communication, Organisation").split(",").map((skill) => <li key={skill}>{skill.trim()}</li>)}</ul></section>
    </article>
  );
}

function CompactCVPreview({ data }: { data: CVData }) {
  return (
    <article className="relative mx-auto aspect-[210/297] w-full max-w-[760px] overflow-hidden bg-white px-[7%] py-[6%] text-[clamp(6px,0.9vw,10px)] leading-[1.35] text-slate-700 shadow-lg transition duration-200 ease-out">
      <span className="absolute inset-y-0 left-0 w-1 bg-primary" aria-hidden="true" />
      <header className="flex items-center gap-5 border-b border-slate-400 pb-4">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-500 bg-[oklch(0.965_0.012_70)]">{data.photo ? <img src={data.photo} alt="Portrait du CV" className="size-full object-cover" /> : <UserRound className="size-11 text-slate-500" />}</div>
        <div className="flex-1"><h1 className="text-[clamp(16px,2.7vw,29px)] font-bold text-slate-800">{data.name}</h1><p className="tracking-[0.18em] text-slate-500">{data.title}</p></div>
      </header>
      <div className="grid grid-cols-[0.75fr_1.25fr] gap-6 pt-5">
        <div className="space-y-4">
          <section><h2 className="mb-2 text-[0.9em] font-bold uppercase tracking-wider text-slate-800">Contact</h2><p>{data.phone}</p><p>{data.email}</p><p>{data.address}</p></section>
          <section><h2 className="mb-2 text-[0.9em] font-bold uppercase tracking-wider text-slate-800">Education</h2><p className="whitespace-pre-line">{data.education}</p></section>
          <section><h2 className="mb-2 text-[0.9em] font-bold uppercase tracking-wider text-slate-800">Skills</h2><ul className="list-disc space-y-0.5 pl-3">{data.skills.split(",").map((skill) => <li key={skill}>{skill.trim()}</li>)}</ul></section>
          <section><h2 className="mb-2 text-[0.9em] font-bold uppercase tracking-wider text-primary">Language</h2><div className="flex flex-wrap gap-1">{data.languages.split(",").map((language) => language.trim()).filter(Boolean).map((language) => <span key={language} className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[0.9em] text-primary">{language}</span>)}</div></section>
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

function CorporateCVPreview({ data }: { data: CVData }) {
  const entries = (value: string) => value.split("\n").map((line, index) => <p key={`${line}-${index}`} className={line ? "min-h-4" : "h-2"}>{line || " "}</p>);
  const heading = "mb-3 bg-slate-100 px-3 py-2 text-[0.9em] font-bold uppercase tracking-wide text-slate-700";
  return (
    <article className="relative mx-auto aspect-[210/297] w-full max-w-[760px] overflow-hidden bg-white text-[clamp(6px,0.9vw,10px)] leading-[1.45] text-slate-700 shadow-lg">
      <header className="flex items-center gap-5 bg-slate-900 px-[7%] py-[6%] text-white"><div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-700">{data.photo ? <img src={data.photo} alt="Portrait du CV" className="size-full object-cover" /> : <UserRound className="size-11 text-slate-200" />}</div><div><h1 className="text-[clamp(17px,3vw,32px)] font-bold">{data.name || "PRÉNOM NOM"}</h1><p className="mt-2 text-[clamp(9px,1.5vw,15px)] text-slate-300">{data.title || "Métier"}</p></div></header>
      <div className="grid grid-cols-[0.75fr_1.25fr] gap-6 px-[7%] py-8"><aside className="space-y-5"><section><h2 className={heading}>Contact</h2><p>{data.phone || "Téléphone"}</p><p>{data.email || "email@exemple.com"}</p><p>{data.address || "Ville, Pays"}</p></section><section><h2 className={heading}>Education</h2><div className="whitespace-pre-line">{entries(data.education || "Diplôme\nÉtablissement\nAnnée")}</div></section><section><h2 className={heading}>Skills</h2><ul className="space-y-2 pl-3">{(data.skills || "Communication, Organisation, Analyse").split(",").map((skill) => <li key={skill} className="list-disc">{skill.trim()}</li>)}</ul></section></aside><main className="space-y-5"><section><h2 className={heading}>Professional summary</h2><p>{data.about || "Présentez votre profil professionnel et vos principaux domaines d’expertise."}</p></section><section><h2 className={heading}>Experience</h2><div className="whitespace-pre-line">{entries(data.experience || "Poste | Entreprise\nDates\nDécrivez vos missions et résultats.")}</div></section></main></div>
    </article>
  );
}

function SignatureCVPreview({ data, skillLevels = {} }: { data: CVData; skillLevels?: Record<string, number> }) {
  const entries = (value: string) => value.split("\n").map((line, index) => <p key={`${line}-${index}`}>{line || " "}</p>);
  const heading = "mb-2 text-[0.9em] font-bold uppercase tracking-wide text-slate-800";
  return (
    <article className="relative mx-auto aspect-[210/297] w-full max-w-[760px] overflow-hidden bg-white text-[clamp(6px,0.9vw,10px)] leading-[1.35] text-slate-700 shadow-lg">
      <header className="relative h-[28%] overflow-hidden bg-[#ffd52f] px-[7%] pt-[7%]">
        <span className="absolute -left-[4%] -top-[4%] h-[92%] w-[66%] rounded-br-[42%] rounded-tr-[12%] bg-white" aria-hidden="true" />
        <div className="relative z-10"><h1 className="text-[clamp(11px,2.2vw,24px)] uppercase leading-none tracking-[0.12em] text-slate-800"><span className="block font-normal">{(data.name || "ALEXAR KENIVOPPER").split(" ")[0]}</span><span className="block font-bold">{(data.name || "ALEXAR KENIVOPPER").split(" ").slice(1).join(" ")}</span></h1><p className="mt-1 text-[0.78em] font-semibold uppercase tracking-[0.18em] text-slate-700">{data.title || "Manager / CEO"}</p></div>
        <div className="absolute right-[8%] top-[10%] z-10 flex aspect-square w-[21%] items-center justify-center overflow-hidden rounded-full border-[5px] border-white bg-slate-200 shadow-[0_0_0_2px_#d7d7d7]">{data.photo ? <img src={data.photo} alt="Portrait du CV" className="size-full object-cover" /> : <UserRound className="size-1/2 text-slate-500" />}</div>
      </header>
      <div className="grid h-[72%] grid-cols-[40%_60%]">
        <aside className="bg-slate-100 px-[9%] py-[9%]">
          <section><h2 className={heading}>Profile</h2><p>{data.about || "Professional profile with experience, strong communication skills and a clear focus on delivering quality results."}</p></section>
          <section className="mt-8"><h2 className={heading}>Education</h2><div className="whitespace-pre-line">{entries(data.education || "2016 - 2017\nUniversity Name Here\nDegree name\n\n2010 - 2015\nUniversity Name Here\nDegree name")}</div></section>
          <section className="mt-8"><h2 className={heading}>Contact</h2><p>{data.phone || "+1234567890"}</p><p>{data.email || "youremail@address.com"}</p><p>{data.address || "Your address"}</p></section>
        </aside>
        <main className="space-y-6 px-[7%] py-[7%]">
          <section><h2 className={heading}><span className="mr-1 text-[#e6bd00]">Job</span> Experience</h2><div className="space-y-3">{entries(data.experience || "2020 - Present\nSenior Web Designer\nCompany Name Here\nLorem ipsum dolor sit amet, consectetur adipiscing elit.\n\n2017 - 2020\nGraphic Designer\nCompany Name Here\nLorem ipsum dolor sit amet, consectetur adipiscing elit.")}</div></section>
          <section><h2 className={heading}>Skills</h2><div className="grid grid-cols-2 gap-x-5 gap-y-2">{(data.skills || "Photoshop, After Effect, Illustrator, Adobe XD").split(",").map((skill, index) => { const name = skill.trim(); const level = skillLevels[name] ?? (index % 3) + 2; return <div key={skill} className="flex items-center justify-between gap-2"><span>{name}</span><span className="flex gap-0.5">{[0, 1, 2, 3].map((dot) => <i key={dot} className={dot < level ? "size-1 rounded-full bg-[#e6bd00]" : "size-1 rounded-full bg-slate-300"} />)}</span></div>; })}</div></section>
          <section><h2 className={heading}>Interests</h2><p>{"Traveling  •  Singing  •  Sketching  •  Swimming"}</p></section>
        </main>
      </div>
      <span className="absolute -bottom-[4%] -left-[7%] size-[16%] rounded-full bg-[#ffd52f]" aria-hidden="true" />
    </article>
  );
}

function EditorialCVPreview({ data, skillLevels = {} }: { data: CVData; skillLevels?: Record<string, number> }) {
  const entries = (value: string) => value.split("\n").map((line, index) => <p key={`${line}-${index}`}>{line || " "}</p>);
  const heading = "mb-3 text-[0.9em] font-bold uppercase tracking-wide text-slate-800";
  return (
    <article className="relative mx-auto aspect-[210/297] w-full max-w-[760px] overflow-hidden bg-white text-[clamp(6px,0.9vw,10px)] leading-[1.35] text-slate-700 shadow-lg">
      <aside className="relative w-[38%] bg-slate-100 px-[8%] pb-[8%] pt-[7%]">
        <span className="absolute inset-x-0 top-0 h-[31%] bg-[#ffd52f]" aria-hidden="true" />
        <span className="absolute left-[28%] top-[7%] z-10 flex aspect-square w-[44%] items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-sm">{data.photo ? <img src={data.photo} alt="Portrait du CV" className="size-full object-cover" /> : <UserRound className="size-1/2 text-slate-500" />}</span>
        <div className="relative z-20 pt-[165%]">
          <section><h2 className={heading}>Contact...</h2><div className="space-y-1.5"><p className="flex items-center gap-1"><Phone className="size-[0.9em] shrink-0 text-[#e6bd00]" />{data.phone || "+123 456 7890"}</p><p className="flex items-center gap-1"><Mail className="size-[0.9em] shrink-0 text-[#e6bd00]" />{data.email || "votremail@adresse.com"}</p><p className="flex items-center gap-1"><MapPin className="size-[0.9em] shrink-0 text-[#e6bd00]" />{data.address || "Votre adresse"}</p></div></section>
          <section className="mt-8"><h2 className={heading}>Formation...</h2><div className="whitespace-pre-line">{entries(data.education || "École supérieure des arts\n2011 - 2015\n\nLicence en sciences\nUniversité de référence\n2015 - 2019")}</div></section>
          <section className="mt-8"><h2 className={heading}>Références...</h2><p><strong>M. David Parker</strong><br />Responsable créatif<br />Nom de l’entreprise</p><p className="mt-3"><strong>M. David Parker</strong><br />Designer senior<br />Nom de l’entreprise</p></section>
        </div>
      </aside>
      <main className="absolute inset-y-0 left-[38%] right-0 px-[7%] py-[8%]">
        <header className="border-b border-[#ffd52f] pb-5"><h1 className="text-[clamp(15px,2.8vw,30px)] font-normal uppercase leading-none tracking-wide text-slate-800">{(data.name || "ANNE ROBERTSON").split(" ")[0]}<br /><strong>{(data.name || "ANNE ROBERTSON").split(" ").slice(1).join(" ")}</strong></h1><p className="mt-1 text-[clamp(11px,1.6vw,18px)] font-semibold uppercase leading-tight tracking-wide">{data.title || "CONCEPTRICE WEB"}</p></header>
        <section className="mt-6"><h2 className={heading}><span className="text-[#e6bd00]">Expérience</span> professionnelle...</h2><div className="space-y-3 border-l-2 border-[#ffd52f] pl-3">{entries(data.experience || "2019 - Aujourd’hui\nDesigner web senior\nNom de l’entreprise\nDécrivez ici vos missions et vos résultats.\n\n2017 - 2019\nDesigner web junior\nNom de l’entreprise\nDécrivez ici vos missions et vos résultats.")}</div></section>
        <section className="mt-7"><h2 className={heading}>Compétences...</h2><div className="grid grid-cols-2 gap-x-4 gap-y-2">{(data.skills || "Photoshop, After Effects, Illustrator, Adobe XD, InDesign, PowerPoint").split(",").map((skill, index) => { const name = skill.trim(); const level = skillLevels[name] ?? (index % 3) + 2; return <div key={skill} className="flex items-center justify-between gap-1"><span>{name}</span><span className="flex gap-0.5">{[0, 1, 2, 3].map((dot) => <i key={dot} className={dot < level ? "size-1 rounded-full bg-[#e6bd00]" : "size-1 rounded-full bg-slate-300"} />)}</span></div>; })}</div></section>
        <section className="mt-7"><h2 className={heading}>Centres d’intérêt...</h2><p>Voyage&nbsp;&nbsp; • &nbsp;Chant&nbsp;&nbsp; • &nbsp;Dessin&nbsp;&nbsp; • &nbsp;Natation</p></section>
      </main>
    </article>
  );
}

function CreativeCVPreview({ data }: { data: CVData }) {
  const entries = (value: string) => value.split("\n").map((line, index) => <p key={`${line}-${index}`} className={line ? "min-h-4" : "h-2"}>{line || " "}</p>);
  const heading = "mb-3 border-b border-sky-300 pb-2 text-[0.95em] font-semibold text-slate-600";
  return (
    <article className="relative mx-auto aspect-[210/297] w-full max-w-[760px] overflow-hidden bg-white text-[clamp(6px,0.9vw,10px)] leading-[1.4] text-slate-600 shadow-lg">
      <aside className="absolute inset-y-0 left-0 w-[34%] bg-slate-50 px-[5%] py-[7%]"><div className="relative mx-auto mb-5 flex size-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-sm">{data.photo ? <img src={data.photo} alt="Portrait du CV" className="size-full object-cover" /> : <UserRound className="size-11 text-slate-500" />}</div><h1 className="text-center font-display text-[clamp(15px,2.7vw,28px)] font-medium leading-tight text-sky-700">{data.name || "Lorna Alvarado"}</h1><p className="mt-2 text-center text-[1.1em]">{data.title || "Marketing Manager"}</p><section className="mt-8"><h2 className={heading}>Contact</h2><p>{data.phone || "+123-456-7890"}</p><p>{data.email || "hello@reallygreatsite.com"}</p><p>{data.address || "Any City, ST 12345"}</p></section><section className="mt-7"><h2 className={heading}>About me</h2><p>{data.about || "Présentez votre parcours et votre valeur professionnelle en quelques lignes."}</p></section><section className="mt-7"><h2 className={heading}>Skills</h2><ul className="space-y-2 pl-3">{(data.skills || "Management Skills, Creativity, Digital Marketing, Negotiation, Leadership").split(",").map((skill) => <li key={skill} className="list-disc">{skill.trim()}</li>)}</ul></section></aside>
      <main className="ml-[34%] space-y-7 px-[6%] py-[7%]"><section><h2 className={heading}>Education</h2><div className="whitespace-pre-line">{entries(data.education || "Bachelor of Business Management\nBorcelle University | 2016 - 2020\n\nBachelor of Business Management\nBorcelle University | 2020 - 2023")}</div></section><section><h2 className={heading}>Experience</h2><div className="whitespace-pre-line">{entries(data.experience || "Product Design Manager | 2016 - 2020\nArrowai Industries\nDécrivez vos missions et vos résultats.\n\nMarketing Manager | 2019 - 2020\nArrowai Industries\nDécrivez vos missions et vos résultats.")}</div></section><section><h2 className={heading}>References</h2><div className="grid grid-cols-2 gap-3"><p><strong>Harumi Kobayashi</strong><br />Wardiere Inc. / CEO</p><p><strong>Bailey Dupont</strong><br />Wardiere Inc. / CEO</p></div></section></main>
    </article>
  );
}

function TagEditor({
  label,
  field,
  value,
  suggestions,
  onAdd,
  onChange,
  skillLevels,
  onLevelChange,
}: {
  label: string;
  field: "skills" | "languages";
  value: string;
  suggestions: string[];
  onAdd: (field: "skills" | "languages", value: string) => void;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  skillLevels?: Record<string, number>;
  onLevelChange?: (skill: string, level: number) => void;
}) {
  const [newItem, setNewItem] = useState("");
  const selectedItems = value.split(",").map((item) => item.trim()).filter(Boolean);
  const toggleItem = (item: string) => {
    const nextItems = selectedItems.includes(item)
      ? selectedItems.filter((selectedItem) => selectedItem !== item)
      : [...selectedItems, item];
    onChange({ target: { value: nextItems.join(", ") } } as ChangeEvent<HTMLTextAreaElement>);
  };
  const submitItem = () => {
    onAdd(field, newItem);
    setNewItem("");
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {selectedItems.map((item) => (
          <div key={`selected-${item}`} className="flex items-center gap-1 rounded-md border border-primary bg-primary/10 px-2 py-1 text-xs text-primary">
            <button type="button" onClick={() => toggleItem(item)} className="inline-flex items-center" aria-label={`Retirer ${item}`}>
              {item}<X className="ml-1 size-3" aria-hidden="true" />
            </button>
            {field === "skills" && onLevelChange && <label className="flex items-center gap-1 border-l border-primary/30 pl-2"><span className="sr-only">Niveau de {item}</span><select aria-label={`Niveau de ${item}`} value={skillLevels?.[item] ?? 3} onChange={(event) => onLevelChange(item, Number(event.target.value))} className="rounded border-0 bg-transparent text-xs text-primary outline-none"><option value="1">1/4</option><option value="2">2/4</option><option value="3">3/4</option><option value="4">4/4</option></select></label>}
          </div>
        ))}
        {suggestions.map((item) => {
          const isSelected = selectedItems.includes(item);
          if (isSelected) return null;
          return <button key={item} type="button" onClick={() => toggleItem(item)} className={cn("rounded-full border px-3 py-1 text-xs transition duration-200 ease-out", isSelected ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/40 text-muted-foreground hover:border-primary/50 hover:text-foreground")}>{item}{isSelected && <span className="ml-1">×</span>}</button>;
        })}
      </div>
      <div className="flex gap-2"><Input value={newItem} onChange={(event) => setNewItem(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); submitItem(); } }} placeholder={`Ajouter ${label.toLowerCase()}`} /><Button type="button" variant="outline" size="icon" aria-label={`Ajouter ${label.toLowerCase()}`} onClick={submitItem}><Plus className="size-4" /></Button></div>
    </div>
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
  if (data.photo && data.photo.startsWith("data:image/")) {
    const imageFormat = data.photo.startsWith("data:image/png") ? "PNG" : "JPEG";
    pdf.addImage(data.photo, imageFormat, 20, 18, 24, 24);
  }
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
  const { templateId, modelId } = useParams<{ templateId?: string; modelId?: string }>();
  const modernCategory = templateId === "modern" && !modelId;
  const premiumCategory = templateId === "premium" && !modelId;
  const selectedTemplate = templateId === "premium"
    ? modelId === "editorial" ? "editorial" : modelId === "signature" ? "signature" : "corporate"
    : templateId === "modern"
      ? (modelId === "corporate" ? "corporate" : modelId === "creative" ? "creative" : "compact")
      : modelId === "epure" ? "minimalist" : "classic";
  const selected = Boolean(
    (templateId === "minimaliste" && modelId) ||
    (templateId === "modern" && modelId) ||
    (templateId === "premium" && modelId),
  );
  const [previewOpen, setPreviewOpen] = useState(false);
  const [data, setData] = useState<CVData>(emptyCVData);
  const [skillLevels, setSkillLevels] = useState<Record<string, number>>({});
  const [activeSection, setActiveSection] = useState("infos");
  const [photoError, setPhotoError] = useState("");
  const [previewCollapsed, setPreviewCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ infos: true });

  useEffect(() => {
    setData(emptyCVData);
    setSkillLevels({});
    setOpenSections({ infos: true });
  }, [templateId, modelId]);

  usePageSEO({
    title: "Création-CV - EmploiPlus Group",
    description: "Créez votre CV professionnel avec EmploiPlus Group.",
    robots: "noindex,nofollow",
  });

  const updateField = (field: keyof CVData) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData((current) => ({ ...current, [field]: event.target.value }));
  };

  const addListItem = (field: "skills" | "languages", value: string) => {
    const item = value.trim();
    if (!item) return;
    setData((current) => ({
      ...current,
      [field]: current[field].split(",").map((entry) => entry.trim()).filter(Boolean).includes(item)
        ? current[field]
        : current[field] ? `${current[field]}, ${item}` : item,
    }));
  };

  const updateSkillLevel = (skill: string, level: number) => {
    setSkillLevels((current) => ({ ...current, [skill]: level }));
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Sélectionnez une image valide.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("La photo ne doit pas dépasser 5 Mo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setData((current) => ({ ...current, photo: typeof reader.result === "string" ? reader.result : "" }));
      setPhotoError("");
    };
    reader.readAsDataURL(file);
  };

  const hasSectionContent = (section: string) => {
    if (section === "infos") return Boolean(data.name && data.title && data.email);
    if (section === "experience") return Boolean(data.experience.trim());
    if (section === "formation") return Boolean(data.education.trim());
    return Boolean(data.skills.trim() && data.languages.trim());
  };

  const sectionItems = [
    { id: "infos", label: "Infos", icon: UserRound },
    { id: "experience", label: "Expérience", icon: BriefcaseBusiness },
    { id: "formation", label: "Formation", icon: GraduationCap },
    { id: "competences", label: "Compétences", icon: Languages },
  ];

  const previewData = selectedTemplate === "signature" && !Object.values(data).some(Boolean)
    ? signatureCVData
    : selectedTemplate === "minimalist" && !Object.values(data).some(Boolean)
      ? initialCVData
    : data;

  const toggleSection = (section: string) => {
    setOpenSections((current) => ({ ...current, [section]: !current[section] }));
  };

  const categoryLabel = templateId === "modern" ? "Style moderne" : templateId === "premium" ? "Style premium" : "Style minimaliste";
  const modelLabel = modelId === "colonnes" ? "CV Moderne Élégant" : modelId === "epure" ? "CV Moderne Épuré" : modelId === "signature" ? "CV Premium Signature" : modelId === "editorial" ? "CV Premium Éditorial" : "Modèle sélectionné";
  const breadcrumb = (
    <Breadcrumb className="mb-8">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/candidate/create-cv">Création de CV</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {(templateId || modelId) && <BreadcrumbSeparator />}
        {templateId && !modelId && <BreadcrumbItem><BreadcrumbPage>{categoryLabel}</BreadcrumbPage></BreadcrumbItem>}
        {templateId && modelId && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link to={`/candidate/create-cv/${templateId}`}>{categoryLabel}</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>{modelLabel}</BreadcrumbPage></BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );

  if (!selected || modernCategory || premiumCategory || (templateId === "minimaliste" && !modelId)) {
    return (
      <div className="space-y-0 font-sans">
        {templateId && breadcrumb}
        <div className={!templateId ? "grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)] md:items-center" : undefined}>
        <header className={cn("max-w-3xl space-y-2", !templateId && "slide-in-left")}>
          {!templateId && (
            <>
              <h1 className="font-display text-[28px] font-medium leading-tight text-foreground">
                Un CV à la hauteur de votre parcours
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Des modèles pensés pour être lus rapidement par les recruteurs et présenter votre expérience avec clarté.
              </p>
            </>
          )}
          {modernCategory && <h1 className="text-2xl font-bold text-foreground">CV modernes</h1>}
          {modernCategory && <p className="mt-1 text-sm text-muted-foreground">Choisissez un modèle moderne pour créer votre CV.</p>}
          {premiumCategory && <h1 className="text-2xl font-bold text-foreground">CV premium</h1>}
          {premiumCategory && <p className="mt-1 text-sm text-muted-foreground">Choisissez un modèle premium pour créer votre CV.</p>}
        </header>

        {!templateId && (
          <section className="mt-6 grid grid-cols-3 border-y border-border/70 bg-background slide-in-right slide-delay-1 md:mt-0">
            {["2|styles disponibles", "5 min|temps moyen de création", "PDF|prêt à télécharger"].map((stat, index) => {
              const [value, label] = stat.split("|");
              return (
                <div key={label} className={cn("px-3 py-4 text-center", index > 0 && "border-l border-border/70")}>
                  <p className="text-lg font-medium text-foreground">{value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{label}</p>
                </div>
              );
            })}
          </section>
        )}
        </div>

        <section id={!templateId ? "cv-styles" : undefined} className="space-y-5 py-9">
          {!templateId && (
            <div className="text-center fade-up slide-delay-2">
              <h2 className="font-display text-xl font-medium text-foreground">Choisissez votre style</h2>
              <p className="mt-2 text-sm text-muted-foreground">Deux directions visuelles, une présentation professionnelle.</p>
            </div>
          )}
        <div className="grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
          {modernCategory && (
            <>
              <Card className="group overflow-hidden border-border/70 transition duration-200 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                <div className="flex h-[170px] items-center justify-center overflow-hidden bg-muted p-4"><TemplateThumbnail className="w-24" /></div>
                <CardHeader className="space-y-2 p-4"><CardTitle className="font-display text-lg font-medium">CV Moderne Épuré</CardTitle><CardDescription className="text-sm leading-5">Une mise en page claire et structurée pour une lecture rapide.</CardDescription></CardHeader>
                <CardContent className="p-4 pt-0"><Button variant="outline" className="w-full justify-between border-border bg-transparent text-sm transition duration-200 ease-out hover:bg-muted" onClick={() => navigate("/candidate/create-cv/modern/epure")}>Créer ce CV<ArrowRight className="size-4" /></Button></CardContent>
              </Card>
              <Card className="group overflow-hidden border-border/70 transition duration-200 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                <div className="flex min-h-[170px] items-center justify-center overflow-hidden bg-muted p-4"><div className="w-full max-w-[180px] overflow-hidden shadow-sm"><div className="flex items-center gap-2 bg-brand-deep p-3 text-white"><span className="size-7 rounded-full border border-white bg-slate-600" /><span className="h-2 w-2/3 bg-white/90" /></div><div className="grid grid-cols-[0.7fr_1.3fr] gap-2 bg-white p-3"><div className="space-y-2"><div className="h-2 w-full bg-slate-200" /><div className="h-1 w-4/5 bg-slate-300" /><div className="h-2 w-full bg-slate-200" /></div><div className="space-y-2"><div className="h-2 w-2/3 bg-slate-300" /><div className="h-1 w-full bg-slate-200" /><div className="h-1 w-5/6 bg-slate-200" /><div className="h-1 w-full bg-slate-200" /></div></div></div></div>
                <CardHeader className="space-y-2 p-4"><CardTitle className="font-display text-lg font-medium">CV Corporate</CardTitle><CardDescription className="text-sm leading-5">En-tête sombre, colonne contact et expérience détaillée pour les profils confirmés.</CardDescription></CardHeader>
                <CardContent className="p-4 pt-0"><Button variant="outline" className="w-full justify-between border-border bg-transparent text-sm transition duration-200 ease-out hover:bg-muted" onClick={() => navigate("/candidate/create-cv/modern/corporate")}>Créer ce CV<ArrowRight className="size-4" /></Button></CardContent>
              </Card>
              <Card className="group overflow-hidden border-border/70 transition duration-200 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                <div className="flex min-h-[170px] items-center justify-center overflow-hidden bg-muted p-4"><div className="w-full max-w-[180px] overflow-hidden bg-white shadow-sm"><div className="flex h-12 items-center gap-2 bg-primary px-3"><span className="size-8 rounded-full border-2 border-white bg-slate-200" /><span className="h-2 w-1/2 bg-white/90" /></div><div className="grid grid-cols-[0.75fr_1.25fr] gap-2 p-3"><div className="space-y-2 border-r border-slate-200 pr-2"><div className="h-2 w-2/3 bg-primary" /><div className="h-1 w-full bg-slate-200" /><div className="h-1 w-4/5 bg-slate-200" /></div><div className="space-y-2"><div className="h-2 w-1/2 bg-slate-600" /><div className="h-1 w-full bg-slate-200" /><div className="h-1 w-5/6 bg-slate-200" /></div></div></div></div>
                <CardHeader className="space-y-2 p-4"><CardTitle className="font-display text-lg font-medium">CV Moderne Créatif</CardTitle><CardDescription className="text-sm leading-5">Photo, colonne latérale et accent graphique pour les profils marketing, design et communication.</CardDescription></CardHeader>
                <CardContent className="p-4 pt-0"><Button variant="outline" className="w-full justify-between border-border bg-transparent text-sm transition duration-200 ease-out hover:bg-muted" onClick={() => navigate("/candidate/create-cv/modern/creative")}>Créer ce CV<ArrowRight className="size-4" /></Button></CardContent>
              </Card>
            </>
          )}
          {premiumCategory && (
            <>
              <Card className="group overflow-hidden border-border/70 transition duration-200 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                <div className="flex min-h-[170px] items-center justify-center overflow-hidden bg-muted p-4"><div className="w-full max-w-[180px] overflow-hidden shadow-sm"><div className="flex items-center gap-2 bg-brand-deep p-3 text-white"><span className="size-7 rounded-full border border-white bg-slate-600" /><span className="h-2 w-2/3 bg-white/90" /></div><div className="grid grid-cols-[0.7fr_1.3fr] gap-2 bg-white p-3"><div className="space-y-2 bg-brand-deep p-2"><div className="h-2 w-full bg-white/80" /><div className="h-1 w-4/5 bg-white/40" /><div className="h-1 w-full bg-white/40" /></div><div className="space-y-2"><div className="h-2 w-2/3 bg-slate-700" /><div className="h-1 w-full bg-slate-200" /><div className="h-1 w-5/6 bg-slate-200" /></div></div></div></div>
                <CardHeader className="space-y-2 p-4"><CardTitle className="font-display text-lg font-medium">CV Premium Signature</CardTitle><CardDescription className="text-sm leading-5">Une composition sombre et structurée pour les profils créatifs et les directions expérimentées.</CardDescription></CardHeader>
                <CardContent className="p-4 pt-0"><Button variant="outline" className="w-full justify-between border-border bg-transparent text-sm transition duration-200 ease-out hover:bg-muted" onClick={() => navigate("/candidate/create-cv/premium/signature")}>Créer ce CV<ArrowRight className="size-4" /></Button></CardContent>
              </Card>
              <Card className="group overflow-hidden border-border/70 transition duration-200 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                <div className="flex min-h-[170px] items-center justify-center overflow-hidden bg-muted p-4"><div className="w-full max-w-[180px] overflow-hidden bg-white shadow-sm"><div className="flex h-12 items-center gap-2 bg-secondary px-3"><span className="size-8 rounded-full border-2 border-white bg-slate-300" /><span className="h-2 w-1/2 bg-white/90" /></div><div className="grid grid-cols-[0.75fr_1.25fr] gap-2 p-3"><div className="space-y-2 border-r border-slate-300 pr-2"><div className="h-2 w-2/3 bg-secondary" /><div className="h-1 w-full bg-slate-200" /><div className="h-2 w-2/3 bg-secondary" /></div><div className="space-y-2"><div className="h-2 w-1/2 bg-slate-700" /><div className="h-1 w-full bg-slate-200" /><div className="h-1 w-5/6 bg-slate-200" /></div></div></div></div>
                <CardHeader className="space-y-2 p-4"><CardTitle className="font-display text-lg font-medium">CV Premium Éditorial</CardTitle><CardDescription className="text-sm leading-5">Une mise en page élégante en deux colonnes, conçue pour raconter un parcours complet.</CardDescription></CardHeader>
                <CardContent className="p-4 pt-0"><Button variant="outline" className="w-full justify-between border-border bg-transparent text-sm transition duration-200 ease-out hover:bg-muted" onClick={() => navigate("/candidate/create-cv/premium/editorial")}>Créer ce CV<ArrowRight className="size-4" /></Button></CardContent>
              </Card>
            </>
          )}
          {templateId === "minimaliste" && (
            <>
              <Card className="group overflow-hidden border-border/70 transition duration-200 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                <div className="flex h-[170px] items-center justify-center overflow-hidden bg-muted p-4"><TemplateThumbnail className="w-24" /></div>
                <CardHeader className="space-y-2 p-4"><CardTitle className="font-display text-lg font-medium">Modèle professionnel</CardTitle><CardDescription className="text-sm leading-5">Une présentation sobre sur une colonne, adaptée aux profils juridiques, financiers et juniors.</CardDescription></CardHeader>
                <CardContent className="p-4 pt-0"><Button variant="outline" className="w-full justify-between border-border bg-transparent text-sm transition duration-200 ease-out hover:bg-muted" onClick={() => navigate("/candidate/create-cv/minimaliste/epure")}>Ouvrir ce modèle<ArrowRight className="size-4" /></Button></CardContent>
              </Card>
              <Card className="group overflow-hidden border-border/70 transition duration-200 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                <div className="flex h-[170px] items-center justify-center overflow-hidden bg-muted p-4"><TemplateThumbnail compact className="w-24" /></div>
                <CardHeader className="space-y-2 p-4"><CardTitle className="font-display text-lg font-medium">Modèle moderne</CardTitle><CardDescription className="text-sm leading-5">Une structure en deux colonnes pour valoriser un parcours riche et polyvalent.</CardDescription></CardHeader>
                <CardContent className="p-4 pt-0"><Button variant="outline" className="w-full justify-between border-border bg-transparent text-sm transition duration-200 ease-out hover:bg-muted" onClick={() => navigate("/candidate/create-cv/minimaliste/ligne")}>Ouvrir ce modèle<ArrowRight className="size-4" /></Button></CardContent>
              </Card>
            </>
          )}
          {!templateId && (
            <>
              <Carousel opts={{ align: "start", loop: true }} className="col-span-full mx-auto w-full max-w-5xl px-10 slide-in-up slide-delay-2">
                <CarouselContent className="after:block after:min-w-8">
                  <CarouselItem className="basis-full md:basis-1/3"><Card className="group overflow-hidden border-border/70 transition duration-300 ease-out hover:-translate-y-1 hover:scale-[1.015] hover:border-primary/40 hover:shadow-lg">
                <div className="flex min-h-[170px] items-center justify-center overflow-hidden bg-muted p-4"><TemplateThumbnail /></div>
                <CardHeader className="space-y-2 p-4"><CardTitle className="font-display text-lg font-medium">Style minimaliste</CardTitle><CardDescription className="text-sm leading-5">Épuré, une colonne, idéal pour les profils juridiques, financiers et les parcours juniors.</CardDescription></CardHeader>
                <CardContent className="p-4 pt-0"><Button className="group/button w-full justify-between bg-[linear-gradient(120deg,#7DB7E3_0%,#7DB7E3_1%,#3B8DCE_6%,#000079_100%)] text-sm text-white transition duration-300 ease-out hover:brightness-110 hover:shadow-md" onClick={() => navigate("/candidate/create-cv/minimaliste")}>Voir les modèles<ArrowRight className="size-4 transition-transform duration-300 group-hover/button:translate-x-1" /></Button></CardContent>
                  </Card></CarouselItem>
                  <CarouselItem className="basis-full md:basis-1/3"><Card className="group overflow-hidden border-border/70 transition duration-300 ease-out hover:-translate-y-1 hover:scale-[1.015] hover:border-primary/40 hover:shadow-lg">
                <div className="flex min-h-[170px] items-center justify-center overflow-hidden bg-muted p-4"><TemplateThumbnail compact /></div>
                <CardHeader className="space-y-2 p-4"><CardTitle className="font-display text-lg font-medium">Style moderne</CardTitle><CardDescription className="text-sm leading-5">Deux colonnes avec bandeau latéral, pour les profils commerciaux, créatifs et polyvalents.</CardDescription></CardHeader>
                <CardContent className="p-4 pt-0"><Button className="group/button w-full justify-between bg-[linear-gradient(120deg,#7DB7E3_0%,#7DB7E3_1%,#3B8DCE_6%,#000079_100%)] text-sm text-white transition duration-300 ease-out hover:brightness-110 hover:shadow-md" onClick={() => navigate("/candidate/create-cv/modern")}>Voir les modèles<ArrowRight className="size-4 transition-transform duration-300 group-hover/button:translate-x-1" /></Button></CardContent>
                  </Card></CarouselItem>
                  <CarouselItem className="basis-full md:basis-1/3"><Card className="group relative overflow-visible border-border/70 transition duration-300 ease-out hover:-translate-y-1 hover:scale-[1.015] hover:border-primary/40 hover:shadow-lg">
                <div className="absolute left-4 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"><Crown className="size-3.5" />Premium</div>
                <div className="flex min-h-[170px] items-center justify-center overflow-hidden rounded-t-lg bg-muted p-4"><TemplateThumbnail compact /></div>
                <CardHeader className="space-y-2 p-4"><CardTitle className="font-display text-lg font-medium">Style premium</CardTitle><CardDescription className="text-sm leading-5">Des modèles haut de gamme avec une présentation travaillée pour les profils expérimentés.</CardDescription></CardHeader>
                <CardContent className="p-4 pt-0"><Button type="button" disabled aria-disabled="true" title="Réservé aux abonnés Premium" className="group/button w-full justify-between bg-[linear-gradient(120deg,#7DB7E3_0%,#7DB7E3_1%,#3B8DCE_6%,#000079_100%)] text-sm text-white transition duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-100" onClick={(event) => event.preventDefault()}>Voir les modèles<Crown className="size-4" /></Button></CardContent>
                  </Card></CarouselItem>
                </CarouselContent>
                <CarouselPrevious className="left-0 transition duration-300 hover:scale-110 hover:border-primary hover:bg-primary hover:text-primary-foreground" aria-label="Style précédent" />
                <CarouselNext className="right-0 transition duration-300 hover:scale-110 hover:border-primary hover:bg-primary hover:text-primary-foreground" aria-label="Style suivant" />
              </Carousel>
            </>
          )}
        </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6 font-sans">
      {breadcrumb}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="font-display text-[32px] font-medium leading-tight text-foreground">Personnalisez votre CV</h1><p className="mt-2 text-base text-muted-foreground">Vos informations restent dans votre navigateur et ne sont jamais envoyées.</p></div>
        <div className="flex gap-2"><Button variant="outline" size="icon" aria-label="Visualiser le CV" title="Visualiser le CV" onClick={() => setPreviewOpen(true)}><Eye className="size-4" /></Button><Button variant="outline" size="icon" aria-label={previewCollapsed ? "Afficher l’aperçu" : "Réduire l’aperçu"} title={previewCollapsed ? "Afficher l’aperçu" : "Réduire l’aperçu"} onClick={() => setPreviewCollapsed((collapsed) => !collapsed)}>{previewCollapsed ? <PanelRightOpen className="size-4" /> : <PanelRightClose className="size-4" />}</Button><Button onClick={() => downloadCV(data)} className="gap-2 bg-slate-800 text-white hover:bg-slate-700"><Download className="size-4" />Télécharger en PDF</Button></div>
      </div>
      <div className={cn("grid justify-center gap-8 transition-[grid-template-columns] duration-600 ease-in-out", previewCollapsed ? "xl:grid-cols-[minmax(0,1fr)_0fr]" : "xl:grid-cols-[460px_minmax(0,1fr)]")}>
        <div className={cn("mx-auto w-full origin-center space-y-6 transition-[max-width,transform] duration-600 ease-in-out", previewCollapsed ? "xl:max-w-5xl xl:translate-x-0" : "xl:max-w-[460px] xl:translate-x-0")}>
          <nav className="grid grid-cols-4 gap-1 border-b border-border/70 pb-4" aria-label="Progression du CV">
            {sectionItems.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setActiveSection(id)} className={cn("flex flex-col items-center gap-2 rounded-md px-1 py-2 text-xs transition duration-200 ease-out", activeSection === id ? "text-primary" : "text-muted-foreground hover:text-foreground")}><span className={cn("flex size-8 items-center justify-center rounded-full border", hasSectionContent(id) ? "border-primary bg-primary text-primary-foreground" : activeSection === id ? "border-primary" : "border-border")}>{hasSectionContent(id) ? <Check className="size-4" /> : <Icon className="size-4" />}</span>{label}</button>)}
          </nav>

          <Card className="border-border/70 shadow-sm" onFocus={() => setActiveSection("infos")}>
            <button type="button" onClick={() => toggleSection("infos")} className="flex w-full items-center justify-between border-b border-border/60 p-6 text-left"><span><CardTitle className="flex items-center gap-2 font-display text-xl font-medium"><UserRound className="size-4 text-primary" />Informations</CardTitle><CardDescription className="mt-1">Les coordonnées qui ouvrent votre CV.</CardDescription></span><ChevronDown className={cn("size-5 text-muted-foreground transition-transform duration-200", openSections.infos && "rotate-180")} /></button>
            {openSections.infos && <CardContent className="grid gap-4 p-6">
              {(["name", "title"] as const).map((field) => <div className="space-y-1.5" key={field}><Label htmlFor={`cv-${field}`}>{field === "name" ? "Nom complet" : "Titre professionnel"}</Label><Input placeholder={field === "name" ? "Ex. Marie Dupont" : "Ex. Responsable commerciale"} className="transition duration-200 ease-out" id={`cv-${field}`} value={data[field]} onChange={updateField(field)} /></div>)}
              {(["phone", "email", "address"] as const).map((field) => { const Icon = field === "phone" ? Phone : field === "email" ? Mail : MapPin; return <div className="space-y-1.5" key={field}><Label htmlFor={`cv-${field}`}>{field === "phone" ? "Téléphone" : field === "email" ? "Email" : "Adresse"}</Label><div className="relative"><Icon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder={field === "phone" ? "Ex. 06 12 34 56 78" : field === "email" ? "Ex. marie@exemple.com" : "Ex. Paris, France"} className="pl-9 transition duration-200 ease-out" id={`cv-${field}`} value={data[field]} onChange={updateField(field)} /></div></div>; })}
              <div className="space-y-1.5"><Label htmlFor="cv-about">Présentation</Label><Textarea placeholder="Présentez votre parcours en quelques lignes..." id="cv-about" rows={4} value={data.about} onChange={updateField("about")} /></div>
              {(selectedTemplate === "compact" || selectedTemplate === "corporate" || selectedTemplate === "creative" || selectedTemplate === "editorial" || selectedTemplate === "signature") && <div className="space-y-3 border-t border-border/60 pt-4"><div><Label htmlFor="cv-photo">Photo</Label><p className="mt-1 text-xs text-muted-foreground">Ajoutez une photo professionnelle pour ce modèle.</p></div><div className="flex items-center gap-3"><div className="flex size-14 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">{data.photo ? <img src={data.photo} alt="Aperçu de votre photo" className="size-full object-cover" /> : <Camera className="size-5 text-muted-foreground" />}</div><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" className="transition duration-200 ease-out"><label htmlFor="cv-photo" className="flex cursor-pointer items-center gap-2"><Camera className="size-4" />{data.photo ? "Remplacer" : "Ajouter une photo"}</label></Button>{data.photo && <Button type="button" variant="ghost" size="icon" aria-label="Supprimer la photo" onClick={() => setData((current) => ({ ...current, photo: "" }))}><X className="size-4" /></Button>}</div><input id="cv-photo" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoChange} /></div>{photoError && <p className="text-xs text-destructive">{photoError}</p>}</div>}
            </CardContent>}
          </Card>

          <Card className="border-border/70 shadow-sm" onFocus={() => setActiveSection("experience")}>
            <button type="button" onClick={() => toggleSection("experience")} className="flex w-full items-center justify-between border-b border-border/60 p-6 text-left"><span><CardTitle className="flex items-center gap-2 font-display text-xl font-medium"><BriefcaseBusiness className="size-4 text-primary" />Expérience</CardTitle><CardDescription className="mt-1">Présentez les expériences les plus utiles au poste visé.</CardDescription></span><ChevronDown className={cn("size-5 text-muted-foreground transition-transform duration-200", openSections.experience && "rotate-180")} /></button>
            {openSections.experience && <CardContent className="space-y-4 p-6"><div className="rounded-md border border-border/70 p-4"><div className="mb-3 flex items-center justify-between"><p className="text-sm font-medium">Parcours professionnel</p><div className="flex gap-1 text-muted-foreground"><Button variant="ghost" size="icon" className="size-7"><span className="sr-only">Modifier</span><PenLine className="size-4" /></Button><Button variant="ghost" size="icon" className="size-7"><span className="sr-only">Supprimer</span><Trash2 className="size-4" /></Button></div></div><Textarea id="cv-experience" rows={8} placeholder="Décrivez vos expériences, postes, missions et résultats..." value={data.experience} onChange={updateField("experience")} /></div><Button variant="outline" className="w-full border-dashed bg-transparent transition duration-200 ease-out hover:bg-muted"><Plus className="mr-2 size-4" />Ajouter une expérience</Button></CardContent>}
          </Card>

          <Card className="border-border/70 shadow-sm" onFocus={() => setActiveSection("formation")}>
            <button type="button" onClick={() => toggleSection("formation")} className="flex w-full items-center justify-between border-b border-border/60 p-6 text-left"><span><CardTitle className="flex items-center gap-2 font-display text-xl font-medium"><GraduationCap className="size-4 text-primary" />Formation</CardTitle><CardDescription className="mt-1">Ajoutez les diplômes et formations qui vous valorisent.</CardDescription></span><ChevronDown className={cn("size-5 text-muted-foreground transition-transform duration-200", openSections.formation && "rotate-180")} /></button>
            {openSections.formation && <CardContent className="space-y-4 p-6"><div className="rounded-md border border-border/70 p-4"><div className="mb-3 flex items-center justify-between"><p className="text-sm font-medium">Parcours académique</p><div className="flex gap-1 text-muted-foreground"><Button variant="ghost" size="icon" className="size-7" aria-label="Modifier la formation"><PenLine className="size-4" /></Button><Button variant="ghost" size="icon" className="size-7" aria-label="Supprimer la formation"><Trash2 className="size-4" /></Button></div></div><Textarea id="cv-education" rows={7} placeholder="Indiquez vos diplômes, établissements et années..." value={data.education} onChange={updateField("education")} /></div><Button variant="outline" className="w-full border-dashed bg-transparent transition duration-200 ease-out hover:bg-muted"><Plus className="mr-2 size-4" />Ajouter une formation</Button></CardContent>}
          </Card>

          <Card className="border-border/70 shadow-sm" onFocus={() => setActiveSection("competences")}>
            <button type="button" onClick={() => toggleSection("competences")} className="flex w-full items-center justify-between border-b border-border/60 p-6 text-left"><span><CardTitle className="flex items-center gap-2 font-display text-xl font-medium"><Languages className="size-4 text-primary" />Compétences et langues</CardTitle><CardDescription className="mt-1">Sélectionnez des suggestions ou ajoutez vos propres éléments.</CardDescription></span><ChevronDown className={cn("size-5 text-muted-foreground transition-transform duration-200", openSections.competences && "rotate-180")} /></button>
            {openSections.competences && <CardContent className="space-y-5 p-6"><TagEditor label="Compétences" field="skills" value={data.skills} suggestions={["Communication", "Gestion de projet", "Analyse", "Leadership", "Excel"]} onAdd={addListItem} onChange={updateField("skills")} skillLevels={skillLevels} onLevelChange={updateSkillLevel} /><TagEditor label="Langues" field="languages" value={data.languages} suggestions={["Français", "Anglais", "Espagnol", "Allemand"]} onAdd={addListItem} onChange={updateField("languages")} /></CardContent>}
          </Card>
        </div>
        <div className={cn("h-fit min-w-0 overflow-hidden transition duration-600 ease-in-out xl:sticky xl:top-6", previewCollapsed ? "translate-x-full opacity-0" : "translate-x-0 opacity-100")} aria-hidden={previewCollapsed}><div className="rounded-xl bg-[oklch(0.965_0.012_70)] p-4 sm:p-6">{selectedTemplate === "compact" ? <CompactCVPreview data={previewData} /> : selectedTemplate === "corporate" ? <CorporateCVPreview data={previewData} /> : selectedTemplate === "creative" ? <CreativeCVPreview data={previewData} /> : selectedTemplate === "editorial" ? <EditorialCVPreview data={previewData} skillLevels={skillLevels} /> : selectedTemplate === "signature" ? <SignatureCVPreview data={previewData} skillLevels={skillLevels} /> : selectedTemplate === "minimalist" ? <MinimalistCVPreview data={previewData} /> : <CVPreview data={previewData} />}</div></div>
      </div>
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}><DialogContent className="max-h-[95vh] max-w-4xl overflow-y-auto"><DialogHeader><DialogTitle>Aperçu de votre CV</DialogTitle><DialogDescription>Vérifiez votre CV avant de le télécharger.</DialogDescription></DialogHeader>{selectedTemplate === "compact" ? <CompactCVPreview data={previewData} /> : selectedTemplate === "corporate" ? <CorporateCVPreview data={previewData} /> : selectedTemplate === "creative" ? <CreativeCVPreview data={previewData} /> : selectedTemplate === "editorial" ? <EditorialCVPreview data={previewData} skillLevels={skillLevels} /> : selectedTemplate === "signature" ? <SignatureCVPreview data={previewData} skillLevels={skillLevels} /> : selectedTemplate === "minimalist" ? <MinimalistCVPreview data={previewData} /> : <CVPreview data={previewData} />}<Button onClick={() => downloadCV(data)} className="mx-auto gap-2 bg-slate-800 text-white hover:bg-slate-700"><Download className="size-4" />Télécharger en PDF</Button></DialogContent></Dialog>
    </div>
  );
}
