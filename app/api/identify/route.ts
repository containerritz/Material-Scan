import { NextRequest, NextResponse } from "next/server";

const DB = [
  { id:"BS-01", kurz:"Bauschutt 1", preis:45, avv:"17 01 07", hinweis:"Mineralisch, sauber getrennt",
    syn:["beton","betonschutt","gehwegplatten","kies","schotter","pflastersteine","natursteine","randsteine","waschbeton","estrich","betonplatten","fundament","stahlbeton","granit","sandstein","kalkstein","pflaster","bordstein","recyclingbeton"] },
  { id:"BS-02", kurz:"Bauschutt 2", preis:80, avv:"17 01 07", hinweis:"Mineralisch gemischt",
    syn:["fliesen","backsteine","backstein","kalksandstein","keramik","porzellan","mauerwerk","ziegel","ziegelstein","kaminstein","hohlblockstein","poroton","mauersteine","klinker","tonziegel","dachziegel","dachpfanne","verblender","kacheln"] },
  { id:"GIPS-01", kurz:"Gips / Leichtbaustoffe", preis:150, avv:"17 08 02", hinweis:"Inkl. Fliesen mit Gipsanhaftung",
    syn:["gips","gipskarton","rigips","gipsplatten","gipsbausteine","porenbeton","ytong","gasbeton","bims","bimssteine","leichtbaustein","deckenfüllschüttung","fliesen mit gips"] },
  { id:"MISCH-01", kurz:"Mischabfall / Sperrmüll", preis:300, avv:"17 09 04", hinweis:"KEIN Elektro, Farbe, Lacke",
    syn:["mischabfall","sperrmüll","baustellenabfall","gemischter abfall","möbel","plastik","restmüll","folie","teppich","matratze","kunststoff"] },
  { id:"HOLZ-01", kurz:"Holz unbehandelt", preis:175, avv:"17 02 01", hinweis:"Nur Innenbereich",
    syn:["holz unbehandelt","bauholz","abbruchholz","innenholz","parkett","dielen","balken","dachstuhl","rohholz"] },
  { id:"HOLZ-02", kurz:"Holz behandelt (A4)", preis:250, avv:"17 02 04*", hinweis:"Außenbereich, behandelt",
    syn:["holz behandelt","außenholz","imprägniert","lasiert","schalholz","spanplatte","osb","mdf","pressholz","sperrholz"] },
  { id:"HOLZ-03", kurz:"Holz mit Glas", preis:300, avv:"17 09 04", hinweis:"Nur Kleinmengen!",
    syn:["fenster","türen","rahmen mit glas","holz mit glas","glasrahmen","fenstertür","holzfenster"] },
  { id:"GLAS-01", kurz:"Flach- / Isolierglas", preis:119, avv:"17 02 02", hinweis:"Glasbausteine mit Anhaftung",
    syn:["glas","fensterglas","isolierglas","glasbausteine","flachglas","scheibe","glastür","doppelglas"] },
  { id:"ASBE-01", kurz:"Asbestplatten", preis:350, avv:"17 06 05*", hinweis:"⚠ Gefährlicher Abfall – In Big-Bags",
    syn:["asbest","asbestplatte","faserzement alt","wellplatte asbest","eternit alt","asbestzement"] },
  { id:"DÄMM-01", kurz:"Styropor / EPS", preis:310, avv:"17 06 04", hinweis:"Nur Kleinmengen",
    syn:["styropor","eps","styrodur","dämmplatten","polystyrol","schaumstoffplatten"] },
  { id:"DÄMM-02", kurz:"Dämmwolle", preis:1350, avv:"17 06 04 / 17 06 03*", hinweis:"In Big-Bags",
    syn:["glaswolle","steinwolle","mineralwolle","rockwool","dämmwolle","isolierwolle","glasfaserdämmung","klemmfilz"] },
  { id:"ERDE-01", kurz:"Erdmassen", preis:30, avv:"17 05 04", hinweis:"",
    syn:["erde","aushub","lehm","boden","erdaushub","humus","sand","mutterboden"] },
  { id:"GRÜN-01", kurz:"Grasnarbe", preis:45, avv:"20 02 01", hinweis:"",
    syn:["rasen","gras","grasnarbe","rasensoden","rollrasen"] },
  { id:"GRÜN-02", kurz:"Grünschnitt bis 30 cm", preis:100, avv:"20 02 01", hinweis:"Auch Grasnarbe",
    syn:["äste","strauchschnitt","grünschnitt","schnittgut","grünabfall","hecke","gestrüpp"] },
  { id:"GRÜN-03", kurz:"Grünschnitt ab 30 cm", preis:170, avv:"20 02 01", hinweis:"Wurzeln, Baumstämme",
    syn:["wurzeln","baumstämme","stämme","baumwurzeln","baumstamm"] },
  { id:"PAPI-01", kurz:"Akten – Vernichtung", preis:200, avv:"20 01 01", hinweis:"",
    syn:["akten","dokumente","papier vertraulich","vernichtung","aktenordner"] },
  { id:"PAPI-02", kurz:"Mischpapier / Kartonage", preis:100, avv:"20 01 01", hinweis:"",
    syn:["papier","karton","pappe","wellpappe","kartonage","zeitungen","zeitschriften"] },
];

const REGELN = [
  { wenn:["BS-01","BS-02"],    dann:"BS-02",    grund:"Beton + Fliesen/Ziegel erkannt → wird als Bauschutt 2 abgerechnet (80 €/t)." },
  { wenn:["BS-01","GIPS-01"],  dann:"GIPS-01",  grund:"Gipsanteile im Betonschutt → Baustoffe auf Gipsbasis (150 €/t)." },
  { wenn:["BS-02","GIPS-01"],  dann:"GIPS-01",  grund:"Gipsanteile im Mauerwerk → Baustoffe auf Gipsbasis (150 €/t)." },
  { wenn:["HOLZ-01","HOLZ-02"],dann:"HOLZ-02",  grund:"Behandeltes Holz vorhanden → A4-Holz behandelt (250 €/t)." },
  { wenn:["HOLZ-01","GLAS-01"],dann:"HOLZ-03",  grund:"Holz mit Glasanteilen → A4-Holz mit Glas (300 €/t)." },
  { wenn:["HOLZ-02","GLAS-01"],dann:"HOLZ-03",  grund:"Holz mit Glasanteilen → A4-Holz mit Glas (300 €/t)." },
  { wenn:["BS-01","MISCH-01"], dann:"MISCH-01", grund:"Mischabfall erkannt → Mischabfall wird abgerechnet (300 €/t)." },
  { wenn:["BS-02","MISCH-01"], dann:"MISCH-01", grund:"Mischabfall erkannt → Mischabfall wird abgerechnet (300 €/t)." },
];

function eskaliere(ids: string[]): string[] {
  let result = [...ids];
  let changed = true;
  while (changed) {
    changed = false;
    for (const r of REGELN) {
      if (r.wenn.every(id => result.includes(id)) && !result.includes(r.dann)) {
        result = [...new Set([...result.filter(id => !r.wenn.includes(id)), r.dann])];
        changed = true;
      }
    }
  }
  return result;
}

function eskGrund(orig: string[], final: string[]): string | null {
  for (const r of REGELN)
    if (r.wenn.every(id => orig.includes(id)) && final.includes(r.dann)) return r.grund;
  return null;
}

function teuerster(ids: string[]) {
  return ids.map(id => DB.find(d => d.id === id)).filter(Boolean).sort((a: any, b: any) => b.preis - a.preis)[0] || null;
}

export async function POST(req: NextRequest) {
  try {
    const { image, mediaType } = await req.json();
    if (!image) return NextResponse.json({ error: "Kein Bild übermittelt." }, { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "API-Key nicht konfiguriert." }, { status: 500 });

    const dbStr = DB.map(d => `${d.id} "${d.kurz}": ${d.syn.join(", ")}`).join("\n");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 900,
        system: `Du bist Experte für Bauschuttklassifikation bei Container Ritz GmbH.

AUFGABE: Erkenne ALLE sichtbaren Materialien im Bild. Auch Einzelmaterialien (ein Stein, eine Fliese, ein Brett).

DATENBANK:
${dbStr}

REGELN:
- Ytong/Gasbeton/Porenbeton → GIPS-01
- Bims → GIPS-01
- Einzelner Betonstein → BS-01
- Ziegel/Fliesen/Keramik → BS-02
- Bei Gemischen: ALLE IDs angeben
- Erkläre präzise auf Deutsch: Farbe, Textur, Form, typische Merkmale

Antworte NUR mit validem JSON (kein Markdown):
{"gefundene_ids":["BS-01"],"dominantes_material":"Beton","konfidenz":"hoch","erklaerung":"Das Bild zeigt...","material_details":[{"id":"BS-01","name":"Beton","merkmal":"grau, rau, mit Körnung"}]}`,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType || "image/jpeg", data: image } },
            { type: "text", text: "Analysiere alle sichtbaren Baumaterialien in diesem Bild." }
          ]
        }]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as any).error?.message || `Claude API Fehler ${response.status}`);
    }

    const data = await response.json();
    const raw = data.content?.[0]?.text || "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Kein valides JSON von Claude erhalten.");

    const detection = JSON.parse(match[0]);
    const origIds = [...new Set<string>(detection.gefundene_ids || [])];
    const finalIds = eskaliere([...origIds]);
    const hauptMaterial = teuerster(finalIds);
    const grund = eskGrund(origIds, finalIds);

    return NextResponse.json({
      detection,
      origIds,
      finalIds,
      hauptMaterial,
      eskGrund: grund,
    });

  } catch (err: any) {
    console.error("[/api/identify]", err);
    return NextResponse.json({ error: err.message || "Interner Fehler" }, { status: 500 });
  }
}
