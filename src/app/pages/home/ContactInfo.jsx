import React from "react";
  import  IconRender  from "@/components/common/IconRender";
const generateLink = (key, value) => {
  if (key.includes("email")) {
    return `mailto:${value.label}?subject=${encodeURIComponent(
      value.template_email?.subject || ""
    )}&body=${encodeURIComponent(value.template_email?.body || "")}`;
  }
  if (key.includes("phone")) {
    return `tel:${value.label.replace(/\D/g, "")}`;
  }
  if (key.includes("whatsapp")) {
    return `https://wa.me/54${value.label.replace(/\D/g, "")}`;
  }
  return value.url || "#";
};

const extractGroupedItems = (jsonData) => {
  const groups = {};

  for (const key in jsonData) {
    if (key.startsWith("meta_title_")) {
      const groupKey = key.replace("meta_title_", "");
      groups[groupKey] = { title: jsonData[key], items: [] };
    }
  }

  for (const key in jsonData) {
    if (!key.startsWith("meta_title_") && !key.startsWith("template_")) {
      const [prefix] = key.split("_"); // e.g., "contact", "social"
      if (groups[prefix]) {
        groups[prefix].items.push({ key, ...jsonData[key] });
      }
    }
  }

  return Object.values(groups);
};

const ContactInfo = ({content}) => {
  const groupedData = extractGroupedItems(content);

  return (
    <div className="relative w-full p-6 bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full bg-gradient-to-br from-[#8CC63F]/30 to-transparent blur-sm" />

      {groupedData.map((group, idx) => (
        <div key={idx} className="mb-8 relative">
          <h3 className="text-xl font-bold mb-4 pb-2 border-b-2 border-[#8CC63F] text-gray-600">
            {group.title}
          </h3>
          <div className="space-y-4">
            {group.items.map((item, index) => {
              <IconRender icon={item.icon} /> ;
              const href = generateLink(item.key, item);
              const isExternal = item.key.includes("social") || item.key.includes("whatsapp");

              return (
                <a
                  key={index}
                  href={href}
                  target={isExternal ? "_blank" : "_self"}
                  rel={isExternal ? "noopener noreferrer" : ""}
                  className="flex items-center text-gray-600 hover:text-emerald-600 transition-colors"
                >
                  <IconRender icon={item.icon} className="w-5 h-5 mr-3" aria-hidden="true" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactInfo;
