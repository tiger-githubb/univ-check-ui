"use client";

import { Button } from "@/components/ui/button";
import { Emargement } from "@/types/attendance.types";
import { RiFilePdf2Line } from "@remixicon/react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface ExportToPdfButtonProps {
  emargements: Emargement[];
  fileName?: string;
  title?: string;
}

export function ExportToPdfButton({
  emargements,
  fileName = "rapport-emargements",
  title = "Rapport des émargements",
}: ExportToPdfButtonProps) {
  const handleExportPDF = async () => {
    // Dynamically import jspdf and jspdf-autotable
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    try {
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(18);
      doc.text(title, 14, 20);

      // Add date
      doc.setFontSize(11);
      doc.text(`Généré le ${format(new Date(), "d MMMM yyyy à HH:mm", { locale: fr })}`, 14, 30);

      // Add company info or logo (placeholder)
      doc.setFontSize(10);
      doc.text("Université XYZ", 14, 38);

      // Prepare data for table
      const tableColumn = ["Professeur", "Cours", "Date", "Horaire", "Statut"];

      const tableRows = emargements.map((emargement) => {
        // Format date and time
        const date = emargement.classSession?.date
          ? format(parseISO(emargement.classSession.date), "dd/MM/yyyy", { locale: fr })
          : "N/A";

        const time =
          emargement.classSession?.heureDebut && emargement.classSession?.heureFin
            ? `${format(parseISO(emargement.classSession.heureDebut), "HH:mm", { locale: fr })} - 
             ${format(parseISO(emargement.classSession.heureFin), "HH:mm", { locale: fr })}`
            : "N/A";

        // Get status in French
        let status = "N/A";
        switch (emargement.status) {
          case "PRESENT":
            status = "Présent";
            break;
          case "ABSENT":
            status = "Absent";
            break;
          case "PENDING":
            status = "En attente";
            break;
          case "SUPERVISOR_CONFIRMED":
            status = "Confirmé (superviseur)";
            break;
          case "CLASS_HEADER_CONFIRMED":
            status = "Confirmé (responsable)";
            break;
        }

        return [emargement.professor?.name || "N/A", emargement.classSession?.course?.title || "N/A", date, time, status];
      });

      // Generate the table
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240],
        },
      });

      // Add summary statistics at the bottom
      const totalEmargements = emargements.length;
      const presentCount = emargements.filter(
        (e) => e.status === "PRESENT" || e.status === "SUPERVISOR_CONFIRMED" || e.status === "CLASS_HEADER_CONFIRMED"
      ).length;
      const absentCount = emargements.filter((e) => e.status === "ABSENT").length;
      const pendingCount = emargements.filter((e) => e.status === "PENDING").length;
      const presentPercentage = totalEmargements > 0 ? Math.round((presentCount / totalEmargements) * 100) : 0; // Get the end position of the table
      // Utilisez unknown comme type intermédiaire pour éviter l'utilisation directe de any
      const docAsUnknown = doc as unknown;
      const finalY = (docAsUnknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

      doc.setFontSize(11);
      doc.text(`Statistiques:`, 14, finalY);
      doc.setFontSize(10);
      doc.text(`Total des émargements: ${totalEmargements}`, 14, finalY + 7);
      doc.text(`Présents: ${presentCount} (${presentPercentage}%)`, 14, finalY + 14);
      doc.text(`Absents: ${absentCount} (${Math.round((absentCount / totalEmargements) * 100) || 0}%)`, 14, finalY + 21);
      doc.text(`En attente: ${pendingCount} (${Math.round((pendingCount / totalEmargements) * 100) || 0}%)`, 14, finalY + 28);

      // Footer
      const docInternal = (
        docAsUnknown as { internal: { getNumberOfPages: () => number; pageSize: { width: number; height: number } } }
      ).internal;
      const pageCount = docInternal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.text(`Page ${i} sur ${pageCount}`, docInternal.pageSize.width - 25, docInternal.pageSize.height - 10);
      }

      // Save PDF
      doc.save(`${fileName}-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
      // You might want to display a toast or notification here
    }
  };

  return (
    <Button variant="outline" onClick={handleExportPDF} className="flex items-center gap-2">
      <RiFilePdf2Line size={16} />
      Exporter PDF
    </Button>
  );
}
