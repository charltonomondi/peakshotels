import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/cms")({
  component: CmsPage,
});

const SECTIONS = [
  { key: "hero", label: "Hero", fields: ["title","subtitle","cta_label"] },
  { key: "about", label: "About", fields: ["title","body"] },
  { key: "contact", label: "Contact", fields: ["phone","email","address"] },
  { key: "offers", label: "Offers/Promotions", fields: ["title","body"] },
];

function CmsPage() {
  const [data, setData] = useState<Record<string, any>>({});

  useEffect(() => { load(); }, []);
  async function load() {
    const { data: rows } = await supabase.from("cms_content").select("*");
    const m: Record<string, any> = {};
    (rows ?? []).forEach((r: any) => { m[r.section] = r.data; });
    setData(m);
  }

  async function save(section: string) {
    const payload = data[section] ?? {};
    const { error } = await supabase.from("cms_content").upsert({ section, data: payload }, { onConflict: "section" });
    if (error) return toast.error(error.message);
    toast.success(`${section} saved`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Website Content</h1>
        <p className="text-muted-foreground">Manage homepage and site content</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {SECTIONS.map((s) => (
          <Card key={s.key}>
            <CardHeader><CardTitle>{s.label}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {s.fields.map((f) => (
                <div key={f}>
                  <Label className="capitalize">{f.replace("_"," ")}</Label>
                  {f === "body" ? (
                    <Textarea rows={3} value={data[s.key]?.[f] ?? ""} onChange={(e) => setData({ ...data, [s.key]: { ...(data[s.key] ?? {}), [f]: e.target.value } })} />
                  ) : (
                    <Input value={data[s.key]?.[f] ?? ""} onChange={(e) => setData({ ...data, [s.key]: { ...(data[s.key] ?? {}), [f]: e.target.value } })} />
                  )}
                </div>
              ))}
              <Button size="sm" onClick={() => save(s.key)}>Save</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
