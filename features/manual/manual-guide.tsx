"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Camera, CheckCircle2, FileText, ListTree, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { manualChapters, type ManualChapter, type ManualSection } from "@/features/manual/manual-content";
import { cn } from "@/lib/utils";

type DisplaySection = ManualSection & {
  subSections?: ManualSection[];
};

const productFieldIds = new Set([
  "campo-imagen-producto",
  "campo-nombre-producto",
  "campo-codigo-producto",
  "campo-categoria-producto",
  "campo-precio-producto",
  "campo-material-producto",
  "campo-medidas-producto",
  "campo-descripcion-producto",
  "campo-observaciones-producto",
  "campo-visible-producto",
]);

function getHashChapter() {
  if (typeof window === "undefined") return manualChapters[0]?.id ?? "";
  const id = window.location.hash.replace("#", "");
  return manualChapters.some((chapter) => chapter.id === id) ? id : manualChapters[0]?.id ?? "";
}

function cleanTitle(title: string) {
  return title.replace(/^\d+(?:\.\d+)?\s+/, "");
}

function cleanFieldTitle(title: string) {
  return cleanTitle(title).replace(/^Campo:\s*/, "");
}

function getDisplaySections(chapter: ManualChapter): DisplaySection[] {
  if (chapter.id !== "productos") return chapter.sections;

  const byId = new Map(chapter.sections.map((section) => [section.id, section]));
  const fields = chapter.sections.filter((section) => productFieldIds.has(section.id));
  const formGuide: DisplaySection = {
    id: "formulario-producto",
    title: "Cómo llenar el formulario",
    body: [
      "El formulario de producto se entiende mejor campo por campo. Primero carga la imagen y los datos obligatorios; después completa la información comercial que ayuda a cotizar y publicar bien la ficha.",
      "Usa los ejemplos como referencia de estilo. La idea no es llenar por llenar, sino que cada dato ayude a identificar, vender o administrar el producto.",
    ],
    captures: ["Formulario de producto completo, señalando imagen, datos principales y botón Guardar"],
    subSections: fields,
  };

  return [
    byId.get("lista-productos"),
    byId.get("crear-producto"),
    formGuide,
    byId.get("filtrar-productos"),
    byId.get("ordenar-productos"),
    byId.get("editar-publicar-eliminar"),
    byId.get("usos-sucursales"),
  ].filter(Boolean) as DisplaySection[];
}

function ManualCapture({
  chapterId,
  sectionId,
  index,
  description,
}: {
  chapterId: string;
  sectionId: string;
  index: number;
  description: string;
}) {
  const [missing, setMissing] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const src = `/manual/${chapterId}/${sectionId}-${index + 1}.webp`;

  return (
    <figure className="mx-auto w-full max-w-5xl overflow-hidden rounded-[1rem] border border-dashed border-[color:var(--border)] bg-[color:var(--panel)] text-[color:var(--foreground)]">
      {!missing ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={description}
          className={cn(
            "block max-w-full bg-[color:var(--surface-soft)]",
            isPortrait ? "h-auto max-h-[42rem] w-auto" : "h-auto w-full",
          )}
          onLoad={(event) => setIsPortrait(event.currentTarget.naturalHeight > event.currentTarget.naturalWidth)}
          onError={() => setMissing(true)}
        />
      ) : (
        <div className="flex min-h-[22rem] flex-col justify-between p-5">
          <div>
            <span className="flex size-11 items-center justify-center rounded-full bg-[color:var(--surface-soft)] text-[color:var(--accent)]">
              <Camera size={20} aria-hidden />
            </span>
            <figcaption className="mt-5 text-xl font-semibold leading-tight text-[color:var(--foreground)]">Captura pendiente</figcaption>
            <p className="mt-3 text-base leading-7 text-[color:var(--foreground)]">{description}</p>
          </div>
          <div className="mt-6 border-t border-[color:var(--border)]/35 pt-4">
            <p className="text-sm font-semibold text-[color:var(--foreground)]">Archivo esperado</p>
            <code className="mt-1 block break-all text-sm text-[color:var(--muted)]">{src}</code>
          </div>
        </div>
      )}
    </figure>
  );
}

function CaptureStack({
  chapterId,
  sectionId,
  captures,
  startIndex = 0,
}: {
  chapterId: string;
  sectionId: string;
  captures: string[];
  startIndex?: number;
}) {
  if (!captures.length) return null;

  return (
    <div className="mt-6 grid gap-5">
      {captures.map((capture, captureIndex) => (
        <ManualCapture key={capture} chapterId={chapterId} sectionId={sectionId} index={startIndex + captureIndex} description={capture} />
      ))}
    </div>
  );
}

function Examples({ example }: { example?: ManualSection["example"] }) {
  if (!example?.good && !example?.bad) return null;

  return (
    <div className="mt-5 space-y-2 text-lg leading-8">
      {example.good ? (
        <p className="flex gap-3 text-[color:var(--foreground)]">
          <CheckCircle2 size={20} className="mt-1 shrink-0 text-[color:var(--success)]" aria-hidden />
          <span>
            <strong className="text-[color:var(--foreground)]">Ejemplo correcto:</strong> {example.good}
          </span>
        </p>
      ) : null}
      {example.bad ? (
        <p className="flex gap-3 text-[color:var(--foreground)]">
          <XCircle size={20} className="mt-1 shrink-0 text-[color:var(--danger)]" aria-hidden />
          <span>
            <strong className="text-[color:var(--foreground)]">Evita:</strong> {example.bad}
          </span>
        </p>
      ) : null}
    </div>
  );
}

function Steps({
  chapterId,
  sectionId,
  steps,
  captures,
}: {
  chapterId: string;
  sectionId: string;
  steps?: string[];
  captures: string[];
}) {
  if (!steps?.length) return null;

  return (
    <div className="mt-5">
      <p className="text-lg font-semibold text-[color:var(--foreground)]">Pasos</p>
      <ol className="mt-3 space-y-10 text-lg leading-8 text-[color:var(--foreground)]">
        {steps.map((step, stepIndex) => (
          <li key={step} className="grid gap-5">
            <div className="flex gap-3">
              <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--surface-soft)] text-sm font-semibold text-[color:var(--foreground)]">
                {stepIndex + 1}
              </span>
              <span>{step}</span>
            </div>
            {captures[stepIndex] ? (
              <div className="pl-0 pt-1 md:pl-10">
                <ManualCapture chapterId={chapterId} sectionId={sectionId} index={stepIndex} description={captures[stepIndex]} />
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

function Notes({ notes, warnings }: { notes?: string[]; warnings?: string[] }) {
  const items = [...(notes ?? []), ...(warnings ?? [])];
  if (!items.length) return null;

  return (
    <div className="mt-5 space-y-2 text-base leading-7 text-[color:var(--foreground)]">
      {items.map((item) => (
        <p key={item}>
          <strong className="text-[color:var(--foreground)]">Nota:</strong> {item}
        </p>
      ))}
    </div>
  );
}

function SectionArticle({
  chapterId,
  section,
  number,
}: {
  chapterId: string;
  section: DisplaySection;
  number: number;
}) {
  const looseCaptures = section.steps?.length ? section.captures.slice(section.steps.length) : section.captures;

  return (
    <article id={`${chapterId}-${section.id}`} className="rounded-[1.15rem] bg-[color:var(--surface)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:p-8">
      <div className="flex items-start gap-4">
        <span className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-base font-black text-black">{number}</span>
        <div className="min-w-0">
          <h3 className="text-3xl font-semibold leading-tight">{cleanTitle(section.title)}</h3>
          <div className="mt-4 space-y-4 text-lg leading-8 text-[color:var(--foreground)]">
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>

      {!section.steps?.length ? <CaptureStack chapterId={chapterId} sectionId={section.id} captures={looseCaptures} /> : null}
      <Steps chapterId={chapterId} sectionId={section.id} steps={section.steps} captures={section.captures} />
      {section.steps?.length ? <CaptureStack chapterId={chapterId} sectionId={section.id} captures={looseCaptures} startIndex={section.steps.length} /> : null}
      <Examples example={section.example} />
      <Notes notes={section.notes} warnings={section.warnings} />

      {section.subSections?.length ? (
        <div className="mt-8 space-y-8 border-t border-[color:var(--border)]/35 pt-7">
          {section.subSections.map((subSection, subIndex) => (
            <SubSectionArticle key={subSection.id} chapterId={chapterId} section={subSection} number={`${number}.${subIndex + 1}`} />
          ))}
        </div>
      ) : null}
    </article>
  );
}

function SubSectionArticle({
  chapterId,
  section,
  number,
}: {
  chapterId: string;
  section: ManualSection;
  number: string;
}) {
  const looseCaptures = section.steps?.length ? section.captures.slice(section.steps.length) : section.captures;

  return (
    <section id={`${chapterId}-${section.id}`} className="scroll-mt-24">
      <h4 className="text-2xl font-semibold leading-tight text-[color:var(--foreground)]">
        {number} {cleanFieldTitle(section.title)}
      </h4>
      <div className="mt-3 space-y-4 text-lg leading-8 text-[color:var(--foreground)]">
        {section.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      {!section.steps?.length ? <CaptureStack chapterId={chapterId} sectionId={section.id} captures={looseCaptures} /> : null}
      <Steps chapterId={chapterId} sectionId={section.id} steps={section.steps} captures={section.captures} />
      {section.steps?.length ? <CaptureStack chapterId={chapterId} sectionId={section.id} captures={looseCaptures} startIndex={section.steps.length} /> : null}
      <Examples example={section.example} />
      <Notes notes={section.notes} warnings={section.warnings} />
    </section>
  );
}

export function ManualGuide() {
  const [activeId, setActiveId] = useState(manualChapters[0]?.id ?? "");
  const activeIndex = useMemo(() => Math.max(0, manualChapters.findIndex((chapter) => chapter.id === activeId)), [activeId]);
  const chapter = manualChapters[activeIndex] ?? manualChapters[0];
  const sections = getDisplaySections(chapter);
  const previous = activeIndex > 0 ? manualChapters[activeIndex - 1] : null;
  const next = activeIndex < manualChapters.length - 1 ? manualChapters[activeIndex + 1] : null;

  useEffect(() => {
    function syncFromHash() {
      setActiveId(getHashChapter());
    }

    const timer = window.setTimeout(syncFromHash, 0);
    window.addEventListener("hashchange", syncFromHash);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("hashchange", syncFromHash);
    };
  }, []);

  function selectChapter(id: string) {
    setActiveId(id);
    window.history.replaceState(null, "", `#${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[19rem_minmax(0,1fr)]">
      <aside className="xl:sticky xl:top-24 xl:self-start">
        <nav className="rounded-[1.25rem] bg-[color:var(--panel)] p-3 shadow-[var(--shadow-card)]" aria-label="Índice del manual">
          <div className="mb-3 flex items-center gap-2 px-2 text-sm font-semibold text-[color:var(--muted)]">
            <ListTree size={17} aria-hidden />
            Índice
          </div>
          <div className="space-y-1">
            {manualChapters.map((item) => {
              const active = item.id === chapter.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectChapter(item.id)}
                  className={cn(
                    "focus-ring ui-pressable flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-full px-3 text-left text-sm font-semibold transition-[transform,background-color,color,box-shadow] duration-160 ease-[var(--ease-out-premium)] active:scale-[0.99]",
                    active
                      ? "bg-[color:var(--panel-raised)] text-[color:var(--foreground)] shadow-[var(--shadow-control)]"
                      : "text-[color:var(--muted)] hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--foreground)]",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full text-xs", active ? "bg-[color:var(--accent)] text-black" : "bg-[color:var(--surface-soft)] text-current")}>
                    {item.number}
                  </span>
                  <span className="min-w-0 truncate">{item.title}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </aside>

      <section id={chapter.id} className="min-w-0 rounded-[1.35rem] bg-[color:var(--panel)] shadow-[var(--shadow-card)]">
        <div className="border-b border-[color:var(--border)]/45 p-5 md:p-8">
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[color:var(--muted)]">
            <FileText size={17} className="text-[color:var(--accent)]" aria-hidden />
            Capítulo {chapter.number}
          </div>
          <h2 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">{chapter.title}</h2>
          <p className="mt-3 max-w-3xl text-lg leading-8 text-[color:var(--muted)]">{chapter.summary}</p>
        </div>

        <div className="grid gap-6 p-5 md:p-8">
          {sections.map((section, sectionIndex) => (
            <SectionArticle key={section.id} chapterId={chapter.id} section={section} number={sectionIndex + 1} />
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-[color:var(--border)]/45 p-5 sm:flex-row sm:items-center sm:justify-between md:p-8">
          {previous ? (
            <Button type="button" tone="chrome" iconLeft={<ArrowLeft size={16} aria-hidden />} onClick={() => selectChapter(previous.id)}>
              {previous.title}
            </Button>
          ) : (
            <span />
          )}
          {next ? (
            <Button type="button" tone="primary" iconRight={<ArrowRight size={16} aria-hidden />} onClick={() => selectChapter(next.id)}>
              {next.title}
            </Button>
          ) : null}
        </div>
      </section>
    </div>
  );
}
