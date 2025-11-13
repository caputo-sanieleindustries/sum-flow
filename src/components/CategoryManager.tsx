import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  user_id?: string;
  is_system?: boolean;
}

const ICON_OPTIONS = [
  "🏠", "🚗", "🍕", "🛒", "💊", "🎮", "📱", "✈️", 
  "🎓", "💰", "🎨", "⚽", "🎵", "📚", "☕", "👕",
  "🎬", "🏋️", "🐕", "🌳", "💡", "🔧", "🎁", "🍔"
];

const COLOR_OPTIONS = [
  "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1"
];

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    icon: "💰",
    color: "#3b82f6"
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast.error("Errore nel caricamento delle categorie");
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Inserisci un nome per la categoria");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utente non autenticato");

      if (editingId) {
        // Update existing category
        const { error } = await (supabase as any)
          .from("categories")
          .update({
            name: formData.name,
            icon: formData.icon,
            color: formData.color
          })
          .eq("id", editingId)
          .eq("user_id", user.id);

        if (error) throw error;
        toast.success("Categoria aggiornata");
      } else {
        // Create new category
        const { error } = await (supabase as any)
          .from("categories")
          .insert({
            name: formData.name,
            icon: formData.icon,
            color: formData.color,
            user_id: user.id,
            is_system: false
          });

        if (error) throw error;
        toast.success("Categoria creata");
      }

      setFormData({ name: "", icon: "💰", color: "#3b82f6" });
      setEditingId(null);
      setIsDialogOpen(false);
      fetchCategories();
    } catch (error: any) {
      toast.error(editingId ? "Errore nell'aggiornamento" : "Errore nella creazione");
      console.error(error);
    }
  };

  const handleEdit = (category: any) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      icon: category.icon || "💰",
      color: category.color || "#3b82f6"
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questa categoria?")) return;

    try {
      const { error } = await (supabase as any)
        .from("categories")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Categoria eliminata");
      fetchCategories();
    } catch (error: any) {
      toast.error("Errore nell'eliminazione");
      console.error(error);
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", icon: "💰", color: "#3b82f6" });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const systemCategories = categories.filter((c: any) => c.is_system);
  const userCategories = categories.filter((c: any) => !c.is_system);

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Categorie</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="income" size="sm" onClick={() => {
              setEditingId(null);
              setFormData({ name: "", icon: "💰", color: "#3b82f6" });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Nuova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Modifica Categoria" : "Nuova Categoria"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Es. Ristorante"
                  required
                />
              </div>

              <div>
                <Label>Icona</Label>
                <div className="mt-2 grid grid-cols-8 gap-2">
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`flex h-10 w-10 items-center justify-center rounded-md border text-xl transition-all ${
                        formData.icon === icon
                          ? "border-primary bg-primary/10 ring-2 ring-primary"
                          : "border-border hover:border-primary hover:bg-accent"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Colore</Label>
                <div className="mt-2 flex gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`h-8 w-8 rounded-full transition-all ${
                        formData.color === color
                          ? "ring-2 ring-primary ring-offset-2"
                          : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" variant="income" className="flex-1">
                  <Save className="mr-2 h-4 w-4" />
                  {editingId ? "Aggiorna" : "Crea"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  <X className="mr-2 h-4 w-4" />
                  Annulla
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {/* System Categories */}
        {systemCategories.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">Categorie di Sistema</h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {systemCategories.map((category: any) => (
                <div
                  key={category.id}
                  className="flex items-center gap-3 rounded-lg border bg-card p-3"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-xl"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    {category.icon || "💰"}
                  </div>
                  <span className="flex-1 font-medium text-foreground">{category.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Categories */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">Le Mie Categorie</h3>
          {userCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nessuna categoria personale. Crea la tua prima categoria!
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {userCategories.map((category: any) => (
                <div
                  key={category.id}
                  className="flex items-center gap-3 rounded-lg border bg-card p-3"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-xl"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    {category.icon || "💰"}
                  </div>
                  <span className="flex-1 font-medium text-foreground">{category.name}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(category)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
