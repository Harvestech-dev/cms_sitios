import React from 'react'

export default function BannerDemo({ content }) {
  console.log("banner demo content", content)
  if (!content) return null

  const {
    txt_title,
    icon_title,
    txt_subtitle,
    txt_featuredText,
    item_ventajas = [],
    txtp_descripcion = [],
    img_portada,
    link_cta
  } = content

  return (
    <section className="p-6 rounded-xl bg-white shadow-md space-y-6">
      {/* Title */}
      {(txt_title || icon_title) && (
        <div className="flex items-center gap-2 text-2xl font-bold">
          {icon_title && <span className="text-primary">{renderIcon(icon_title)}</span>}
          <h2>{txt_title}</h2>
        </div>
      )}

      {/* Subtitle */}
      {txt_subtitle && <h3 className="text-xl text-gray-600">{txt_subtitle}</h3>}

      {/* Featured text */}
      {txt_featuredText && (
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded">
          {txt_featuredText}
        </div>
      )}

      {/* Text Items */}
      {item_ventajas.length > 0 && (
        <ul className="list-disc pl-5 space-y-1">
          {item_ventajas.map((item, idx) => (
            <li key={idx} className="flex items-center gap-2">
              {item.icon && <span>{renderIcon(item.icon)}</span>}
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Paragraphs */}
      {txtp_descripcion.length > 0 && (
        <div className="space-y-4 text-gray-700">
          {txtp_descripcion.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
      )}

      {/* Image */}
      {img_portada?.url && (
        <div className="w-full max-w-md mx-auto">
          <img
            src={img_portada.url}
            alt={img_portada.alt || ''}
            className="rounded-lg shadow"
          />
        </div>
      )}

      {/* Link CTA */}
      {link_cta && (
        <a
          href={link_cta.url}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {link_cta.icon && renderIcon(link_cta.icon)}
          {link_cta.label}
        </a>
      )}
    </section>
  )
}

function renderIcon(name) {
  // Simple emoji fallback for demo
  const icons = {
    star: '⭐',
    check: '✅',
    'arrow-right': '➡️'
  }

  return <span>{icons[name] || '🔷'}</span>
}
