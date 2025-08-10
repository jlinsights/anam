#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Extract critical CSS for above-the-fold content
function extractCriticalCSS() {
  console.log('🎨 Extracting critical CSS...\n');

  const globalCssPath = path.join(process.cwd(), 'app/globals.css');
  
  if (!fs.existsSync(globalCssPath)) {
    console.log('❌ globals.css not found');
    return;
  }

  const css = fs.readFileSync(globalCssPath, 'utf-8');
  
  // Critical CSS rules for above-the-fold content
  const criticalRules = [
    // Base styles
    /html,\s*body\s*{[^}]*}/g,
    /\*,\s*\*::before,\s*\*::after\s*{[^}]*}/g,
    /body\s*{[^}]*}/g,
    
    // Layout fundamentals
    /\.container-art\s*{[^}]*}/g,
    /\.font-\w+\s*{[^}]*}/g,
    
    // Navigation and header (above-the-fold)
    /nav\s*{[^}]*}/g,
    /header\s*{[^}]*}/g,
    /\.nav-\w+\s*{[^}]*}/g,
    
    // Hero section
    /\.hero\s*{[^}]*}/g,
    /\.hero-\w+\s*{[^}]*}/g,
    
    // Critical utility classes
    /\.text-\w+\s*{[^}]*}/g,
    /\.bg-\w+\s*{[^}]*}/g,
    /\.flex\s*{[^}]*}/g,
    /\.grid\s*{[^}]*}/g,
    /\.hidden\s*{[^}]*}/g,
    /\.block\s*{[^}]*}/g,
    
    // Critical responsive classes
    /@media\s*\([^)]*\)\s*{[^{}]*\.(?:container-art|flex|grid|hidden|block)[^{}]*}/g,
  ];

  let criticalCSS = '';
  let remainingCSS = css;
  
  criticalRules.forEach(rule => {
    const matches = css.match(rule);
    if (matches) {
      matches.forEach(match => {
        criticalCSS += match + '\n';
        remainingCSS = remainingCSS.replace(match, '');
      });
    }
  });

  // Add font display swap for web fonts
  const fontFaceRule = `
/* Font optimization */
@font-face {
  font-family: 'Inter';
  font-display: swap;
}
@font-face {
  font-family: 'Noto Serif KR';
  font-display: swap;
}
`;

  criticalCSS = fontFaceRule + criticalCSS;

  const criticalCSSPath = path.join(process.cwd(), 'styles/critical.css');
  const nonCriticalCSSPath = path.join(process.cwd(), 'styles/non-critical.css');

  // Create styles directory if it doesn't exist
  const stylesDir = path.dirname(criticalCSSPath);
  if (!fs.existsSync(stylesDir)) {
    fs.mkdirSync(stylesDir, { recursive: true });
  }

  fs.writeFileSync(criticalCSSPath, criticalCSS.trim());
  fs.writeFileSync(nonCriticalCSSPath, remainingCSS.trim());

  console.log(`✅ Critical CSS extracted: ${Math.round(criticalCSS.length / 1024)}KB`);
  console.log(`📦 Non-critical CSS: ${Math.round(remainingCSS.length / 1024)}KB`);
  console.log(`💾 Original CSS: ${Math.round(css.length / 1024)}KB`);
  console.log(`📊 Reduction: ${Math.round((1 - criticalCSS.length / css.length) * 100)}%\n`);

  // Generate usage instructions
  console.log('📝 Implementation instructions:');
  console.log('1. Inline critical.css in <head> for first paint');
  console.log('2. Lazy load non-critical.css after page load');
  console.log('3. Add preload hint for non-critical.css');
  
  return {
    criticalSize: criticalCSS.length,
    nonCriticalSize: remainingCSS.length,
    originalSize: css.length,
    reduction: Math.round((1 - criticalCSS.length / css.length) * 100)
  };
}

if (require.main === module) {
  extractCriticalCSS();
}

module.exports = { extractCriticalCSS };