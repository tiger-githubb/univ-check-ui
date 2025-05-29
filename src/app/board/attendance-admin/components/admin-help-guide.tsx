"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RiInformationLine, RiQuestionnaireLine, RiSlideshowLine } from "@remixicon/react";

export function AdminHelpGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <RiQuestionnaireLine />
          Aide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <RiInformationLine className="text-primary" />
            Guide d&apos;utilisation - Administration des émargements
          </DialogTitle>
          <DialogDescription>
            Ce guide vous aide à comprendre et utiliser le système de gestion des émargements des professeurs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Aperçu du système</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Le système de gestion des émargements permet aux administrateurs de surveiller et gérer les présences des professeurs
                aux cours. Il offre une vue d&apos;ensemble statistique, des fonctionnalités de validation, et des outils de reporting.
              </p>
            </CardContent>
          </Card>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-base font-semibold">Statistiques et analyses</AccordionTrigger>
              <AccordionContent className="space-y-2 pb-4">
                <h3 className="font-medium">Récapitulatif de présence</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Affiche une vue d&apos;ensemble des statistiques clés : nombre total de professeurs, taux de présence, taux
                  d&apos;absence, et émargements en attente.
                </p>

                <h3 className="font-medium">Tendances de présence</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Graphique interactif montrant l&apos;évolution des présences au fil du temps. Vous pouvez basculer entre les vues
                  semaine, mois et année.
                </p>

                <h3 className="font-medium">Présence par département</h3>
                <p className="text-sm text-muted-foreground">
                  Visualisez les taux de présence répartis par département pour identifier rapidement les tendances organisationnelles.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-base font-semibold">Gestion et validation</AccordionTrigger>
              <AccordionContent className="space-y-2 pb-4">
                <h3 className="font-medium">Validation des émargements</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Permet aux superviseurs de confirmer les émargements des professeurs. Les onglets séparent les émargements en attente
                  de confirmation et ceux déjà validés.
                </p>

                <h3 className="font-medium">Opérations par lot</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Effectuez des actions sur plusieurs émargements simultanément : marquer présent/absent, confirmer, ou exporter un
                  rapport PDF pour les émargements sélectionnés.
                </p>

                <h3 className="font-medium">Filtres avancés</h3>
                <p className="text-sm text-muted-foreground">
                  Affinez votre recherche par professeur, cours, période ou statut pour trouver rapidement les informations
                  pertinentes.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-base font-semibold">Rapports et exports</AccordionTrigger>
              <AccordionContent className="space-y-2 pb-4">
                <h3 className="font-medium">Rapport par professeur</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Affiche un tableau détaillé des statistiques de présence par professeur, avec leur taux de présence respectif.
                </p>

                <h3 className="font-medium">Export CSV et PDF</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Exportez les données dans différents formats pour des analyses externes ou pour archivage. L&apos;export PDF inclut
                  automatiquement des statistiques récapitulatives.
                </p>

                <h3 className="font-medium">Impression d&apos;émargement</h3>
                <p className="text-sm text-muted-foreground">
                  Générez des certificats d&apos;émargement individuels pour un professeur et un cours spécifique, incluant toutes les
                  informations pertinentes et zones de signature.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-base font-semibold">Sessions de cours</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">
                  L&apos;onglet &quot;Sessions de cours&quot; permet de gérer les sessions planifiées. Vous pouvez y consulter les
                  détails des sessions, vérifier si elles ont été émargées, et au besoin créer manuellement un émargement pour une
                  session spécifique.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-base font-semibold">Notifications et mises à jour</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">
                  Le système de notifications vous alerte lorsque de nouveaux émargements sont enregistrés. Les mises à jour se font
                  automatiquement à intervalles réguliers, mais vous pouvez également rafraîchir manuellement les données à tout
                  moment.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <RiSlideshowLine className="text-primary" />
                Conseils d&apos;utilisation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="font-medium min-w-28">Validation rapide</div>
                <div className="text-sm text-muted-foreground">
                  Utilisez les opérations par lot pour valider plusieurs émargements simultanément.
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="font-medium min-w-28">Filtrage efficace</div>
                <div className="text-sm text-muted-foreground">
                  Commencez par filtrer par département ou période pour réduire le volume de données à traiter.
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="font-medium min-w-28">Suivi régulier</div>
                <div className="text-sm text-muted-foreground">
                  Consultez régulièrement le tableau de bord pour identifier rapidement les anomalies ou tendances.
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="font-medium min-w-28">Documentation</div>
                <div className="text-sm text-muted-foreground">
                  Utilisez la fonction d&apos;impression pour conserver une trace des émargements importants.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="mt-4">
          <Button type="button" variant="default">
            Compris
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
