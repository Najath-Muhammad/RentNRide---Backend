const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.ts') && !fullPath.replace(/\\/g, '/').includes('src/config/env.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('process.env.')) {
                const parts = fullPath.replace(/\\/g, '/').split('/src/');
                const depth = parts[1].split('/').length - 1;
                const relativePath = depth === 0 ? './config/env' : '../'.repeat(depth) + 'config/env';

                if (!content.includes('import { env }')) {
                    content = `import { env } from "${relativePath}";\n` + content;
                }

                content = content.replace(/process\.env\.([A-Za-z0-9_]+)/g, 'env.$1');

                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

processDir(path.join(__dirname, 'src'));
