"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell, TrendingDown, Scale, Wallet, PiggyBank, ArrowRight, Check } from "lucide-react";
import { saveProfile } from "./actions";

type Step = 1 | 2 | 3;

export default function OnboardingForm() {
    const [step, setStep] = useState<Step>(1);
    const [formData, setFormData] = useState({
        objective: "",
        budget: "",
        weight: "",
        height: "",
        age_range: "",
    });
    const [loading, setLoading] = useState(false);

    const handleSelection = (key: string, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const nextStep = () => setStep((prev) => (prev < 3 ? (prev + 1 as Step) : prev));
    const prevStep = () => setStep((prev) => (prev > 1 ? (prev - 1 as Step) : prev));

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await saveProfile({
                objective: formData.objective,
                budget: formData.budget,
                weight: parseFloat(formData.weight),
                height: parseInt(formData.height),
                age_range: formData.age_range,
            });
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8">
            {/* Progress Indicator */}
            <div className="flex gap-2 mb-8">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className={`h-2 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-secondary"
                            }`}
                    />
                ))}
            </div>

            <div className="space-y-6">
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-3xl font-bold text-white text-center">Ton Objectif ?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <SelectionCard
                                label="Perte de poids"
                                icon={<TrendingDown className="w-8 h-8" />}
                                selected={formData.objective === "perte_poids"}
                                onClick={() => handleSelection("objective", "perte_poids")}
                            />
                            <SelectionCard
                                label="Maintien"
                                icon={<Scale className="w-8 h-8" />}
                                selected={formData.objective === "maintain"}
                                onClick={() => handleSelection("objective", "maintain")}
                            />
                            <SelectionCard
                                label="Prise de masse"
                                icon={<Dumbbell className="w-8 h-8" />}
                                selected={formData.objective === "prise_masse"}
                                onClick={() => handleSelection("objective", "prise_masse")}
                            />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-3xl font-bold text-white text-center">Ton Budget ?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SelectionCard
                                label="Mode Survie (Eco)"
                                icon={<PiggyBank className="w-8 h-8" />}
                                description="Max d'économies, recettes malines."
                                selected={formData.budget === "eco"}
                                onClick={() => handleSelection("budget", "eco")}
                            />
                            <SelectionCard
                                label="Mode Confort"
                                icon={<Wallet className="w-8 h-8" />}
                                description="Plus de choix, ingrédients premium."
                                selected={formData.budget === "standard"}
                                onClick={() => handleSelection("budget", "standard")}
                            />
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-3xl font-bold text-white text-center">Tes infos</h2>

                        {/* Weight & Height Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                            <div className="space-y-2">
                                <Label className="text-white text-lg">Poids (kg)</Label>
                                <Input
                                    type="number"
                                    placeholder="ex: 75"
                                    value={formData.weight}
                                    onChange={(e) => handleSelection("weight", e.target.value)}
                                    className="bg-secondary border-none text-white text-xl p-6"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white text-lg">Taille (cm)</Label>
                                <Input
                                    type="number"
                                    placeholder="ex: 175"
                                    value={formData.height}
                                    onChange={(e) => handleSelection("height", e.target.value)}
                                    className="bg-secondary border-none text-white text-xl p-6"
                                />
                            </div>
                        </div>

                        {/* Age Range Selection */}
                        <div className="space-y-4 pt-4">
                            <h3 className="text-xl font-bold text-white text-center">Dans quelle tranche d'âge ?</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {(["16-29", "30-49", "50-69", "70+"] as const).map((range) => (
                                    <Card
                                        key={range}
                                        onClick={() => handleSelection("age_range", range)}
                                        className={`cursor-pointer transition-all duration-200 border-2 ${formData.age_range === range
                                            ? "bg-primary border-primary"
                                            : "bg-card/50 border-input hover:border-primary/50"
                                            }`}
                                    >
                                        <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                                            <span className={`text-3xl mb-2`}>
                                                {range === "16-29" && "🛹"}
                                                {range === "30-49" && "💼"}
                                                {range === "50-69" && "📚"}
                                                {range === "70+" && "🌳"}
                                            </span>
                                            <span className={`font-bold text-lg ${formData.age_range === range ? "text-black" : "text-white"}`}>
                                                {range === "70+" ? "70 ans +" : `${range} ans`}
                                            </span>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-between pt-8">
                {step > 1 ? (
                    <Button variant="ghost" onClick={prevStep} className="text-muted-foreground hover:text-white">
                        Retour
                    </Button>
                ) : (
                    <div /> /* Spacer */
                )}

                {step < 3 ? (
                    <Button
                        onClick={nextStep}
                        disabled={
                            (step === 1 && !formData.objective) || (step === 2 && !formData.budget)
                        }
                        className="text-lg font-bold px-8"
                    >
                        Suivant <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={!formData.weight || !formData.height || !formData.age_range || loading}
                        className="text-lg font-bold px-8 bg-primary text-black hover:bg-primary/90"
                    >
                        {loading ? "Génération en cours..." : "Valider mon profil"} <Check className="ml-2 w-5 h-5" />
                    </Button>
                )}
            </div>
        </div>
    );
}

function SelectionCard({
    label,
    icon,
    description,
    selected,
    onClick,
}: {
    label: string;
    icon: React.ReactNode;
    description?: string;
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <Card
            onClick={onClick}
            className={`cursor-pointer transition-all duration-200 border-2 ${selected
                ? "bg-primary border-primary" // Full yellow implementation when selected
                : "bg-card/50 border-input hover:border-primary/50"
                }`}
        >
            <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full">
                <div className={`mb-4 ${selected ? "text-black" : "text-primary"}`}>{icon}</div>
                <h3 className={`font-bold text-xl ${selected ? "text-black" : "text-white"}`}>{label}</h3>
                {description && (
                    <p className={`text-sm mt-2 ${selected ? "text-black/80" : "text-muted-foreground"}`}>
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
