import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  platform: 'neutral',
  target: 'es2022',
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-native',
    /^react\//,
    /^react-native\//,
    'react-native-reanimated',
    'react-native-gesture-handler',
  ],
});
