# SELLING.md — how to actually sell this to travel companies at $100

## The product you're selling
A white-labeled "client perk": the travel agency's logo sits on an animated
world map where their client families color in the countries they visit.
Every family gets a shareable public page that markets the agency.

**The one-line pitch:**
> "Your agency's logo on a beautiful trip-map your clients update from every
> country they visit — and every time they share it, it advertises you. One
> license, $100, deployed on your domain in a day."

## Who buys (best-first order)
1. **Boutique travel agencies (1–20 staff)** in Armenia, Georgia, Russia and
   the RU-speaking market — the product already speaks their language, and
   they compete for clients on "extras" like this.
2. **Tour operators selling family trips** — families are literally their
   customer base; the map is the memory of the product they sold.
3. **Travel bloggers/creators with audiences** — they buy it to give their
   community a tool and monetize it.
4. Honeymoon/travel-planning services (high ticket, love shareable keepsakes).

## Where to find them
- Instagram / Facebook: search #турагентство #турагентствоЕреван #travelagency
  + your city — DM the 50 closest agencies. Small agencies respond to DMs;
  big ones to email.
- Telegram travel communities and local tourism association member lists.
- Google Maps: "турагентство" in your city — every listing has a contact.
- Your own Whop/previous buyers of the template.

## The pitch sequence (that works for cold DMs)
1. **First message — value, not features:**
   "Hi! I built a tool travel agencies give their clients: a branded world map
   where each family colors in the countries they visit, with photos/notes and
   a share page. Their trip stays connected to your agency after they fly.
   Want to see it live in 2 minutes? [demo link]"
2. **Send the demo link** (http://localhost:3000 → demo button). The demo is
   seeded with a fake family's 28 trips — it sells itself in 60 seconds.
3. **The killer move: brand it BEFORE they pay.** Ask for their logo, set it
   in Agency Studio (2 minutes), send them *their* branded demo link. Seeing
   their own logo on it ends the price conversation.
4. **Close:**
   "$100 one-time. I deploy it on your domain within a day. No subscriptions."
5. After the first sale: ask for a 2-line testimonial + a referral intro.
   Testimonials double the close rate on the next ten.

## Objections → answers
- "We don't do tech" → "You don't touch code. I deploy everything; you get a
  link and a login. $100 includes setup on your domain."
- "Why would our clients use it?" → "They already track trips in photos and
  stories. This gives their memories your logo. Clients who feel the perk
  rebook — that's the point."
- "Can we try first?" → "Yes — I'll brand a demo with your logo today, free.
  If your team likes it, you buy."
- "$100 is cheap — what's the catch?" → "It's my launch price for the first
  agencies. After that it goes up." (scarcity, and it's true — raise it after
  10 sales)

## Delivery checklist per sale
1. Get their logo (PNG/SVG, square) + brand color + domain.
2. Deploy: Supabase project (free) + Vercel (free) — see
   `whop/deploy-checklist.md`. 30–60 min per deployment.
3. Run both migrations, set their branding in Agency Studio, seed their demo
   family, hand over: their domain link + one admin login.
4. Send a 3-line "how to onboard a client family" note (also built into
   Agency Studio).

## Pricing ladder (after the first 10 sales)
| Offer | Price | Notes |
|---|---|---|
| Agency License (now) | $100 | white-label + source + deploy help |
| Done-for-you branding | $150 | they send logo, you do everything |
| Hosting | $10/mo | you keep it running on their domain |
| Extra language | $50 | they ask for FR/DE/etc. |

## Metrics that matter
- 50 DMs → ~10 demo clicks → 2–4 sales at current quality. It's a numbers
  game; the demo does the closing.
- Track: DMs sent, demo links opened (Vercel analytics), replies, sales.
- Raise price to $150 after 10 sales, $200 after 25 — with testimonials
  quoted in the listing.
