// Per-productType FAQ content for Highland Yak Chew product pages.
// Drives BOTH the visible FAQ accordion (in ProductDetailClient) AND the
// FAQPage JSON-LD emitted server-side (in page.tsx) — the two MUST match for
// Google's rich-result / "People Also Ask" eligibility.
//
// Answers are written "direct-answer-first" (inverted pyramid): the first
// sentence is a complete, citable answer, which is what answer/generative
// engines (Google AI Overviews, ChatGPT, Perplexity) extract.

export interface FAQItem {
  question: string;
  answer: string;
}

export type ProductType = 'yak-milk' | 'puff-treat' | 'highland-mix';

const yakMilkFaqs: FAQItem[] = [
  {
    question: 'What is a Highland Yak Chew made from?',
    answer:
      'A Highland Yak Chew is made from just three natural ingredients: yak and cow milk, a little lime juice, and a pinch of salt. There are no preservatives, additives, grains, or artificial flavours — it is a single-ingredient-style hard cheese chew traditionally made in the Himalayas.',
  },
  {
    question: 'Are yak milk chews safe for dogs?',
    answer:
      'Yes, yak milk chews are safe for most dogs and are highly digestible. They are naturally low in fat and lactose, grain-free, and contain no artificial additives. As with any chew, give it under supervision and choose the correct size for your dog.',
  },
  {
    question: 'Are Highland Yak Chews suitable for puppies?',
    answer:
      'Yak chews are suitable for puppies over roughly 4–6 months old that have their adult teeth, when given under supervision. For young puppies, soak the end in warm water to soften it slightly. Always pick a chew sized for your puppy and take it away once it becomes small enough to swallow.',
  },
  {
    question: 'How long does a yak chew last?',
    answer:
      'A Highland Yak Chew typically lasts a single dog several days to a few weeks of regular chewing, depending on the dog’s size, chewing strength, and the size of the chew. Larger chews given to gentle chewers can last weeks.',
  },
  {
    question: 'What do I do with the last small piece?',
    answer:
      'Once the chew is too small to chew safely, take it away and microwave the leftover piece for 30–45 seconds. It puffs up into a light, crunchy treat your dog can eat safely — so there is zero waste.',
  },
  {
    question: 'Do yak chews smell or stain?',
    answer:
      'No. Yak milk chews are virtually odourless and do not leave greasy stains on floors or furniture, unlike many rawhide or animal-based chews, which makes them ideal for use indoors.',
  },
];

const puffTreatFaqs: FAQItem[] = [
  {
    question: 'What are Highland Puff Treats?',
    answer:
      'Highland Puff Treats are yak milk chews that have been puffed into a light, airy, crunchy treat. They are made from the same natural yak and cow milk and are an easy-to-eat reward, ideal for older dogs, puppies, and quick training treats.',
  },
  {
    question: 'Are puff treats good for puppies and senior dogs?',
    answer:
      'Yes. Because they are light and crunchy rather than hard, puff treats are gentle on teeth and easy to chew, making them well suited to puppies and senior dogs that may struggle with a solid yak chew.',
  },
  {
    question: 'Are Highland Puff Treats healthy?',
    answer:
      'Yes. Puff treats are made from natural yak and cow milk with no grains, preservatives, or artificial additives. They are a high-protein, low-fat treat, so they make a wholesome alternative to processed dog biscuits.',
  },
  {
    question: 'How should I store puff treats?',
    answer:
      'Store puff treats in a sealed container in a cool, dry place to keep them crunchy. They do not need refrigeration.',
  },
];

const highlandMixFaqs: FAQItem[] = [
  {
    question: 'What is in the Highland Mix?',
    answer:
      'The Highland Mix combines our natural yak milk chews with puffed treats in one box, giving your dog a variety of textures — a long-lasting hard chew plus light, crunchy puffs — all made from the same natural yak and cow milk.',
  },
  {
    question: 'Is the Highland Mix good value?',
    answer:
      'Yes. The Highland Mix is designed to give you a variety of our most popular chews and treats together, which is ideal if you have more than one dog or want to see which texture your dog prefers before buying in bulk.',
  },
  {
    question: 'Are all the chews in the mix natural?',
    answer:
      'Yes. Every chew and treat in the Highland Mix is made from natural yak and cow milk with no grains, preservatives, or artificial additives.',
  },
  {
    question: 'Which dogs is the Highland Mix best for?',
    answer:
      'The Highland Mix suits households with multiple dogs or different chewing styles, since it includes both a durable hard chew for strong chewers and gentler puffed treats for puppies and senior dogs.',
  },
];

const defaultFaqs: FAQItem[] = yakMilkFaqs;

const faqsByType: Record<ProductType, FAQItem[]> = {
  'yak-milk': yakMilkFaqs,
  'puff-treat': puffTreatFaqs,
  'highland-mix': highlandMixFaqs,
};

/**
 * Returns the FAQ list for a product. Prefers product-specific FAQs from the
 * backend (`product.faqs`) when present, otherwise falls back to a sensible
 * default set keyed by productType.
 */
export function getProductFaqs(product: {
  productType?: string;
  faqs?: FAQItem[];
}): FAQItem[] {
  if (product?.faqs?.length) return product.faqs;
  const type = product?.productType as ProductType | undefined;
  if (type && faqsByType[type]) return faqsByType[type];
  return defaultFaqs;
}
