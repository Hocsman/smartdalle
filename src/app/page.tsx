import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Utensils, Zap, Euro } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen p-4 flex flex-col items-center justify-center relative bg-background overflow-hidden">
      {/* Background Gradients/Effects could go here */}

      <div className="z-10 text-center max-w-2xl w-full space-y-8">
        <h1 className="text-6xl font-extrabold tracking-tighter text-white uppercase italic">
          Smart<span className="text-primary">Dalle</span>
        </h1>
        <p className="text-xl text-muted-foreground font-medium">
          La nutrition intelligente pour la street. <br />
          Mange propre, paie moins, reste vif.
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/dashboard">
            <Button size="lg" className="text-lg font-bold px-8 cursor-pointer hover:scale-105 transition-transform">
              Générer mon plan
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="text-lg font-bold px-8 cursor-pointer hover:scale-105 transition-transform">
              Connexion
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 text-left">
          <Card className="bg-card/50 border-input">
            <CardHeader>
              <Utensils className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-white">Culture</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Des repas qui ont du goût : Afro, Antillais, Maghreb, French Touch.</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-input">
            <CardHeader>
              <Euro className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-white">Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">On respecte ton porte-monnaie avec des options Eco et Standard.</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-input">
            <CardHeader>
              <Zap className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-white">Énergie</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Protéines et macros calibrés pour tes objos (masse, sèches, maintien).</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
