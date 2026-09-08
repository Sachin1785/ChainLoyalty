export interface DocSection {
  title: string;
  description?: string;
  usage?: string;
  props?: Array<{
    name: string;
    type: string;
    description: string;
    default?: string;
  }>;
  theme?: Array<{
    variable: string;
    description: string;
  }>;
}

export interface ParsedDoc {
  title: string;
  description: string;
  slug: string;
  sections: DocSection[];
}

export function parseMarkdownContent(content: string): ParsedDoc {
  // Normalize line endings to \n
  content = content.replace(/\r\n/g, '\n');
  
  // Simple markdown parser for our doc format
  const lines = content.split('\n');
  
  const titleMatch = content.match(/^# (.+)$/m);
  const title = titleMatch ? titleMatch[1] : 'Untitled';
  
  // Get first paragraph as description
  const descriptionMatch = content.match(/^# .+\n\n([\s\S]+?)(?:\n\n## |\n\n\n|$)/);
  const description = descriptionMatch ? descriptionMatch[1].trim() : '';
  
  const slug = title.toLowerCase().replace(/\s+/g, '-');
  
  // Parse sections
  const sections: DocSection[] = [];
  const sectionRegex = /## (.+?)\n([\s\S]*?)(?=## |$)/g;
  let match;
  
  while ((match = sectionRegex.exec(content)) !== null) {
    const sectionTitle = match[1].trim();
    const sectionContent = match[0];
    
    const section: DocSection = {
      title: sectionTitle,
    };
    
    // Extract code blocks
    const codeMatch = sectionContent.match(/```tsx\n([\s\S]*?)```/);
    if (codeMatch) {
      section.usage = codeMatch[1].trim();
    }
    
    // Extract tables (props)
    const hasPropsTable = sectionContent.includes('| name') || sectionContent.includes('| Property');
    if (hasPropsTable && sectionTitle.toLowerCase().includes('prop')) {
      section.props = parsePropsTable(sectionContent);
    }

    // Extract theme tables
    const hasThemeTable = sectionContent.includes('| Variable');
    if (hasThemeTable && sectionTitle.toLowerCase().includes('theme')) {
      section.theme = parseThemeTable(sectionContent);
    }
    
    sections.push(section);
  }
  
  return { title, description, slug, sections };
}

function parsePropsTable(content: string): Array<{ name: string; type: string; description: string; default?: string }> {
  const lines = content.split('\n');
  const props = [];
  let inTable = false;
  
  for (const line of lines) {
    if (line.includes('|') && !inTable) {
      inTable = true;
      continue;
    }
    if (inTable && line.trim().startsWith('|---')) {
      continue;
    }
    if (inTable && line.includes('|')) {
      const parts = line.split('|').map(p => p.trim()).filter(Boolean);
      if (parts.length >= 3) {
        props.push({
          name: parts[0],
          type: parts[1],
          description: parts[2],
          default: parts[3],
        });
      }
    }
    if (inTable && !line.includes('|')) {
      inTable = false;
    }
  }
  
  return props;
}

function parseThemeTable(content: string): Array<{ variable: string; description: string }> {
  const lines = content.split('\n');
  const theme = [];
  let inTable = false;
  
  for (const line of lines) {
    if (line.includes('|') && !inTable) {
      inTable = true;
      continue;
    }
    if (inTable && line.trim().startsWith('|---')) {
      continue;
    }
    if (inTable && line.includes('|')) {
      const parts = line.split('|').map(p => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        theme.push({
          variable: parts[0].replace(/`/g, ''),
          description: parts[1],
        });
      }
    }
    if (inTable && !line.includes('|')) {
      inTable = false;
    }
  }
  
  return theme;
}
