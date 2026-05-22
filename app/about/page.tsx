"use client";

import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import TopNav from "@/components/TopNav";

export default function AboutPage() {
  const { isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.current, isAuthenticated ? {} : "skip");

  return (
    <div className="min-h-screen bg-luo-black">
      <TopNav user={user ?? null} />

      {/* HERO */}
      <section className="relative bg-luo-yellow text-black overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1600&q=80&auto=format&fit=crop"
            alt="The Nile river"
            className="w-full h-full object-cover opacity-30 mix-blend-multiply"
          />
        </div>
        <div className="absolute inset-y-0 right-0 w-1/2 bg-luo-black [clip-path:polygon(20%_0,100%_0,100%_100%,0_100%)] hidden md:block" />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-8 items-center">
          <div className="animate-slide-up">
            <span className="label-block">Our Story</span>
            <h1 className="h-display text-5xl md:text-7xl mt-4 mb-6">
              People<br />
              of the<br />
              <span className="bg-black text-luo-yellow px-3 inline-block">
                Nile
              </span>
            </h1>
            <p className="text-black/80 text-lg font-medium max-w-lg">
              The Luo are a Nilotic people whose songs have travelled the river
              for centuries — from the swamps of the Sudd in South Sudan,
              down the Bahr el Ghazal, and out across East Africa.
            </p>
          </div>

          <div className="relative animate-slide-up hidden md:block">
            <div className="absolute -top-4 -left-4 w-full h-full bg-luo-red" />
            <div className="relative aspect-[4/5] overflow-hidden border-4 border-black">
              <img
                src="https://images.unsplash.com/photo-1503551723145-6c040742065b?w=1200&q=80&auto=format&fit=crop"
                alt="River and African landscape"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="h-3 stripe-accent" />
      </section>

      {/* WHO ARE THE LUO */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 grid md:grid-cols-12 gap-8">
        <div className="md:col-span-5">
          <span className="label-green">Who We Are</span>
          <h2 className="h-display text-4xl md:text-5xl mt-3 mb-5">
            A Nilotic<br />
            <span className="text-luo-yellow">Heritage</span>
          </h2>
          <p className="text-white/70 leading-relaxed mb-4">
            The Luo (sometimes spelled <em>Lwoo</em> or <em>Lwo</em>) are a
            cluster of Nilotic peoples numbering more than seven million across
            South Sudan, Sudan, Uganda, Kenya, Tanzania, Ethiopia and the
            Democratic Republic of Congo.
          </p>
          <p className="text-white/70 leading-relaxed">
            Their historical homeland sits in present-day{" "}
            <strong className="text-white">South Sudan</strong>, in the
            wetlands of the <strong className="text-white">Bahr el Ghazal</strong>{" "}
            and along the White Nile — a landscape of river, papyrus and open
            cattle country that still shapes Luo culture today.
          </p>
        </div>

        <div className="md:col-span-7 grid grid-cols-2 gap-3">
          <div className="aspect-square overflow-hidden border-2 border-luo-yellow row-span-2">
            <img
              src="https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=900&q=80&auto=format&fit=crop"
              alt="African elder portrait"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="aspect-square overflow-hidden border-2 border-luo-red">
            <img
              src="https://images.unsplash.com/photo-1521336575822-6da63fb45455?w=900&q=80&auto=format&fit=crop"
              alt="Cattle herders"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="aspect-square overflow-hidden border-2 border-luo-green">
            <img
              src="https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=900&q=80&auto=format&fit=crop"
              alt="African landscape"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="bg-luo-ink border-y-2 border-luo-yellow/30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          <div className="mb-10 text-center">
            <span className="label-block">Migration</span>
            <h2 className="h-display text-4xl md:text-5xl mt-4">
              Down the <span className="text-luo-yellow">River</span>
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto mt-4">
              From an ancestral homeland in South Sudan, the Luo dispersed
              southward over generations, carrying language, song and cattle.
            </p>
          </div>

          <ol className="grid md:grid-cols-4 gap-4 relative">
            {[
              {
                era: "Origins",
                title: "Bahr el Ghazal",
                desc: "The Luo cradle: swamps and savannah of South Sudan, west of the White Nile. The Shilluk, Anuak, Jur Chol, Pari and Acholi are the Luo of the homeland.",
              },
              {
                era: "15th–16th c.",
                title: "Southward",
                desc: "Successive waves of migration push down the Nile basin into northern Uganda and the Great Lakes. The Padhola, Alur and Jopadhola form along the way.",
              },
              {
                era: "17th–18th c.",
                title: "Lake Victoria",
                desc: "The Luo reach the eastern shores of Lake Victoria — modern western Kenya and northern Tanzania — meeting Bantu neighbours and reshaping the region.",
              },
              {
                era: "Today",
                title: "A river of peoples",
                desc: "Some 7+ million Luo speakers, sharing a kindred language family (Western Nilotic) and a thread of music, oral history and ritual.",
              },
            ].map((step, i) => (
              <li key={step.era} className="card p-5 relative">
                <div className="w-10 h-10 bg-luo-yellow text-black font-display flex items-center justify-center mb-3">
                  {i + 1}
                </div>
                <p className="text-luo-yellow text-xs font-bold uppercase tracking-wider">
                  {step.era}
                </p>
                <h3 className="font-display uppercase text-xl mt-1 mb-2">
                  {step.title}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* MUSIC ORIGINS */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 grid md:grid-cols-2 gap-10 items-center">
        <div className="relative">
          <div className="absolute -top-4 -left-4 w-full h-full bg-luo-yellow" />
          <div className="relative aspect-[4/5] overflow-hidden border-4 border-black">
            <img
              src="https://images.unsplash.com/photo-1571974599782-87624638275f?w=1200&q=80&auto=format&fit=crop"
              alt="African drum"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div>
          <span className="label-green">The Sound</span>
          <h2 className="h-display text-4xl md:text-5xl mt-3 mb-5">
            Where the<br />
            <span className="text-luo-yellow">Music Begins</span>
          </h2>
          <p className="text-white/70 leading-relaxed mb-4">
            For the Luo, music was never entertainment alone — it was record,
            ritual and resistance. Songs marked births, funerals, harvests,
            cattle raids and the long nights along the river.
          </p>
          <p className="text-white/70 leading-relaxed mb-4">
            The oldest Luo music is built around{" "}
            <strong className="text-white">call-and-response vocals</strong>{" "}
            riding a foundation of drums. A lead singer (the{" "}
            <em>jathum</em>) opens with a line; a chorus answers; and the
            community moves with it.
          </p>
          <p className="text-white/70 leading-relaxed">
            Today that thread runs through gospel, benga, Afrobeat and the
            new generation of South Sudanese artists rebuilding their sound
            after decades of conflict.
          </p>
        </div>
      </section>

      {/* INSTRUMENTS */}
      <section className="bg-luo-yellow text-black border-y-4 border-black">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          <div className="text-center mb-10">
            <span className="bg-black text-luo-yellow font-display uppercase text-sm px-3 py-1 inline-block">
              Traditional Instruments
            </span>
            <h2 className="h-display text-4xl md:text-5xl mt-4">
              Drums, Strings, and the<br />
              <span className="bg-black text-luo-yellow px-2 inline-block">
                Human Voice
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Bul",
                role: "The Drum",
                desc: "A wooden goblet drum, played with bare hands. The bul keeps time at funerals, weddings and night-long dances. In South Sudan it is the heartbeat of any gathering.",
              },
              {
                name: "Thom",
                role: "Eight-string Lyre",
                desc: "A bowl-bodied lyre tuned to a pentatonic scale. The thom carries the melody under the storyteller's voice — bardic, intimate, and used to preserve genealogy.",
              },
              {
                name: "Bul lakeret",
                role: "Talking Drum",
                desc: "A double-headed pressure drum whose pitch can be bent by squeezing the leather thongs. It mimics speech tones — a way of sending news between cattle camps.",
              },
              {
                name: "Tom / Orutu",
                role: "Single-string Fiddle",
                desc: "A small bowed fiddle. Among the Luo of Kenya and Uganda the orutu became the carrier of working songs, market songs and love ballads.",
              },
              {
                name: "Agwara",
                role: "Trumpets",
                desc: "Long wooden or horn trumpets, often played in ensembles of five or seven. Royal music in the Shilluk kingdom and central to celebration.",
              },
              {
                name: "Voice",
                role: "Lead & Chorus",
                desc: "The lead singer (jathum) tells. The chorus (jokwer) replies. Layered ululation lifts the chorus into something almost ceremonial.",
              },
            ].map((inst) => (
              <div
                key={inst.name}
                className="bg-black text-white border-4 border-black hover:border-luo-red transition-all p-6"
              >
                <p className="text-luo-yellow font-display uppercase text-3xl">
                  {inst.name}
                </p>
                <p className="text-luo-red text-xs uppercase tracking-wider font-bold mb-3">
                  {inst.role}
                </p>
                <p className="text-white/70 text-sm leading-relaxed">
                  {inst.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOUTH SUDAN SECTION */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <span className="label-block">South Sudan</span>
            <h2 className="h-display text-4xl md:text-5xl mt-3 mb-5">
              A Young Country,<br />
              an <span className="text-luo-yellow">Old Song</span>
            </h2>
            <p className="text-white/70 leading-relaxed mb-4">
              South Sudan became the world's youngest country in{" "}
              <strong className="text-white">2011</strong>, but its peoples are
              ancient. The Luo here — Shilluk, Anuak, Jur Chol, Pari and
              Acholi — predate every modern border drawn across the Nile basin.
            </p>
            <p className="text-white/70 leading-relaxed mb-4">
              Decades of war scattered Luo communities across the world, from
              Juba and Wau to Khartoum, Kampala, Nairobi, Melbourne and
              Minneapolis. Music followed them.
            </p>
            <p className="text-white/70 leading-relaxed">
              This site is a small archive of that music: traditional tracks,
              new releases from diaspora artists, and the conversation between
              them.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="aspect-[3/4] overflow-hidden border-2 border-luo-yellow">
              <img
                src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=900&q=80&auto=format&fit=crop"
                alt="The Nile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-[3/4] overflow-hidden border-2 border-luo-red mt-8">
              <img
                src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=900&q=80&auto=format&fit=crop"
                alt="African village"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-[3/4] overflow-hidden border-2 border-luo-green">
              <img
                src="https://images.unsplash.com/photo-1473625247510-8ceb1760943f?w=900&q=80&auto=format&fit=crop"
                alt="Drummer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-[3/4] overflow-hidden border-2 border-white mt-8">
              <img
                src="https://images.unsplash.com/photo-1623938183746-2c8f9b9ad03f?w=900&q=80&auto=format&fit=crop"
                alt="Sunset over the river"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="bg-luo-black border-y-2 border-luo-yellow/30">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-20 text-center relative">
          <div className="text-luo-yellow text-7xl font-display leading-none">
            “
          </div>
          <p className="font-display uppercase text-2xl md:text-3xl leading-tight tracking-mega">
            The river forgets nothing. Neither does the drum.
          </p>
          <p className="mt-4 text-luo-yellow text-xs font-bold uppercase tracking-widest">
            — Luo proverb
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-luo-yellow text-black">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-14 grid md:grid-cols-2 gap-8 items-center">
          <h2 className="h-display text-4xl md:text-5xl">
            Press <span className="bg-black text-luo-yellow px-2 inline-block">play</span>.
            <br />
            Hear the river.
          </h2>
          <div className="flex flex-wrap gap-3 justify-start md:justify-end">
            <Link href="/" className="btn-primary">
              Listen Now
            </Link>
            <Link href="/auth" className="btn-outline !border-black !text-black hover:!bg-black hover:!text-white">
              Create Account
            </Link>
          </div>
        </div>
        <div className="h-3 stripe-accent" />
      </section>

      {/* FOOTER */}
      <footer className="bg-luo-black text-white/50 text-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-luo-yellow flex items-center justify-center rotate-[-6deg]">
              <span className="font-display text-black text-sm">L</span>
            </div>
            <span className="font-display uppercase">
              Luo<span className="text-luo-yellow">Music</span>
            </span>
          </div>
          <p>Feel the beat of the Nile · {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
