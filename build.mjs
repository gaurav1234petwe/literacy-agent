/**
 * Bundles retell-client-js-sdk into a browser-ready IIFE
 * that exposes window.RetellWebClient.
 * Runs automatically via postinstall.
 */
import esbuild from 'esbuild';
import { writeFileSync } from 'fs';

try {
  await esbuild.build({
    stdin: {
      contents: `
        import { RetellWebClient } from 'retell-client-js-sdk';
        window.RetellWebClient = RetellWebClient;
      `,
      resolveDir: '.',
    },
    bundle: true,
    format: 'iife',
    outfile: 'retell-sdk.js',
    platform: 'browser',
    minify: true,
    define: {
      'process.env.NODE_ENV': '"production"',
      'global': 'window',
    },
  });
  console.log('✓ Retell SDK bundled → retell-sdk.js');
} catch (err) {
  console.error('✗ Retell SDK bundle failed:', err.message);
  // Write a stub so the server still starts; the error will surface in the browser
  writeFileSync('retell-sdk.js',
    `window.RetellWebClient=null;console.error("Retell SDK bundle failed — voice calls unavailable.");`
  );
}
