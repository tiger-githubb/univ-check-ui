"use client";

import { Button } from "@/components/ui/button";
import { Emargement } from "@/types/attendance.types";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface PrintAttendanceProps {
  emargement: Emargement;
}

export function PrintAttendance({ emargement }: PrintAttendanceProps) {
  const handlePrint = async () => {
    try {
      // Create a new window for printing
      const printWindow = window.open("", "_blank", "width=800,height=600");
      if (!printWindow) {
        alert("Veuillez autoriser les popups pour cette fonction");
        return;
      }

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

      // Format date and time
      const date = emargement.classSession?.date
        ? format(parseISO(emargement.classSession.date), "dd MMMM yyyy", { locale: fr })
        : "N/A";

      const time =
        emargement.classSession?.heureDebut && emargement.classSession?.heureFin
          ? `${format(parseISO(emargement.classSession.heureDebut), "HH:mm", { locale: fr })} - 
           ${format(parseISO(emargement.classSession.heureFin), "HH:mm", { locale: fr })}`
          : "N/A";

      // Create HTML content
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Émargement - ${emargement.professor?.name || "Inconnu"}</title>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 40px;
              line-height: 1.5;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 20px;
            }
            .attendance-card {
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 30px;
            }
            .info-row {
              display: flex;
              margin-bottom: 10px;
            }
            .label {
              font-weight: bold;
              width: 140px;
            }
            .value {
              flex: 1;
            }
            .status {
              font-weight: bold;
              padding: 5px 10px;
              border-radius: 4px;
              display: inline-block;
              margin-top: 10px;
            }
            .status-present {
              background-color: #d1fae5;
              color: #065f46;
            }
            .status-absent {
              background-color: #fee2e2;
              color: #b91c1c;
            }
            .status-pending {
              background-color: #fef3c7;
              color: #92400e;
            }
            .status-confirmed {
              background-color: #dbeafe;
              color: #1e40af;
            }
            .signature-area {
              margin-top: 50px;
              border-top: 1px dotted #ccc;
              padding-top: 20px;
              display: flex;
              justify-content: space-between;
            }
            .signature-box {
              border-bottom: 1px solid #000;
              width: 200px;
              height: 60px;
              margin-bottom: 10px;
            }
            .print-date {
              font-size: 12px;
              color: #666;
              text-align: center;
              margin-top: 30px;
            }
            @media print {
              body {
                margin: 0.5cm;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Certificat d'émargement</h1>
            <p>Université XYZ</p>
          </div>
          
          <div class="attendance-card">
            <div class="info-row">
              <div class="label">Professeur:</div>
              <div class="value">${emargement.professor?.name || "Non spécifié"}</div>
            </div>
            <div class="info-row">
              <div class="label">Cours:</div>
              <div class="value">${emargement.classSession?.course?.title || "Non spécifié"}</div>
            </div>
            <div class="info-row">
              <div class="label">Date:</div>
              <div class="value">${date}</div>
            </div>
            <div class="info-row">
              <div class="label">Horaire:</div>
              <div class="value">${time}</div>
            </div>
            <div class="info-row">
              <div class="label">Lieu:</div>
              <div class="value">${emargement.classSession?.course?.location || "Non spécifié"}</div>
            </div>
            <div class="info-row">
              <div class="label">Statut:</div>
              <div class="value">
                <div class="status ${
                  emargement.status === "PRESENT" ||
                  emargement.status === "SUPERVISOR_CONFIRMED" ||
                  emargement.status === "CLASS_HEADER_CONFIRMED"
                    ? "status-present"
                    : emargement.status === "ABSENT"
                    ? "status-absent"
                    : "status-pending"
                }">${status}</div>
              </div>
            </div>
            <div class="info-row">
              <div class="label">ID de référence:</div>
              <div class="value">${emargement.id}</div>
            </div>
          </div>
          
          <div class="signature-area">
            <div>
              <div class="signature-box"></div>
              <p>Signature du professeur</p>
            </div>
            <div>
              <div class="signature-box"></div>
              <p>Signature du responsable</p>
            </div>
          </div>
          
          <div class="print-date">
            Document généré le ${format(new Date(), "dd MMMM yyyy à HH:mm", { locale: fr })}
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 30px;">
            <button onclick="window.print();" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">Imprimer</button>
          </div>
        </body>
        </html>
      `;

      // Write to the new window
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Focus on the new window and print after it's loaded
      printWindow.onload = () => {
        printWindow.focus();
        // Automatic print could be added here if desired:
        // printWindow.print();
      };
    } catch (error) {
      console.error("Erreur lors de la préparation de l'impression:", error);
      alert("Une erreur s'est produite lors de la préparation de l'impression");
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handlePrint} title="Imprimer l'émargement">
      Imprimer
    </Button>
  );
}
