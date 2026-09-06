import logoAsset from "@/assets/vida-logo.png.asset.json";

interface BrandLockupProps {
  title: string;
}

export function BrandLockup({ title }: BrandLockupProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <img
        src={logoAsset.url}
        alt="VIDA — Una revista para vivir mejor"
        className="h-7 w-auto max-w-full shrink-0 sm:h-8"
      />
      <span className="hidden h-7 w-px shrink-0 bg-gradient-to-b from-brand-teal via-brand-blue to-brand-magenta sm:block" />
      <div className="hidden min-w-0 flex-col sm:flex">
        <p
          className="truncate text-[11px] font-semibold tracking-[0.18em] text-foreground uppercase sm:text-xs"
          aria-live="polite"
        >
          {title}
        </p>
        <p className="truncate text-[9px] tracking-[0.24em] text-muted-foreground uppercase">
          Una revista para vivir mejor · Online
        </p>
      </div>
    </div>
  );
}
