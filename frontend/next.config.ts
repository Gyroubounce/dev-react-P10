import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   output: 'export',      // ← Export statique
  distDir: 'out',        // ← Dossier de sortie
  trailingSlash: true,   // ← Aide avec le routing
  reactCompiler: true,
};

export default nextConfig;
