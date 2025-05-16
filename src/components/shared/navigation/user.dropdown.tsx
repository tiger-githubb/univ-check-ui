import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { routes } from "@/config/routes";
import { useCurrentUser, useSignOutMutation } from "@/hooks/queries/use-auth.query";
import { RiLogoutBoxLine, RiSettingsLine } from "@remixicon/react";
import { useRouter } from "next/navigation";

export default function UserDropdown() {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();
  const { mutate: signOut } = useSignOutMutation();

  const handleSignOut = () => {
    signOut();
    router.replace(routes.auth.signIn);
  };

  const userInfo = user?.user;

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {" "}
        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {userInfo?.name ? getInitials(userInfo.name) : "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-w-64" align="end">
        <DropdownMenuLabel className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-foreground">
            {isLoading ? "Chargement..." : userInfo?.name || "Utilisateur"}
          </span>
          <span className="truncate text-xs font-normal text-muted-foreground">{userInfo?.email || ""}</span>
          {userInfo?.role && <span className="truncate text-xs font-semibold mt-1 text-primary">{userInfo.role}</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push(routes.board.profile)}>
            <RiSettingsLine size={16} className="opacity-60" aria-hidden="true" />
            <span>Paramètres du compte</span>
          </DropdownMenuItem>
          {/* <DropdownMenuItem>
            <RiTeamLine size={16} className="opacity-60" aria-hidden="true" />
            <span>Mon équipe</span>
          </DropdownMenuItem> */}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <RiLogoutBoxLine size={16} className="opacity-60" aria-hidden="true" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
