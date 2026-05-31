import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                manualChunks: function (id) {
                    if (id.indexOf("node_modules/react") >= 0 || id.indexOf("node_modules/react-dom") >= 0) {
                        return "react-vendor";
                    }
                    if (id.indexOf("/src/data/") >= 0 || id.indexOf("\\src\\data\\") >= 0) {
                        return "assessment-data";
                    }
                    if (id.indexOf("node_modules/xlsx") >= 0) {
                        return "xlsx";
                    }
                },
            },
        },
    },
});
