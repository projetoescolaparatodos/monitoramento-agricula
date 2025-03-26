
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export default function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-8 flex flex-col md:flex-row md:items-center md:justify-between", className)}>
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-secondary">{title}</h1>
        {description && <p className="text-neutral mt-1">{description}</p>}
      </div>
      {actions && <div className="mt-4 md:mt-0">{actions}</div>}
    </div>
  );
}
