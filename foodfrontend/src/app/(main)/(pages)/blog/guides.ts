import type { BlogPost } from './data';
import { PROMO } from '@/utils/promo';

// Guides written for the Search Console queries UK owners actually type
// ("are yak chews safe for dogs", "yak chew ingredients", "himalayan yak chew"...).
//
// House rules for these posts: no invented statistics, no "vet-approved" or
// "vets recommend" claims, nothing about the product we can't stand behind.
// Sizes and contents match the live catalogue; check them when products change.
// Inline images use: ![alt](/images/blog/file.webp WIDTHxHEIGHT)

// Checkout charges a flat £1.99 for UK delivery (DELIVERY_CHARGE in the backend),
// so that is what we promise — don't advertise a free-delivery threshold the
// checkout doesn't apply.
const SHOP_CTA = `
### Ready to Try One?

Use code **${PROMO.code}** at checkout for ${PROMO.percent}% off your order. UK delivery is a flat £1.99, and orders usually arrive within 3–5 working days. Browse [all our chews](/products), start with a [Classic Yak Chew](/products/classic-dog-chew), or [send us a message](/contact) if you are not sure which one to pick.
`;

const UPDATED = '2026-10-11';

export const guidePosts: BlogPost[] = [
  // ─── 1. Safety ────────────────────────────────────────────────────────────
  {
    slug: 'are-yak-chews-safe-for-dogs',
    title: 'Are Yak Chews Safe for Dogs? An Honest UK Guide',
    excerpt:
      'Yak milk chews are one of the most popular long-lasting chews in the UK — but are they safe? An honest look at what they are, where the real risks lie, and the simple habits that make chewing safer for your dog.',
    category: 'Dog Health',
    date: '2026-03-10',
    updated: UPDATED,
    readTime: '7 min read',
    image: '/images/blog/are-yak-chews-safe-dog-chewing-highland-yak-chew.webp',
    imageAlt:
      'Fox red Labrador walking across a garden lawn carrying a strawberry Highland Yak Chew in its mouth',
    author: 'Highland Yak Chew Team',
    faqs: [
      {
        question: 'Are yak chews safe for dogs?',
        answer:
          'For most healthy adult dogs, yes — when the chew is the right size, your dog is supervised, and you take the last piece away before it is small enough to swallow whole. Yak milk chews are a hard cheese made from yak and cow milk, lime juice and salt, so they soften gradually rather than splintering. No chew is risk-free, though: any hard chew can damage teeth if a dog bites down hard, and any piece swallowed whole can cause choking or a blockage.',
      },
      {
        question: 'Are yak milk chews safe for dogs to eat completely?',
        answer:
          'Yak milk chews are food, so the flakes your dog scrapes off as they chew are meant to be eaten. The risk is the final piece: once it is small enough to fit whole in your dog’s mouth, take it away. You can microwave that end piece so it puffs into a light, crunchy treat that is easy to bite through.',
      },
      {
        question: 'Can puppies have yak chews?',
        answer:
          'We suggest waiting until a puppy is at least four months old, choosing a size that suits their adult weight rather than their current one, and keeping chewing sessions short and supervised. Puppy teeth and jaws are still developing, so if you have any doubts, ask your own vet before offering any hard chew.',
      },
      {
        question: 'Which dogs should not have yak chews?',
        answer:
          'Skip yak chews if your dog has a known dairy allergy or intolerance, has cracked, worn or recently treated teeth, or tends to swallow chews in large chunks rather than gnawing. Dogs on a strict diet should have chews counted as part of their daily food. If your dog has a health condition, check with your vet first.',
      },
      {
        question: 'How long should I let my dog chew a yak chew for?',
        answer:
          'Many owners give a chew for a session of 15 to 30 minutes and then put it away until the next day. That keeps the chew lasting longer, stops a keen chewer overdoing it, and means you are around while they chew.',
      },
      {
        question: 'Do yak chews smell or stain?',
        answer:
          'Yak milk chews have very little smell compared with many animal-part chews, and they do not leave greasy marks. When a chew has been worked on for a while the surface gets soft and a little sticky, so a washable mat or hard floor is handy.',
      },
    ],
    content: `
## Are Yak Chews Safe for Dogs?

If you have searched "are yak chews safe for dogs", you have probably already seen two kinds of answer: shops that say they are perfectly safe, and forum threads that make every chew sound dangerous. The truth sits in between, and it is mostly about how you use them.

Here is what a yak chew actually is, where the real risks lie, and the habits that make chewing safer.

### What a Yak Milk Chew Is

A yak milk chew — sometimes called a Himalayan dog chew or churpi — is a **hard cheese**. Ours is made from **yak and cow milk, lime juice and a little salt**. The milk is boiled, curdled with the lime juice, pressed into blocks, and then dried slowly until it is rock hard.

Our flavoured chews add one more natural ingredient — real [strawberry](/products/strawberry-dog-chew), [blueberry](/products/blueberry-dog-chew) or [turmeric](/products/turmeric-dog-chew). There is no hide, no bone, no grain and nothing artificial.

That matters for safety because it changes **how the chew behaves under a dog’s teeth**. As your dog chews, saliva softens the surface and they scrape away thin layers. The chew wears down gradually rather than snapping into sharp pieces.

![Highland Yak Chew infographic: is yak chew safe? Yes, when used correctly and with supervision — choose the right size, always supervise, provide fresh water, take it away when it gets small, and consider your dog’s needs](/images/blog/is-yak-chew-safe-supervision-checklist.webp 1254x1254)

### Where the Real Risks Are

Being honest about this is more useful than pretending a chew is risk-free. These are the things to watch:

- **Choking on the last piece.** This is the big one. When a chew gets small enough to fit whole in your dog’s mouth, a keen dog may try to swallow it. Take it away before that happens.
- **Teeth.** A yak chew is hard when it is new. Most dogs gnaw and soften it, but a dog who bites down with full force on hard objects can damage a tooth on any hard chew.
- **Gulping large chunks.** Some dogs break off and swallow big pieces instead of gnawing. If yours does, a yak chew may not suit them — or try a bigger size so it is harder to get a mouthful.
- **Dairy.** It is a milk product. Dogs with a dairy allergy or intolerance should avoid it.
- **Too much at once.** It is food. A dog who gets through a whole chew in one go may have an upset stomach, and chews should count towards their daily intake.

### Five Habits That Make Yak Chews Safer

1. **Pick the right size.** Bigger is safer than smaller. Our [yak chew size guide](/blog/yak-chew-size-guide) matches each chew to your dog’s weight.
2. **Supervise.** Especially for the first few sessions, until you know how your dog chews.
3. **Keep sessions short.** Fifteen to thirty minutes, then put the chew away for tomorrow.
4. **Leave fresh water down.** Chewing is thirsty work.
5. **Take the end piece away.** Then turn it into a treat — see below.

![Infographic showing when to take a yak chew away: when it is small enough to swallow, crumbly, soft and sticky, or your dog loses interest](/images/blog/when-to-take-yak-chew-away-safety-guide.webp 1402x1753)

### What to Do With the Last Piece

This is where yak chews have an advantage over most long-lasting chews. Instead of throwing away the end piece, soak it in water for a few minutes, then **microwave it for 30–60 seconds**. It puffs up into a light, crunchy treat that is easy to bite through. Let it cool completely before giving it to your dog — the middle stays hot for a while.

We explain the full method in [how long do yak chews last](/blog/how-long-do-yak-chews-last). If you would rather skip the microwave, our [Classic Puff Chew](/products/classic-puff-chew) comes ready to puff.

### Who Should Be More Careful

- **Puppies under about four months.** Wait until their adult teeth are coming through, and supervise closely.
- **Dogs with dental problems.** Worn, cracked or recently treated teeth need a softer option.
- **Senior dogs.** Many still enjoy a yak chew, but puffed pieces are gentler.
- **Dogs with a health condition or special diet.** Ask your vet first.

### The Honest Verdict

Yak chews are a sensible choice for most healthy adult dogs. They are simple, food-based and wear down gradually instead of splintering. They are safest when they are the right size, when someone is around while your dog chews, and when the last piece is taken away.

If you want to see how they compare with other popular chews, read [yak chews vs rawhide vs antlers](/blog/yak-chews-vs-rawhide-vs-antlers).
${SHOP_CTA}
    `.trim(),
  },

  // ─── 2. Ingredients ───────────────────────────────────────────────────────
  {
    slug: 'what-are-yak-chews-made-of',
    title: 'What Are Yak Chews Made Of? Ingredients Explained',
    excerpt:
      'Yak chews are not bones and they are not rawhide. They are a hard cheese made from yak and cow milk, lime juice and salt. Here is what goes into every Highland Yak Chew, what the flavours add, and what we leave out.',
    category: 'Product Guide',
    date: UPDATED,
    readTime: '6 min read',
    image: '/images/blog/yak-chew-ingredients-yak-cow-milk-natural-flavours.webp',
    imageAlt:
      'Four Highland Yak Chews — strawberry, original, turmeric and blueberry — laid out with fresh strawberries, blueberries, turmeric root and a splash of milk',
    author: 'Highland Yak Chew Team',
    faqs: [
      {
        question: 'What are yak chews made of?',
        answer:
          'Yak chews are a hard cheese. A Highland Yak Chew is made from yak and cow milk, lime juice and a little salt. Our flavoured chews add one natural ingredient: real strawberry, blueberry or turmeric. They contain no hide, bone, grain, preservatives or artificial colours and flavours.',
      },
      {
        question: 'What are yak bones made of?',
        answer:
          '"Yak bones" is a name some people use for yak chews because of their shape, but they contain no bone at all. They are blocks of hardened cheese made from milk, which is why they wear down gradually as a dog chews instead of splintering like bone can.',
      },
      {
        question: 'Why do yak chews contain cow milk as well as yak milk?',
        answer:
          'Traditional Himalayan hard cheese is often made from a mix of yak and cow milk, depending on what herders have available. Blending the milks also helps give the chews a consistent texture. That is why we list both on the pack rather than calling our chews 100% yak milk.',
      },
      {
        question: 'Are yak chews lactose-free?',
        answer:
          'Much of the lactose in milk stays in the whey that is drained off when cheese is made, and hard, dried cheeses contain relatively little. But yak chews are still a dairy product, so we do not describe them as lactose-free, and dogs with a dairy allergy or intolerance should avoid them.',
      },
      {
        question: 'Do yak chews have preservatives?',
        answer:
          'No. Yak chews keep because most of the water is removed during slow drying, which is the same way hard cheeses have been preserved for centuries. Store them in a cool, dry place and reseal the pack.',
      },
      {
        question: 'Are yak chews grain-free?',
        answer:
          'Yes. Highland Yak Chews contain no wheat, corn, rice or any other grain, and no gluten.',
      },
    ],
    content: `
## What Are Yak Chews Made Of?

Search for "yak chew ingredients" and you will find a lot of words like natural, wholesome and pure, without much detail. So here is the full ingredient list for a Highland Yak Chew, with nothing hidden.

### The Short Answer

A yak chew is a **hard cheese**. Ours is made from:

- **Yak milk**
- **Cow milk**
- **Lime juice** — used to curdle the milk
- **A little salt**

That is the whole list for our [Classic Yak Chew](/products/classic-dog-chew). No hide, no bone, no grain, no preservatives, and no artificial colours or flavours.

![Rows of yak milk dog chews in four flavours, labelled Original Milk, Strawberry, Blueberry and Turmeric, beside the fruit and spice used in each](/images/blog/yak-milk-dog-chews-original-strawberry-blueberry-turmeric.webp 1085x814)

### So What Are "Yak Bones"?

You will sometimes see yak chews called yak bones, Himalayan bones or cheese bones. The name comes from the shape, not the contents. **There is no bone in a yak chew.** It is milk that has been turned into cheese, pressed and dried until it is very hard.

This is the main reason people choose them over real bones. Cooked bone can splinter into sharp pieces. Cheese softens at the surface as your dog chews and wears down gradually. We compare the two properly in [yak chew vs bone](/blog/yak-chew-vs-bone-which-is-safer-for-your-dog).

### Why Yak and Cow Milk?

Plenty of people search for "yak and cow milk dog chews" because they have noticed both on a label and wondered why.

In the Himalayas, hard cheese has always been made with whatever milk herders have — often a mix of yak and cow (or a yak–cow cross). Mixing the milks also helps keep the texture consistent from batch to batch.

We list both milks on our packs. Some sellers describe their chews as "100% yak milk"; ours contain cow milk too, and we would rather say so.

### What Each Ingredient Does

| Ingredient | What it is there for |
| --- | --- |
| Yak and cow milk | The base of the cheese — provides the protein and the chew |
| Lime juice | Makes the milk curdle, separating solid curds from liquid whey |
| Salt | A small amount, traditional in the recipe, helps with flavour and keeping |
| Real fruit or turmeric | Flavour and colour in our flavoured chews only |

### The Flavours

Our flavoured chews use the same base and add one natural ingredient each:

- **[Strawberry](/products/strawberry-dog-chew)** — real strawberry, which gives the chew its pink colour
- **[Blueberry](/products/blueberry-dog-chew)** — real blueberry, which turns it purple
- **[Turmeric](/products/turmeric-dog-chew)** — real turmeric, for a golden colour and earthy flavour

The colours come from the ingredients themselves, not from added dye.

![Purple blueberry yak milk chews on a wooden table with fresh blueberries and a Highland Yak Chew Milk Chew pack](/images/blog/blueberry-yak-milk-chew-himalayan-yak-cow-milk.webp 1254x1254)

### What We Leave Out

- **Hide** — unlike rawhide, there is no animal skin
- **Bone** — despite the nickname
- **Grain and gluten** — no wheat, corn, rice or fillers
- **Preservatives** — drying does the job instead
- **Artificial colours and flavours**

### How It Keeps Without Preservatives

Hard cheese keeps because most of the water is removed. Our chews are dried slowly until they are hard all the way through, which is how Himalayan communities preserved milk long before fridges. Keep them in a cool, dry place, reseal the pack, and they stay hard.

![Golden turmeric yak milk dog chews stacked beside fresh turmeric root and ground turmeric](/images/blog/turmeric-yak-milk-dog-chew-real-turmeric.webp 1448x1448)

### A Note on Dairy

Making cheese drains off most of the whey, and much of the lactose goes with it, so dried hard cheese contains relatively little. But a yak chew is still dairy. We do not call our chews lactose-free, and **dogs with a dairy allergy or intolerance should avoid them.**

### Want to Know How They Are Made?

The process behind these four ingredients is a centuries-old Himalayan cheese-making tradition. Read [how churpi is made in Nepal](/blog/how-highland-yak-chews-are-made) for the full story.
${SHOP_CTA}
    `.trim(),
  },

  // ─── 3. Himalayan / churpi ───────────────────────────────────────────────
  {
    slug: 'how-highland-yak-chews-are-made',
    title: 'Himalayan Yak Chews: How Churpi Is Made in Nepal',
    excerpt:
      'Long before it became a dog chew, churpi was a hard cheese Himalayan herders made to last through long winters and mountain journeys. Here is how this traditional cheese is made, and how it reaches dogs in the UK.',
    category: 'Our Story',
    date: '2026-03-04',
    updated: UPDATED,
    readTime: '7 min read',
    image: '/images/blog/himalayan-yak-chew-churpi-hard-cheese-nepal.webp',
    imageAlt:
      'Three natural Himalayan yak chews (churpi) on a wooden floor beside a Highland Yak Chew Milk Chew pack illustrated with yaks and mountains',
    author: 'Highland Yak Chew Team',
    faqs: [
      {
        question: 'What is churpi?',
        answer:
          'Churpi (also spelt chhurpi) is a traditional cheese from the Himalayan regions of Nepal, Tibet, Bhutan and parts of India. There is a soft kind eaten fresh and a hard kind that is dried until it is rock solid. Hard churpi has been chewed slowly by people for generations, and it is the basis of the yak chews sold for dogs.',
      },
      {
        question: 'What is a Himalayan yak chew?',
        answer:
          'A Himalayan yak chew is a block of hard churpi-style cheese made from yak and cow milk, lime juice and salt, shaped and sized for dogs. It is dried until very hard, so dogs gnaw at it slowly, softening and scraping the surface as they go.',
      },
      {
        question: 'How is hard churpi made?',
        answer:
          'Milk is heated, then an acid such as lime juice is added so it separates into curds and whey. The curds are strained through cloth, pressed into blocks to squeeze out more liquid, cut into pieces and then dried slowly over several weeks until they are hard all the way through.',
      },
      {
        question: 'Where are Highland Yak Chews made?',
        answer:
          'Highland Yak Chews are made in Nepal using the traditional hard churpi method, then packed and sold in the UK by Highland Yak Chew.',
      },
      {
        question: 'Where can I buy yak chews in the UK?',
        answer:
          'You can order Highland Yak Chews from highlanddogchew.co.uk, with flat-rate £1.99 delivery anywhere in the UK. We sell classic and flavoured chews in small, medium and large sizes, puff treats, and mixed boxes.',
      },
    ],
    content: `
## Himalayan Yak Chews: How Churpi Is Made in Nepal

The yak chew in your dog’s mouth started life as something people eat. In the Himalayas, **churpi** (often spelt chhurpi) is a traditional cheese that has been made for generations in Nepal, Tibet, Bhutan, Sikkim and Darjeeling.

There are two kinds. **Soft churpi** is eaten fresh, a bit like cottage cheese, and turns up in curries and pickles. **Hard churpi** is dried until it is rock solid. It keeps for a very long time and is chewed slowly, a small piece lasting for hours — which made it ideal food for long winters and journeys on foot through the mountains.

It is that hard churpi that became the Himalayan yak chew.

![Pale golden original Himalayan yak milk chews resting on wood with dried grasses](/images/blog/natural-himalayan-yak-milk-chews-smoked-dried.webp 1448x1930)

### How Hard Churpi Is Made

The method is simple, but it takes time. In broad steps:

1. **Heat the milk.** Yak milk, cow milk, or a mix of the two is heated in a large pot.
2. **Curdle it.** An acid — for our chews, lime juice — is added. The milk separates into solid curds and liquid whey.
3. **Strain.** The curds are gathered in cloth and the whey drains away.
4. **Press.** The wrapped curds are pressed under weight to squeeze out more liquid and form a dense block.
5. **Cut.** The block is cut into bars or pieces.
6. **Dry slowly.** The pieces are dried for several weeks, traditionally in the dry mountain air and sometimes over smoke, until they are hard all the way through.

Nothing is added to stop the cheese going off. It keeps because the water has been driven out — the same reason a hard cheese like Parmesan lasts longer than a soft one.

### From Human Snack to Dog Chew

At some point, people noticed what dogs already knew: a piece of hard churpi keeps a dog busy for a very long time. Dried slowly and properly, it is hard enough to need patient gnawing but softens at the surface as saliva works into it, so a dog scrapes it away bit by bit.

Today, the dog chews are made the same way as the cheese, then cut and graded into sizes for different dogs. That is what a Highland Yak Chew is: hard churpi, made in Nepal from **yak and cow milk, lime juice and a little salt**, sized for your dog.

![Turmeric yak milk chews with a Highland Yak Chew pack showing yaks grazing below Himalayan peaks](/images/blog/himalayan-yak-chew-uk-milk-chew-pack-yaks.webp 1254x1254)

### Why the Traditional Method Matters

You will find a lot of yak chews for sale in the UK, and they are not all the same. A few things to look for:

- **A short ingredient list.** Milk, an acid such as lime juice, and salt. If you see binders, fillers or long chemical names, it is not traditional churpi.
- **Honest labelling of the milk.** Most churpi uses a mix of yak and cow milk. A clear label tells you which.
- **Proper drying.** A well-dried chew is hard right through. A chew that feels soft or bendy out of the pack has not been dried properly and will not last.
- **No odd smell.** Good hard churpi has a mild, milky smell, not a strong or sour one.

### Our Flavours, the Same Tradition

Our [original chew](/products/classic-dog-chew) is the traditional recipe. For dogs who like variety, we also make versions with real [strawberry](/products/strawberry-dog-chew), [blueberry](/products/blueberry-dog-chew) and [turmeric](/products/turmeric-dog-chew) added to the same base. The method stays the same; only the flavour changes. You can read the full ingredient breakdown in [what are yak chews made of](/blog/what-are-yak-chews-made-of).

### Himalayan Yak Chews in the UK

Highland Yak Chew brings churpi made in Nepal to dogs across the UK. We sell [classic and flavoured yak chews](/products/yak-chews) in small, medium and large sizes, [puff treats](/products/puff-treats) for older dogs and smaller mouths, and [mixed boxes](/products/highland-mix) if you want to try a few at once.

Not sure which size to get? Our [yak chew size guide](/blog/yak-chew-size-guide) will help.
${SHOP_CTA}
    `.trim(),
  },

  // ─── 4. How long they last + puff trick ───────────────────────────────────
  {
    slug: 'how-long-do-yak-chews-last',
    title: 'How Long Do Yak Chews Last? (Plus the Microwave Puff Trick)',
    excerpt:
      'One dog makes a yak chew last a week; another finishes it in an afternoon. Here is what decides how long a yak chew lasts, how to make it go further, and how to turn the last piece into a crunchy puffed treat.',
    category: 'Product Guide',
    date: UPDATED,
    readTime: '6 min read',
    image: '/images/blog/how-long-do-yak-chews-last-pug-chewing.webp',
    imageAlt: 'Black pug lying on a sofa holding a strawberry yak chew between its paws',
    author: 'Highland Yak Chew Team',
    faqs: [
      {
        question: 'How long do yak chews last?',
        answer:
          'It depends mostly on your dog. A gentle chewer may get several sessions over days or even weeks from one chew, while a determined power chewer can get through a small chew in a single sitting. Choosing the right size, or one size up for strong chewers, and putting the chew away between sessions makes it last much longer.',
      },
      {
        question: 'How do you puff a yak chew in the microwave?',
        answer:
          'Take the small end piece away from your dog, soak it in warm water for about five minutes, then microwave it on its own for around 30 to 60 seconds until it puffs up. Microwaves vary, so start with less time and watch it. Let it cool completely, for at least two minutes, before giving it to your dog — the inside stays hot.',
      },
      {
        question: 'When should I take a yak chew away?',
        answer:
          'Take it away once it is small enough for your dog to swallow whole, if it starts breaking into crumbly chunks, or if your dog loses interest. The small end piece can then be puffed in the microwave.',
      },
      {
        question: 'How long do yak chews keep in the pack?',
        answer:
          'Yak chews are dried hard cheese, so they keep well in a cool, dry place. Check the best-before date on the pack, reseal it after opening, and keep chews away from damp and direct sunlight.',
      },
      {
        question: 'Why has my dog’s yak chew gone soft?',
        answer:
          'That is normal. Saliva softens the surface of the chew as your dog works on it. Leave it somewhere dry between sessions and it will harden up again. If it stays soft and sticky, it is near the end of its life — puff the remaining piece.',
      },
    ],
    content: `
## How Long Do Yak Chews Last?

This is the question we get asked most, and the honest answer is: **it depends on your dog.** We have heard from owners whose dog makes one chew last for weeks, and others whose dog was on the last piece by teatime.

Here is what makes the difference, how to stretch a chew further, and what to do when it gets small.

### What Decides How Long a Chew Lasts

- **How your dog chews.** Gentle chewers lick and nibble. Power chewers grind with their back teeth. This matters more than anything else.
- **Size of the chew compared with the dog.** A small chew in a big dog’s mouth goes quickly — and is less safe. See our [size guide](/blog/yak-chew-size-guide).
- **How long each session is.** A chew left down all day is gone sooner than one given for half an hour at a time.
- **How dry it is.** Saliva softens the chew. Letting it dry out between sessions keeps it harder for longer.

### How to Make a Yak Chew Last Longer

1. **Size up for strong chewers.** If your dog finishes a medium quickly, try a [large](/products/classic-dog-chew).
2. **Use short sessions.** Fifteen to thirty minutes, then put it away. Many dogs enjoy the chew more when it reappears tomorrow.
3. **Let it dry between sessions.** Leave it somewhere airy, not in a sealed tub while wet.
4. **Supervise.** You will spot a dog trying to crack off big pieces, which is the fastest way through a chew — and not a safe one.

### When to Take It Away

Take the chew away when:

- It is **small enough to swallow whole**
- It is **breaking into crumbly chunks**
- It has gone **soft and sticky** all over
- Your dog has **lost interest**

Do not throw the end piece away, though.

### The Microwave Puff Trick

The last bit of a yak chew can be turned into a completely different treat. Heat makes the remaining moisture expand, and the dense cheese puffs up into something light and crunchy, a bit like a cheese puff.

![Four-step yak chew puff trick: soak the small end piece in water, microwave it, watch it puff, then let it cool completely before serving](/images/blog/yak-chew-puff-trick-microwave-steps.webp 1254x1254)

1. **Soak.** Put the end piece in warm water for about five minutes.
2. **Microwave.** Put it on a plate on its own and microwave for about **30–60 seconds**. Microwaves vary, so start with less and add more if needed.
3. **Watch it puff.** It grows several times bigger. Stop once it has puffed and stopped growing.
4. **Cool completely.** Wait at least two minutes. The outside cools fast, but the middle stays hot.

A puffed piece is easy to bite through, which makes it a good treat for smaller dogs and older dogs, and it means nothing goes to waste.

### Puffs Without the Leftovers

If your dog prefers the crunchy version, you do not need to wait for an end piece. Our [Classic Puff Chew](/products/classic-puff-chew) and [Classic Un-Puff Chew](/products/classic-un-puff-chew) are small pieces made for puffing at home.

![Highland Yak Chew Crunchy Puff Chew pouch with puffed yak milk treats visible through the window](/images/blog/crunchy-puffed-yak-chew-treats-pouch.webp 1086x1352)

### Is a Long-Lasting Chew Always Better?

Not necessarily. A chew that lasts forever because your dog cannot make any impression on it is too hard for them. What you want is a chew your dog can gradually wear down. If you are weighing up options, read [yak chews vs rawhide vs antlers](/blog/yak-chews-vs-rawhide-vs-antlers).
${SHOP_CTA}
    `.trim(),
  },

  // ─── 5. Comparison ───────────────────────────────────────────────────────
  {
    slug: 'yak-chews-vs-rawhide-vs-antlers',
    title: 'Yak Chews vs Rawhide vs Antlers: Best Long-Lasting Natural Dog Chews UK',
    excerpt:
      'Rawhide, antlers, bully sticks, bones and yak chews all promise to keep your dog busy. An honest side-by-side look at what each one is, how long it lasts, and the trade-offs — so you can pick the right one for your dog.',
    category: 'Buying Guide',
    date: UPDATED,
    readTime: '8 min read',
    image: '/images/blog/long-lasting-natural-dog-chew-labrador-garden.webp',
    imageAlt:
      'Fox red Labrador trotting through a garden with a long-lasting yak milk chew in its mouth',
    author: 'Highland Yak Chew Team',
    faqs: [
      {
        question: 'What is the best long-lasting natural dog chew?',
        answer:
          'There is no single best chew for every dog. A good long-lasting chew is one your dog can gradually wear down rather than one that cannot be dented, made from simple ingredients, and the right size for their mouth. Yak milk chews suit many dogs because they are food-based and soften as they are chewed, but always match the chew to your dog’s size and chewing style.',
      },
      {
        question: 'Are yak chews better than rawhide?',
        answer:
          'They are different products. Rawhide is the inner layer of an animal hide, often processed and sometimes pressed or glued into shapes; it softens into a leathery texture and can be swallowed in large pieces. Yak chews are hard cheese made from milk, lime juice and salt, and wear down in thin layers. Many owners choose yak chews for the shorter ingredient list, but both need supervision.',
      },
      {
        question: 'Are antlers safe for dogs?',
        answer:
          'Antlers are very hard and do not soften as a dog chews, so there is a risk of tooth damage, especially for strong chewers. A common rule of thumb is that if you cannot press a fingernail into a chew, it may be too hard for your dog’s teeth. If you do use antlers, choose split antlers for a softer centre and supervise closely.',
      },
      {
        question: 'Do yak chews last longer than bully sticks?',
        answer:
          'For most dogs, yes — a yak chew of the right size usually lasts longer than a bully stick of a similar size, because it is much denser and harder. Exact times depend on the dog.',
      },
      {
        question: 'Which dog chews do not splinter?',
        answer:
          'Yak milk chews, bully sticks and most rubber chew toys do not splinter. Cooked bones are the main chew to avoid because they can break into sharp pieces. Antlers can chip, and raw bones can break under strong jaws.',
      },
    ],
    content: `
## Yak Chews vs Rawhide vs Antlers

Walk into any UK pet shop and you will see a wall of long-lasting chews: rawhide twists, antlers, bully sticks, bones, and yak chews. They all promise to keep your dog busy. They are not the same, and none of them is perfect for every dog.

We sell yak chews, so we are not neutral. We have tried to be fair anyway — including about where a yak chew is not the right choice.

### What Makes a Good Long-Lasting Chew?

Before comparing, it helps to know what you are looking for:

- **Wears down gradually.** Your dog should be able to make progress. A chew they cannot dent at all is too hard for their teeth.
- **Does not splinter or break into sharp pieces.**
- **Simple ingredients.** Easy to understand what your dog is eating.
- **Right size.** Too small is a choking risk, whatever it is made of.
- **Something your dog actually enjoys.**

![Infographic comparing natural dog chews (simple ingredients, minimally processed, no artificial additives) with highly processed chews](/images/blog/natural-vs-highly-processed-dog-chews.webp 1024x1365)

### Rawhide

**What it is:** the inner layer of cow or other animal hide, cleaned, dried and often rolled or pressed into shapes.

- **Good:** widely available, cheap, most dogs like it.
- **Watch out for:** rawhide softens into a leathery, stretchy texture, and dogs can tear off and swallow large pieces, which can cause choking or a blockage. Processing varies between makers, and some pressed rawhides are made from many scraps stuck together.

### Antlers

**What they are:** naturally shed deer or elk antler, cut into lengths.

- **Good:** very long-lasting, do not smell, not greasy.
- **Watch out for:** antlers are extremely hard and do not soften as they are chewed. That hardness is the main concern for teeth, particularly with strong chewers. Split antlers, which expose the softer centre, are a gentler option.

### Bully Sticks and Other Animal-Part Chews

**What they are:** dried animal parts — bully sticks, pizzles, ears, tendons.

- **Good:** single-ingredient, digestible, most dogs love them.
- **Watch out for:** they can be smelly, they tend not to last long with a keen chewer, and the last couple of inches is a choking hazard. Some owners use a bully stick holder.

### Bones

**What they are:** raw or cooked animal bone.

- **Watch out for:** cooked bones can splinter into sharp pieces and should never be given. Raw bones are a considered choice for some owners but carry risks to teeth and from bacteria. We go into this in detail in [yak chew vs bone](/blog/yak-chew-vs-bone-which-is-safer-for-your-dog).

![Highland Yak Chew graphic asking what your dog would choose — a regular bone or a Highland Yak Chew — next to a chewing-benefits panel](/images/blog/yak-chew-vs-bone-what-would-your-dog-choose.webp 1402x1122)

### Yak Milk Chews

**What they are:** hard cheese made from yak and cow milk, lime juice and salt, dried until very hard. See [what are yak chews made of](/blog/what-are-yak-chews-made-of).

- **Good:** four simple ingredients; wear down in thin layers as saliva softens the surface; do not splinter; little smell; usually long-lasting; the last piece can be puffed in the microwave so you are not left with a choking-size stub.
- **Watch out for:** they are hard when new, so very aggressive chewers can still hurt a tooth; they are dairy, so not for dogs with a milk allergy; and they cost more than rawhide.

### Side by Side

| Chew | Rawhide | Antler | Bully stick | Yak chew |
| --- | --- | --- | --- | --- |
| Made from | Animal hide | Shed antler | Dried animal part | Milk, lime juice, salt |
| Softens as chewed | Yes, leathery | No | Yes | Yes, at the surface |
| Splinters | No, but tears into chunks | Can chip | No | No |
| Smell | Mild | None | Often strong | Very mild |
| Typical life | Varies | Very long | Short to medium | Medium to long |
| Last piece | Discard | Discard | Discard | Puff it in the microwave |

"Typical life" depends heavily on the dog and the size of the chew. Treat it as a rough comparison, not a promise.

### Which Is Best for Your Dog?

- **Gentle to moderate chewers:** a yak chew of the right size is a good all-rounder.
- **Power chewers:** size up to a [large yak chew](/products/classic-dog-chew), supervise, and avoid anything your dog cannot make a dent in.
- **Puppies, seniors and dogs with sensitive teeth:** softer options such as [puff treats](/products/puff-treats) are kinder.
- **Dogs with a dairy allergy:** skip yak chews and choose a non-dairy option.

Whatever you choose, the same rules apply: right size, supervision, and take the last piece away.
${SHOP_CTA}
    `.trim(),
  },

  // ─── 6. Size guide ───────────────────────────────────────────────────────
  {
    slug: 'yak-chew-size-guide',
    title: 'Yak Chew Size Guide: Which Size for Your Dog?',
    excerpt:
      'Choosing the right yak chew size is the single most important thing you can do for safety. Here is our size guide by dog weight, how to adjust for chewing style, and examples of common UK breeds in each size.',
    category: 'Buying Guide',
    date: '2026-02-10',
    updated: UPDATED,
    readTime: '6 min read',
    image: '/images/blog/yak-chew-size-guide-small-dogs-pugs.webp',
    imageAlt:
      'Two pugs sniffing a Highland Yak Chew pack held out to them in front of an open gift box',
    author: 'Highland Yak Chew Team',
    faqs: [
      {
        question: 'What size yak chew should I get for my dog?',
        answer:
          'Go by weight first: our Small chew (30–40 g) suits dogs of about 5–10 kg, Medium (60–80 g) suits about 10–25 kg, and Large (100–120 g) suits dogs over 25 kg. If your dog is a strong chewer or sits near the top of a range, choose the next size up.',
      },
      {
        question: 'Is it better to go bigger or smaller with a yak chew?',
        answer:
          'Bigger. A chew that is too small can be swallowed whole or in large pieces. A chew that is a little too big just lasts longer. If you are unsure between two sizes, choose the larger one.',
      },
      {
        question: 'What size yak chew for a dog under 5 kg?',
        answer:
          'Very small dogs such as Chihuahuas and toy breeds can still enjoy a Small chew with supervision, as long as it is too big to fit fully in their mouth. Many tiny dogs find puffed yak treats easier, because they are light and easy to bite through.',
      },
      {
        question: 'What size yak chew for a Labrador?',
        answer:
          'Most adult Labradors weigh over 25 kg, so a Large chew (100–120 g) is the right starting point. Labradors are often keen chewers, so supervise the first few sessions.',
      },
      {
        question: 'What size yak chew for a Cocker Spaniel?',
        answer:
          'Most Cocker Spaniels weigh around 12–16 kg, which puts them in our Medium size (60–80 g). If your Cocker is a determined chewer, try a Large.',
      },
    ],
    content: `
## Yak Chew Size Guide: Which Size for Your Dog?

Getting the size right is the most useful thing you can do to make a yak chew safe. A chew that is too small can be swallowed whole. One that is a little too big simply lasts longer.

Here is how to choose.

### Our Sizes at a Glance

Each chew is cut from a natural block of hard cheese, so weights vary a little. That is why we give a range.

| Size | Chew weight | Dog weight | Example breeds |
| --- | --- | --- | --- |
| Small | 30–40 g | about 5–10 kg | Jack Russell, Miniature Dachshund, Shih Tzu, Pug |
| Medium | 60–80 g | about 10–25 kg | Cocker Spaniel, Beagle, Border Collie, Staffie |
| Large | 100–120 g | over 25 kg | Labrador, Golden Retriever, German Shepherd, Boxer |

Breed examples are a rough guide — always go by your own dog’s weight.

![Highland Yak Chew size panel: small chews for dogs 5–10 kg, medium for 10–25 kg, large for dogs over 25 kg](/images/blog/yak-chew-sizes-small-medium-large-dog-weight.webp 869x298)

### Step 1: Start With Weight

Weigh your dog, or use their last weight from the vet, and find their row in the table above. If they sit near the top of a range, lean towards the next size up.

### Step 2: Adjust for Chewing Style

Weight gets you close. How your dog chews decides the rest.

![Infographic of four chewer types — gentle, moderate, power and picky — to help choose a yak chew size](/images/blog/what-kind-of-chewer-is-your-dog-gentle-power.webp 1254x1254)

- **Gentle chewers** take their time and lick and nibble. The size for their weight is right.
- **Moderate chewers** enjoy a good chew without trying to destroy it. Stick with the size for their weight and watch the first session.
- **Power chewers** try to crack and crunch. **Go one size up.** A Staffie at 18 kg who demolishes toys will do better with a Large than a Medium.
- **Picky chewers** may need a flavour they like. Try [strawberry](/products/strawberry-dog-chew), [blueberry](/products/blueberry-dog-chew) or [turmeric](/products/turmeric-dog-chew), or a [mixed bundle](/products/the-pawfect-pack) to find a favourite.

### Step 3: Check the Fit

When you first hand over the chew, it should be **too big to fit fully inside your dog’s mouth.** If your dog can close their mouth around the whole thing, it is too small.

### Very Small Dogs (Under 5 kg)

Toy breeds such as Chihuahuas, Yorkshire Terriers and Pomeranians can still enjoy a Small chew, as long as it is clearly too large to swallow and you supervise. Many tiny dogs find [puff treats](/products/puff-treats) easier — they are light, crunchy and easy for small jaws.

### Puppies and Older Dogs

- **Puppies:** we suggest waiting until at least four months. Choose a size based on their expected adult weight, keep sessions short, and supervise.
- **Senior dogs:** if your dog’s teeth are worn or sensitive, puffed pieces are gentler than a full hard chew.

![Border Collie chewing a yak chew beside a checklist: size, texture, duration and supervision](/images/blog/choosing-a-dog-chew-size-texture-supervision.webp 1086x1448)

### Multi-Dog Households

If you have dogs of different sizes, buy for the biggest chewer, or give each dog their own chew in their own space. Some dogs guard chews, and a small dog may pick up a chew that is the wrong size for them.

### When It Gets Small

Whatever size you buy, take the chew away once it is small enough to swallow and puff the end piece in the microwave. We explain how in [how long do yak chews last](/blog/how-long-do-yak-chews-last).

Still unsure? [Send us a message](/contact) with your dog’s weight and breed and we will recommend a size.
${SHOP_CTA}
    `.trim(),
  },

  // ─── 7. Christmas gifts ──────────────────────────────────────────────────
  {
    slug: 'dog-christmas-gift-ideas-uk',
    title: 'Dog Gift Ideas UK: Christmas Presents Your Dog Will Actually Use',
    excerpt:
      'Stuck for a Christmas present for your dog — or a dog-owning friend? Practical dog gift ideas for every budget, from stocking fillers to our Highland Gift Box, plus a few festive foods to keep out of reach.',
    category: 'Buying Guide',
    date: UPDATED,
    readTime: '7 min read',
    image: '/images/blog/dog-christmas-gift-box-uk-highland-yak-chew.webp',
    imageAlt:
      'Black pug looking at a Highland Yak Chew gift box with a blueberry Milk Chew pack held in front of it',
    author: 'Highland Yak Chew Team',
    faqs: [
      {
        question: 'What is a good Christmas present for a dog?',
        answer:
          'The best presents are ones your dog will use every day: a long-lasting natural chew, a toy that suits how they play, a comfy bed, or new walking kit. A gift box of chews is an easy choice because it works for almost any dog and gives them something to enjoy over the festive period.',
      },
      {
        question: 'What is in the Highland Gift Box?',
        answer:
          'The Highland Gift Box includes yak milk chews in the flavours of your choice, a puffed and an unpuffed chew, and a special-occasion card with a personal note and a photo. It works for Christmas, birthdays and other occasions.',
      },
      {
        question: 'What are good dog stocking fillers?',
        answer:
          'Individual yak milk chews make good stocking fillers because they are small, keep well and are useful. Other ideas include a new ball, a name tag, poo bags in a fun holder, or a pack of training treats.',
      },
      {
        question: 'What Christmas foods are dangerous for dogs?',
        answer:
          'Keep chocolate, grapes, raisins, currants and sultanas (so mince pies, Christmas pudding and Christmas cake), onions, garlic and leeks (including stuffing and gravy), cooked turkey bones, macadamia nuts, and anything sweetened with xylitol away from dogs. If you think your dog has eaten something toxic, contact your vet straight away.',
      },
      {
        question: 'When should I order dog Christmas presents in the UK?',
        answer:
          'Order in good time. Our standard UK delivery usually takes 3–5 working days, and couriers get busy in December, so ordering by early December gives plenty of margin.',
      },
    ],
    content: `
## Dog Gift Ideas UK: Christmas Presents Your Dog Will Actually Use

Dogs do not care about wrapping paper (well, some of them love it). They care about things they can chew, chase, sniff and snuggle. So the best dog presents are the ones that get used every day — not the novelty jumper that comes out once.

Here are our honest picks for every budget, including a few that are not ours.

### Stocking Fillers

- **A single yak chew.** Small, keeps for ages and actually useful. Try a [Classic Yak Chew](/products/classic-dog-chew) or a flavoured [strawberry](/products/strawberry-dog-chew), [blueberry](/products/blueberry-dog-chew) or [turmeric](/products/turmeric-dog-chew) chew. Choose the right size with our [size guide](/blog/yak-chew-size-guide).
- **A new ball or tug toy** that suits how your dog plays.
- **A name tag** with up-to-date contact details — a useful excuse to check the old one.

![A hand fanning out five Highland Yak Chew Milk Chew packs — an easy dog stocking filler](/images/blog/yak-milk-chew-packs-stocking-fillers.webp 1152x1431)

### Bundles and Treat Boxes

If you want something more substantial without going big:

- **[Mixed Chew Bundle](/products/the-pawfect-pack)** — five medium flavoured yak chews, good for finding your dog’s favourite.
- **[Dog’s Delight Combo](/products/dogs-delight-combo)** — five small flavoured chews plus a crunchy puff treat, ideal for smaller dogs.
- **[Highland Treat Box](/products/highland-treat-box)** — five medium chews, a puff treat and a classic unpuffed chew.

### The Gift Box: For Someone Special

Our **[Highland Gift Box](/products/highland-gift-box)** is the one we designed for presents. It includes:

- Yak milk chews in **the flavours of your choice**
- A **puffed and an unpuffed chew**
- A **special-occasion card** with your note and a photo

It arrives boxed and ready to give, so it works well for a dog-owning friend or family member as well as your own dog. It is not just for Christmas either — it is popular for birthdays, "get well soon" and "miss you" messages.

![Highland Yak Chew gift box set with flavoured yak milk chews, an unpuffed chew pouch and a crunchy puff chew pouch](/images/blog/highland-gift-box-yak-chews-puff-treats.webp 1122x1397)

### Gifts That Are Not Things

Some of the best presents for a dog cost little or nothing:

- **A new walk.** Somewhere with fresh smells is a treat in itself.
- **A sniffing game.** Hide treats around a room or in a rolled-up towel.
- **Your time.** Ten minutes of training a new trick is great enrichment.

### For Older or Fussy Dogs

Older dogs with sensitive teeth often prefer something softer. [Puff treats](/products/puff-treats) are light and crunchy, and our [Classic Un-Puff Chew](/products/classic-un-puff-chew) lets you puff fresh pieces at home.

![Open white and yellow Highland Yak Chew gift box with paw prints, printed “from the Highlands to your dog”](/images/blog/open-dog-gift-box-highland-yak-chew.webp 1086x1352)

### Keep These Christmas Foods Away From Your Dog

Christmas brings a lot of food into the house that is not safe for dogs. Keep these out of reach:

- **Chocolate** — including tree decorations and selection boxes
- **Grapes, raisins, currants and sultanas** — so mince pies, Christmas pudding and Christmas cake too
- **Onions, garlic, leeks and chives** — often hidden in stuffing and gravy
- **Cooked turkey or chicken bones** — they can splinter
- **Macadamia nuts**
- **Anything with xylitol** — some sugar-free sweets and baked goods

If you think your dog has eaten something it should not have, call your vet straight away. Out of hours, your vet’s answerphone will direct you to emergency cover.

A long-lasting chew is also useful on the day itself: it gives your dog something to do while everyone is eating, which helps keep their nose out of the plates.

### Order in Good Time

Our standard UK delivery usually takes 3–5 working days, and couriers get busy in December. Ordering by early December gives you plenty of margin.
${SHOP_CTA}
    `.trim(),
  },
];
