import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tractor, User, Store } from "lucide-react";
import { clsx } from "clsx";

export default function Register() {
  const { register } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", phone: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ ...formData, role });
      window.location.href = "/painel/dashboard";
    } catch (err) {
      toast({ title: "Erro", description: "Não foi possível realizar o cadastro.", variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 relative p-4 py-12">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/pattern.png)`, backgroundSize: 'cover' }}></div>
      
      <div className="w-full max-w-lg relative z-10">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Tractor className="w-7 h-7 text-white" />
            </div>
            <span className="font-display font-bold text-3xl text-primary">AAAgronegócio</span>
          </Link>
        </div>

        <Card className="border-border/50 shadow-2xl rounded-2xl bg-white overflow-hidden">
          <CardHeader className="text-center pb-2 pt-8">
            <CardTitle className="text-2xl font-display">Crie sua conta</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button 
                type="button"
                className={clsx("flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all hover-elevate", role === 'buyer' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-transparent text-muted-foreground')}
                onClick={() => setRole('buyer')}
              >
                <User className="w-6 h-6 mb-2" />
                <span className="font-semibold">Comprador</span>
              </button>
              <button 
                type="button"
                className={clsx("flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all hover-elevate", role === 'seller' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-transparent text-muted-foreground')}
                onClick={() => setRole('seller')}
              >
                <Store className="w-6 h-6 mb-2" />
                <span className="font-semibold">Anunciante</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Nome Completo</label>
                <Input required value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className="h-12 rounded-xl bg-secondary/30" />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Email</label>
                <Input type="email" required value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} className="h-12 rounded-xl bg-secondary/30" />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Telefone</label>
                <Input type="tel" required value={formData.phone} onChange={e => setFormData(p => ({...p, phone: e.target.value}))} className="h-12 rounded-xl bg-secondary/30" placeholder="(11) 99999-9999"/>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Senha</label>
                <Input type="password" required minLength={8} value={formData.password} onChange={e => setFormData(p => ({...p, password: e.target.value}))} className="h-12 rounded-xl bg-secondary/30" />
              </div>
              <Button type="submit" className="w-full h-12 text-lg rounded-xl shadow-md shadow-primary/20 hover-elevate mt-4" disabled={loading}>
                {loading ? "Criando conta..." : "Criar Conta"}
              </Button>
            </form>
            
            <div className="mt-8 text-center text-sm text-muted-foreground">
              Já tem uma conta? <Link href="/entrar" className="text-primary font-bold hover:underline">Faça login</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
