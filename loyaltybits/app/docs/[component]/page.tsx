import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import { getComponentBySlug } from '@/lib/component-registry'
import { parseMarkdownContent } from '@/lib/parse-docs'
import { ComponentPreview } from '@/components/component-preview'
import { PropsTable } from '@/components/props-table'
import { ThemeTable } from '@/components/theme-table'

interface PageProps {
  params: Promise<{ component: string }>
}

export async function generateStaticParams() {
  const docsDir = path.join(process.cwd(), 'content', 'docs')
  const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md'))
  return files.map(file => ({ component: file.replace('.md', '') }))
}

export async function generateMetadata({ params }: PageProps) {
  const { component } = await params
  const meta = getComponentBySlug(component)
  if (!meta) return { title: 'Not Found' }
  return { title: `${meta.title} - LoyaltyKit`, description: meta.description }
}

async function getComponentDoc(slug: string) {
  const filePath = path.join(process.cwd(), 'content', 'docs', `${slug}.md`)
  if (!fs.existsSync(filePath)) return null
  const content = fs.readFileSync(filePath, 'utf-8')
  return parseMarkdownContent(content)
}

export default async function ComponentPage({ params }: PageProps) {
  const { component: slug } = await params
  const componentMeta = getComponentBySlug(slug)
  if (!componentMeta) notFound()

  const doc = await getComponentDoc(slug)
  if (!doc) notFound()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span style={{
          display: 'inline-flex', alignSelf: 'flex-start',
          padding: '4px 12px', borderRadius: 999,
          background: 'var(--lk-badge-bg)', border: '1px solid var(--lk-badge-border)',
          fontSize: 12, fontWeight: 600, color: 'var(--lk-badge-text)',
        }}>
          {componentMeta!.category}
        </span>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: 'var(--lk-text)', margin: 0, lineHeight: 1.15 }}>
          {doc!.title}
        </h1>
        <p style={{ fontSize: 17, color: 'var(--lk-text-muted)', maxWidth: 640, margin: 0 }}>
          {doc!.description}
        </p>
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {doc!.sections.map((section, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Section heading with divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--lk-text)', margin: 0, whiteSpace: 'nowrap' }}>
                {section.title}
              </h2>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, var(--lk-border), transparent)' }} />
            </div>

            {typeof section.usage === 'string' && (
              <div style={{ marginTop: 8 }}>
                <ComponentPreview slug={slug} code={section.usage} />
              </div>
            )}

            {section.props && section.props.length > 0 && (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--lk-text)', marginBottom: 12, marginTop: 0 }}>Properties</h3>
                <PropsTable props={section.props} />
              </div>
            )}

            {section.theme && section.theme.length > 0 && (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--lk-text)', marginBottom: 12, marginTop: 0 }}>Theme Variables</h3>
                <ThemeTable variables={section.theme} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
