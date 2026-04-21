export default {
  source: {
    package: "@base-ui/react",
    version: "^1.0.0",
  },
  target: {
    package: "@msviderok/base-ui-solid",
    version: "1.0.0-beta.9",
  },
  importMap: {
    "lucide-react": "lucide-solid",
  },
  componentsDir: "src/components/ui",
  libDir: "src/lib",
};
