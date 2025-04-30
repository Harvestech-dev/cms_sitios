'use client'
import * as icons from "react-icons/fa";
const IconRender = ({ icon, className }: { icon: string; className: string }) => {
  const IconComponent = icons[icon as keyof typeof icons];
  return IconComponent ? <IconComponent className={className} /> : null;
};
export default IconRender;