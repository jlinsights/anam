#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Revert lucide-react imports to use Next.js optimizePackageImports instead
function revertLucideImports() {
  console.log('🔄 Reverting lucide-react imports to use Next.js optimization...\n');

  const files = [
    './app/offline/page.tsx',
    './app/not-found.tsx',
    './components/artwork-card.tsx',
    './components/ui/select.tsx',
    './components/art-navigation.tsx',
    './components/search-filter.tsx',
    './components/contact-info.tsx',
    './components/pwa-install-prompt.tsx',
    './components/artwork-detail-modal-client.tsx',
    './components/section-header.tsx',
    './components/simple-theme-toggle.tsx',
    './components/language-switcher.tsx',
    './components/theme-toggle-button.tsx',
    './components/theme-toggle.tsx',
    './components/pwa-install-button.tsx',
    './components/contact-form.tsx',
    './components/artwork-detail-client.tsx'
  ];

  let filesFixed = 0;

  for (const filePath of files) {
    try {
      const fullPath = path.resolve(filePath);
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      // Find all individual lucide-react imports and group them
      const lucideImports = [];
      const lines = content.split('\n');
      let modifiedContent = '';
      let skippingLucideImports = false;
      
      for (const line of lines) {
        if (line.includes("// Optimized lucide-react imports")) {
          skippingLucideImports = true;
          continue;
        }
        
        if (line.includes("import { ") && line.includes(" } from 'lucide-react/dist/esm/icons/")) {
          // Extract icon name
          const match = line.match(/import\s*{\s*(\w+)\s*}\s*from/);
          if (match) {
            lucideImports.push(match[1]);
          }
          continue;
        }
        
        if (skippingLucideImports && line.trim() === '') {
          // End of lucide imports section, add grouped import
          if (lucideImports.length > 0) {
            modifiedContent += `import { ${lucideImports.join(', ')} } from 'lucide-react'\n`;
          }
          skippingLucideImports = false;
        }
        
        if (!skippingLucideImports) {
          modifiedContent += line + '\n';
        }
      }
      
      // Handle case where file ends with lucide imports
      if (skippingLucideImports && lucideImports.length > 0) {
        modifiedContent += `import { ${lucideImports.join(', ')} } from 'lucide-react'\n`;
      }
      
      if (modifiedContent.trim() !== content.trim()) {
        fs.writeFileSync(fullPath, modifiedContent);
        filesFixed++;
        console.log(`✅ Fixed: ${filePath}`);
      }
      
    } catch (error) {
      console.log(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  console.log(`\n📊 Fixed ${filesFixed} files`);
  console.log('✅ Lucide-react imports reverted to use Next.js optimizePackageImports');
  
  return filesFixed;
}

if (require.main === module) {
  revertLucideImports();
}

module.exports = { revertLucideImports };