export default {
  '**/*.{ts,tsx,js,cjs,mjs,jsx}': ['prettier --write', 'eslint --fix'],
  '**/*.{json,yml}': ['prettier --write'],
}
