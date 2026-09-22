import type { ElementType, ReactNode } from "react";
import { Lock } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface ReadOnlyField {
  label: string;
  value: ReactNode;
}

interface ReadOnlyInfoCardProps {
  title: string;
  description?: string;
  icon?: ElementType;
  fields: ReadOnlyField[];
}

export default function ReadOnlyInfoCard({
  title,
  description,
  icon: Icon = Lock,
  fields,
}: ReadOnlyInfoCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        {fields.map((field) => (
          <div key={field.label} className="rounded-md border bg-muted/20 p-2.5">
            <span className="block text-xs text-muted-foreground">{field.label}</span>
            <span className="font-medium text-foreground">{field.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}