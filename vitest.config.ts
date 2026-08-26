import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // dist/ holds compiled build output, which includes copies of these same
    // tests. Running them from there doubles the suite and reports failures
    // from whatever was last built rather than the current source.
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
})
