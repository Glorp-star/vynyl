const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'spotify-app', 'vynyl-inject.js'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'spotify-app', 'vynyl.css'), 'utf8');
const outputDirectory = path.join(root, 'dist');
const outputPath = path.join(outputDirectory, 'vynyl-spicetify.js');
const styleLoader = `(() => {
  const marker = "vynyl-style";
  if (document.getElementById(marker)) return;
  const style = document.createElement("style");
  style.id = marker;
  style.textContent = ${JSON.stringify(styles)};
  document.head.appendChild(style);
})();
`;

fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(outputPath, `// Vynyl-managed Spicetify extension\n${styleLoader}${script}`, 'utf8');
