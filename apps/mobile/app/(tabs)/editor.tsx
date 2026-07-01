import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { EditorArea } from '@ai-pass/ui';
import { CodeEditor } from '@ai-pass/editor';
import { tokens } from '@ai-pass/ui';

const INITIAL = `// AI Pass Mobile Editor\nexport function hello() {\n  return 'Hello from mobile!';\n}\n`;

export default function EditorScreen() {
  const [content, setContent] = useState(INITIAL);

  return (
    <View style={styles.container}>
      <EditorArea
        filePath="src/App.tsx"
        content={content}
        language="typescript"
      >
        <CodeEditor value={content} onChange={setContent} language="typescript" />
      </EditorArea>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.colors.bg },
});
