export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  imageAlt: string;
  author?: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'are-yak-chews-safe-for-dogs',
    title: 'Are Yak Chews Safe for Dogs? Everything You Need to Know',
    excerpt:
      'Yak chews have become one of the most popular long-lasting dog treats in the UK. But are they actually safe? We break down the science, the ingredients, and the facts every responsible dog owner should know before buying.',
    category: 'Dog Health',
    date: '2026-03-10',
    readTime: '5 min read',
    image: '/images/dog-28.jpeg',
    imageAlt: 'Golden Retriever happily chewing a natural yak milk chew on grass',
    author: 'Highland Yakchew Team',
    content: `
## Are Yak Chews Safe for Dogs?

Yak chews — also known as Himalayan dog chews or yak milk chews — are made from just three natural ingredients: yak milk, cow milk, and a small amount of lime juice and salt. No preservatives, no artificial additives, no chemicals. They have been a staple in Himalayan communities for centuries, and today they are one of the most trusted natural chews available for dogs in the UK and across Europe.

### Why They Are Safe

- **Natural ingredients only**: The simple, time-tested recipe contains no BHA, BHT, artificial colours, or flavour enhancers — just pure dairy protein that has been smoked and sun-dried at high altitude.
- **High protein, low fat**: With over 55% protein and less than 5% fat per chew, yak chews support lean muscle development without contributing to weight gain — making them an excellent choice for dogs on calorie-controlled diets.
- **Grain-free and gluten-free**: Ideal for dogs with grain sensitivities, wheat allergies, or digestive issues triggered by common fillers found in commercial treats.
- **Long-lasting and fully digestible**: Unlike rawhide — which can swell in the stomach and cause intestinal blockages — yak chews soften gradually as your dog works through them and are broken down naturally during digestion.
- **No splintering risk**: Unlike antlers or cooked bones, yak chews do not splinter into sharp fragments, reducing the risk of internal cuts or choking.

### Dental Health Benefits

Veterinary research consistently shows that the mechanical action of chewing helps reduce plaque and tartar build-up. The firm texture of a yak chew works like a natural toothbrush — scraping teeth clean while your dog enjoys every minute. Regular chewing has been linked to fresher breath, healthier gums, and reduced risk of periodontal disease.

### Size Matters

Always choose the correct size for your dog. A chew that is too small can become a choking hazard if swallowed whole. Refer to our [Size Guide](/products/yak-chews) to pick the right fit based on your dog's weight and chewing style.

### The Puff Treat Bonus

When a yak chew gets too small to chew safely, do not throw it away. Microwave the end piece for 30–60 seconds and watch it puff up into a crunchy, airy treat — a completely safe, zero-waste snack your dog will love.

### Who Should Be Cautious?

- Puppies under 16 weeks whose adult teeth have not yet erupted
- Dogs with a confirmed dairy allergy (note: yak milk contains significantly less lactose than regular cow milk)
- Dogs recovering from dental surgery or those with cracked or fractured teeth
- Very aggressive power chewers — consider sizing up to an XL chew

### The Verdict

Yak chews are one of the safest, most nutritious long-lasting treats available for dogs of all breeds. They are recommended by veterinarians, backed by centuries of traditional use, and loved by millions of dogs worldwide. Always supervise your dog while chewing and remove any small pieces that could pose a risk.
    `.trim(),
  },
  {
    slug: 'how-highland-yak-chews-are-made',
    title: 'How Highland Yak Chews Are Made: From Nepal to Your Dog',
    excerpt:
      'Ever wondered what goes into making an authentic Highland Yak Chew? The answer is centuries of Himalayan tradition, sustainable farming, and just three natural ingredients — no factories, no chemicals, just pure craftsmanship.',
    category: 'Our Story',
    date: '2026-03-04',
    readTime: '6 min read',
    image: '/images/dog-5.jpeg',
    imageAlt: 'Husky standing in a snowy highland landscape, evoking Himalayan origins',
    author: 'Highland Yakchew Team',
    content: `
## From the Himalayas to Your Dog's Bowl

The story of yak chews begins over 4,000 metres above sea level in the Himalayan mountains of Nepal, where herding communities have been pressing yak and cow milk into hard cheese blocks for generations. Originally crafted as a high-protein food source for herders embarking on long mountain journeys, this ancient recipe has found a new purpose — providing dogs with one of the healthiest, most natural chews on the planet.

### The Three Ingredients

1. **Yak milk** — The primary ingredient, naturally rich in protein, calcium, and omega-3 fatty acids. Yaks graze freely on wild Himalayan herbs and grasses, giving the milk its distinctive nutritional profile.
2. **Cow milk** — Blended with yak milk to achieve the ideal firmness and texture. The ratio is carefully controlled to ensure consistency across every batch.
3. **Lime juice & salt** — Used as natural coagulants to separate the curds from the whey. No artificial preservatives, no chemicals — just the same technique used for centuries.

### The Traditional Process

- **Step 1 — Milking**: Yaks and cows are milked by hand in small Himalayan villages, often at elevations above 3,500 metres.
- **Step 2 — Boiling & skimming**: The milk is boiled in large copper vessels over wood fires. The cream is skimmed off and used separately.
- **Step 3 — Curdling**: Fresh lime juice is added to the hot milk, causing it to separate into curds and whey. The curds are strained through cotton cloth.
- **Step 4 — Pressing**: The curds are packed into wooden moulds and pressed under heavy stones for several hours to extract all remaining moisture.
- **Step 5 — Smoking**: The compressed blocks are hung above a slow-burning wood fire, absorbing a subtle smoky flavour that dogs find irresistible.
- **Step 6 — Sun-drying**: The smoked blocks are moved outdoors and sun-dried for 4–8 weeks at high altitude, where the cold, dry air removes moisture slowly and naturally.
- **Step 7 — Quality grading**: Each chew is inspected by hand for cracks, density, and weight before being approved for export.

### Why This Method Works

The high altitude and cold mountain air allow the chews to dry slowly and naturally, locking in nutrients without any chemical processing. This slow dehydration is what gives authentic Highland Yak Chews their incredible hardness and long shelf life — typically 3–5 years without refrigeration.

### Our Commitment to Fair Trade

At Highland Yakchew, we work directly with Himalayan farming cooperatives, ensuring fair wages and sustainable practices. Every chew you buy supports rural livelihoods in some of the most remote communities on Earth.

### Why Authenticity Matters

Not all "yak chews" are genuine. Some mass-produced alternatives use mostly cow milk, add binding agents, or skip the traditional smoking and drying process. At Highland Yakchew, we guarantee that every chew is authentically Himalayan-made using the original recipe — because your dog deserves the real thing.
    `.trim(),
  },
  {
    slug: 'top-5-benefits-yak-milk-chews-dogs',
    title: 'Top 5 Benefits of Yak Milk Chews for Dogs',
    excerpt:
      'From cleaner teeth and stronger muscles to calmer behaviour and zero waste, yak milk chews offer a remarkable range of benefits that go far beyond just keeping your dog busy.',
    category: 'Dog Health',
    date: '2026-02-20',
    readTime: '5 min read',
    image: '/images/dog-17.jpeg',
    imageAlt: 'Smiling golden retriever enjoying the outdoors at sunset',
    author: 'Highland Yakchew Team',
    content: `
## Top 5 Benefits of Yak Milk Chews for Dogs

Every dog owner wants to give their pet the best — treats that are healthy, safe, and genuinely enjoyed. Yak milk chews tick all three boxes. Here are the top five science-backed benefits that make them stand out from every other chew on the market.

### 1. Superior Dental Health

The firm, dense texture of a yak chew works as a natural toothbrush. As dogs gnaw and scrape their teeth against the surface, plaque and tartar are mechanically removed — a process veterinary dentists call "passive dental care." Studies have shown that dogs who chew regularly have up to 70% less tartar build-up compared to those who do not.

**The result**: Cleaner teeth, healthier gums, fresher breath — and fewer expensive dental bills at the vet.

### 2. High Protein, Low Fat Nutrition

A single yak chew contains over 55% crude protein and less than 5% fat. This makes them one of the most protein-dense treats available — ideal for:

- Growing puppies who need protein for muscle and bone development
- Active working dogs who burn through calories quickly
- Overweight dogs on calorie-restricted diets
- Senior dogs who need easily digestible protein to maintain muscle mass

Compare this to commercial dog treats, which often contain 15–25% protein alongside high levels of sugar, fat, and artificial fillers.

### 3. Long-Lasting Mental Stimulation

Boredom is one of the leading causes of destructive behaviour in dogs — chewing furniture, excessive barking, digging, and anxiety. A single yak chew can keep most dogs occupied for 1–3 hours, providing deep mental engagement that tires them out in a healthy, constructive way.

Veterinary behaviourists recommend long-lasting chews as a key tool in managing separation anxiety and reducing stress during thunderstorms, fireworks, or periods of change.

### 4. Grain-Free and Hypoallergenic

Many popular dog treats contain wheat, corn, soy, or rice — all common allergens that can trigger itching, ear infections, digestive issues, and hot spots. Yak chews are naturally:

- 100% grain-free
- Gluten-free
- Low lactose (yak milk contains 40–50% less lactose than cow milk)
- Free from artificial colours, flavours, and preservatives

This makes them suitable for dogs with food sensitivities, inflammatory bowel conditions, or those on elimination diets.

### 5. Zero Waste — The Puff Treat Trick

When the chew becomes too small to be safe, do not throw it away. Microwave it for 30–60 seconds on full power and watch it puff up into a light, crunchy, airy snack — like a natural, protein-packed crisp for your dog.

This means every single gram of the chew gets used. No waste, no guilt, and one extra treat your dog was not expecting.

### Shop Our Range

Browse our [Yak Milk Chews](/products/yak-chews), [Himalayan Puff Treats](/products/puff-treats), and [Highland Mix Chews](/products/highland-mix) to find the perfect treat for your dog.
    `.trim(),
  },
  {
    slug: 'yak-chew-size-guide',
    title: 'Yak Chew Size Guide: Choosing the Right Chew for Your Dog',
    excerpt:
      'Picking the wrong size yak chew can be a safety hazard — too small and it is a choking risk, too large and your dog loses interest. Here is a comprehensive guide to choosing the perfect size for every breed and weight.',
    category: 'Buying Guide',
    date: '2026-02-10',
    readTime: '4 min read',
    image: '/images/dog-31.jpeg',
    imageAlt: 'Multiple dog breeds of different sizes looking upward together',
    author: 'Highland Yakchew Team',
    content: `
## Choosing the Right Size Yak Chew

Getting the right size chew is essential for both safety and satisfaction. A chew that is too small can become a choking risk if swallowed whole, while one that is too large may discourage your dog from even starting. The perfect chew should be at least 1.5 times the width of your dog's mouth.

### Size Guide by Dog Weight

| Dog Weight | Recommended Size | Example Breeds |
|------------|-----------------|----------------|
| Under 5 kg | XS / Puppy | Chihuahua, Yorkshire Terrier, Maltese |
| 5–15 kg | Small | Cavalier King Charles, Dachshund, Shih Tzu |
| 15–30 kg | Medium | Cocker Spaniel, Border Collie, Beagle |
| 30–45 kg | Large | Labrador, Golden Retriever, Boxer |
| 45 kg+ | XL / Jumbo | German Shepherd, Rottweiler, Great Dane |

### Adjusting for Chewing Style

Not all dogs chew the same way. Consider your dog's chewing personality:

- **Gentle chewers**: These dogs lick and nibble slowly. The standard size recommendation works well — they will enjoy the chew for hours.
- **Moderate chewers**: Most dogs fall into this category. Stick with the recommended size and supervise for the first session to gauge how quickly they work through it.
- **Power chewers**: Dogs like Staffies, Pit Bulls, and working breeds who demolish toys in minutes. Always go one size up from the guide above. An XL chew is worth the extra cost for safety and longevity.

### Age-Specific Advice

- **Puppies (16 weeks to 6 months)**: Start with puppy-sized chews and supervise every session. Their teeth and jaws are still developing — a chew that is too hard may cause discomfort.
- **Adult dogs (1–7 years)**: Follow the weight guide above and adjust for chewing style.
- **Senior dogs (7+ years)**: Older dogs may have weakened teeth or gum sensitivity. Choose a slightly smaller or softer variety, or try our Puff Treats for a gentler chewing experience.

### Safety Tips

- Always supervise your dog during the first few chewing sessions
- Replace the chew when it becomes small enough to swallow whole
- Do not give yak chews to dogs under 16 weeks old
- If a piece breaks off, remove it immediately
- Remember: microwave the end piece to make a puff treat — zero waste

### Need Help?

If you are unsure which size is right for your dog, [contact us](/contact) and our team will be happy to recommend the perfect chew based on your dog's breed, weight, and chewing habits.
    `.trim(),
  },
  {
    slug: 'himalayan-puff-treats-explained',
    title: 'Himalayan Puff Treats: The Zero-Waste Reward Your Dog Deserves',
    excerpt:
      'Himalayan puff treats are the lightest, crunchiest snack your dog will ever try — made from pure yak milk offcuts that transform into airy delights in just 60 seconds flat.',
    category: 'Product Guide',
    date: '2026-01-28',
    readTime: '4 min read',
    image: '/images/dog-15.jpeg',
    imageAlt: 'Adorable golden retriever puppy sitting happily in a flower meadow',
    author: 'Highland Yakchew Team',
    content: `
## What Are Himalayan Puff Treats?

Himalayan puff treats are a natural by-product of the yak chew process. When a yak chew is cut to its final size, the offcuts and end pieces are collected rather than discarded. When you microwave these pieces for 30–60 seconds at high heat, something remarkable happens — the dense, hard cheese expands dramatically into a light, airy, crunchy puff that dogs absolutely love.

Think of it as the dog treat equivalent of popcorn — same natural ingredients, completely different texture, and endlessly satisfying for dogs of every size and age.

### How to Make a Puff Treat at Home

1. Take the last small piece of a used yak chew (or buy puff treats pre-made from our shop)
2. Place it on a microwave-safe plate with some space around it — it will expand to 2–3 times its original size
3. Microwave on full power for 30–60 seconds. Watch through the glass — you will see it puff up and transform
4. Allow it to cool for at least 2–3 minutes before giving it to your dog — the inside will be very hot even when the outside feels cool
5. Enjoy watching your dog crunch through it with pure delight

### Why Dogs Love Them

- **Light, airy texture**: Easy to bite through, satisfying to crunch — even for small dogs and seniors
- **Same great yak milk flavour**: All the taste of a full yak chew in a softer, lighter format
- **Perfect training reward**: Break a puff treat into smaller pieces for high-value training treats that are healthy and grain-free
- **Gentle on teeth**: Ideal for senior dogs, puppies over 16 weeks, and dogs recovering from dental work
- **No artificial anything**: Pure yak and cow milk, lime juice, and salt — nothing else

### Nutritional Profile

Puff treats maintain the same nutritional profile as regular yak chews:

- Over 55% protein
- Less than 5% fat
- Grain-free, gluten-free, and low lactose
- No preservatives, no additives, no fillers

### Why We Love Them

Puff treats represent our commitment to zero-waste production. Nothing from the yak chew process goes to waste — every offcut, every end piece gets a second life as a delicious puff treat. They are our most sustainable product and a favourite among environmentally conscious dog owners.

### Perfect For

- Quick rewards during training sessions
- Senior dogs who struggle with harder chews
- Puppies experiencing their first chews
- Dogs recovering from dental procedures
- A light snack between meals

Browse our [Himalayan Puff Treats](/products/puff-treats) today and discover the zero-waste treat your dog deserves.
    `.trim(),
  },
];
