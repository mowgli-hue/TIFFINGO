'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, ArrowRight, Check, Plus, X, Sparkles, RefreshCw, Link2, ClipboardPaste, Upload, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/store/cart';

const D = '#1A3A2A', A = '#F0B429', B = '#2D6A4A', LT = '#FFFBEB', BR = '#D8DDD0';
const STEPS = ['Your kitchen', 'Your menu', 'AI meals', 'Go live'];
const CUISINES = ['Indian', 'Punjabi', 'Pakistani', 'South Indian', 'Chinese', 'Healthy', 'Fusion', 'Cafe', 'Other'];

type MenuItem = { name: string; price: string };
type Meal = { day: string; emoji: string; name: string; description: string; protein: string; calories: number; tags: string[] };

export default function JoinPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [meals, setMeals] = useState<Meal[]>([]);

  const [form, setForm] = useState({
    name: '', tagline: '', cuisine: '', type: 'restaurant',
    address: '', city: 'Surrey', phone: '', email: '',
    isHalal: false, isVeg: false,
    pricePerMeal: '12', weeklyPrice: '50',
    cutoffTime: '8:00pm', deliverySlots: ['12:00pm – 1:00pm'],
    agree: false,
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { name: '', price: '' },
    { name: '', price: '' },
    { name: '', price: '' },
  ]);

  // Menu import — most restaurants already have their menu somewhere.
  const [importMode, setImportMode] = useState<'link' | 'paste' | 'file'>('link');
  const [importUrl, setImportUrl] = useState('');
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);
  const [importNote, setImportNote] = useState('');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));

  const setMenu = (i: number, k: 'name' | 'price') => (e: React.ChangeEvent<HTMLInputElement>) =>
    setMenuItems(items => items.map((item, idx) => idx === i ? { ...item, [k]: e.target.value } : item));

  const validMenu = menuItems.filter(m => m.name.trim() && m.price.trim());

  async function runImport(payload: Record<string, unknown>) {
    setImporting(true);
    setImportNote('');
    try {
      const res = await fetch('/api/import-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) { toast.error('Sign in to continue'); router.push('/auth/login?next=/join'); return; }
      const data = await res.json();
      if (data.error && !data.items?.length) { toast.error(data.error); return; }

      const found: MenuItem[] = (data.items || []).map((i: { name: string; price: string }) => ({
        name: i.name, price: i.price || '',
      }));
      if (!found.length) { toast.error('No menu items found there'); return; }

      // Keep anything they already typed, drop the empty placeholder rows.
      const typed = menuItems.filter(m => m.name.trim());
      const merged = [...typed, ...found].slice(0, 40);
      while (merged.length < 3) merged.push({ name: '', price: '' });
      setMenuItems(merged);

      const missing = found.filter(i => !i.price).length;
      setImportNote(
        `Read ${found.length} item${found.length === 1 ? '' : 's'}${data.source ? ` from ${data.source}` : ''}.` +
        (missing ? ` ${missing} had no price on the menu — add those below.` : ' Check the prices are right.')
      );
      toast.success(`Imported ${found.length} items`);
    } catch {
      toast.error('Import failed — try pasting your menu text');
    } finally {
      setImporting(false);
    }
  }

  async function importFromFile(file: File) {
    if (file.size > 5 * 1024 * 1024) { toast.error('That file is over 5MB'); return; }
    const data: string = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(',')[1] || '');
      r.onerror = reject;
      r.readAsDataURL(file);
    });
    await runImport({ file: { data, mediaType: file.type } });
  }

  async function generateMeals() {
    if (validMenu.length < 3) { toast.error('Add at least 3 menu items'); return; }
    setGenerating(true);
    try {
      const res = await fetch('/api/generate-meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuItems: validMenu, kitchenName: form.name, isHalal: form.isHalal, isVeg: form.isVeg }),
      });
      if (res.status === 401) { toast.error('Sign in to continue'); router.push('/auth/login?next=/join'); return; }
      const data = await res.json();
      if (data.meals?.length) {
        setMeals(data.meals);
        toast.success('Your weekly meals are ready!');
      } else {
        toast.error(data.error || 'Generation failed — try again');
      }
    } catch {
      toast.error('Generation failed — try again');
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await fetch('/api/merchant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kitchen: form, meals }),
      });
      if (res.status === 401) { toast.error('Sign in to submit'); router.push('/auth/login?next=/join'); return; }
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error || 'Submission failed — try again');
        return;
      }
      toast.success('Application submitted! Pending approval.');
      router.push('/join/success');
    } catch {
      toast.error('Submission failed — try again');
    } finally {
      setLoading(false);
    }
  }

  const inputCls = 'w-full border rounded-2xl px-4 py-3 text-[14px] bg-white';
  const inputStyle = { borderColor: BR, color: D };
  const labelStyle = { color: '#5A6B5A' };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#F5F5F0' }}>
        <div className="w-full max-w-sm rounded-2xl bg-white p-7 text-center" style={{ border: `0.5px solid ${BR}` }}>
          <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: LT }}>
            <ChefHat size={21} style={{ color: '#C8941A' }} />
          </div>
          <h1 className="text-[19px] font-semibold mb-2" style={{ color: D }}>List your kitchen on TiffinGo</h1>
          <p className="text-[13px] leading-relaxed mb-6" style={{ color: '#8A9A8A' }}>
            Create an account first so we can reach you about your listing and payouts. Takes a minute.
          </p>
          <Link href="/auth/signup?next=/join"
            className="block w-full py-3 rounded-2xl text-[14px] font-semibold mb-2.5"
            style={{ background: D, color: '#fff' }}>
            Create an account
          </Link>
          <Link href="/auth/login?next=/join" className="block text-[13px] font-medium" style={{ color: '#5A6B5A' }}>
            Already registered? Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#F5F5F0' }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(160deg, ${D}, ${B})` }} className="px-5 pt-14 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: A }}>
            <ChefHat size={20} style={{ color: D }} />
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-white" style={{ fontFamily: 'Fraunces, serif' }}>Join TiffinGo</h1>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Your menu becomes weekly meals — automatically</p>
          </div>
        </div>
        <div className="flex items-center">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ background: i <= step ? A : 'rgba(255,255,255,0.12)', color: i <= step ? D : 'rgba(255,255,255,0.4)' }}>
                  {i < step ? <Check size={11} /> : i + 1}
                </div>
                <span className="text-[10px] font-medium" style={{ color: i === step ? A : 'rgba(255,255,255,0.4)' }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className="flex-1 h-px mx-2" style={{ background: i < step ? A : 'rgba(255,255,255,0.15)' }} />}
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 py-5 max-w-lg mx-auto pb-10">

        {/* STEP 0 — Kitchen info */}
        {step === 0 && (
          <div className="space-y-4">
            <div><p className="text-[11px] font-semibold mb-1.5" style={labelStyle}>KITCHEN / RESTAURANT NAME</p>
              <input value={form.name} onChange={set('name')} placeholder="e.g. The Chai Bar" className={inputCls} style={inputStyle} /></div>
            <div><p className="text-[11px] font-semibold mb-1.5" style={labelStyle}>TAGLINE (OPTIONAL)</p>
              <input value={form.tagline} onChange={set('tagline')} placeholder="e.g. Authentic chai. Real street food." className={inputCls} style={inputStyle} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-[11px] font-semibold mb-1.5" style={labelStyle}>CUISINE</p>
                <select value={form.cuisine} onChange={set('cuisine')} className={inputCls} style={inputStyle}>
                  <option value="">Select...</option>
                  {CUISINES.map(c => <option key={c}>{c}</option>)}
                </select></div>
              <div><p className="text-[11px] font-semibold mb-1.5" style={labelStyle}>TYPE</p>
                <select value={form.type} onChange={set('type')} className={inputCls} style={inputStyle}>
                  <option value="restaurant">Restaurant</option>
                  <option value="tiffin">Home kitchen</option>
                </select></div>
            </div>
            <div><p className="text-[11px] font-semibold mb-1.5" style={labelStyle}>ADDRESS</p>
              <input value={form.address} onChange={set('address')} placeholder="123 Main St, Surrey, BC" className={inputCls} style={inputStyle} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-[11px] font-semibold mb-1.5" style={labelStyle}>PHONE</p>
                <input value={form.phone} onChange={set('phone')} type="tel" placeholder="+1 604 000 0000" className={inputCls} style={inputStyle} /></div>
              <div><p className="text-[11px] font-semibold mb-1.5" style={labelStyle}>EMAIL</p>
                <input value={form.email} onChange={set('email')} type="email" placeholder="you@example.com" className={inputCls} style={inputStyle} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-[11px] font-semibold mb-1.5" style={labelStyle}>PRICE PER MEAL ($)</p>
                <input value={form.pricePerMeal} onChange={set('pricePerMeal')} type="number" className={inputCls} style={inputStyle} /></div>
              <div><p className="text-[11px] font-semibold mb-1.5" style={labelStyle}>WEEKLY PACKAGE ($)</p>
                <input value={form.weeklyPrice} onChange={set('weeklyPrice')} type="number" className={inputCls} style={inputStyle} /></div>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isHalal} onChange={set('isHalal')} className="w-4 h-4 rounded" />
                <span className="text-[13px]" style={{ color: D }}>Halal</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isVeg} onChange={set('isVeg')} className="w-4 h-4 rounded" />
                <span className="text-[13px]" style={{ color: D }}>Vegetarian only</span>
              </label>
            </div>
          </div>
        )}

        {/* STEP 1 — Menu */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Import — saves typing the whole menu by hand */}
            <div className="rounded-2xl p-4 bg-white" style={{ border: `0.5px solid ${BR}` }}>
              <p className="text-[13px] font-semibold mb-1" style={{ color: D }}>Already have a menu?</p>
              <p className="text-[12px] leading-relaxed mb-3" style={{ color: '#8A9A8A' }}>
                Link it, paste it, or upload it — we&rsquo;ll fill in the items for you. You can edit everything after.
              </p>

              <div className="flex gap-1.5 mb-3">
                {([['link', 'Link', Link2], ['paste', 'Paste text', ClipboardPaste], ['file', 'PDF / photo', Upload]] as const).map(([mode, label, Icon]) => (
                  <button key={mode} type="button" onClick={() => setImportMode(mode)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11.5px] font-medium transition"
                    style={{
                      background: importMode === mode ? LT : 'transparent',
                      border: `1px solid ${importMode === mode ? A : BR}`,
                      color: importMode === mode ? '#C8941A' : '#5A6B5A',
                    }}>
                    <Icon size={13} /> {label}
                  </button>
                ))}
              </div>

              {importMode === 'link' && (
                <div className="flex gap-2">
                  <input value={importUrl} onChange={e => setImportUrl(e.target.value)}
                    placeholder="yourrestaurant.com/menu"
                    className="flex-1 border rounded-xl px-3.5 py-2.5 text-[13px] bg-white" style={inputStyle} />
                  <button type="button" disabled={importing || !importUrl.trim()}
                    onClick={() => runImport({ url: importUrl })}
                    className="px-4 rounded-xl text-[12.5px] font-semibold flex items-center gap-1.5 disabled:opacity-40"
                    style={{ background: D, color: '#fff' }}>
                    {importing ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} Read it
                  </button>
                </div>
              )}

              {importMode === 'paste' && (
                <div className="space-y-2">
                  <textarea value={importText} onChange={e => setImportText(e.target.value)} rows={5}
                    placeholder={'Paste your menu here, e.g.\n\nMasala Chai  3.50\nAloo Paratha  8.00\nButter Chicken  14.99'}
                    className="w-full border rounded-xl px-3.5 py-2.5 text-[13px] bg-white" style={inputStyle} />
                  <button type="button" disabled={importing || importText.trim().length < 20}
                    onClick={() => runImport({ text: importText })}
                    className="w-full py-2.5 rounded-xl text-[12.5px] font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40"
                    style={{ background: D, color: '#fff' }}>
                    {importing ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} Read my menu
                  </button>
                </div>
              )}

              {importMode === 'file' && (
                <label className="w-full py-6 rounded-xl text-[12.5px] font-medium flex flex-col items-center justify-center gap-1.5 border-2 border-dashed cursor-pointer"
                  style={{ borderColor: BR, color: '#5A6B5A' }}>
                  <input type="file" accept="application/pdf,image/png,image/jpeg,image/webp" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) importFromFile(f); e.target.value = ''; }} />
                  {importing ? <Loader2 size={17} className="animate-spin" /> : <Upload size={17} />}
                  {importing ? 'Reading your menu…' : 'Choose a PDF or photo of your menu'}
                  <span className="text-[10.5px]" style={{ color: '#8A9A8A' }}>Up to 5MB</span>
                </label>
              )}

              {importNote && (
                <div className="mt-3 rounded-xl p-2.5 flex items-start gap-2" style={{ background: LT, border: `0.5px solid ${A}` }}>
                  <Check size={13} style={{ color: '#C8941A', flexShrink: 0, marginTop: 1 }} />
                  <p className="text-[11px] leading-relaxed" style={{ color: '#C8941A' }}>{importNote}</p>
                </div>
              )}
            </div>

            <div className="rounded-2xl p-4 bg-white" style={{ border: `0.5px solid ${BR}` }}>
              <p className="text-[13px] font-semibold mb-1" style={{ color: D }}>
                {validMenu.length ? 'Your menu items' : 'Add your menu items'}
              </p>
              <p className="text-[12px] leading-relaxed" style={{ color: '#8A9A8A' }}>
                {validMenu.length
                  ? 'Check the prices, delete anything you don\u2019t offer as tiffin, and add whatever the menu missed. Our AI turns these into your weekly meal combos in the next step.'
                  : 'Just the name and price \u2014 or use the reader above and we\u2019ll fill these in for you. Our AI turns them into your weekly meal combos in the next step. At least 3 items; the more you add, the better the combos.'}
              </p>
            </div>

            <div className="space-y-2">
              {menuItems.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input value={item.name} onChange={setMenu(i, 'name')} placeholder={`Item ${i + 1} — e.g. Masala Chai`}
                    className="flex-[3] border rounded-xl px-3.5 py-2.5 text-[13px] bg-white" style={inputStyle} />
                  <input value={item.price} onChange={setMenu(i, 'price')} placeholder="$" type="number"
                    className="flex-1 border rounded-xl px-3.5 py-2.5 text-[13px] bg-white" style={inputStyle} />
                  {menuItems.length > 3 && (
                    <button onClick={() => setMenuItems(items => items.filter((_, idx) => idx !== i))}
                      className="w-9 flex items-center justify-center rounded-xl" style={{ background: '#F0EEE8' }}>
                      <X size={13} style={{ color: '#8A9A8A' }} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button onClick={() => setMenuItems(items => [...items, { name: '', price: '' }])}
              className="w-full py-3 rounded-2xl text-[13px] font-medium flex items-center justify-center gap-2 border-2 border-dashed"
              style={{ borderColor: BR, color: '#5A6B5A', background: 'transparent' }}>
              <Plus size={15} /> Add another item
            </button>

            <div className="rounded-2xl p-3.5 flex items-center gap-2.5" style={{ background: LT, border: `0.5px solid ${A}` }}>
              <Sparkles size={15} style={{ color: '#C8941A', flexShrink: 0 }} />
              <p className="text-[11px]" style={{ color: '#C8941A' }}>
                <strong>{validMenu.length} items added.</strong> {validMenu.length >= 3 ? 'Ready for AI meal generation →' : `Add ${3 - validMenu.length} more to continue.`}
              </p>
            </div>
          </div>
        )}

        {/* STEP 2 — AI generated meals */}
        {step === 2 && (
          <div className="space-y-4">
            {meals.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: LT }}>
                  <Sparkles size={24} style={{ color: A }} />
                </div>
                <p className="text-[16px] font-bold mb-2" style={{ color: D, fontFamily: 'Fraunces, serif' }}>Let AI build your week</p>
                <p className="text-[13px] mb-6 max-w-xs mx-auto leading-relaxed" style={{ color: '#8A9A8A' }}>
                  Our AI will read your {validMenu.length} menu items and create 5 balanced daily meal combos for Monday to Friday.
                </p>
                <button onClick={generateMeals} disabled={generating}
                  className="px-8 py-3.5 rounded-2xl text-[14px] font-bold disabled:opacity-60"
                  style={{ background: D, color: A }}>
                  {generating ? '✨ Creating your meals...' : '✨ Generate my weekly meals'}
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-[14px] font-bold" style={{ color: D, fontFamily: 'Fraunces, serif' }}>Your AI-generated week</p>
                  <button onClick={generateMeals} disabled={generating}
                    className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-xl"
                    style={{ background: LT, color: '#C8941A' }}>
                    <RefreshCw size={11} className={generating ? 'animate-spin' : ''} />
                    Regenerate
                  </button>
                </div>
                <div className="space-y-2.5">
                  {meals.map(meal => (
                    <div key={meal.day} className="rounded-2xl p-3.5 bg-white flex items-start gap-3" style={{ border: `0.5px solid ${BR}` }}>
                      <div className="w-11 h-11 rounded-xl flex flex-col items-center justify-center flex-shrink-0" style={{ background: D }}>
                        <span className="text-[9px] font-bold" style={{ color: A }}>{meal.day}</span>
                        <span className="text-[14px]">{meal.emoji}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold mb-0.5" style={{ color: D }}>{meal.name}</p>
                        <p className="text-[11px] leading-relaxed mb-1.5" style={{ color: '#8A9A8A' }}>{meal.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px]" style={{ color: '#8A9A8A' }}>{meal.protein} protein</span>
                          <span className="text-[10px]" style={{ color: '#A8B4A8' }}>·</span>
                          <span className="text-[10px]" style={{ color: '#8A9A8A' }}>{meal.calories} cal</span>
                          {meal.tags.map(tag => (
                            <span key={tag} className="text-[9px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: LT, color: '#C8941A' }}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl p-3.5" style={{ background: '#E8F0E8', border: '0.5px solid #52B788' }}>
                  <p className="text-[11px]" style={{ color: B }}>💡 These combos update automatically each week. You can edit any meal anytime from your dashboard.</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 3 — Agreement */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-2xl p-4 bg-white space-y-3" style={{ border: `0.5px solid ${BR}` }}>
              <p className="text-[14px] font-bold" style={{ color: D, fontFamily: 'Fraunces, serif' }}>Partnership terms</p>
              {[
                { e: '🎁', t: '0% commission for 90 days', d: 'Launch partner offer — keep 100% of every order for 3 months.' },
                { e: '💰', t: '10% after that', d: 'Uber Eats charges 30%. We charge 10%. You keep 90%.' },
                { e: '🤖', t: 'AI runs your meal calendar', d: 'Weekly combos auto-generated from your menu. Edit anytime.' },
                { e: '🛵', t: 'We handle all delivery', d: 'Drivers, logistics, customer support — all TiffinGo.' },
                { e: '📱', t: 'Evening prep alert', d: 'Every night: "Prep 34 portions tomorrow." That\'s your only job.' },
                { e: '❌', t: 'Cancel anytime', d: '7 days notice. No lock-in, no penalties.' },
              ].map(({ e, t, d }) => (
                <div key={t} className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">{e}</span>
                  <div>
                    <p className="text-[12px] font-semibold" style={{ color: D }}>{t}</p>
                    <p className="text-[11px]" style={{ color: '#8A9A8A' }}>{d}</p>
                  </div>
                </div>
              ))}
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.agree} onChange={set('agree')} className="w-4 h-4 mt-0.5 rounded" />
              <p className="text-[12px] leading-relaxed" style={{ color: '#5A6B5A' }}>I agree to TiffinGo's merchant terms and confirm my information is accurate.</p>
            </label>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              className="flex-1 py-3.5 rounded-2xl text-[13px] font-medium bg-white"
              style={{ border: `0.5px solid ${BR}`, color: '#5A6B5A' }}>
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => {
                if (step === 0 && !form.name) { toast.error('Enter your kitchen name'); return; }
                if (step === 1 && validMenu.length < 3) { toast.error('Add at least 3 menu items'); return; }
                if (step === 2 && meals.length === 0) { toast.error('Generate your meals first'); return; }
                setStep(s => s + 1);
              }}
              className="flex-1 py-3.5 rounded-2xl text-[14px] font-bold flex items-center justify-center gap-2 text-white"
              style={{ background: D }}>
              Continue <ArrowRight size={16} style={{ color: A }} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!form.agree || loading}
              className="flex-1 py-3.5 rounded-2xl text-[14px] font-bold disabled:opacity-50"
              style={{ background: A, color: D }}>
              {loading ? 'Submitting...' : 'Submit & go live 🚀'}
            </button>
          )}
        </div>

        <p className="text-center text-[11px] mt-4" style={{ color: '#A8B4A8' }}>
          Already a merchant? <Link href="/dashboard" style={{ color: '#C8941A' }} className="font-semibold">Dashboard →</Link>
        </p>
      </div>
    </div>
  );
}
