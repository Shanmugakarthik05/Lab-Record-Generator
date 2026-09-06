import re
import os

filepath = r'e:\MY PROJECT\Lab Record Generator\src\components\History.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add useTheme import if not there
if 'useTheme' not in content:
    content = content.replace("import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';", "import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';\nimport { useTheme } from '../hooks/useTheme';")

# Add isDark to component
if 'const { isDark } = useTheme();' not in content:
    content = content.replace("export function History({ onLoadRecord, onClose, userId, userName, studentProfile }: HistoryProps) {", "export function History({ onLoadRecord, onClose, userId, userName, studentProfile }: HistoryProps) {\n  const { isDark } = useTheme();")


replacements = [
    (r'text-gray-800 dark:text-slate-200 dark:text-slate-200', 'th-text-primary'),
    (r'text-gray-600 dark:text-slate-400 dark:text-slate-400', 'th-text-secondary'),
    (r'text-gray-500 dark:text-slate-400 dark:text-slate-400', 'th-text-muted'),
    (r'bg-gray-50 dark:bg-slate-800/50 dark:bg-slate-800/50', 'th-surface'),
    (r'border-gray-200 dark:border-slate-700 dark:border-slate-700', 'th-border'),
    (r'border-gray-300 dark:border-slate-700 dark:border-slate-700', 'th-border'),
    (r'bg-white dark:bg-slate-900', 'th-card'),
    (r'bg-white dark:bg-slate-800/50', 'th-card'),
]

for old, new in replacements:
    content = re.sub(old, new, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated History.tsx with th-* classes")
