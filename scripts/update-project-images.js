// update-project-images.js
// 将此文件放在项目根目录的 scripts/ 文件夹中
// 运行: node scripts/update-project-images.js

const fs = require('fs');
const path = require('path');

const projectsDir = path.join(__dirname, '..', 'public', 'projects');
const contentDir = path.join(__dirname, '..', 'content', 'projects');
const indexPath = path.join(__dirname, '..', 'content', 'projects_index.json');

console.log('📁 Projects directory:', projectsDir);
console.log('📁 Content directory:', contentDir);
console.log('');

// 扫描项目目录
function scanProjects() {
  const categories = ['hci', 'architecture', 'fabrication', 'urban-interaction'];
  
  // 读取 projects_index.json
  let projectsIndex = [];
  if (fs.existsSync(indexPath)) {
    try {
      projectsIndex = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    } catch (e) {
      console.log('❌ Error reading projects_index.json:', e.message);
    }
  }

  let totalUpdated = 0;
  
  categories.forEach(category => {
    const categoryPath = path.join(projectsDir, category);
    
    if (!fs.existsSync(categoryPath)) {
      console.log(`⚠️  Category not found: ${category}`);
      return;
    }
    
    const projects = fs.readdirSync(categoryPath);
    
    projects.forEach(projectSlug => {
      const projectPath = path.join(categoryPath, projectSlug);
      
      if (!fs.statSync(projectPath).isDirectory()) return;
      
      // 读取所有图片文件
      const files = fs.readdirSync(projectPath);
      
      const images = {
        hero: null,
        portfolio: [],
        gallery: []
      };
      
      files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        if (!['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) return;
        
        const fileName = path.basename(file, ext);
        
        if (fileName === 'hero') {
          images.hero = file;
        } else if (fileName.startsWith('portfolio-')) {
          images.portfolio.push(file);
        } else if (fileName.startsWith('gallery-')) {
          images.gallery.push(file);
        }
      });
      
      // 排序
      images.portfolio.sort();
      images.gallery.sort();
      
      // 更新 meta.json
      const metaPath = path.join(contentDir, category, projectSlug, 'meta.json');
      
      if (!fs.existsSync(metaPath)) {
        console.log(`⚠️  Meta not found: ${category}/${projectSlug}`);
        return;
      }
      
      let meta;
      try {
        meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      } catch (error) {
        console.log(`❌ Error reading meta.json for ${category}/${projectSlug}:`, error.message);
        return;
      }
      
      // 更新图片字段
      if (images.hero) {
        meta.hero = images.hero;
      }
      
      if (images.portfolio.length > 0) {
        meta.portfolioImages = images.portfolio;
      }
      
      if (images.gallery.length > 0) {
        meta.galleryImages = images.gallery;
      }
      
      // 写回 meta.json
      try {
        fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf-8');
      } catch (error) {
        console.log(`❌ Error writing meta.json for ${category}/${projectSlug}:`, error.message);
        return;
      }

      // ── 同步更新 projects_index.json ──
      const heroUrl = images.hero
        ? `/projects/${category}/${projectSlug}/${images.hero}`
        : null;

      const galleryUrls = images.gallery.map(
        f => `/projects/${category}/${projectSlug}/${f}`
      );

      const portfolioUrls = images.portfolio.map(
        f => `/projects/${category}/${projectSlug}/${f}`
      );

      const indexEntry = projectsIndex.find(
        p => p.slug === projectSlug && p.category === category
      );

      if (indexEntry) {
        indexEntry.heroUrl = heroUrl;
        indexEntry.galleryUrls = galleryUrls;
        indexEntry.assets = portfolioUrls;
        // coverUrl: 첫 번째 portfolio 이미지 or hero
        indexEntry.coverUrl = portfolioUrls[0] || heroUrl || null;
      } else {
        console.log(`⚠️  No index entry found for ${category}/${projectSlug} — run build_projects_index.py first`);
      }

      totalUpdated++;
      
      console.log(`✅ ${category}/${projectSlug}`);
      console.log(`   Hero: ${images.hero ? images.hero : '✗'}`);
      console.log(`   heroUrl: ${heroUrl}`);
      console.log(`   Portfolio: ${images.portfolio.length} images`);
      console.log(`   Gallery: ${images.gallery.length} images`);
      console.log('');
    });
  });

  // 写回 projects_index.json
  try {
    fs.writeFileSync(indexPath, JSON.stringify(projectsIndex, null, 2), 'utf-8');
    console.log('📝 projects_index.json updated successfully');
  } catch (e) {
    console.log('❌ Error writing projects_index.json:', e.message);
  }
  
  return totalUpdated;
}

console.log('🚀 Starting to update project images...\n');

const updated = scanProjects();

console.log(`\n✅ Complete! Updated ${updated} projects.`);
console.log('\n💡 Next steps:');
console.log('   1. Restart your dev server: npm run dev');
console.log('   2. Refresh your browser');