---
name: sidebar
title: Sidebar
type: ui
surface: both
description: "shadcn's sidebar as the dashboard's: on the canvas, 212px, 32px rows with 16px icons, the current page on the neutral gray wash, outlined group tags, a white drawer on phones."
use_for: "The main navigation of an app. Wrap the page in SidebarProvider, put Sidebar and SidebarInset side by side, the workspace and search in SidebarHeader, pages in SidebarGroup with SidebarMenuButton (isActive on the current page), and Help, Documentation and the account in SidebarFooter. Use collapsible icon for a rail that narrows to its icons. For the dashboard's exact shell with its centered list, use the product app-sidebar."
never: [A blue current row, Animating the current row as it changes, More than about ten top-level rows, Icons on some rows and not others]
source: "context-dashboard c0ddf7a src/components/shell/sidebar.tsx; src/components/shell/workspace-card.tsx"
---
