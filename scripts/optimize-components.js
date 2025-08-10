#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Find unused components and optimize imports
async function optimizeComponents() {
  console.log('🧹 Optimizing components and imports...\n');

  // Get all component files
  function getAllComponents(dir) {
    const components = [];
    function scan(currentDir) {
      const files = fs.readdirSync(currentDir);
      files.forEach(file => {
        const filePath = path.join(currentDir, file);
        if (fs.statSync(filePath).isDirectory()) {
          if (!['node_modules', '.next', '__tests__'].includes(file)) {
            scan(filePath);
          }
        } else if (/\.(tsx|ts)$/.test(file) && currentDir.includes('components')) {
          components.push({
            path: filePath,
            name: path.basename(file, path.extname(file)),
            relativePath: path.relative(process.cwd(), filePath)
          });
        }
      });
    }
    scan(dir);
    return components;
  }

  // Get all source files that might import components
  function getAllSourceFiles(dir) {
    const files = [];
    function scan(currentDir) {
      const dirFiles = fs.readdirSync(currentDir);
      dirFiles.forEach(file => {
        const filePath = path.join(currentDir, file);
        if (fs.statSync(filePath).isDirectory()) {
          if (!['node_modules', '.next', '__tests__'].includes(file)) {
            scan(filePath);
          }
        } else if (/\.(tsx|ts|js|jsx)$/.test(file)) {
          files.push(filePath);
        }
      });
    }
    scan(dir);
    return files;
  }

  const components = getAllComponents(process.cwd());
  const sourceFiles = getAllSourceFiles(process.cwd());

  console.log(`📊 Found ${components.length} components and ${sourceFiles.length} source files`);

  // Check component usage
  const unusedComponents = [];
  const heavyComponents = [];

  for (const component of components) {
    let isUsed = false;
    let usageCount = 0;
    
    // Check if component is imported anywhere
    for (const sourceFile of sourceFiles) {
      if (sourceFile === component.path) continue; // Skip self-reference
      
      try {
        const content = fs.readFileSync(sourceFile, 'utf-8');
        const componentName = component.name;
        
        // Check for various import patterns
        const importPatterns = [
          new RegExp(`import.*${componentName}.*from`, 'g'),
          new RegExp(`from.*${component.relativePath.replace(/\\/g, '/')}`, 'g'),
          new RegExp(`<${componentName}[^>]*>`, 'g'),
        ];
        
        for (const pattern of importPatterns) {
          const matches = content.match(pattern);
          if (matches) {
            isUsed = true;
            usageCount += matches.length;
            break;
          }
        }
      } catch (error) {
        // Skip files that can't be read
        continue;
      }
    }

    if (!isUsed) {
      unusedComponents.push(component);
    }

    // Check component size
    try {
      const content = fs.readFileSync(component.path, 'utf-8');
      if (content.length > 15000) { // 15KB+
        heavyComponents.push({
          ...component,
          size: Math.round(content.length / 1024),
          usageCount
        });
      }
    } catch (error) {
      // Skip if can't read file
    }
  }

  // Report unused components
  console.log(`\n🗑️  Unused components (${unusedComponents.length}):`);
  if (unusedComponents.length === 0) {
    console.log('   ✅ No unused components found!');
  } else {
    unusedComponents.forEach(comp => {
      console.log(`   • ${comp.relativePath}`);
    });
  }

  // Report heavy components
  console.log(`\n📦 Heavy components (${heavyComponents.length}):`);
  heavyComponents
    .sort((a, b) => b.size - a.size)
    .forEach(comp => {
      console.log(`   • ${comp.relativePath}: ${comp.size}KB (used ${comp.usageCount} times)`);
    });

  // Analyze import patterns
  console.log('\n📈 Import optimization opportunities:');
  
  const importStats = {};
  for (const file of sourceFiles) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Find imports that could be optimized
      const imports = content.match(/import\s+.*from\s+['"][^'"]+['"]/g) || [];
      
      imports.forEach(importLine => {
        // Check for barrel imports that could be specific
        if (importLine.includes('lucide-react') && !importLine.includes('/icons/')) {
          importStats['lucide-react-barrel'] = (importStats['lucide-react-barrel'] || 0) + 1;
        }
        
        if (importLine.includes('@radix-ui') && importLine.includes('{')) {
          const match = importLine.match(/@radix-ui\/([^'"]+)/);
          if (match) {
            const pkg = `@radix-ui/${match[1]}`;
            importStats[pkg] = (importStats[pkg] || 0) + 1;
          }
        }
        
        if (importLine.includes('framer-motion') && !importLine.includes('/dist/')) {
          importStats['framer-motion-barrel'] = (importStats['framer-motion-barrel'] || 0) + 1;
        }
      });
    } catch (error) {
      // Skip files that can't be read
    }
  }

  Object.entries(importStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .forEach(([pkg, count]) => {
      if (pkg.includes('barrel')) {
        console.log(`   • ${pkg.replace('-barrel', '')}: ${count} barrel imports (consider specific imports)`);
      } else {
        console.log(`   • ${pkg}: ${count} imports`);
      }
    });

  // Generate optimization recommendations
  console.log('\n💡 Optimization recommendations:');
  
  if (unusedComponents.length > 0) {
    const totalUnusedSize = unusedComponents.reduce((acc, comp) => {
      try {
        const content = fs.readFileSync(comp.path, 'utf-8');
        return acc + content.length;
      } catch {
        return acc;
      }
    }, 0);
    
    console.log(`   1. Remove ${unusedComponents.length} unused components (~${Math.round(totalUnusedSize / 1024)}KB)`);
  }

  if (importStats['lucide-react-barrel'] > 0) {
    console.log(`   2. Convert ${importStats['lucide-react-barrel']} lucide-react barrel imports to specific imports`);
  }

  if (importStats['framer-motion-barrel'] > 0) {
    console.log(`   3. Convert ${importStats['framer-motion-barrel']} framer-motion barrel imports to specific imports`);
  }

  console.log('   4. Consider lazy loading heavy components that aren\'t above-the-fold');
  console.log('   5. Split large components into smaller, more focused components');

  const estimatedSavings = {
    unusedComponents: Math.round((unusedComponents.length * 5)), // ~5KB avg per component
    treeShaking: 15, // Lucide + Framer Motion optimizations
    lazyLoading: 10, // Lazy loading heavy components
  };

  const totalSavings = Object.values(estimatedSavings).reduce((a, b) => a + b, 0);
  
  console.log('\n📊 Estimated savings:');
  console.log(`   • Unused components: ${estimatedSavings.unusedComponents}KB`);
  console.log(`   • Tree-shaking: ${estimatedSavings.treeShaking}KB`);
  console.log(`   • Lazy loading: ${estimatedSavings.lazyLoading}KB`);
  console.log(`   • Total: ${totalSavings}KB`);

  return {
    unusedComponents,
    heavyComponents,
    importStats,
    estimatedSavings: totalSavings
  };
}

if (require.main === module) {
  optimizeComponents().then(() => {
    console.log('\n✅ Component optimization analysis complete!');
  }).catch(error => {
    console.error('❌ Error optimizing components:', error.message);
    process.exit(1);
  });
}

module.exports = { optimizeComponents };