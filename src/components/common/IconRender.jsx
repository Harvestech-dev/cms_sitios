import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import * as BiIcons from 'react-icons/bi';
const IconRender = ({ icon, className }) => {
  const IconComponent = FaIcons[icon] || AiIcons[icon] || BiIcons[icon];
  return IconComponent ? <IconComponent className={className} /> : null;
};
export default IconRender;