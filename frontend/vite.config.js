import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom Vite plugin to ensure Google and Bing verification tags are properly populated in static HTML
function searchEngineVerificationPlugin() {
  return {
    name: 'search-engine-verification',
    transformIndexHtml(html) {
      const googleToken = process.env.VITE_GOOGLE_SITE_VERIFICATION || 'PkSVx42UE7D5NkOo2vLZB2svvgzI4x8k-HY4Gp1GvOE';
      const bingToken = process.env.VITE_BING_SITE_VERIFICATION || '';

      let result = html;
      if (googleToken) {
        result = result.replace(
          /<meta name="google-site-verification"[^>]*>/i,
          `<meta name="google-site-verification" content="${googleToken}" />`
        );
      }
      if (bingToken) {
        result = result.replace(
          /<meta name="msvalidate.01"[^>]*>/i,
          `<meta name="msvalidate.01" content="${bingToken}" />`
        );
      }
      return result;
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), searchEngineVerificationPlugin()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
