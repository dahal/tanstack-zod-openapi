import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true
    })
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'TanStackZodOpenAPI',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`
    },
    rollupOptions: {
      external: ['zod', 'js-yaml', 'node:fs', 'node:path', 'fs', 'path'],
      output: {
        globals: {
          'zod': 'Zod',
          'js-yaml': 'jsYaml'
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'node'
  }
})