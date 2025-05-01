import React from 'react'
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import * as BiIcons from 'react-icons/bi';
import IconRender from '@/components/common/IconRender';
const HeroBanner = ({ content }) => {

  if (!content) return null

  const {
    txt_title,
    txt_subtitle,
    item_lista = [],
    txt_profile_name,
    txt_profile_title,
    txt_profile_description,
    img_principal,
    img_logo,
    img_profile_photo,
  } = content

  return (
    <section
      id="inicio"
      className="relative min-h-[100svh] flex items-center font-museo pt-16 md:pt-20"
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center md:bg-fixed"
        style={{ backgroundImage: `url(${img_principal?.url})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#3A567B]/80 to-[#B1CD49]/60" />
      </div>

      {/* Contenido */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center py-8 md:py-0">
          {/* Columna principal */}
          <div className="space-y-4 md:space-y-6">
            {img_logo && (
              <img
                src={img_logo.url}
                alt={img_logo.alt}
                className="w-24 md:w-48 rounded-full mx-auto md:mx-0"
              />
            )}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
              {txt_title}
            </h1>
            <h2 className="text-2xl md:text-3xl text-white/90">
              {txt_subtitle}
            </h2>

            {item_lista?.length > 0 && (
              <ul className="space-y-2 text-white/90 list-disc list-inside text-base md:text-lg">
                {item_lista.map((item, index) => (
                  <p key={index} className="leading-tight md:leading-normal flex items-center gap-2">
                    {item.icon && <IconRender icon={item.icon} />}
                    {item.text}
                  </p>
                ))}
              </ul>
            )}
          </div>

          {/* Perfil */}
          {(txt_profile_name || txt_profile_title || txt_profile_description || img_profile_photo) && (
            <div className="relative bg-white/10 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-white/20 max-w-md mx-auto">
              <div className="flex flex-col items-center text-center space-y-4">
                {img_profile_photo && (
                  <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white/20">
                    <img
                      src={img_profile_photo.url}
                      alt={img_profile_photo.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  {txt_profile_name && (
                    <h3 className="text-xl md:text-2xl font-bold text-white">
                      {txt_profile_name}
                    </h3>
                  )}
                  {txt_profile_title && (
                    <p className="text-lg md:text-xl text-white/90">
                      {txt_profile_title}
                    </p>
                  )}
                  {txt_profile_description && (
                    <p className="text-base md:text-lg text-white/80">
                      {txt_profile_description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default HeroBanner
