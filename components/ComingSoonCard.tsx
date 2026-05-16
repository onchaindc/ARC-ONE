import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function ComingSoonCard({ title, body, badge = "Coming Soon" }: { title: string; body: string; badge?: string }) {
  return (
    <Card className="p-4">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <h3 className="min-w-0 break-words font-black text-white">{title}</h3>
        <Badge className="shrink-0">{badge}</Badge>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted">{body}</p>
    </Card>
  );
}
