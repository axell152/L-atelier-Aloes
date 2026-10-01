'use client';
import { useState } from 'react';
import ProductGallery from './ProductGallery';
import ProductOrder from './ProductOrder';

// Photos + choix de la couleur : un clic sur une couleur affiche la photo associée,
// et un clic sur la photo d'une couleur sélectionne cette couleur.
export default function ProductShowcase({ images, imageColors, name, categoryLabel, colors, available, whatsappNumber, children }) {
  const [current, setCurrent] = useState(0);
  const [color, setColor] = useState(null);

  const handleColorChange = (c) => {
    setColor(c);
    const index = images.findIndex((url) => imageColors[url] === c);
    if (index >= 0) setCurrent(index);
  };

  const handleSelectImage = (i) => {
    setCurrent(i);
    const imageColor = imageColors[images[i]];
    if (imageColor && colors.includes(imageColor)) setColor(imageColor);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
      <ProductGallery images={images} name={name} current={current} onSelect={handleSelectImage} />
      <div className="space-y-6">
        {children}
        <ProductOrder
          name={name}
          categoryLabel={categoryLabel}
          colors={colors}
          available={available}
          whatsappNumber={whatsappNumber}
          color={color}
          onColorChange={handleColorChange}
        />
      </div>
    </div>
  );
}
