import { InfoToggletip } from "@/components/disclosure/info-toggletip";

export function PageHeader({
  title,
  help,
  action,
}: {
  title: string;
  help?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-[1.8rem] font-bold leading-tight tracking-[-0.01em] text-[color:var(--foreground)] md:text-[2.2rem]">{title}</h1>
          {help ? <InfoToggletip label={`Ayuda sobre ${title}`}>{help}</InfoToggletip> : null}
        </div>
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </header>
  );
}
