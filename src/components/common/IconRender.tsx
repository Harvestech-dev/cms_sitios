import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import * as BiIcons from 'react-icons/bi';

interface IconRenderProps {
  icon: string;
  className?: string;
}

const IconRender = ({ icon, className }: IconRenderProps) => {
  const IconComponent = FaIcons[icon] || AiIcons[icon] || BiIcons[icon];
  return IconComponent ? <IconComponent className={className} /> : null;
};

export default IconRender; 