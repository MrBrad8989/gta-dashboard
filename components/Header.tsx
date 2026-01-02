export default function Header() {
  return (
    <header className="w-full h-20 sm:h-24 relative overflow-hidden shadow-lg">
      {/* Imagen de fondo del banner */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/banner-gta.jpg')" }}
      />
      
      {/* Overlay oscuro para mejor contraste */}
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Logo en el lado izquierdo */}
      <div className="relative z-10 h-full flex items-center px-6 sm:px-8">
        <img 
          src="/logo-gta-world.png" 
          alt="GTA World" 
          className="h-12 sm:h-16 w-auto"
        />
      </div>
    </header>
  );
}
