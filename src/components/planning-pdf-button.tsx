"use client";

import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PlanningPdfButtonProps {
    plan: any;
    recipes: {
        breakfast?: any;
        lunch?: any;
        dinner?: any;
        snack?: any;
    };
    filename?: string;
}

export default function PlanningPdfButton({ plan, recipes, filename = "smartdalle-planning" }: PlanningPdfButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePdf = () => {
        setIsGenerating(true);
        try {
            const doc = new jsPDF();

            // Header (Brand)
            doc.setFillColor(255, 211, 0); // Primary Yellow #FFD300
            doc.rect(0, 0, 210, 40, "F");

            doc.setFontSize(24);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0);
            doc.text("SmartDalle", 20, 20);

            doc.setFontSize(14);
            doc.setFont("helvetica", "normal");
            doc.text("Plan Nutritionnel du Jour", 20, 30);

            doc.setFontSize(10);
            doc.text(`Date : ${plan.date || new Date().toLocaleDateString("fr-FR")}`, 150, 30);

            // Totals
            const totalCals =
                (recipes.breakfast?.calories || 0) +
                (recipes.lunch?.calories || 0) +
                (recipes.dinner?.calories || 0) +
                (recipes.snack?.calories || 0);

            const totalProtein =
                (recipes.breakfast?.protein || 0) +
                (recipes.lunch?.protein || 0) +
                (recipes.dinner?.protein || 0) +
                (recipes.snack?.protein || 0);

            doc.setFontSize(12);
            doc.setTextColor(50);
            doc.text(`Objectifs du jour : ${totalCals} Kcal • ${totalProtein}g Protéines`, 20, 50);

            // Table Data
            const slots = [
                { name: "Petit-Déjeuner", recipe: recipes.breakfast },
                { name: "Déjeuner", recipe: recipes.lunch },
                { name: "Dîner", recipe: recipes.dinner },
                { name: "Snack", recipe: recipes.snack },
            ];

            const tableData = slots.map(slot => {
                if (!slot.recipe) return [slot.name, "Pas de recette", "-", "-"];
                return [
                    slot.name,
                    slot.recipe.name,
                    `${slot.recipe.calories} kcal`,
                    `${slot.recipe.protein}g prot`
                ];
            });

            autoTable(doc, {
                startY: 60,
                head: [['Repas', 'Recette', 'Calories', 'Protéines']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [10, 10, 10], textColor: [255, 255, 255], fontStyle: 'bold' },
                styles: { fontSize: 11, cellPadding: 8 },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 40 },
                    1: { cellWidth: 90 }
                },
                didDrawPage: (data) => {
                    // Footer
                    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
                    doc.setFontSize(8);
                    doc.setTextColor(150);
                    doc.text("Généré par SmartDalle - La nutrition intelligente pour la street generation", 105, pageHeight - 10, { align: "center" });
                }
            });

            // Add Ingredients List Summary (Optional but cool)
            const finalY = (doc as any).lastAutoTable.finalY + 20;
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text("Ingrédients à prévoir :", 20, finalY);

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text("Retrouve la liste complète et tes courses sur l'app SmartDalle.", 20, finalY + 8);

            doc.save(`${filename}-${plan.date}.pdf`);
        } catch (error) {
            console.error("PDF Generation failed:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={generatePdf}
            disabled={isGenerating}
            className="cursor-pointer text-muted-foreground hover:text-white"
            title="Télécharger le plan en PDF"
        >
            {isGenerating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
                <FileDown className="h-5 w-5" />
            )}
        </Button>
    );
}
