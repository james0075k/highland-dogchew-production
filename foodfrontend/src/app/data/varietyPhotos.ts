// Curated @highlandyakchew photos for each variety (collection) card.
//
// The admin can still upload a variety image in Dashboard → Varieties; it is
// used for any variety not listed here. These override it because the uploaded
// images were stock dog photos with no chew in sight. To go back to the admin
// image for a variety, delete its entry.
export interface VarietyPhoto {
  src: string;
  alt: string;
}

const PHOTOS: Record<string, VarietyPhoto> = {
  'play chews': {
    src: '/images/blog/long-lasting-natural-dog-chew-labrador-garden.webp',
    alt: 'Fox red Labrador trotting through a garden with a strawberry yak chew in its mouth',
  },
  "dog's choice": {
    src: '/images/blog/yak-chew-size-guide-small-dogs-pugs.webp',
    alt: 'Two pugs sniffing a Highland Yak Chew pack held out in front of an open gift box',
  },
  'flavor fun': {
    src: '/images/blog/yak-milk-dog-chews-original-strawberry-blueberry-turmeric.webp',
    alt: 'Strawberry and blueberry yak milk chews laid out with fresh strawberries and blueberries',
  },
  'chew mix': {
    src: '/images/blog/how-long-do-yak-chews-last-pug-chewing.webp',
    alt: 'Black pug lying on a sofa holding a strawberry yak chew between its paws',
  },
};

/** Curated photo for a variety, falling back to its admin-uploaded image. */
export function varietyPhoto(variety: { name: string; image?: string }): VarietyPhoto {
  const key = variety.name.trim().toLowerCase().replace(/[’‘]/g, "'");
  return PHOTOS[key] ?? { src: variety.image || '/placeholder.jpg', alt: variety.name };
}
