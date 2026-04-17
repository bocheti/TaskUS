const fs = require('fs');

// Vercel will inject process.env.API_URL here during the build
const targetPath = './src/environments/environment.ts';
const envConfigFile = `
export const environment = {
  production: true,
  apiUrl: '${process.env.API_URL || 'http://localhost:3000'}'
};
`;

fs.writeFileSync(targetPath, envConfigFile);
console.log(`Environment variables injected into ${targetPath}`);