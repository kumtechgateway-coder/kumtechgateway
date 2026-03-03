/**
 * Gallery Data Source
 * Single source of truth for all gallery images.
 */
const galleryData = {
  flyers: Array.from({ length: 88 }, (_, i) => ({
    id: `flyer-${i + 1}`,
    src: `images/flyer${i + 1}.webp`,
    alt: `Flyer Design ${i + 1}`,
    category: 'flyers'
  })),
  banners: Array.from({ length: 1 }, (_, i) => ({
    id: `banner-${i + 1}`,
    src: `images/banner${i + 1}.webp`,
    alt: `Banner Design ${i + 1}`,
    category: 'banners'
  })),
  posters: Array.from({ length: 4 }, (_, i) => ({
    id: `poster-${i + 1}`,
    src: `images/poster${i + 1}.webp`,
    alt: `Poster Design ${i + 1}`,
    category: 'posters'
  })),
  'social-media': Array.from({ length: 1 }, (_, i) => ({
    id: `social-media-${i + 1}`,
    src: `images/socialmedia${i + 1}.webp`,
    alt: `Social Media Design ${i + 1}`,
    category: 'social-media'
  }))
};