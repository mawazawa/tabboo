# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - generic [ref=e6]:
      - img [ref=e8]
      - generic [ref=e10]:
        - heading "Something went wrong" [level=3] [ref=e11]
        - paragraph [ref=e12]: We're sorry, but something unexpected happened
    - generic [ref=e13]:
      - generic [ref=e14]:
        - paragraph [ref=e15]: TypeError
        - paragraph [ref=e16]: "Failed to fetch dynamically imported module: http://localhost:8085/src/components/FormViewer.tsx"
        - group [ref=e17]:
          - generic "Stack trace" [ref=e18] [cursor=pointer]
      - generic [ref=e19]:
        - button "Try Again" [ref=e20] [cursor=pointer]
        - button "Reload Page" [ref=e21] [cursor=pointer]
      - paragraph [ref=e22]: If this problem persists, please contact support
  - generic [ref=e25]:
    - generic [ref=e26]: "[plugin:vite:import-analysis] Failed to resolve import \"@/hooks/useLiveRegion\" from \"src/components/FieldNavigationPanel.tsx\". Does the file exist?"
    - generic [ref=e27]: /Users/mathieuwauters/Desktop/code/form-ai-forge/src/components/FieldNavigationPanel.tsx:14:30
    - generic [ref=e28]: "33 | import { useQuery } from \"@tanstack/react-query\"; 34 | import { useToast } from \"@/hooks/use-toast\"; 35 | import { useLiveRegion } from \"@/hooks/useLiveRegion\"; | ^ 36 | import { Popover, PopoverContent, PopoverTrigger } from \"@/components/ui/popover\"; 37 | import { ValidationRuleEditor } from \"./ValidationRuleEditor\";"
    - generic [ref=e29]: at TransformPluginContext._formatError (file:///Users/mathieuwauters/Desktop/code/form-ai-forge/node_modules/vite/dist/node/chunks/dep-C6uTJdX2.js:49258:41) at TransformPluginContext.error (file:///Users/mathieuwauters/Desktop/code/form-ai-forge/node_modules/vite/dist/node/chunks/dep-C6uTJdX2.js:49253:16) at normalizeUrl (file:///Users/mathieuwauters/Desktop/code/form-ai-forge/node_modules/vite/dist/node/chunks/dep-C6uTJdX2.js:64291:23) at async file:///Users/mathieuwauters/Desktop/code/form-ai-forge/node_modules/vite/dist/node/chunks/dep-C6uTJdX2.js:64423:39 at async Promise.all (index 16) at async TransformPluginContext.transform (file:///Users/mathieuwauters/Desktop/code/form-ai-forge/node_modules/vite/dist/node/chunks/dep-C6uTJdX2.js:64350:7) at async PluginContainer.transform (file:///Users/mathieuwauters/Desktop/code/form-ai-forge/node_modules/vite/dist/node/chunks/dep-C6uTJdX2.js:49099:18) at async loadAndTransform (file:///Users/mathieuwauters/Desktop/code/form-ai-forge/node_modules/vite/dist/node/chunks/dep-C6uTJdX2.js:51977:27
    - generic [ref=e30]:
      - text: Click outside, press Esc key, or fix the code to dismiss.
      - text: You can also disable this overlay by setting
      - code [ref=e31]: server.hmr.overlay
      - text: to
      - code [ref=e32]: "false"
      - text: in
      - code [ref=e33]: vite.config.ts
      - text: .
```