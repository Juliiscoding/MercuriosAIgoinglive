"use client"
import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Sparkles } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">SC</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg p-2"
            side={isMobile ? "bottom" : "right"}
            align="start"
            sideOffset={4}
          >
            <div className="flex items-center gap-2 px-2 py-1.5">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">SC</AvatarFallback>
              </Avatar>
              <div className="grid flex-1">
                <span className="text-sm font-semibold">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
            <DropdownMenuSeparator className="-mx-2 my-2" />
            <DropdownMenuItem className="gap-2">
              <Sparkles className="h-4 w-4" />
              Upgrade to Pro
            </DropdownMenuItem>
            <DropdownMenuSeparator className="-mx-2 my-2" />
            <DropdownMenuItem className="gap-2">
              <BadgeCheck className="h-4 w-4" />
              Account
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <CreditCard className="h-4 w-4" />
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </DropdownMenuItem>
            <DropdownMenuSeparator className="-mx-2 my-2" />
            <DropdownMenuItem className="gap-2">
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

