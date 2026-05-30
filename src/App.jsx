



import { useState, useEffect } from "react";

const LOWES_COLOR = "#004990";
const HD_COLOR = "#F96302";

async function callClaude(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }]
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "API error");
  const block = data.content?.find(b => b.type === "text");
  if (!block) throw new Error("No text in response");
  let text = block.text;
  // Extract JSON object
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in response");
  let jsonStr = match[0];
  // Fix common JSON issues
  jsonStr = jsonStr
    .replace(/,\s*}/g, "}")      // trailing commas in objects
    .replace(/,\s*]/g, "]")      // trailing commas in arrays
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, " "); // control characters
  try { try { try { return JSON.parse(jsonStr); } catch { jsonStr = jsonStr.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]").replace(/\n/g, " "); return JSON.parse(jsonStr); } } catch { jsonStr = jsonStr.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]").replace(/\n/g, " "); try { return JSON.parse(jsonStr); } catch { jsonStr = jsonStr.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]").replace(/\n/g, " "); return JSON.parse(jsonStr); } } } catch { jsonStr = jsonStr.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]").replace(/\n/g, " "); try { return JSON.parse(jsonStr); } catch { jsonStr = jsonStr.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]").replace(/\n/g, " "); return JSON.parse(jsonStr); } }
}a

function StarRating({ rating }) {
  const r = Math.min(5, Math.max(0, parseFloat(rating) || 0));
  return (
    <span style={{ fontSize: 13, color: "#f5a623" }}>
      {"★".repeat(Math.round(r))}{"☆".repeat(5 - Math.round(r))}
      <span style={{ color: "#888", marginLeft: 4 }}>{r.toFixed(1)}</span>
    </span>
  );
}

function StockBadge({ count, availability }) {
  const n = parseInt(count);
  const oos = availability === "Out of Stock" || n === 0;
  const low = !oos && (n <= 3 || availability === "Limited Stock");
  if (oos) return <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#fdecea", color: "#c0392b" }}>Out of stock</span>;
  if (low) return <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#fff8e1", color: "#b7800a" }}>Only {n} left</span>;
  return <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#e8f5e9", color: "#2e7d32" }}>{n} in stock</span>;
}

function StoreBlock({ store, isAlternate }) {
  if (!store) return null;
  return (
    <div style={{ borderTop: "1px solid #eee", paddingTop: 8, marginTop: 8 }}>
      {isAlternate && <span style={{ display: "inline-block", fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#e3f2fd", color: "#1565c0", marginBottom: 6 }}>Nearest store with stock</span>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 600, color: "#222" }}>{store.name}</p>
        {store.distance && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#f5f5f5", color: "#555", border: "1px solid #ddd", whiteSpace: "nowrap", marginLeft: 6 }}>{store.distance}</span>}
      </div>
      {store.address && <p style={{ margin: "0 0 2px", fontSize: 11, color: "#555" }}>{store.address}</p>}
      {store.hours && <p style={{ margin: "0 0 2px", fontSize: 11, color: "#888" }}>Today: {store.hours}</p>}
      {store.stock_count !== undefined && <p style={{ margin: "4px 0 0", fontSize: 11, fontWeight: 600, color: parseInt(store.stock_count) > 3 ? "#2e7d32" : "#b7800a" }}>{store.stock_count} in stock at this location</p>}
    </div>
  );
}

function ProductCard({ product, accent, hasZip, onBookmark, onAddToCart, isBookmarked }) {
  const isOOS = product.availability === "Out of Stock" || parseInt(product.stock_count) === 0;
  return (
    <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "12px 14px", marginBottom: 10, borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: "#222", lineHeight: 1.4, flex: 1 }}>{product.name}</p>
        <button onClick={() => onBookmark(product)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: "0 2px", color: isBookmarked ? "#f5a623" : "#bbb" }}>{isBookmarked ? "★" : "☆"}</button>
      </div>
      <p style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: accent }}>{product.price}</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <StarRating rating={product.rating} />
        {hasZip && product.stock_count !== undefined
          ? <StockBadge count={product.stock_count} availability={product.availability} />
          : <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: isOOS ? "#fdecea" : product.availability === "Limited Stock" ? "#fff8e1" : "#e8f5e9", color: isOOS ? "#c0392b" : product.availability === "Limited Stock" ? "#b7800a" : "#2e7d32" }}>{product.availability}</span>
        }
      </div>
      {product.sku && <p style={{ margin: "6px 0 0", fontSize: 11, color: "#aaa" }}>SKU: {product.sku}</p>}
      {hasZip && !isOOS && product.store && <StoreBlock store={{ ...product.store, stock_count: product.stock_count }} />}
      {hasZip && isOOS && (
        <>
          {product.store && <div style={{ borderTop: "1px solid #eee", paddingTop: 8, marginTop: 8 }}><p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 600, color: "#c0392b" }}>✕ Out of stock at nearest store</p><p style={{ margin: 0, fontSize: 11, color: "#555" }}>{product.store.name} — {product.store.distance}</p></div>}
          {product.alternate_store && <StoreBlock store={product.alternate_store} isAlternate={true} />}
        </>
      )}
      <button onClick={() => onAddToCart(product)} style={{ marginTop: 10, width: "100%", padding: "7px 0", fontSize: 13, background: accent, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>+ Add to cart</button>
    </div>
  );
}

function StoreHeader({ color, label, name }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      <div style={{ width: 32, height: 32, borderRadius: 6, background: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{label}</span>
      </div>
      <span style={{ fontWeight: 700, fontSize: 16, color }}>{name}</span>
    </div>
  );
}

function StoreLocationCard({ loc, accent }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "14px 16px", marginBottom: 12, borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 600, color: "#222" }}>{loc.name}</p>
          <p style={{ margin: "0 0 6px", fontSize: 13, color: "#555" }}>{loc.address}</p>
        </div>
        <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, background: "#e3f2fd", color: "#1565c0", whiteSpace: "nowrap", marginLeft: 8 }}>{loc.distance}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4 }}>
        <div style={{ fontSize: 12 }}><span style={{ display: "block", color: "#aaa", fontSize: 11, marginBottom: 2 }}>Hours today</span><span style={{ color: "#444" }}>{loc.hours}</span></div>
        <div style={{ fontSize: 12 }}><span style={{ display: "block", color: "#aaa", fontSize: 11, marginBottom: 2 }}>Phone</span><span style={{ color: "#444" }}>{loc.phone}</span></div>
      </div>
      {loc.services && <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>{loc.services.map((s, i) => <span key={i} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#f5f5f5", color: "#555", border: "1px solid #ddd" }}>{s}</span>)}</div>}
    </div>
  );
}

function CartTab({ cart, setCart }) {
  const updateQty = (id, delta) => setCart(c => c.map(i => i._id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  const remove = (id) => setCart(c => c.filter(i => i._id !== id));
  const total = cart.reduce((sum, i) => sum + (parseFloat(i.price?.replace(/[^0-9.]/g, "") || 0) * i.qty), 0);
  const lowesItems = cart.filter(i => i._store === "lowes");
  const hdItems = cart.filter(i => i._store === "homedepot");
  if (cart.length === 0) return <div style={{ textAlign: "center", padding: "3rem 0", color: "#aaa" }}>Your cart is empty. Add products from the search tab.</div>;
  const renderGroup = (items, color, label) => items.length === 0 ? null : (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: color, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{label === "Lowe's" ? "L" : "HD"}</span></div>
        <span style={{ fontWeight: 700, color, fontSize: 15 }}>{label}</span>
      </div>
      {items.map(item => (
        <div key={item._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#fff", border: "1px solid #e0e0e0", borderRadius: 10, marginBottom: 8, borderLeft: `3px solid ${color}` }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: "#222" }}>{item.name}</p>
            <p style={{ margin: 0, fontSize: 13, color, fontWeight: 600 }}>{item.price}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button onClick={() => updateQty(item._id, -1)} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #ddd", background: "#f5f5f5", cursor: "pointer", fontSize: 16 }}>−</button>
            <span style={{ fontSize: 14, fontWeight: 600, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
            <button onClick={() => updateQty(item._id, 1)} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #ddd", background: "#f5f5f5", cursor: "pointer", fontSize: 16 }}>+</button>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, minWidth: 56, textAlign: "right" }}>${(parseFloat(item.price?.replace(/[^0-9.]/g, "") || 0) * item.qty).toFixed(2)}</span>
          <button onClick={() => remove(item._id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#bbb", fontSize: 16 }}>✕</button>
        </div>
      ))}
    </div>
  );
  return (
    <>
      {renderGroup(lowesItems, LOWES_COLOR, "Lowe's")}
      {renderGroup(hdItems, HD_COLOR, "Home Depot")}
      <div style={{ borderTop: "1px solid #eee", paddingTop: 14, marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 15, fontWeight: 600 }}>Estimated total</span>
        <span style={{ fontSize: 20, fontWeight: 700 }}>${total.toFixed(2)}</span>
      </div>
      <button onClick={() => setCart([])} style={{ marginTop: 14, width: "100%", padding: "8px 0", fontSize: 13, background: "#f5f5f5", color: "#555", border: "1px solid #ddd", borderRadius: 8, cursor: "pointer" }}>Clear cart</button>
    </>
  );
}

function BookmarksTab({ bookmarks, setBookmarks, onAddToCart, cart }) {
  if (bookmarks.length === 0) return <div style={{ textAlign: "center", padding: "3rem 0", color: "#aaa" }}>No saved items yet. Star a product in search to bookmark it.</div>;
  return (
    <>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>{bookmarks.length} saved item{bookmarks.length !== 1 ? "s" : ""}</p>
      {bookmarks.map((p) => {
        const isLowes = p._store === "lowes";
        const accent = isLowes ? LOWES_COLOR : HD_COLOR;
        const inCart = cart.some(c => c._id === p._id);
        return (
          <div key={p._id} style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "12px 14px", marginBottom: 10, borderLeft: `3px solid ${accent}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 11, color: accent, fontWeight: 600 }}>{isLowes ? "Lowe's" : "Home Depot"}</span>
                <p style={{ margin: "2px 0 4px", fontSize: 14, fontWeight: 600, color: "#222" }}>{p.name}</p>
                <p style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: accent }}>{p.price}</p>
                <StarRating rating={p.rating} />
              </div>
              <button onClick={() => setBookmarks(b => b.filter(x => x._id !== p._id))} style={{ background: "none", border: "none", cursor: "pointer", color: "#f5a623", fontSize: 20 }}>★</button>
            </div>
            <button onClick={() => onAddToCart(p)} style={{ marginTop: 10, width: "100%", padding: "7px 0", fontSize: 13, background: inCart ? "#f5f5f5" : accent, color: inCart ? "#555" : "#fff", border: inCart ? "1px solid #ddd" : "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
              {inCart ? "✓ In cart" : "+ Add to cart"}
            </button>
          </div>
        );
      })}
    </>
  );
}

export default function App() {
  const [tab, setTab] = useState("search");
  const [cart, setCart] = useState(() => { try { return JSON.parse(localStorage.getItem("cart") || "[]"); } catch { return []; } });
  const [bookmarks, setBookmarks] = useState(() => { try { return JSON.parse(localStorage.getItem("bookmarks") || "[]"); } catch { return []; } });
  const [query, setQuery] = useState("");
  const [searchZip, setSearchZip] = useState("");
  const [results, setResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searched, setSearched] = useState({ query: "", zip: "" });
  const [zip, setZip] = useState("");
  const [locations, setLocations] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState(null);
  const [locLabel, setLocLabel] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => { localStorage.setItem("cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem("bookmarks", JSON.stringify(bookmarks)); }, [bookmarks]);

  const addToCart = (product) => {
    const id = product._id || (product.name + product.price + product._store);
    setCart(c => { const exists = c.find(i => i._id === id); if (exists) return c.map(i => i._id === id ? { ...i, qty: i.qty + 1 } : i); return [...c, { ...product, _id: id, qty: 1 }]; });
  };
  const toggleBookmark = (product) => {
    const id = product._id || (product.name + product.price + product._store);
    setBookmarks(b => b.find(x => x._id === id) ? b.filter(x => x._id !== id) : [...b, { ...product, _id: id }]);
  };
  const isBookmarked = (product) => { const id = product._id || (product.name + product.price + product._store); return bookmarks.some(b => b._id === id); };

  const searchProducts = async () => {
    if (!query.trim()) return;
    setSearchLoading(true); setSearchError(null); setResults(null);
    const hz = searchZip.trim();
    const prompt = hz
      ? `Return a JSON object for a product search for "${query}" near zip code ${hz}. Include 3 products per store. Each product must have: name, price (like "$49.97"), sku (7 digits), rating (like "4.3"), availability ("In Stock", "Limited Stock", or "Out of Stock"), stock_count (integer), store object (name, address, distance, hours). If stock_count is 0, include alternate_store (name, address, distance, hours, stock_count). Use real brands like DeWalt, Milwaukee, Ryobi, Behr. JSON keys: lowes (array), homedepot (array). Return ONLY the JSON object.`
      : `Return a JSON object for a product search for "${query}". Include 3 products per store. Each product must have: name, price (like "$49.97"), sku (7 digits), rating (like "4.3"), availability ("In Stock", "Limited Stock", or "Out of Stock"). Use real brands. JSON keys: lowes (array), homedepot (array). Return ONLY the JSON object.`;
    try {
      const data = await callClaude(prompt);
      if (data.lowes) data.lowes = data.lowes.map(p => ({ ...p, _store: "lowes" }));
      if (data.homedepot) data.homedepot = data.homedepot.map(p => ({ ...p, _store: "homedepot" }));
      setResults(data);
      setSearched({ query: query.trim(), zip: hz });
    } catch (e) { setSearchError("Search failed: " + e.message); }
    finally { setSearchLoading(false); }
  };

  const findStores = async (zipCode, label) => {
    setLocLoading(true); setLocError(null); setLocations(null); setLocLabel(label);
    try {
      const data = await callClaude(`Return a JSON object with nearby Lowe's and Home Depot stores ${zipCode ? "near zip code " + zipCode : "near coordinates " + label}. Include 2 stores per chain. Each store must have: name, address, distance, hours, phone, services (array). JSON keys: lowes (array), homedepot (array). Return ONLY the JSON object.`);
      setLocations(data);
    } catch (e) { setLocError("Could not find stores: " + e.message); }
    finally { setLocLoading(false); }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) { setLocError("Geolocation not supported."); return; }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => { setGeoLoading(false); await findStores(null, `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`); setLocLabel("your location"); },
      () => { setGeoLoading(false); setLocError("Could not get your location. Try a zip code instead."); }
    );
  };

  const tabBtn = (t, label, badge) => (
    <button onClick={() => setTab(t)} style={{ padding: "8px 16px", fontSize: 14, fontWeight: 600, border: "1px solid #ddd", borderRadius: 8, cursor: "pointer", background: tab === t ? "#f0f0f0" : "#fff", color: tab === t ? "#111" : "#555", display: "flex", alignItems: "center", gap: 6 }}>
      {label}{badge > 0 && <span style={{ fontSize: 11, background: "#333", color: "#fff", borderRadius: 20, padding: "1px 6px" }}>{badge}</span>}
    </button>
  );

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px", fontFamily: "system-ui, sans-serif" }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px", color: "#111" }}>Store comparison</h2>
      <p style={{ fontSize: 14, color: "#666", margin: "0 0 24px" }}>Compare products and find stores at Lowe's and Home Depot</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {tabBtn("search", "Search")}
        {tabBtn("locations", "Stores")}
        {tabBtn("cart", "Cart", cart.reduce((s, i) => s + i.qty, 0))}
        {tabBtn("bookmarks", "Saved", bookmarks.length)}
      </div>

      {tab === "search" && (
        <>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <input type="text" placeholder='e.g. "cordless drill", "paint", "faucet"' value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && searchProducts()} style={{ flex: 1, fontSize: 15, padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8 }} />
            <button onClick={searchProducts} disabled={searchLoading || !query.trim()} style={{ padding: "0 20px", fontSize: 15, background: "#111", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", opacity: searchLoading || !query.trim() ? 0.5 : 1 }}>{searchLoading ? "Searching…" : "Search"}</button>
          </div>
          <div style={{ marginBottom: 24 }}>
            <input type="text" placeholder="Zip code for stock + store info (optional)" value={searchZip} onChange={e => setSearchZip(e.target.value)} onKeyDown={e => e.key === "Enter" && searchProducts()} style={{ width: 300, fontSize: 14, padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8 }} maxLength={10} />
          </div>
          {searchLoading && <div style={{ textAlign: "center", padding: "3rem 0", color: "#888" }}>Checking both stores…</div>}
          {searchError && <div style={{ padding: 14, background: "#fdecea", color: "#c0392b", borderRadius: 8, fontSize: 13 }}>{searchError}</div>}
          {results && !searchLoading && (
            <>
              <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>Results for "<strong>{searched.query}</strong>"{searched.zip ? ` near ${searched.zip}` : ""}</p>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 20 }}>
                <div><StoreHeader color={LOWES_COLOR} label="L" name="Lowe's" />{(results.lowes || []).map((p, i) => <ProductCard key={i} product={p} accent={LOWES_COLOR} hasZip={!!searched.zip} onBookmark={toggleBookmark} onAddToCart={addToCart} isBookmarked={isBookmarked(p)} />)}</div>
                <div><StoreHeader color={HD_COLOR} label="HD" name="Home Depot" />{(results.homedepot || []).map((p, i) => <ProductCard key={i} product={p} accent={HD_COLOR} hasZip={!!searched.zip} onBookmark={toggleBookmark} onAddToCart={addToCart} isBookmarked={isBookmarked(p)} />)}</div>
              </div>
              <div style={{ marginTop: 16, padding: "10px 14px", background: "#f9f9f9", borderRadius: 8, fontSize: 12, color: "#aaa" }}>Prices, stock counts, and store locations are AI-generated examples. Always verify on the store's website before purchasing.</div>
            </>
          )}
          {!results && !searchLoading && !searchError && <div style={{ textAlign: "center", padding: "3rem 0", color: "#aaa" }}>Enter a product above to compare prices</div>}
        </>
      )}

      {tab === "locations" && (
        <>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <input type="text" placeholder="Enter zip code…" value={zip} onChange={e => setZip(e.target.value)} onKeyDown={e => e.key === "Enter" && zip.trim() && findStores(zip.trim(), zip.trim())} style={{ flex: 1, fontSize: 15, padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8 }} maxLength={10} />
            <button onClick={() => zip.trim() && findStores(zip.trim(), zip.trim())} disabled={locLoading || geoLoading || !zip.trim()} style={{ padding: "0 20px", fontSize: 15, background: "#111", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", opacity: locLoading || geoLoading || !zip.trim() ? 0.5 : 1 }}>{locLoading && locLabel !== "your location" ? "Finding…" : "Find stores"}</button>
          </div>
          <div style={{ marginBottom: 24 }}>
            <button onClick={useMyLocation} disabled={locLoading || geoLoading} style={{ fontSize: 14, padding: "8px 16px", border: "1px solid #ddd", borderRadius: 8, background: "#fff", cursor: "pointer", opacity: locLoading || geoLoading ? 0.5 : 1 }}>{geoLoading ? "Getting location…" : locLoading && locLabel === "your location" ? "Finding stores…" : "📍 Use my location"}</button>
          </div>
          {locError && <div style={{ padding: 14, background: "#fdecea", color: "#c0392b", borderRadius: 8, fontSize: 13 }}>{locError}</div>}
          {locations && !locLoading && (
            <>
              <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>Stores near <strong>{locLabel}</strong></p>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 20 }}>
                <div><StoreHeader color={LOWES_COLOR} label="L" name="Lowe's" />{(locations.lowes || []).map((l, i) => <StoreLocationCard key={i} loc={l} accent={LOWES_COLOR} />)}</div>
                <div><StoreHeader color={HD_COLOR} label="HD" name="Home Depot" />{(locations.homedepot || []).map((l, i) => <StoreLocationCard key={i} loc={l} accent={HD_COLOR} />)}</div>
              </div>
            </>
          )}
          {!locations && !locLoading && !locError && <div style={{ textAlign: "center", padding: "3rem 0", color: "#aaa" }}>Enter a zip code or use your location to find nearby stores</div>}
        </>
      )}

      {tab === "cart" && <CartTab cart={cart} setCart={setCart} />}
      {tab === "bookmarks" && <BookmarksTab bookmarks={bookmarks} setBookmarks={setBookmarks} onAddToCart={addToCart} cart={cart} />}
    </div>
  );
}