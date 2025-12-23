'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import ThemeToggle from "@/components/ThemeToggle";

const menuGroups = [
  {
    header: "Alat",
    items: [
      {
        label: "Cetak Nota Massal",
        href: "/receipt-bulk-print",
        description: "Cetak nota/faktur dalam jumlah banyak",
      },
      {
        label: "Daftar Hutang",
        href: "/debt-list",
        description: "Kelola dan lacak hutang",
      },
    ],
  },
  // More menu groups can be added here
  // {
  //   header: "Other Tools",
  //   items: [
  //     {
  //       label: "Tool 1",
  //       href: "/tool-1",
  //       description: "Description for Tool 1",
  //     },
  //   ],
  // },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <div className="container mx-auto dark:bg-gray-900">
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4">
          <Link 
            href="/" 
            className="mr-6 flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/logo.png"
              alt="Widjaya Tools Logo"
              width={32}
              height={32}
              className="h-8 w-auto"
              priority
            />
            <span className="text-xl font-bold text-foreground">
              Widjaya Tools
            </span>
          </Link>
          
          <div className="flex flex-1 items-center justify-end gap-6">
            <NavigationMenu>
              <NavigationMenuList>
                {menuGroups.map((group, groupIndex) => {
                  // If group has only one item, render as simple link
                  if (group.items.length === 1) {
                    const item = group.items[0];
                    const isActive = pathname === item.href;
                    return (
                      <NavigationMenuItem key={groupIndex}>
                        <Link
                          href={item.href}
                          className={cn(
                            "text-sm font-medium transition-colors hover:text-foreground/80 px-4 py-2 rounded-md",
                            isActive
                              ? "text-foreground bg-accent"
                              : "text-foreground/60"
                          )}
                        >
                          {group.header ? `${group.header}: ${item.label}` : item.label}
                        </Link>
                      </NavigationMenuItem>
                    );
                  }

                  // If group has multiple items, render as dropdown menu
                  return (
                    <NavigationMenuItem key={groupIndex}>
                      <NavigationMenuTrigger className="text-sm font-medium text-foreground">
                        {group.header}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                          {group.items.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                              <li key={item.href}>
                                <Link
                                  href={item.href}
                                  className={cn(
                                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                    isActive && "bg-accent text-accent-foreground"
                                  )}
                                >
                                  <div className="text-sm font-medium leading-none text-foreground">
                                    {item.label}
                                  </div>
                                  {item.description && (
                                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                      {item.description}
                                    </p>
                                  )}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>
            
            <Separator orientation="vertical" className="h-4" />
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </div>
  );
}
