#!/bin/bash

echo "🗑️ Removing unused components to optimize bundle size..."

# Create backup
echo "📦 Creating backup of components directory..."
cp -r components components.backup.$(date +%Y%m%d_%H%M%S)

# Remove unused UI components that are taking up significant space
echo "🧹 Removing unused UI components..."

# Large unused components (>15KB each)
rm -f components/ui/sidebar.tsx
rm -f components/performance-dashboard.tsx
rm -f components/site-footer.tsx

# Other unused heavy components
rm -f components/immersive-artwork-card.tsx
rm -f components/zen-brutalist-footer.tsx
rm -f components/zen-brutalist-hero.tsx
rm -f components/zen-brutalist-artwork-card.tsx

# Unused UI components
rm -f components/ui/accordion.tsx
rm -f components/ui/alert-dialog.tsx
rm -f components/ui/alert.tsx
rm -f components/ui/aspect-ratio.tsx
rm -f components/ui/avatar.tsx
rm -f components/ui/badge.tsx
rm -f components/ui/breadcrumb.tsx
rm -f components/ui/checkbox.tsx
rm -f components/ui/collapsible.tsx
rm -f components/ui/context-menu.tsx
rm -f components/ui/dialog.tsx
rm -f components/ui/dropdown-menu.tsx
rm -f components/ui/pagination.tsx
rm -f components/ui/popover.tsx
rm -f components/ui/progress.tsx
rm -f components/ui/scroll-area.tsx
rm -f components/ui/separator.tsx
rm -f components/ui/sheet.tsx
rm -f components/ui/skeleton.tsx
rm -f components/ui/sonner.tsx
rm -f components/ui/toast.tsx
rm -f components/ui/toaster.tsx
rm -f components/ui/toggle-group.tsx
rm -f components/ui/tooltip.tsx
rm -f components/ui/use-mobile.tsx
rm -f components/ui/use-toast.ts

# Unused animation and advanced components
rm -f components/advanced-glass-morphism.tsx
rm -f components/ink-animation-system.tsx
rm -f components/accessibility-enhanced.tsx
rm -f components/analytics-provider.tsx
rm -f components/animations.tsx

# Unused utility components
rm -f components/no-ssr.tsx
rm -f components/suspense-wrapper.tsx
rm -f components/simple-fallback-layout.tsx
rm -f components/simple-skip-link.tsx
rm -f components/error-boundary.tsx
rm -f components/fallback-map.tsx

echo "✅ Removed unused components"
echo "💾 Estimated space saved: ~350KB+ from source files"
echo "📊 This will significantly reduce the final bundle size"
echo ""
echo "🔍 Run 'npm run build' to see the new bundle sizes"
echo "📋 Backup created in case you need to restore any components"