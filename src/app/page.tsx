import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Utensils, Zap, Euro, Sparkles, ChefHat, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative gradient-bg overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />

      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,211,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,211,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      <div className="z-10 text-center max-w-4xl w-full px-6 py-16 space-y-10">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary text-sm font-bold px-4 py-2 rounded-full">
          <Sparkles className="w-4 h-4" />
          Street Food Healthy • IA Powered
        </div>

        {/* Hero Title */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white uppercase">
            Smart<span className="text-primary text-glow">Dalle</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            La nutrition intelligente pour la <span className="text-white font-bold">street generation</span>.
            <br className="hidden md:block" />
            Mange propre. Paie moins. Reste <span className="text-primary font-bold">vif</span>.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link href="/dashboard">
            <Button
              size="lg"
              className="text-lg font-black px-10 py-6 cursor-pointer btn-glow bg-primary text-black hover:bg-primary/90 rounded-xl"
            >
              <ChefHat className="mr-2 h-5 w-5" />
              Générer mon plan
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="text-lg font-bold px-10 py-6 cursor-pointer border-white/20 text-white hover:bg-white/10 hover:border-white/40 rounded-xl transition-all"
            >
              Connexion
            </Button>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">

          {/* Culture Card */}
          <div className="glass-card glow-border rounded-2xl p-6 text-left transition-all duration-300 group">
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Utensils className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Culture</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Des repas qui ont du <span className="text-white">goût</span> : Afro, Antillais, Maghreb, French Touch. Ta culture, ton assiette.
            </p>
          </div>

          {/* Budget Card */}
          <div className="glass-card glow-border rounded-2xl p-6 text-left transition-all duration-300 group">
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Euro className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Budget Smart</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              On respecte ton <span className="text-white">porte-monnaie</span>. Options Eco dès 3€ le repas ou Standard pour te faire plaisir.
            </p>
          </div>

          {/* Energy Card */}
          <div className="glass-card glow-border rounded-2xl p-6 text-left transition-all duration-300 group">
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Objectifs</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Protéines et macros <span className="text-white">calibrés</span> pour tes objectifs : prise de masse, sèche, ou maintien.
            </p>
          </div>

        </div>

        {/* Stats/Social Proof */}
        <div className="flex flex-wrap justify-center gap-8 pt-8 text-center">
          <div className="space-y-1">
            <p className="text-3xl font-black text-primary">500+</p>
            <p className="text-sm text-muted-foreground">Recettes</p>
          </div>
          <div className="w-px h-12 bg-white/10 hidden sm:block" />
          <div className="space-y-1">
            <p className="text-3xl font-black text-primary">9,99€</p>
            <p className="text-sm text-muted-foreground">Pro / mois</p>
          </div>
          <div className="w-px h-12 bg-white/10 hidden sm:block" />
          <div className="space-y-1">
            <p className="text-3xl font-black text-primary">IA</p>
            <p className="text-sm text-muted-foreground">Powered</p>
          </div>
        </div>

      </div>
    </main>
  );
}
