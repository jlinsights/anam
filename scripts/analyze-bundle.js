#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Bundle size analysis and optimization recommendations
async function analyzeBundleSize() {
  console.log('🔍 Analyzing bundle size and dependencies...\n');

  // Get all source files using recursive fs
  function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        if (!['node_modules', '.next', 'dist', '__tests__'].includes(file)) {
          getAllFiles(filePath, fileList);
        }
      } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
        fileList.push(path.relative(process.cwd(), filePath));
      }
    });
    return fileList;
  }

  const files = getAllFiles(process.cwd());

  const importStats = {};
  const dynamicImports = [];
  const largeComponents = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(process.cwd(), file), 'utf-8');
    const lines = content.split('\n');
    
    // Analyze imports
    lines.forEach((line, index) => {
      // Static imports
      const staticImportMatch = line.match(/import\s+.*from\s+['"]([^'"]+)['"]/);
      if (staticImportMatch) {
        const pkg = staticImportMatch[1];
        if (!importStats[pkg]) {
          importStats[pkg] = { count: 0, files: [] };
        }
        importStats[pkg].count++;
        importStats[pkg].files.push(`${file}:${index + 1}`);
      }

      // Dynamic imports
      const dynamicImportMatch = line.match(/import\s*\(['"]([^'"]+)['"]\)/);
      if (dynamicImportMatch) {
        dynamicImports.push({
          module: dynamicImportMatch[1],
          file: `${file}:${index + 1}`
        });
      }
    });

    // Check file size
    if (content.length > 10000) {
      largeComponents.push({
        file,
        size: Math.round(content.length / 1024),
        lines: lines.length
      });
    }
  }

  // Sort imports by usage frequency
  const sortedImports = Object.entries(importStats)
    .sort(([,a], [,b]) => b.count - a.count);

  console.log('📊 Most used imports:');
  sortedImports.slice(0, 15).forEach(([pkg, data]) => {
    console.log(`  ${pkg}: ${data.count} times`);
  });

  console.log('\n🚀 Dynamic imports found:');
  dynamicImports.forEach(imp => {
    console.log(`  ${imp.module} (${imp.file})`);
  });

  console.log('\n📦 Large components (>10KB):');
  largeComponents
    .sort((a, b) => b.size - a.size)
    .slice(0, 10)
    .forEach(comp => {
      console.log(`  ${comp.file}: ${comp.size}KB (${comp.lines} lines)`);
    });

  // Generate optimization recommendations
  console.log('\n💡 Optimization recommendations:');
  
  // Check for potential tree-shaking opportunities
  const heavyPackages = ['framer-motion', 'lucide-react', '@radix-ui'];
  heavyPackages.forEach(pkg => {
    const pkgImports = Object.keys(importStats).filter(name => name.includes(pkg));
    if (pkgImports.length > 0) {
      console.log(`  • Consider optimizing ${pkg} imports`);
      pkgImports.forEach(imp => {
        if (importStats[imp].count > 5) {
          console.log(`    - ${imp} used ${importStats[imp].count} times`);
        }
      });
    }
  });

  return {
    importStats,
    dynamicImports,
    largeComponents,
    totalFiles: files.length
  };
}

// Check current bundle sizes
function analyzeBuildOutput() {
  console.log('\n📈 Current build output:');
  
  const nextDir = path.join(process.cwd(), '.next');
  if (!fs.existsSync(nextDir)) {
    console.log('  Run "npm run build" first to analyze build output');
    return;
  }

  // Check static directory
  const staticDir = path.join(nextDir, 'static');
  if (fs.existsSync(staticDir)) {
    function getFiles(dir, ext) {
      const result = [];
      function scan(currentDir) {
        const files = fs.readdirSync(currentDir);
        files.forEach(file => {
          const filePath = path.join(currentDir, file);
          if (fs.statSync(filePath).isDirectory()) {
            scan(filePath);
          } else if (file.endsWith(ext)) {
            result.push(path.relative(staticDir, filePath));
          }
        });
      }
      scan(dir);
      return result;
    }
    
    const chunks = getFiles(staticDir, '.js');
    const cssFiles = getFiles(staticDir, '.css');
    
    let totalJsSize = 0;
    let totalCssSize = 0;

    console.log('  JavaScript chunks:');
    chunks.forEach(chunk => {
      const filePath = path.join(staticDir, chunk);
      const stats = fs.statSync(filePath);
      const sizeKB = Math.round(stats.size / 1024);
      totalJsSize += sizeKB;
      if (sizeKB > 50) {
        console.log(`    ${chunk}: ${sizeKB}KB`);
      }
    });

    console.log('  CSS files:');
    cssFiles.forEach(cssFile => {
      const filePath = path.join(staticDir, cssFile);
      const stats = fs.statSync(filePath);
      const sizeKB = Math.round(stats.size / 1024);
      totalCssSize += sizeKB;
      console.log(`    ${cssFile}: ${sizeKB}KB`);
    });

    console.log(`\n  Total JS: ${totalJsSize}KB`);
    console.log(`  Total CSS: ${totalCssSize}KB`);
    console.log(`  Combined: ${totalJsSize + totalCssSize}KB`);
  }
}

// Generate optimization suggestions
function generateOptimizationSuggestions(analysis) {
  console.log('\n🎯 Specific optimization suggestions:\n');

  console.log('1. Tree-shaking optimizations:');
  console.log('   • Use named imports for lucide-react icons');
  console.log('   • Consider lazy loading framer-motion components');
  console.log('   • Import only needed Radix UI primitives\n');

  console.log('2. Bundle splitting suggestions:');
  console.log('   • Move heavy animations to async chunks');
  console.log('   • Separate admin/demo pages from main bundle');
  console.log('   • Consider route-based code splitting\n');

  console.log('3. CSS optimization:');
  console.log('   • Enable CSS purging for unused styles');
  console.log('   • Extract critical CSS for above-the-fold content');
  console.log('   • Consider CSS-in-JS for component-specific styles\n');

  const estimatedSavings = {
    treeshaking: '15-25KB',
    splitting: '30-50KB', 
    css: '20-40KB',
    total: '65-115KB'
  };

  console.log('4. Expected savings:');
  Object.entries(estimatedSavings).forEach(([method, saving]) => {
    console.log(`   • ${method}: ${saving}`);
  });
}

// Main execution
async function main() {
  try {
    const analysis = await analyzeBundleSize();
    analyzeBuildOutput();
    generateOptimizationSuggestions(analysis);
    
    console.log('\n✅ Analysis complete! Run this script after implementing optimizations to measure improvements.');
  } catch (error) {
    console.error('❌ Error analyzing bundle:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { analyzeBundleSize, analyzeBuildOutput, generateOptimizationSuggestions };