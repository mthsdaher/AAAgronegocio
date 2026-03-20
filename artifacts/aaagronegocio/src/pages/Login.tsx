import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tractor } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      window.location.href = "/painel/dashboard";
    } catch (err) {
      toast({ title: "Erro no login", description: "Verifique suas credenciais.", variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 relative p-4">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/pattern.png)`, backgroundSize: 'cover' }}></div>
      
      <div className="w-full max-w-md relative z-10">
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
            <CardTitle className="text-2xl font-display">Acesse sua conta</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-semibold mb-1.5 block text-foreground">Email</label>
                <Input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="h-12 rounded-xl bg-secondary/30 border-border/50 focus:bg-white" 
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1.5 block text-foreground">Senha</label>
                <Input 
                  type="password" 
                  required 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="h-12 rounded-xl bg-secondary/30 border-border/50 focus:bg-white" 
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full h-12 text-lg rounded-xl shadow-md shadow-primary/20 hover-elevate mt-2" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
            
            <div className="mt-8 text-center text-sm text-muted-foreground">
              Ainda não tem conta? <Link href="/cadastrar" className="text-primary font-bold hover:underline">Cadastre-se grátis</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
