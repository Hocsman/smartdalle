"use client";

import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { categorizeIngredient, CATEGORIES } from "@/utils/categories";

interface PdfExportButtonProps {
    ingredients: string[];
    filename?: string;
}

export default function PdfExportButton({ ingredients, filename = "smartdalle-shopping-list" }: PdfExportButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePdf = () => {
        setIsGenerating(true);
        try {
            const doc = new jsPDF();

            // Header
            doc.setFillColor(255, 211, 0); // Primary Yellow #FFD300
            doc.rect(0, 0, 210, 40, "F");

            doc.setFontSize(24);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0);
            doc.text("SmartDalle", 20, 20);

            doc.setFontSize(14);
            doc.setFont("helvetica", "normal");
            doc.text("Liste de Courses", 20, 30);

            doc.setFontSize(10);
            doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, 150, 30);

            // Group ingredients
            const groups: Record<string, string[]> = {};
            ingredients.forEach((ing) => {
                const cat = categorizeIngredient(ing);
                if (!groups[cat]) groups[cat] = [];
                groups[cat].push(ing);
            });

            // Prepare table data
            const tableData: any[][] = [];

            CATEGORIES.forEach(cat => {
                if (groups[cat.name]?.length > 0) {
                    // Category Header Row
                    tableData.push([{ content: `${cat.emoji} ${cat.name}`, colSpan: 2, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }]);
                    // Ingredients
                    groups[cat.name].forEach(ing => {
                        tableData.push(["☐ " + ing, ""]);
                    });
                }
            });

            autoTable(doc, {
                startY: 50,
                head: [['Ingrédient', 'Quantité']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [10, 10, 10], textColor: [255, 255, 255], fontStyle: 'bold' },
                styles: { fontSize: 12, cellPadding: 6 },
                columnStyles: {
                    0: { cellWidth: 140 },
                    1: { cellWidth: 40 }
                },
                didDrawPage: (data) => {
                    // Footer
                    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
                    doc.setFontSize(8);
                    doc.setTextColor(150);
                    doc.text("Généré par SmartDalle - La nutrition intelligente pour la street generation", 105, pageHeight - 10, { align: "center" });
                }
            });

            doc.save(`${filename}.pdf`);
        } catch (error) {
            console.error("PDF Generation failed:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={generatePdf}
            disabled={isGenerating || ingredients.length === 0}
            className="cursor-pointer"
            title="Télécharger en PDF"
        >
            {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
                <FileDown className="h-4 w-4 mr-1" />
            )}
            PDF
        </Button>
    );
}
