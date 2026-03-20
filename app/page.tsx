"use client";
import { useState, useRef, useCallback } from "react";

interface MatDetail { id: string; name: string; merkmal: string; }
interface Detection { gefundene_ids: string[]; konfidenz: string; erklaerung: string; material_details: MatDetail[]; }
interface HauptMat { id: string; kurz: string; preis: number; avv: string; hinweis: string; }
interface ScanResult { detection: Detection; origIds: string[]; finalIds: string[]; hauptMaterial: HauptMat | null; eskGrund: string | null; }

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const STEPS = [
    ["Bild wird analysiert\u2026","KI erkennt Materialien"],
    ["Materialien werden erkannt\u2026","Textur & Farbe analysiert"],
    ["Preisliste wird abgeglichen\u2026","Container Ritz Datenbank"],
    ["Logik-Regeln werden gepr\u00fcft\u2026","Teuerste-Regel anwenden"],
  ];

  const handleFile = useCallback((f: File) => {
    const isImage = f.type.startsWith("image/") || /\.(heic|heif|jpg|jpeg|png|webp|gif|avif|tiff|bmp)$/i.test(f.name);
    if (!isImage) { setError("Bitte nur Bilddateien hochladen (JPG, PNG, HEIC)."); return; }
    setError(null);

    const tryCanvas = (src: string) => {
      const img = new window.Image();
      img.onload = () => {
        try {
          // Resize if too large (max 2000px)
          const MAX = 2000;
          let w = img.width, h = img.height;
          if (w > MAX || h > MAX) {
            if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
            else { w = Math.round(w * MAX / h); h = MAX; }
          }
          const canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas nicht verfügbar");
          ctx.drawImage(img, 0, 0, w, h);
          canvas.toBlob((blob) => {
            if (!blob) { setError("Bild konnte nicht geladen werden. Bitte JPG oder PNG verwenden."); return; }
            const converted = new File([blob], "scan.jpg", { type: "image/jpeg" });
            setImageFile(converted);
            const rd = new FileReader();
            rd.onload = (e) => { setImage(e.target?.result as string); setResult(null); };
            rd.onerror = () => setError("Bild konnte nicht gelesen werden. Bitte anderes Foto versuchen.");
            rd.readAsDataURL(converted);
          }, "image/jpeg", 0.88);
        } catch {
          setError("Bild konnte nicht verarbeitet werden. Bitte JPG oder PNG verwenden.");
        }
      };
      img.onerror = () => setError("Dieses Bildformat wird nicht unterstützt. Bitte JPG oder PNG aufnehmen.");
      img.src = src;
    };

    const rd = new FileReader();
    rd.onload = (e) => { if (e.target?.result) tryCanvas(e.target.result as string); };
    rd.onerror = () => setError("Datei konnte nicht gelesen werden. Bitte anderes Foto versuchen.");
    try { rd.readAsDataURL(f); }
    catch { setError("Datei konnte nicht geöffnet werden. Bitte JPG oder PNG verwenden."); }
  }, []);

  const doScan = async () => {
    if (!image || !imageFile) return;
    setLoading(true); setError(null); setResult(null); setLoadStep(0);
    const iv = setInterval(() => setLoadStep(p => Math.min(p + 1, STEPS.length - 1)), 1800);
    try {
      const res = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: image.split(",")[1], mediaType: imageFile.type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fehler");
      setResult(data as ScanResult);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unbekannter Fehler";
      if (msg.includes("JSON") || msg.includes("valides")) {
        setError("Material nicht erkannt. Bitte neues Foto machen.");
      } else {
        setError(msg);
      }
    } finally { clearInterval(iv); setLoading(false); }
  };

  const doReset = () => {
    setImage(null); setImageFile(null); setResult(null); setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const cc = (c: string) => c === "hoch" ? "#16a34a" : c === "mittel" ? "#d97706" : "#dc2626";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --or: #E8541A; --orl: #FFF0EA; --orm: #FDDDD0; --bg: #F5F3F0; --wh: #fff; --tx: #1A1A1A; --txm: #6B6B6B; --txl: #A0A0A0; }
        body { font-family: 'Inter', system-ui, sans-serif; background: var(--bg); min-height: 100vh; }
        .app { max-width: 420px; margin: 0 auto; display: flex; flex-direction: column; padding-bottom: 40px; }
        .hdr { padding: 28px 24px 14px; text-align: center; }
        .logo { height: 46px; object-fit: contain; }
        .hsub { font-size: 11px; color: var(--txl); letter-spacing: .05em; margin-top: 6px; text-transform: uppercase; }
        .cnt { padding: 0 16px; display: flex; flex-direction: column; gap: 14px; }
        .ucard { background: var(--wh); border-radius: 28px; overflow: hidden; box-shadow: 0 2px 20px rgba(0,0,0,.07); }
        .uinner { padding: 40px 24px 34px; display: flex; flex-direction: column; align-items: center; cursor: pointer; min-height: 240px; justify-content: center; }
        .cbg { width: 96px; height: 96px; border-radius: 50%; background: var(--orm); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; position: relative; }
        .gbtn { position: absolute; bottom: -4px; right: -10px; width: 36px; height: 36px; border-radius: 11px; background: var(--wh); box-shadow: 0 2px 10px rgba(0,0,0,.13); display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; }
        .ut { font-size: 14px; font-weight: 800; color: var(--or); letter-spacing: .14em; text-transform: uppercase; margin-bottom: 5px; }
        .us { font-size: 11px; font-weight: 600; color: var(--txl); letter-spacing: .1em; text-transform: uppercase; }
        .pimg { width: 100%; max-height: 280px; object-fit: cover; display: block; }
        .pbar { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; background: rgba(0,0,0,.04); }
        .plbl { font-size: 12px; font-weight: 500; color: var(--txm); }
        .pchg { font-size: 12px; font-weight: 700; color: var(--or); background: var(--orl); border: 1.5px solid var(--orm); padding: 5px 14px; border-radius: 20px; cursor: pointer; }
        .bmain { width: 100%; padding: 15px; background: linear-gradient(135deg, var(--or), #C7400F); color: #fff; border: none; border-radius: 18px; font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 16px rgba(232,84,26,.32); transition: all .2s; }
        .bmain:disabled { opacity: .32; cursor: not-allowed; box-shadow: none; }
        .bmain:hover:not(:disabled) { transform: translateY(-1px); }
        .bsec { width: 100%; padding: 13px; background: transparent; color: var(--txm); border: 1.5px solid #E0DDD9; border-radius: 18px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; }
        .loader { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 28px 0; }
        .ring { width: 42px; height: 42px; border-radius: 50%; border: 3px solid var(--orm); border-top-color: var(--or); animation: spin .75s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .lm { font-size: 14px; font-weight: 600; color: var(--txm); }
        .ls { font-size: 12px; color: var(--txl); }
        .err { padding: 12px 14px; background: #FEF2F2; border: 1.5px solid #FECACA; border-radius: 12px; font-size: 13px; font-weight: 500; color: #B91C1C; line-height: 1.5; }
        .results { display: flex; flex-direction: column; gap: 12px; }
        .rhero { background: var(--wh); border-radius: 28px; overflow: hidden; box-shadow: 0 2px 20px rgba(0,0,0,.08); }
        .htop { background: linear-gradient(135deg, var(--or), #C7400F); padding: 20px 20px 18px; }
        .hey { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,.65); margin-bottom: 5px; }
        .hn { font-size: 24px; font-weight: 800; color: #fff; line-height: 1.15; }
        .hrid { font-size: 11px; color: rgba(255,255,255,.55); margin-top: 4px; font-weight: 600; }
        .hbody { padding: 18px 20px; }
        .prow { display: flex; align-items: baseline; gap: 5px; margin-bottom: 12px; }
        .pnum { font-size: 40px; font-weight: 800; color: var(--or); letter-spacing: -1px; line-height: 1; }
        .punit { font-size: 15px; font-weight: 700; color: var(--txm); }
        .ptax { font-size: 11px; color: var(--txl); margin-left: 2px; }
        .avvp { display: inline-flex; align-items: center; gap: 6px; background: #F0FDF4; border: 1.5px solid #BBF7D0; border-radius: 9px; padding: 5px 12px; margin-bottom: 10px; }
        .avvl { font-size: 10px; font-weight: 800; color: #2E7D32; letter-spacing: .1em; text-transform: uppercase; }
        .avvc { font-size: 13px; font-weight: 700; color: #2E7D32; font-family: monospace; }
        .hw { background: #FFF7ED; border: 1.5px solid #FED7AA; border-radius: 9px; padding: 8px 12px; font-size: 12px; font-weight: 600; color: #C2410C; }
        .eskc { background: var(--wh); border-left: 4px solid var(--or); border-radius: 18px; padding: 14px 16px; box-shadow: 0 1px 8px rgba(0,0,0,.05); }
        .eskt { font-size: 11px; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; color: var(--or); margin-bottom: 5px; }
        .eskd { font-size: 13px; color: var(--txm); line-height: 1.55; }
        .eskbs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
        .eskb { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; background: var(--orl); color: var(--or); border: 1.5px solid var(--orm); }
        .whyc { background: var(--wh); border-radius: 18px; padding: 16px 18px; box-shadow: 0 1px 8px rgba(0,0,0,.05); }
        .wlbl { font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--txl); margin-bottom: 8px; }
        .wtxt { font-size: 14px; color: var(--txm); line-height: 1.65; }
        .chips { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 12px; }
        .chip { padding: 7px 12px; border-radius: 10px; font-size: 12px; }
        .cn { font-weight: 700; display: block; }
        .cm { font-size: 11px; margin-top: 1px; display: block; opacity: .8; }
        .chd { background: var(--orl); border: 1.5px solid var(--orm); }
        .chd .cn, .chd .cm { color: var(--or); }
        .chs { background: #F5F5F5; border: 1.5px solid #E8E8E8; }
        .chs .cn { color: var(--tx); }
        .chs .cm { color: var(--txl); }
        .confr { display: flex; align-items: center; gap: 6px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #F0EDE9; }
        .confd { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
        .conft { font-size: 12px; font-weight: 500; color: var(--txl); }
        .catsc { background: var(--wh); border-radius: 18px; padding: 16px 18px; box-shadow: 0 1px 8px rgba(0,0,0,.05); }
        .catsl { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
        .catr { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 10px; background: #FAFAF9; border: 1.5px solid #F0EDE9; }
        .catr.dom { background: var(--orl); border-color: var(--orm); }
        .catn { font-size: 13px; font-weight: 700; color: var(--tx); }
        .catr.dom .catn { color: var(--or); }
        .cata { font-size: 10px; font-family: monospace; color: var(--txl); margin-top: 2px; }
        .catr.dom .cata { color: var(--or); opacity: .7; }
        .catp { font-size: 17px; font-weight: 800; color: var(--tx); text-align: right; }
        .catr.dom .catp { color: var(--or); }
        .cattg { font-size: 10px; font-weight: 700; color: #2E7D32; margin-top: 2px; text-align: right; }
        .hint { background: #FEFCE8; border: 1.5px solid #FDE68A; border-radius: 18px; padding: 15px 16px; display: flex; gap: 11px; align-items: flex-start; }
        .hico { width: 32px; height: 32px; border-radius: 50%; background: #FEF08A; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 15px; }
        .htit { font-size: 10px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: #92400E; margin-bottom: 3px; }
        .hbod { font-size: 13px; color: #78350F; line-height: 1.55; }
        .hbod u { text-decoration-color: #D97706; }
      `}</style>
      <div className="app">
        <div className="hdr">
          <img className="logo" src="https://container-ritz.de/wp-content/uploads/2021/05/logo.png" alt="Container Ritz GmbH" />
          <div className="hsub">Sortieranlage · Preisliste ab 01/2024</div>
        </div>
        <div className="cnt">
          <div className="ucard">
            <div className="uinner" style={{ display: image ? "none" : "flex" }} onClick={() => fileInputRef.current?.click()}>
              <div className="cbg">
                <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
                  <path d="M19 10l-3.5 5H7a3 3 0 00-3 3v21a3 3 0 003 3h36a3 3 0 003-3V18a3 3 0 00-3-3H34.5L31 10H19z" stroke="#E8541A" strokeWidth="2.5" strokeLinejoin="round"/>
                  <circle cx="25" cy="27" r="8" stroke="#E8541A" strokeWidth="2.5"/>
                  <circle cx="25" cy="27" r="4" fill="#E8541A" opacity=".3"/>
                </svg>
                <button className="gbtn" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <rect x="2" y="2" width="16" height="16" rx="3" stroke="#E8541A" strokeWidth="1.8"/>
                    <circle cx="7" cy="7.5" r="1.5" fill="#E8541A"/>
                    <path d="M2 13l4.5-4.5 3.5 3.5 2.5-2.5 5 5" stroke="#E8541A" strokeWidth="1.8" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <div className="ut">Foto aufnehmen</div>
              <div className="us">oder hochladen</div>
            </div>
            {image && (
              <div>
                <img src={image} className="pimg" alt="Vorschau" />
                <div className="pbar">
                  <span className="plbl">Foto bereit</span>
                  <button className="pchg" onClick={() => fileInputRef.current?.click()}>Ändern</button>
                </div>
              </div>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }}
            onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />

          {image && !loading && <button className="bmain" onClick={doScan}>Material analysieren</button>}
          {!image && <button className="bmain" onClick={() => fileInputRef.current?.click()}>Foto aufnehmen</button>}
          {(result || error) && !loading && <button className="bsec" onClick={doReset}>↩ Neuer Scan</button>}

          {loading && (
            <div className="loader">
              <div className="ring" />
              <div className="lm">{STEPS[loadStep][0]}</div>
              <div className="ls">{STEPS[loadStep][1]}</div>
            </div>
          )}

          {error && <div className="err">⚠️ {error}</div>}

          {result && !loading && !result.hauptMaterial && (
            <div className="err">Material nicht erkannt. Bitte neues Foto machen.</div>
          )}
          {result && !loading && result.hauptMaterial && (
            <div className="results">
              <div className="rhero">
                <div className="htop">
                  <div className="hey">Erkanntes Material</div>
                  <div className="hn">{result.hauptMaterial?.kurz ?? "Unbekannt"}</div>
                  <div className="hrid">{result.hauptMaterial?.id} · Container Ritz Sortieranlage</div>
                </div>
                <div className="hbody">
                  <div className="prow">
                    <div className="pnum">{result.hauptMaterial?.preis?.toLocaleString("de-DE")} €</div>
                    <div className="punit">/ Tonne</div>
                    <div className="ptax">zzgl. MwSt.</div>
                  </div>
                  {result.hauptMaterial?.avv && (
                    <div className="avvp">
                      <span className="avvl">AVV</span>
                      <span className="avvc">{result.hauptMaterial.avv}</span>
                    </div>
                  )}
                  {result.hauptMaterial?.hinweis && <div className="hw">{result.hauptMaterial.hinweis}</div>}
                </div>
              </div>

              {result.eskGrund && (
                <div className="eskc">
                  <div className="eskt">⬆ Teuerste-Regel angewendet</div>
                  <div className="eskd">{result.eskGrund}</div>
                  <div className="eskbs">
                    {result.origIds.filter(id => id !== result.hauptMaterial?.id).map(id => (
                      <span key={id} className="eskb">+ {id}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="whyc">
                <div className="wlbl">Warum dieses Material?</div>
                <div className="wtxt">{result.detection?.erklaerung}</div>
                {result.detection?.material_details?.length > 0 && (
                  <div className="chips">
                    {result.detection.material_details.map(d => (
                      <div key={d.id} className={`chip ${d.id === result.hauptMaterial?.id ? "chd" : "chs"}`}>
                        <span className="cn">{d.name}</span>
                        {d.merkmal && <span className="cm">{d.merkmal}</span>}
                      </div>
                    ))}
                  </div>
                )}
                <div className="confr">
                  <div className="confd" style={{ background: cc(result.detection?.konfidenz) }} />
                  <span className="conft">Konfidenz: {result.detection?.konfidenz}</span>
                </div>
              </div>

              {result.finalIds?.length > 1 && (
                <div className="catsc">
                  <div className="wlbl">Alle Kategorien im Bild</div>
                  <div className="catsl">
                    {result.finalIds.map(id => {
                      const isDom = id === result.hauptMaterial?.id;
                      return (
                        <div key={id} className={`catr${isDom ? " dom" : ""}`}>
                          <div>
                            <div className="catn">{isDom ? result.hauptMaterial?.kurz : id}</div>
                            <div className="cata">AVV {isDom ? result.hauptMaterial?.avv : "–"}</div>
                          </div>
                          <div>
                            <div className="catp">{isDom ? result.hauptMaterial?.preis?.toLocaleString("de-DE") : "–"} €/t</div>
                            {isDom && <div className="cattg">▲ ABGERECHNET</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="hint">
            <div className="hico">⚠️</div>
            <div>
              <div className="htit">System-Hinweis</div>
              <div className="hbod">KI kann Fehler machen. Bitte Ergebnisse vor Ort <u>stets manuell verifizieren</u>.</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
