'use client';

import Link from 'next/link';

/** Library feature for the interactive magazine; Muktibodh keeps its archive. */
export default function NirvanSutraMagazineFeature({ hi }: { hi: boolean }) {
  return <div className="patrika-feature" aria-labelledby="patrika-feature-title">
    <div className="patrika-feature-copy">
      <p className="patrika-feature-kicker">{hi ? 'सजीव डिजिटल पत्रिका · अंक ०१' : 'Interactive digital magazine · Issue 01'}</p>
      <h2 id="patrika-feature-title">{hi ? <>निर्वाण सूत्र<span>पत्रिका</span></> : <>Nirvan Sutra<span>Patrika</span></>}</h2>
      <p className="patrika-feature-subtitle">{hi ? 'ज्ञान • गीत • हँसी • कथा • मौन' : 'Inquiry · Music · Humour · Stories · Silence'}</p>
      <p className="patrika-feature-intro">{hi
        ? 'पढ़ने और सुनने की एक खुली यात्रा। मानचित्र पर अपना पड़ाव चुनें—विचारों के साथ बदलते दृश्य देखें, किसी लेख में ठहरें या गीतों के साथ आगे बढ़ें।'
        : 'An open journey through reading and listening. Choose a stop on the map, explore illustrations that unfold as you read, or pause with a song.'}</p>
      <div className="patrika-feature-note">
        <p>{hi ? 'इस अंक में' : 'Inside this issue'}</p>
        <h3>{hi ? 'मन, पहचान और साधारण जीवन' : 'Mind, identity and everyday life'}</h3>
        <p className="patrika-feature-detail">{hi
          ? 'चार विशेष लेख, नई संपादकीय रचनाएँ और छोटे अवलोकन अभ्यास। सभी 14 रचनाएँ हिंदी या अंग्रेज़ी में पढ़ें और सुनें; अपनी गति चुनें और पिछली जगह से जारी रखें।'
          : 'Four featured essays, new editorial writing and small observation practices. Read or listen to all 14 works in English or Hindi, choose your pace and pick up where you left off.'}</p>
        <ul aria-label={hi ? 'पत्रिका की विशेषताएँ' : 'Magazine features'}>
          <li>{hi ? '७ पड़ाव' : '7 stops'}</li><li>{hi ? '१४ रचनाएँ' : '14 works'}</li><li>{hi ? '५ गीत' : '5 songs'}</li>
        </ul>
      </div>
      <div className="patrika-feature-actions">
        <Link href="/patrika?view=map" className="patrika-feature-primary">{hi ? 'पत्रिका खोलें' : 'Open the magazine'} <span aria-hidden="true">↗</span></Link>
        <Link href="/patrika?view=map&listen=chapters">{hi ? 'लेख और गीत सुनें' : 'Listen to essays & songs'} <span aria-hidden="true">♫</span></Link>
      </div>
      <p className="patrika-feature-access">{hi ? 'निःशुल्क · बिना लॉगिन पढ़ें और सुनें' : 'Free · Read and listen without signing in'}</p>
    </div>
    <Link href="/patrika?view=map" className="patrika-feature-art" aria-label={hi ? 'निर्वाण सूत्र पत्रिका का यात्रा मानचित्र खोलें' : 'Open the Nirvan Sutra Patrika journey map'}>
      <div className="patrika-feature-book">
        <div className="patrika-feature-book-top"><span>{hi ? 'निर्वाण धाम' : 'NIRVAN DHAM'}</span><span>{hi ? 'अंक ०१' : 'ISSUE 01'}</span></div>
        <p className="patrika-feature-book-name" lang={hi ? 'hi' : 'en'}>{hi ? 'निर्वाण सूत्र' : 'Nirvan Sutra'}<span>{hi ? 'पत्रिका' : 'Patrika'}</span></p>
        <p className="patrika-feature-book-line" lang={hi ? 'hi' : 'en'}>{hi ? 'जहाँ मन ठहरे, वहीं से आरम्भ करें।' : 'Begin wherever your attention rests.'}</p>
        <svg viewBox="0 0 420 330" fill="none" aria-hidden="true">
          <circle cx="328" cy="44" r="22" fill="#e6d7a6"/><circle cx="328" cy="44" r="33" stroke="#e6d7a6" strokeOpacity=".18"/>
          <path d="M0 150Q100 80 205 145T420 120V330H0Z" fill="#132b20"/>
          <path d="M0 234Q120 170 230 224T420 180V330H0Z" fill="#0b1b12"/>
          <ellipse cx="322" cy="212" rx="71" ry="33" fill="#1b3e4c" fillOpacity=".8"/>
          <path className="patrika-feature-trail-glow" d="M22 286C58 292 48 171 100 174S135 291 180 270 175 137 224 140 220 271 270 250 283 151 332 170 342 260 395 286"/>
          <path className="patrika-feature-trail" pathLength="1" d="M22 286C58 292 48 171 100 174S135 291 180 270 175 137 224 140 220 271 270 250 283 151 332 170 342 260 395 286"/>
          {[[46,266],[100,174],[180,270],[224,140],[270,250],[332,170],[378,277]].map(([x,y],i)=><g key={i}>
            <circle cx={x} cy={y} r="17" fill="#15291b" stroke="#b89a50" strokeOpacity=".6"/><circle cx={x} cy={y} r="4" fill="#d9bb72"/>
          </g>)}
          <path d="M316 213q12-4 24 0t24 0M292 227q12-4 24 0t24 0" stroke="#b79d5b" strokeOpacity=".35"/>
        </svg>
        <div className="patrika-feature-book-bottom"><span>{hi ? 'एक मानचित्र · अनेक रास्ते' : 'One map · many paths'}</span><span aria-hidden="true">↗</span></div>
      </div>
      <span className="patrika-feature-art-caption">{hi ? 'दृश्यों के साथ पढ़ें · आवाज़ के साथ सुनें' : 'Read with illustrations · listen in your language'}</span>
    </Link>
    <style jsx>{`
      .patrika-feature{display:grid;grid-template-columns:1.1fr 1fr;gap:clamp(2rem,5vw,5rem);align-items:center}
      .patrika-feature-kicker{font:700 .64rem/1.8 var(--font-inter);letter-spacing:.2em;color:#c7a24e;margin:0 0 1rem}
      .patrika-feature h2{font-family:${hi ? 'var(--font-hind)' : 'var(--font-cormorant)'};font-weight:${hi ? '650' : '500'};font-size:clamp(3rem,5.5vw,5rem);line-height:1.15;color:#dfb952;margin:0 0 .7rem;text-shadow:0 0 70px #d4a84322}
      .patrika-feature h2 span{display:block;color:#f1e5c9;font-size:.62em;margin-top:.25rem}
      .patrika-feature-subtitle{font-family:var(--font-hind);font-size:.85rem;color:#c1b17d;margin:0 0 1.5rem}
      .patrika-feature-intro{font-family:${hi ? 'var(--font-hind)' : 'var(--font-inter)'};font-size:.98rem;line-height:1.95;color:#b9bdaa;margin:0 0 1.7rem;max-width:32rem}
      .patrika-feature-note{padding:1.4rem;border:1px solid #d4a84340;border-radius:14px;background:linear-gradient(135deg,#d4a8430a,#17372155)}
      .patrika-feature-note>p:first-child{font-family:var(--font-hind);font-size:.73rem;color:#d9b65e;margin:0 0 .45rem}
      .patrika-feature-note h3{font-family:${hi ? 'var(--font-hind)' : 'var(--font-cormorant)'};font-size:1.5rem;line-height:1.5;color:#f0e7cf;margin:0 0 .6rem}
      .patrika-feature-detail{font-family:${hi ? 'var(--font-hind)' : 'var(--font-inter)'};font-size:.83rem;line-height:1.9;color:#afb9a5;margin:0}
      .patrika-feature-note ul{display:flex;flex-wrap:wrap;gap:.6rem;list-style:none;margin:1rem 0 0;padding:0}
      .patrika-feature-note li{padding:.25rem .6rem;border:1px solid #d4a84338;border-radius:20px;color:#d7bc77;font-size:.7rem}
      .patrika-feature-actions{display:flex;flex-wrap:wrap;gap:.65rem;margin:1.7rem 0 .7rem}
      .patrika-feature-actions :global(a){display:inline-flex;align-items:center;gap:.8rem;min-height:48px;padding:.8rem 1.1rem;text-decoration:none;border:1px solid #d4a8434d;border-radius:7px;color:#dcca9b;font-family:${hi ? 'var(--font-hind)' : 'var(--font-inter)'};font-size:.84rem;background:#d4a84308;transition:background .2s,border-color .2s}
      .patrika-feature-actions :global(a.patrika-feature-primary){background:#d4a843;color:#112218;font-weight:700;border-color:#d4a843}
      .patrika-feature-actions :global(a:hover){background:#d4a8432b;border-color:#e8c060}
      .patrika-feature-actions :global(a.patrika-feature-primary:hover){background:#e8c060}
      .patrika-feature-access{font:400 .72rem/1.8 var(--font-hind);color:#84967e;margin:0}
      :global(.patrika-feature-art){display:block;text-decoration:none;color:#e9dcb8;perspective:1200px}
      .patrika-feature-book{position:relative;border:1px solid #bca26070;border-radius:4px 15px 15px 4px;padding:1.5rem 1.5rem 1rem;background:linear-gradient(135deg,#182a20,#09160f);box-shadow:-8px 5px 0 #293324,-12px 8px 0 #132116,0 30px 90px #0007;transform:rotate(2deg);transition:transform .5s}
      :global(.patrika-feature-art:hover) .patrika-feature-book{transform:rotate(0) translateY(-5px)}
      .patrika-feature-book::before{content:"";position:absolute;top:0;bottom:0;left:10px;width:1px;background:#d7b35433}
      .patrika-feature-book-top,.patrika-feature-book-bottom{display:flex;align-items:center;justify-content:space-between;gap:1rem;font-size:.64rem;letter-spacing:.1em;color:#bca769}
      .patrika-feature-book-name{font-family:var(--font-hind);font-size:clamp(2.4rem,3.8vw,3.6rem);font-weight:600;line-height:1.3;margin:2rem 0 .7rem;text-align:center;color:#e1c67d}
      .patrika-feature-book-name span{display:block;font-size:.55em;color:#f1e4c6;letter-spacing:.1em}
      .patrika-feature-book-line{font-family:var(--font-hind);font-size:.73rem;text-align:center;color:#a6b49b}
      .patrika-feature-book svg{display:block;width:100%;height:auto;margin:.5rem 0}
      .patrika-feature-book-bottom{padding-top:.8rem;border-top:1px solid #d7b35430;line-height:1.7}
      .patrika-feature-trail-glow{stroke:#c3a758;stroke-opacity:.13;stroke-width:12;stroke-linecap:round}
      .patrika-feature-trail{stroke:#d2b56e;stroke-width:2;stroke-dasharray:1;animation:patrika-path 1.8s ease both}
      .patrika-feature-art-caption{display:block;text-align:center;font:400 .72rem/1.8 var(--font-hind);color:#a5ae94;margin-top:1.5rem}
      :global(.patrika-feature-art:focus-visible),.patrika-feature-actions :global(a:focus-visible){outline:2px solid #eac86f;outline-offset:6px}
      @keyframes patrika-path{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
      @media(max-width:760px){.patrika-feature{grid-template-columns:1fr;gap:2.5rem}.patrika-feature h2{font-size:clamp(2.7rem,10vw,4.5rem)}:global(.patrika-feature-art){width:min(100%,390px);margin:0 auto}.patrika-feature-book{transform:none}.patrika-feature-book-name{font-size:2.8rem}.patrika-feature-intro{font-size:.92rem}}
      @media(prefers-reduced-motion:reduce){.patrika-feature-trail{animation:none}.patrika-feature-book{transform:none;transition:none}:global(.patrika-feature-art:hover) .patrika-feature-book{transform:none}}
    `}</style>
  </div>;
}
