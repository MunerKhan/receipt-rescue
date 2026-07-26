"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Purchase = {
  id: string;
  product: string;
  store: string;
  purchaseDate: string;
  price: number;
  returnDays: number;
  warrantyMonths: number;
  orderNumber: string;
  notes: string;
};

const STORAGE_KEY = "receipt-rescue-purchases-v1";

function addDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() + days);
  return value;
}

function addMonths(date: string, months: number) {
  const value = new Date(`${date}T12:00:00`);
  value.setMonth(value.getMonth() + months);
  return value;
}

function daysUntil(date: Date) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / 86_400_000);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function Home() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setPurchases(JSON.parse(saved));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(purchases));
  }, [purchases, loaded]);

  const filteredPurchases = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return purchases;
    return purchases.filter((purchase) =>
      [purchase.product, purchase.store, purchase.orderNumber]
        .join(" ")
        .toLowerCase()
        .includes(value),
    );
  }, [purchases, search]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const purchase: Purchase = {
      id: crypto.randomUUID(),
      product: String(form.get("product") || "").trim(),
      store: String(form.get("store") || "").trim(),
      purchaseDate: String(form.get("purchaseDate") || ""),
      price: Number(form.get("price") || 0),
      returnDays: Number(form.get("returnDays") || 30),
      warrantyMonths: Number(form.get("warrantyMonths") || 12),
      orderNumber: String(form.get("orderNumber") || "").trim(),
      notes: String(form.get("notes") || "").trim(),
    };

    if (!purchase.product || !purchase.store || !purchase.purchaseDate) return;
    setPurchases((current) => [purchase, ...current]);
    event.currentTarget.reset();
    setShowForm(false);
  }

  function removePurchase(id: string) {
    setPurchases((current) => current.filter((purchase) => purchase.id !== id));
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Receipt Rescue home">
          <span className="brand-mark">R</span>
          <span>Receipt Rescue</span>
        </a>
        <nav>
          <a href="#how-it-works">How it works</a>
          <a href="#dashboard">My purchases</a>
          <button className="small-button" onClick={() => setShowForm(true)}>
            Add purchase
          </button>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <span className="eyebrow">Your purchase safety net</span>
          <h1>Never lose money to a missed return or warranty deadline.</h1>
          <p>
            Keep return dates, warranty expirations, order numbers, and purchase
            notes together in one private dashboard.
          </p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => setShowForm(true)}>
              Track a purchase — free
            </button>
            <a className="text-link" href="#how-it-works">
              See how it works →
            </a>
          </div>
          <p className="privacy-note">
            No account required. Your trial data stays in this browser.
          </p>
        </div>
        <div className="hero-card" aria-label="Example deadline card">
          <div className="card-topline">
            <span>MacBook Air</span>
            <span className="status urgent">9 days left</span>
          </div>
          <p className="muted">Purchased at Best Buy</p>
          <div className="deadline-grid">
            <div>
              <span>Return by</span>
              <strong>Aug 3, 2026</strong>
            </div>
            <div>
              <span>Warranty until</span>
              <strong>Jul 4, 2027</strong>
            </div>
          </div>
          <div className="progress-track"><span /></div>
          <p className="tip">Receipt saved. Order number ready when you need it.</p>
        </div>
      </section>

      <section className="steps-section" id="how-it-works">
        <div className="section-heading">
          <span className="eyebrow">Simple by design</span>
          <h2>Protect a purchase in under a minute.</h2>
        </div>
        <div className="steps-grid">
          <article><span>01</span><h3>Add the purchase</h3><p>Enter the store, purchase date, return window, and warranty length.</p></article>
          <article><span>02</span><h3>See every deadline</h3><p>Receipt Rescue calculates your return and warranty dates automatically.</p></article>
          <article><span>03</span><h3>Act before it expires</h3><p>Open the dashboard whenever you need the order number or deadline.</p></article>
        </div>
      </section>

      <section className="dashboard-section" id="dashboard">
        <div className="dashboard-heading">
          <div>
            <span className="eyebrow">Your dashboard</span>
            <h2>Tracked purchases</h2>
          </div>
          <button className="primary-button" onClick={() => setShowForm(true)}>+ Add purchase</button>
        </div>

        {purchases.length > 0 && (
          <input
            className="search-input"
            placeholder="Search by product, store, or order number"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        )}

        {!loaded ? (
          <div className="empty-state"><p>Loading your purchases…</p></div>
        ) : filteredPurchases.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⌁</div>
            <h3>{purchases.length ? "No matching purchases" : "Nothing tracked yet"}</h3>
            <p>{purchases.length ? "Try another search." : "Add your first purchase to see its return and warranty deadlines."}</p>
            {!purchases.length && <button className="primary-button" onClick={() => setShowForm(true)}>Add your first purchase</button>}
          </div>
        ) : (
          <div className="purchase-grid">
            {filteredPurchases.map((purchase) => {
              const returnDate = addDays(purchase.purchaseDate, purchase.returnDays);
              const warrantyDate = addMonths(purchase.purchaseDate, purchase.warrantyMonths);
              const returnDaysLeft = daysUntil(returnDate);
              const returnLabel = returnDaysLeft < 0 ? "Return closed" : returnDaysLeft === 0 ? "Ends today" : `${returnDaysLeft} days left`;
              const statusClass = returnDaysLeft < 0 ? "closed" : returnDaysLeft <= 10 ? "urgent" : "safe";

              return (
                <article className="purchase-card" key={purchase.id}>
                  <div className="card-topline">
                    <div><h3>{purchase.product}</h3><p className="muted">{purchase.store}</p></div>
                    <span className={`status ${statusClass}`}>{returnLabel}</span>
                  </div>
                  <dl>
                    <div><dt>Price</dt><dd>{purchase.price ? `$${purchase.price.toFixed(2)}` : "—"}</dd></div>
                    <div><dt>Return deadline</dt><dd>{formatDate(returnDate)}</dd></div>
                    <div><dt>Warranty ends</dt><dd>{formatDate(warrantyDate)}</dd></div>
                    <div><dt>Order number</dt><dd>{purchase.orderNumber || "—"}</dd></div>
                  </dl>
                  {purchase.notes && <p className="notes">{purchase.notes}</p>}
                  <button className="delete-button" onClick={() => removePurchase(purchase.id)}>Remove</button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="trial-section">
        <span className="eyebrow">30-day public trial</span>
        <h2>Help shape Receipt Rescue.</h2>
        <p>This early version is free. Use it with real purchases and share what would make it worth paying for.</p>
        <a className="primary-button link-button" href="mailto:Munairkhan99@gmail.com?subject=Receipt%20Rescue%20feedback">Send feedback</a>
      </section>

      <footer><span>Receipt Rescue</span><span>Early-access prototype · Data stored locally</span></footer>

      {showForm && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowForm(false)}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="add-purchase-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div><span className="eyebrow">New purchase</span><h2 id="add-purchase-title">Track your deadline</h2></div>
              <button className="close-button" aria-label="Close form" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>Product name<input name="product" required placeholder="MacBook Air" /></label>
                <label>Store<input name="store" required placeholder="Best Buy" /></label>
                <label>Purchase date<input name="purchaseDate" required type="date" /></label>
                <label>Price<input name="price" min="0" step="0.01" type="number" placeholder="899.00" /></label>
                <label>Return window (days)<input name="returnDays" min="0" type="number" defaultValue="30" /></label>
                <label>Warranty length (months)<input name="warrantyMonths" min="0" type="number" defaultValue="12" /></label>
                <label className="full-width">Order number<input name="orderNumber" placeholder="Optional" /></label>
                <label className="full-width">Notes<textarea name="notes" rows={3} placeholder="Color, model, return conditions, or anything else" /></label>
              </div>
              <p className="form-note">For this trial, purchase information is saved only in this browser.</p>
              <div className="form-actions">
                <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="primary-button">Save purchase</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
