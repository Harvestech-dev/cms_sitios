import Image from "next/image";

export default function CtaDemo({ content }) {
  if (!content) return null;

  const {
    title,
    subtitle,
    textItems,
    textParagraphs,
    image,
    link,
    featuredText
  } = content;

  return (
    <section className="p-6 bg-white rounded-xl shadow-md flex flex-col md:flex-row gap-6 items-center">
      <div className="flex-1 space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          {title.icon && <span>{title.icon}</span>}
          {title.text}
        </h2>
        <h3 className="text-lg text-gray-700">{subtitle}</h3>

        <ul className="list-none space-y-1">
          {textItems.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>

        <div className="space-y-2 text-gray-600">
          {textParagraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="mt-4">
          <a
            href={link.url}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {link.icon && <span className="mr-2">{link.icon}</span>}
            {link.label}
          </a>
          {featuredText && (
            <p className="mt-2 text-sm text-blue-700 font-medium">
              {featuredText}
            </p>
          )}
        </div>
      </div>

      {image?.url && (
        <div className="w-full md:w-1/3">
          <Image
            src={image.url}
            alt={image.alt}
            width={400}
            height={300}
            className="rounded-lg object-cover w-full h-auto"
          />
        </div>
      )}
    </section>
  );
}
