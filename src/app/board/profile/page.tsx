"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  RiEditLine,
  RiSaveLine,
  RiCameraLine,
  RiMailLine,
  RiPhoneLine,
  RiMapPinLine,
  RiCalendarLine,
  RiUserLine,
  RiShieldUserLine,
  RiAwardLine,
  RiTimeLine
} from "@remixicon/react";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentUser } from "@/hooks/queries/use-auth.query";
import { UserRole } from "@/types/auth.types";
import { PiSpinnerGap } from "react-icons/pi";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const { data: currentUser, isLoading, error } = useCurrentUser();
  
  // Données par défaut pour l'édition
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "Aucune biographie disponible pour le moment.",
    location: "Non spécifiée",
    department: "Non spécifié",
    role: "USER" as UserRole,
    joinDate: "Non spécifié",
    avatar: "",
  });

  // Met à jour les données du profil quand les données utilisateur changent
  useEffect(() => {
    if (currentUser?.user) {
      const user = currentUser.user;
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: "Aucune biographie disponible pour le moment.",
        location: "Non spécifiée",
        department: "Non spécifié",
        role: user.role || ("USER" as UserRole),
        joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', { 
          year: 'numeric', 
          month: 'long' 
        }) : "Non spécifié",
        avatar: "",
      });
    }
  }, [currentUser]);

  const handleSave = () => {
    setIsEditing(false);
    // Ici vous pourriez ajouter la logique pour sauvegarder les données
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Restaurer les données originales
    if (currentUser?.user) {
      const user = currentUser.user;
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: "Aucune biographie disponible pour le moment.",
        location: "Non spécifiée",
        department: "Non spécifié",
        role: user.role || ("USER" as UserRole),
        joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', { 
          year: 'numeric', 
          month: 'long' 
        }) : "Non spécifié",
        avatar: "",
      });
    }
  };

  // Fonction pour mapper les rôles vers des libellés français
  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      USER: "Utilisateur",
      ADMIN: "Administrateur",
      TEACHER: "Enseignant",
      SUPERVISOR: "Superviseur",
      DELEGATE: "Délégué",
    };
    return roleLabels[role] || role;
  };

  const achievements = [
    { title: "Compte créé", year: profileData.joinDate, type: "account" },
    { title: "Profil configuré", year: "2024", type: "setup" },
  ];

  const recentActivity = [
    { action: "Connexion récente", description: "Dernière connexion au système", time: "Récemment" },
    { action: "Profil consulté", description: "Consultation du profil utilisateur", time: "Maintenant" },
  ];

  // Affichage du loading
  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <PiSpinnerGap className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Affichage d'erreur
  if (error || !currentUser) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">Erreur lors du chargement du profil</p>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Mon Profil {profileData.name && `- ${profileData.name}`}
          </h1>
          <p className="text-muted-foreground">Gérez vos informations personnelles et votre profil professionnel</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Annuler
              </Button>
              <Button onClick={handleSave}>
                <RiSaveLine className="mr-2 h-4 w-4" />
                Sauvegarder
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <RiEditLine className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Informations personnelles</TabsTrigger>
          <TabsTrigger value="professional">Profil professionnel</TabsTrigger>
          <TabsTrigger value="activity">Activité récente</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Photo de profil */}
            <Card>
              <CardHeader>
                <CardTitle>Photo de profil</CardTitle>
                <CardDescription>Votre photo apparaîtra dans l&apos;interface utilisateur</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profileData.avatar} alt={profileData.name} />
                  <AvatarFallback className="text-lg">
                    {profileData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button variant="outline" size="sm">
                    <RiCameraLine className="mr-2 h-4 w-4" />
                    Changer la photo
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Informations de base */}
            <Card>
              <CardHeader>
                <CardTitle>Informations de base</CardTitle>
                <CardDescription>Vos informations personnelles de base</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <RiUserLine className="h-4 w-4 text-muted-foreground" />
                      <span>{profileData.name}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <RiMailLine className="h-4 w-4 text-muted-foreground" />
                      <span>{profileData.email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <RiPhoneLine className="h-4 w-4 text-muted-foreground" />
                      <span>{profileData.phone}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Localisation</Label>
                  {isEditing ? (
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, location: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <RiMapPinLine className="h-4 w-4 text-muted-foreground" />
                      <span>{profileData.location}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle>Biographie</CardTitle>
              <CardDescription>Présentez-vous en quelques mots</CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  placeholder="Parlez-nous de vous..."
                />
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">{profileData.bio}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professional" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Informations professionnelles */}
            <Card>
              <CardHeader>
                <CardTitle>Informations professionnelles</CardTitle>
                <CardDescription>Votre rôle et département dans l&apos;établissement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <RiShieldUserLine className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Rôle</span>
                  </div>
                  <Badge variant="secondary">{getRoleLabel(profileData.role)}</Badge>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <RiUserLine className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Département</span>
                  </div>
                  <span className="text-sm">{profileData.department}</span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <RiCalendarLine className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Date d&apos;arrivée</span>
                  </div>
                  <span className="text-sm">{profileData.joinDate}</span>
                </div>
              </CardContent>
            </Card>

            {/* Récompenses et certifications */}
            <Card>
              <CardHeader>
                <CardTitle>Récompenses & Certifications</CardTitle>
                <CardDescription>Vos accomplissements professionnels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                      <RiAwardLine className="h-5 w-5 text-amber-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{achievement.title}</p>
                        <p className="text-xs text-muted-foreground">{achievement.year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>Vos dernières actions dans le système</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 rounded-lg border">
                    <RiTimeLine className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
