"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RiDeleteBinLine,
  RiDeviceLine,
  RiDownloadLine,
  RiKeyLine,
  RiMailLine,
  RiMoonLine,
  RiNotificationLine,
  RiSaveLine,
  RiShieldLine,
  RiSmartphoneLine,
  RiSunLine,
  RiVolumeUpLine,
} from "@remixicon/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Pour éviter les problèmes d'hydratation
  useEffect(() => {
    setMounted(true);
  }, []);

  const [settings, setSettings] = useState({
    // Apparence
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

  // Charger les paramètres depuis le localStorage
  useEffect(() => {
    if (mounted) {
      const savedSettings = localStorage.getItem("userSettings");
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (error) {
          console.error("Erreur lors du chargement des paramètres:", error);
        }
      }
    }
  }, [mounted]);

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: value };
      // Sauvegarder dans localStorage
      localStorage.setItem("userSettings", JSON.stringify(newSettings));
      return newSettings;
    });
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast("Thème mis à jour", {
      description: `Le thème a été changé vers ${newTheme === "light" ? "clair" : newTheme === "dark" ? "sombre" : "système"}`,
    });
  };

  const handleSaveSettings = () => {
    localStorage.setItem("userSettings", JSON.stringify(settings));
    toast("Paramètres sauvegardés", {
      description: "Vos préférences ont été enregistrées avec succès",
    });
  };

  const handleExportData = () => {
    const dataToExport = {
      settings,
      theme,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `univ-check-settings-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast("Données exportées", {
      description: "Vos données ont été téléchargées avec succès",
    });
  };

  const handleDeleteAccount = () => {
    // Dans une vraie application, ceci ferait un appel API
    localStorage.clear();
    toast("Compte supprimé", {
      description: "Votre compte a été supprimé. Vous allez être déconnecté.",
    });
    // Redirection vers la page de connexion après quelques secondes
    setTimeout(() => {
      window.location.href = "/auth/sign-in";
    }, 2000);
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        handleSettingChange("pushNotifications", true);
        toast("Notifications autorisées", {
          description: "Vous recevrez maintenant des notifications push",
        });
      } else {
        handleSettingChange("pushNotifications", false);
        toast("Notifications refusées", {
          description: "Les notifications push ne sont pas autorisées",
        });
      }
    }
  };

  const [connectedDevices, setConnectedDevices] = useState([
    { id: 1, name: "MacBook Pro", lastUsed: "Maintenant", location: "Lomé, Togo", current: true },
    { id: 2, name: "iPhone 13", lastUsed: "Il y a 2h", location: "Lomé, Togo", current: false },
  ]);

  const handleDisconnectDevice = (deviceId: number) => {
    setConnectedDevices((prev) => prev.filter((device) => device.id !== deviceId));
    toast("Appareil déconnecté", {
      description: "L'appareil a été déconnecté avec succès",
    });
  };

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast("Erreur", {
        description: "Les mots de passe ne correspondent pas",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast("Erreur", {
        description: "Le mot de passe doit contenir au moins 6 caractères",
      });
      return;
    }

    // Simulation d'un changement de mot de passe
    setShowPasswordDialog(false);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    toast("Mot de passe mis à jour", {
      description: "Votre mot de passe a été modifié avec succès",
    });
  };

  if (!mounted) {
    return null; // Éviter les problèmes d'hydratation
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground">Gérez vos préférences et paramètres de compte</p>
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
              </CardTitle>{" "}
              <CardDescription>Personnalisez l&apos;apparence de l&apos;interface utilisateur</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Thème</Label>
                <Select value={theme} onValueChange={handleThemeChange}>
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
                    <SelectItem value="system">
                      <div className="flex items-center space-x-2">
                        <RiDeviceLine className="h-4 w-4" />
                        <span>Système</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Le thème système suit automatiquement les préférences de votre appareil
                </p>
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
                <div className="p-3 border rounded-md bg-muted/50">
                  <p
                    className={`
                    ${settings.fontSize === "small" ? "text-sm" : settings.fontSize === "large" ? "text-lg" : "text-base"}
                  `}
                  >
                    Aperçu du texte avec la taille sélectionnée
                  </p>
                </div>
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
              <CardDescription>Configurez vos préférences de notification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <RiMailLine className="h-4 w-4 text-muted-foreground" />
                    <Label>Notifications par email</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">Recevoir des notifications importantes par email</p>
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
                  <p className="text-sm text-muted-foreground">Recevoir des notifications sur votre navigateur</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        requestNotificationPermission();
                      } else {
                        handleSettingChange("pushNotifications", false);
                      }
                    }}
                  />
                  {settings.pushNotifications && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (settings.pushNotifications) {
                          new Notification("Test de notification", {
                            body: "Les notifications fonctionnent correctement !",
                            icon: "/favicon.ico",
                          });
                        }
                      }}
                    >
                      Tester
                    </Button>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <RiVolumeUpLine className="h-4 w-4 text-muted-foreground" />
                    <Label>Notifications sonores</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">Jouer un son lors des notifications</p>
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
                  <p className="text-sm text-muted-foreground">Recevoir un résumé de votre activité chaque semaine</p>
                </div>
                <Switch checked={settings.weeklyReport} onCheckedChange={(checked) => handleSettingChange("weeklyReport", checked)} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertes système</Label>
                  <p className="text-sm text-muted-foreground">Notifications pour les mises à jour et maintenance</p>
                </div>
                <Switch checked={settings.systemAlerts} onCheckedChange={(checked) => handleSettingChange("systemAlerts", checked)} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Rappels de cours</Label>
                  <p className="text-sm text-muted-foreground">Recevoir des rappels pour vos cours à venir</p>
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
              <CardDescription>Contrôlez la visibilité de vos informations</CardDescription>
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
                  <p className="text-sm text-muted-foreground">Permettre aux autres de voir votre adresse email</p>
                </div>
                <Switch checked={settings.showEmail} onCheckedChange={(checked) => handleSettingChange("showEmail", checked)} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Afficher le téléphone</Label>
                  <p className="text-sm text-muted-foreground">Permettre aux autres de voir votre numéro de téléphone</p>
                </div>
                <Switch checked={settings.showPhone} onCheckedChange={(checked) => handleSettingChange("showPhone", checked)} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Partage de données</Label>
                  <p className="text-sm text-muted-foreground">Autoriser l&apos;analyse des données pour améliorer les services</p>
                </div>
                <Switch checked={settings.dataSharing} onCheckedChange={(checked) => handleSettingChange("dataSharing", checked)} />
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
                <CardDescription>Protégez votre compte avec des mesures de sécurité avancées</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Authentification à deux facteurs</Label>
                    <p className="text-sm text-muted-foreground">Ajouter une couche de sécurité supplémentaire à votre compte</p>
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
                    <p className="text-sm text-muted-foreground">Recevoir des alertes pour les nouvelles connexions</p>
                  </div>
                  <Switch checked={settings.loginAlerts} onCheckedChange={(checked) => handleSettingChange("loginAlerts", checked)} />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Changer le mot de passe</Label>
                  <AlertDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <RiKeyLine className="mr-2 h-4 w-4" />
                        Modifier le mot de passe
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Changer le mot de passe</AlertDialogTitle>
                        <AlertDialogDescription>
                          Entrez votre mot de passe actuel et choisissez un nouveau mot de passe sécurisé.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Mot de passe actuel</Label>
                          <Input
                            id="current-password"
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-password">Nouveau mot de passe</Label>
                          <Input
                            id="new-password"
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                          />
                        </div>
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handlePasswordChange}>Modifier le mot de passe</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <RiDeviceLine className="h-5 w-5" />
                  <span>Appareils connectés</span>
                </CardTitle>
                <CardDescription>Gérez les appareils qui ont accès à votre compte</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {connectedDevices.map((device) => (
                    <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                        <Button variant="outline" size="sm" onClick={() => handleDisconnectDevice(device.id)}>
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
                <CardDescription>Téléchargez une copie de vos données personnelles</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Obtenez une copie de toutes vos données stockées dans notre système, incluant votre profil, historique des cours et
                  évaluations.
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
                <CardDescription>Actions irréversibles concernant votre compte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Suppression du compte</Label>
                  <p className="text-sm text-muted-foreground">
                    Une fois supprimé, votre compte et toutes vos données seront définitivement perdues. Cette action est irréversible.
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
                          Cette action ne peut pas être annulée. Cela supprimera définitivement votre compte et retirera vos données de
                          nos serveurs.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
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
