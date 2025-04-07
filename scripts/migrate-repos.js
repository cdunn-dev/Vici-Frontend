const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  web: {
    keep: [
      'client',
      'docs/frontend',
      '.github/workflows/web',
      'package.json',
      'tsconfig.json',
      'jest.config.js',
      '.env.example',
      'README.md'
    ],
    moveToApi: [
      'server',
      'k8s',
      'docker-compose.yml',
      'scripts/server',
      '.env.server.example'
    ]
  },
  api: {
    initialFiles: [
      'package.json',
      'tsconfig.json',
      'jest.config.js',
      '.env.example',
      'README.md'
    ]
  },
  mobile: {
    initialFiles: [
      'package.json',
      'tsconfig.json',
      'jest.config.js',
      '.env.example',
      'README.md'
    ]
  }
};

// Helper functions
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFile(source, target) {
  ensureDirectoryExists(path.dirname(target));
  fs.copyFileSync(source, target);
}

function moveFile(source, target) {
  ensureDirectoryExists(path.dirname(target));
  fs.renameSync(source, target);
}

// Main migration function
async function migrate() {
  const rootDir = process.cwd();
  
  // Create API repository structure
  console.log('Setting up Vici-API...');
  const apiDir = path.join(rootDir, '../Vici-API');
  ensureDirectoryExists(apiDir);
  
  // Move files to API
  config.web.moveToApi.forEach(file => {
    const source = path.join(rootDir, file);
    const target = path.join(apiDir, file);
    if (fs.existsSync(source)) {
      moveFile(source, target);
      console.log(`Moved ${file} to Vici-API`);
    }
  });

  // Create Mobile repository structure
  console.log('Setting up Vici-Mobile...');
  const mobileDir = path.join(rootDir, '../Vici-Mobile');
  ensureDirectoryExists(mobileDir);

  // Initialize mobile project
  execSync('npx create-expo-app@latest ViciMobile --template expo-template-blank-typescript --yes', {
    cwd: mobileDir,
    stdio: 'inherit'
  });

  // Update package.json files
  console.log('Updating package.json files...');
  
  // Web package.json
  const webPackage = require(path.join(rootDir, 'package.json'));
  webPackage.name = 'vici-web';
  webPackage.private = true;
  delete webPackage.dependencies['express'];
  delete webPackage.dependencies['pg'];
  delete webPackage.dependencies['ioredis'];
  fs.writeFileSync(
    path.join(rootDir, 'package.json'),
    JSON.stringify(webPackage, null, 2)
  );

  // API package.json
  const apiPackage = {
    name: 'vici-api',
    version: '1.0.0',
    private: true,
    scripts: {
      start: 'ts-node server/index.ts',
      dev: 'nodemon server/index.ts',
      build: 'tsc',
      test: 'jest',
      lint: 'eslint . --ext .ts'
    },
    dependencies: {
      express: '^5.1.0',
      pg: '^8.14.1',
      ioredis: '^5.6.0',
      '@types/express': '^5.0.1',
      '@types/pg': '^8.11.11',
      '@types/ioredis': '^4.28.10',
      typescript: '^5.0.0',
      ts-node: '^10.9.1',
      nodemon: '^3.0.1',
      jest: '^29.0.0',
      '@types/jest': '^29.0.0'
    }
  };
  fs.writeFileSync(
    path.join(apiDir, 'package.json'),
    JSON.stringify(apiPackage, null, 2)
  );

  console.log('Migration complete!');
  console.log('Next steps:');
  console.log('1. Run npm install in each repository');
  console.log('2. Update environment variables');
  console.log('3. Test the applications');
}

migrate().catch(console.error); 