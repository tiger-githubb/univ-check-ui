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
  RiTimeLine,
} from "@remixicon/react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Sofia Safier",
    email: "sofia@safier.com",
    phone: "+33 6 12 34 56 78",
    bio: "Professeure d'informatique passionnée par l'enseignement et la technologie. Spécialisée en développement web et intelligence artificielle.",
    location: "Paris, France",
    department: "Informatique",
    role: "Professeure",
    joinDate: "Septembre 2020",
    avatar: "https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp6/user-01_l4if9t.png",
  });

  const handleSave = () => {
    setIsEditing(false);
    // Ici vous pourriez ajouter la logique pour sauvegarder les données
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Ici vous pourriez restaurer les données originales
  };

  const achievements = [
    { title: "Prix d'Excellence Pédagogique", year: "2023", type: "award" },
    { title: "Publication de recherche", year: "2023", type: "research" },
    { title: "Formation continue certifiée", year: "2022", type: "certification" },
  ];

  const recentActivity = [
    { action: "Cours dispensé", description: "Algorithmes et Structures de Données", time: "Il y a 2h" },
    { action: "Évaluation créée", description: "Examen final - Base de Données", time: "Il y a 1 jour" },
    { action: "Présence validée", description: "Cours de Programmation Web", time: "Il y a 2 jours" },
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
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
                  <Badge variant="secondary">{profileData.role}</Badge>
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
