const layers = [
  "lib/core",
  "lib/jev",
  "lib/audience",
  "lib/stage",
  "lib/server",
  "components",
  "app",
];

const upwardImports = layers.slice(0, -1).map((layer, index) => ({
  name: `${layer.replace("/", "-")}-stays-below`,
  comment: `src/${layer} may only import from the layers below it`,
  severity: "error",
  from: { path: `^src/${layer}/` },
  to: { path: `^src/(${layers.slice(index + 1).join("|")})/` },
}));

module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "no-orphans",
      severity: "error",
      from: { orphan: true, pathNot: ["\\.d\\.ts$", "^src/app/"] },
      to: {},
    },
    {
      name: "lib-stays-out-of-react",
      comment: "the core logic runs anywhere, so it never imports React or Next",
      severity: "error",
      from: { path: "^src/lib/" },
      to: { path: "node_modules/(react|react-dom|next)/" },
    },
    {
      name: "server-stays-on-the-server",
      comment: "components run in the browser, so they never import the server code or its key",
      severity: "error",
      from: { path: "^src/components/" },
      to: { path: "^src/lib/(server|jev)/" },
    },
    {
      name: "src-not-to-test",
      severity: "error",
      from: { path: "^src/" },
      to: { path: "^test/" },
    },
    ...upwardImports,
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsConfig: { fileName: "tsconfig.json" },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: { extensions: [".ts", ".tsx", ".js"] },
  },
};
