import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import { getComponentBySlug } from '@/lib/component-registry'
import { parseMarkdownContent } from '@/lib/parse-docs'
import { ComponentPreview } from '@/components/component-preview'
import { PropsTable } from '@/components/props-table'
import { ThemeTable } from '@/components/theme-table'
import { CodeBlock } from '@/components/code-block'

interface PageProps {
  params: Promise<{ component: string }>
}

export async function generateStaticParams() {
  const docsDir = path.join(process.cwd(), 'content', 'docs')
  const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md'))
  
  return files.map(file => ({
    component: file.replace('.md', ''),
  }))
}

export async function generateMetadata({ params }: PageProps) {
  const { component } = await params
  const meta = getComponentBySlug(component)
  
  if (!meta) {
    return { title: 'Not Found' }
  }

  return {
    title: `${meta.title} - ReactBits`,
    description: meta.description,
  }
}

async function getComponentDoc(slug: string) {
  const filePath = path.join(process.cwd(), 'content', 'docs', `${slug}.md`)
  
  if (!fs.existsSync(filePath)) {
    return null
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  return parseMarkdownContent(content)
}

export default async function ComponentPage({ params }: PageProps) {
  const { component: slug } = await params
  
  const componentMeta = getComponentBySlug(slug)
  if (!componentMeta) {
    notFound()
  }

  const doc = await getComponentDoc(slug)
  if (!doc) {
    notFound()
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-medium text-cyan-400 mb-4">
          {componentMeta.category}
        </div>
        <h1 className="text-4xl font-bold text-white text-balance">
          {doc.title}
        </h1>
        <p className="text-lg text-white/70 max-w-2xl">
          {doc.description}
        </p>
      </div>

      {/* Content Sections */}
      <div className="space-y-8">
        {doc.sections.map((section, idx) => (
          <div key={idx} className="space-y-4">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
              {section.title}
              <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            </h2>

            {typeof section.usage === 'string' && (
              <div className="mt-8">
                <ComponentPreview
                  slug={slug}
                  code={section.usage}
                />
              </div>
            )}

            {section.props && section.props.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Properties</h3>
                <PropsTable props={section.props} />
              </div>
            )}

            {section.theme && section.theme.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Theme Variables</h3>
                <ThemeTable variables={section.theme} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
