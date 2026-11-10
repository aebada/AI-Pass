import type { AppTemplate } from './types.js';

export interface ScaffoldFile {
  path: string;
  content: string;
}

export interface ScaffoldResult {
  platform: 'web' | 'mobile';
  templateId: string;
  files: ScaffoldFile[];
}

export function scaffoldWebApp(template: AppTemplate, solutionName: string): ScaffoldResult {
  const slug = solutionName.toLowerCase().replace(/\s+/g, '-');
  return {
    platform: 'web',
    templateId: template.id,
    files: [
      {
        path: `apps/generated/${slug}/app/page.tsx`,
        content: `export default function ${toPascal(solutionName)}Page() {\n  return (\n    <main>\n      <h1>${solutionName}</h1>\n      <p>Generated from ${template.name} template</p>\n    </main>\n  );\n}\n`,
      },
      {
        path: `apps/generated/${slug}/app/layout.tsx`,
        content: `export default function Layout({ children }: { children: React.ReactNode }) {\n  return <html><body>{children}</body></html>;\n}\n`,
      },
      {
        path: `apps/generated/${slug}/package.json`,
        content: JSON.stringify({ name: `@ai-pass/${slug}`, version: '0.1.0', private: true }, null, 2),
      },
    ],
  };
}

export function scaffoldMobileApp(template: AppTemplate, solutionName: string): ScaffoldResult {
  const slug = solutionName.toLowerCase().replace(/\s+/g, '-');
  return {
    platform: 'mobile',
    templateId: template.id,
    files: [
      {
        path: `apps/generated/${slug}-mobile/App.tsx`,
        content: `import { View, Text } from 'react-native';\n\nexport default function App() {\n  return (\n    <View>\n      <Text>${solutionName}</Text>\n      <Text>${template.name} mobile shell</Text>\n    </View>\n  );\n}\n`,
      },
      {
        path: `apps/generated/${slug}-mobile/app.json`,
        content: JSON.stringify({ expo: { name: solutionName, slug } }, null, 2),
      },
    ],
  };
}

function toPascal(name: string): string {
  return name.replace(/(?:^\w|[A-Z]|\b\w)/g, (w) => w.toUpperCase()).replace(/\s+/g, '');
}
