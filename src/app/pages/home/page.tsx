import RenderComponent from '@/components/common/RenderComponent';

export default function HomePage() {

  return (
    <div className="pt-16">
      <RenderComponent type="hero_banner" />
      <RenderComponent type="banner_demo" />
      {/* Otros componentes */}
    </div>
  );
} 