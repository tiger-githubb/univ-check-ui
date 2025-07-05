"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  RiMoonLine, 
  RiSunLine, 
  RiNotificationLine, 
  RiShieldLine, 
  RiSaveLine,
  RiDeleteBinLine,
  RiDownloadLine,
  RiKeyLine,
  RiDeviceLine,
  RiVolumeUpLine,
  RiMailLine,
  RiSmartphoneLine
} from "@remixicon/react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // Apparence
    theme: "system",
    language: "fr",
    fontSize: "medium",
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    soundNotifications: true,
    weeklyReport: true,
    systemAlerts: true,
    courseReminders: true,
    
    // Confidentialité
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    dataSharing: false,
    
    // Sécurité
    twoFactorAuth: false,
    sessionTimeout: "30",
    loginAlerts: true,
  });
  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    // Ici vous pourriez ajouter la logique pour sauvegarder les paramètres
    console.log("Paramètres sauvegardés:", settings);
  };

  const handleExportData = () => {
    // Logique d'export des données
    console.log("Export des données...");
  };

  const handleDeleteAccount = () => {
    // Logique de suppression du compte
    console.log("Suppression du compte...");
  };

  const connectedDevices = [
    { name: "MacBook Pro", lastUsed: "Maintenant", location: "Paris, France", current: true },
    { name: "iPhone 13", lastUsed: "Il y a 2h", location: "Paris, France", current: false },
    { name: "iPad Air", lastUsed: "Il y a 1 jour", location: "Paris, France", current: false },
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground">
            Gérez vos préférences et paramètres de compte
          </p>
        </div>
        <Button onClick={handleSaveSettings}>
          <RiSaveLine className="mr-2 h-4 w-4" />
          Sauvegarder
        </Button>
      </div>

      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="appearance">Apparence</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Confidentialité</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="account">Compte</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <RiSunLine className="h-5 w-5" />
                <span>Thème et Apparence</span>
              </CardTitle>              <CardDescription>
                Personnalisez l&apos;apparence de l&apos;interface utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Thème</Label>
                <Select value={settings.theme} onValueChange={(value) => handleSettingChange("theme", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center space-x-2">
                        <RiSunLine className="h-4 w-4" />
                        <span>Clair</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center space-x-2">
                        <RiMoonLine className="h-4 w-4" />
                        <span>Sombre</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="system">Système</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Langue</Label>
                <Select value={settings.language} onValueChange={(value) => handleSettingChange("language", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Taille de police</Label>
                <Select value={settings.fontSize} onValueChange={(value) => handleSettingChange("fontSize", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Petite</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="large">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <RiNotificationLine className="h-5 w-5" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription>
                Configurez vos préférences de notification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <RiMailLine className="h-4 w-4 text-muted-foreground" />
                    <Label>Notifications par email</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recevoir des notifications importantes par email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <RiSmartphoneLine className="h-4 w-4 text-muted-foreground" />
                    <Label>Notifications push</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recevoir des notifications sur votre navigateur
                  </p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <RiVolumeUpLine className="h-4 w-4 text-muted-foreground" />
                    <Label>Notifications sonores</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Jouer un son lors des notifications
                  </p>
                </div>
                <Switch
                  checked={settings.soundNotifications}
                  onCheckedChange={(checked) => handleSettingChange("soundNotifications", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Rapport hebdomadaire</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir un résumé de votre activité chaque semaine
                  </p>
                </div>
                <Switch
                  checked={settings.weeklyReport}
                  onCheckedChange={(checked) => handleSettingChange("weeklyReport", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertes système</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications pour les mises à jour et maintenance
                  </p>
                </div>
                <Switch
                  checked={settings.systemAlerts}
                  onCheckedChange={(checked) => handleSettingChange("systemAlerts", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Rappels de cours</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir des rappels pour vos cours à venir
                  </p>
                </div>
                <Switch
                  checked={settings.courseReminders}
                  onCheckedChange={(checked) => handleSettingChange("courseReminders", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <RiShieldLine className="h-5 w-5" />
                <span>Confidentialité</span>
              </CardTitle>
              <CardDescription>
                Contrôlez la visibilité de vos informations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Visibilité du profil</Label>
                <Select value={settings.profileVisibility} onValueChange={(value) => handleSettingChange("profileVisibility", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Privé</SelectItem>
                    <SelectItem value="colleagues">Collègues seulement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Afficher l&apos;email</Label>
                  <p className="text-sm text-muted-foreground">
                    Permettre aux autres de voir votre adresse email
                  </p>
                </div>
                <Switch
                  checked={settings.showEmail}
                  onCheckedChange={(checked) => handleSettingChange("showEmail", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Afficher le téléphone</Label>
                  <p className="text-sm text-muted-foreground">
                    Permettre aux autres de voir votre numéro de téléphone
                  </p>
                </div>
                <Switch
                  checked={settings.showPhone}
                  onCheckedChange={(checked) => handleSettingChange("showPhone", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Partage de données</Label>
                  <p className="text-sm text-muted-foreground">
                    Autoriser l&apos;analyse des données pour améliorer les services
                  </p>
                </div>
                <Switch
                  checked={settings.dataSharing}
                  onCheckedChange={(checked) => handleSettingChange("dataSharing", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <RiKeyLine className="h-5 w-5" />
                  <span>Sécurité du compte</span>
                </CardTitle>
                <CardDescription>
                  Protégez votre compte avec des mesures de sécurité avancées
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Authentification à deux facteurs</Label>
                    <p className="text-sm text-muted-foreground">
                      Ajouter une couche de sécurité supplémentaire à votre compte
                    </p>
                  </div>
                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => handleSettingChange("twoFactorAuth", checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Délai d&apos;expiration de session</Label>
                  <Select value={settings.sessionTimeout} onValueChange={(value) => handleSettingChange("sessionTimeout", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 heure</SelectItem>
                      <SelectItem value="240">4 heures</SelectItem>
                      <SelectItem value="never">Jamais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertes de connexion</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des alertes pour les nouvelles connexions
                    </p>
                  </div>
                  <Switch
                    checked={settings.loginAlerts}
                    onCheckedChange={(checked) => handleSettingChange("loginAlerts", checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Changer le mot de passe</Label>
                  <Button variant="outline" className="w-full">
                    <RiKeyLine className="mr-2 h-4 w-4" />
                    Modifier le mot de passe
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <RiDeviceLine className="h-5 w-5" />
                  <span>Appareils connectés</span>
                </CardTitle>
                <CardDescription>
                  Gérez les appareils qui ont accès à votre compte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {connectedDevices.map((device, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <RiDeviceLine className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium flex items-center space-x-2">
                            <span>{device.name}</span>
                            {device.current && <Badge variant="secondary">Actuel</Badge>}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {device.location} • {device.lastUsed}
                          </p>
                        </div>
                      </div>
                      {!device.current && (
                        <Button variant="outline" size="sm">
                          Déconnecter
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <RiDownloadLine className="h-5 w-5" />
                  <span>Export des données</span>
                </CardTitle>
                <CardDescription>
                  Téléchargez une copie de vos données personnelles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Obtenez une copie de toutes vos données stockées dans notre système, 
                  incluant votre profil, historique des cours et évaluations.
                </p>
                <Button onClick={handleExportData}>
                  <RiDownloadLine className="mr-2 h-4 w-4" />
                  Exporter mes données
                </Button>
              </CardContent>
            </Card>

            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-destructive">
                  <RiDeleteBinLine className="h-5 w-5" />
                  <span>Zone de danger</span>
                </CardTitle>
                <CardDescription>
                  Actions irréversibles concernant votre compte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Suppression du compte</Label>
                  <p className="text-sm text-muted-foreground">
                    Une fois supprimé, votre compte et toutes vos données seront définitivement perdues. 
                    Cette action est irréversible.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <RiDeleteBinLine className="mr-2 h-4 w-4" />
                        Supprimer mon compte
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action ne peut pas être annulée. Cela supprimera définitivement votre
                          compte et retirera vos données de nos serveurs.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Oui, supprimer mon compte
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
