import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function ComingSoonCard({ title, body, badge = "Coming Soon" }: { title: string; body: string; badge?: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-black text-white">{title}</h3>
        <Badge>{badge}</Badge>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted">{body}</p>
    </Card>
  );
}
