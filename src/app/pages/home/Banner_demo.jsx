import React from "react";
import IconRender from "@/components/common/IconRender";

export default function BannerDemo({ content }) {
  if (!content) return null;

  const {
    txt_title,
    icon_title,
    txt_subtitle,
    txt_featuredText,
    item_ventajas = [],
    txtp_descripcion = [],
    img_portada,
    link_cta,
  } = content;

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-purple-500 blur-3xl" />
      </div>

      {/* Contenido */}
      <div className="relative p-8 md:p-12">
        <div className="grid gap-8 md:grid-cols-2 items-center">
          <div className="space-y-6">
            {/* Título y Subtítulo */}
            <div className="space-y-4">
              {(txt_title || icon_title) && (
                <div className="flex items-center gap-3">
                  {icon_title && (
                    <div className="flex-shrink-0 p-2 bg-blue-500/10 rounded-lg">
                      <IconRender
                        icon={icon_title}
                        className="w-6 h-6 text-blue-400"
                      />
                    </div>
                  )}
                  {txt_title && (
                    <h2 className="text-3xl font-bold text-white leading-tight">
                      {txt_title}
                    </h2>
                  )}
                </div>
              )}
              {txt_subtitle && (
                <p className="text-lg text-gray-400">{txt_subtitle}</p>
              )}
            </div>

            {/* Texto destacado */}
            {txt_featuredText && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-300">{txt_featuredText}</p>
              </div>
            )}

            {/* Lista de ventajas */}
            {item_ventajas.length > 0 && (
              <div className="space-y-3">
                {item_ventajas.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    {item.icon && (
                      <div className="flex-shrink-0">
                        <IconRender
                          icon={item.icon}
                          className="w-5 h-5 text-blue-400"
                        />
                      </div>
                    )}
                    <span className="text-gray-300">{item.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            {link_cta && (
              <div className="flex gap-4 pt-4">
                <a
                  href={link_cta.url}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors group"
                >
                  <span>{link_cta.label}</span>
                  {link_cta.icon && (
                    <IconRender
                      icon={link_cta.icon}
                      className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    />
                  )}
                </a>
              </div>
            )}
          </div>

          {/* Imagen y Descripción */}
          <div className="space-y-6">
            {img_portada?.url && (
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-30" />
                <img
                  src={img_portada.url}
                  alt={img_portada.alt || ""}
                  className="relative rounded-lg shadow-2xl w-full object-cover"
                />
              </div>
            )}

            {txtp_descripcion.length > 0 && (
              <div className="space-y-4 bg-white/5 p-6 rounded-lg">
                {txtp_descripcion.map((p, idx) => (
                  <p key={idx} className="text-gray-400 leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
