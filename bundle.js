const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

function bundle() {
    let html = fs.readFileSync(path.join(srcDir, 'index.html'), 'utf8');
    const css = fs.readFileSync(path.join(srcDir, 'css', 'styles.css'), 'utf8');
    const data = fs.readFileSync(path.join(srcDir, 'data', 'flashcards.js'), 'utf8');
    const js = fs.readFileSync(path.join(srcDir, 'js', 'app.js'), 'utf8');

    // 1. Inject CSS
    html = html.replace(
        '<link rel="stylesheet" href="css/styles.css">',
        `<style>\n${css}\n</style>`
    );

    // 2. Inject Data and JS, then remove the original script tags
    const combinedJs = `<script>\n${data}\n${js}\n</script>`;
    
    // Remove the two script tags and inject the combined one
    html = html.replace(/<script src="data\/flashcards\.js"><\/script>/, '');
    html = html.replace(/<script src="js\/app\.js"><\/script>/, combinedJs);

    fs.writeFileSync(path.join(distDir, 'thai-flashcards-mobile.html'), html);
    console.log('Successfully bundled into dist/thai-flashcards-mobile.html');
}

bundle();
