'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sparkles, RefreshCw, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const D='#1A3A2A',A='#F0B429',LT='#FFFBEB',BR='#D8DDD0';
type Day = { day:string; emoji:string; items:string[]; name:string; description:string; calories:number; protein:string; price:number };

export default function PlanBuilder() {
  const { id } = useParams();
  const router = useRouter();
  const [diet, setDiet] = useState('No preference');
  const [goal, setGoal] = useState('Balanced');
  const [plan, setPlan] = useState<{days:Day[];subtotal:number;discountPct:number;total:number}|null>(null);
  const [busy, setBusy] = useState(false);

  async function generate() {
    setBusy(true);
    try {
      const r = await fetch('/api/generate-plan', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ kitchenId:id, diet, goal }),
      });
      const d = await r.json();
      if (d.days) setPlan(d); else throw 0;
    } catch { toast.error('Try again'); }
    setBusy(false);
  }

  const chip = (val:string, cur:string, set:(v:string)=>void) => (
    <button key={val} onClick={()=>set(val)} className="px-3.5 py-2 rounded-full text-[12px] font-medium border"
      style={cur===val?{background:D,color:A,borderColor:D}:{background:'#fff',color:'#5A6B5A',borderColor:BR}}>{val}</button>
  );

  return (
    <div className="min-h-screen pb-32" style={{background:'#F5F5F0'}}>
      <div style={{background:`linear-gradient(160deg,${D},#2D6A4A)`}} className="px-5 pt-14 pb-6">
        <button onClick={()=>router.back()} className="mb-4"><ArrowLeft size={18} color="#fff"/></button>
        <h1 className="text-[24px] font-bold text-white" style={{fontFamily:'Fraunces,serif'}}>Build <em style={{color:A,fontStyle:'italic'}}>your</em> week</h1>
        <p className="text-[12px] mt-1" style={{color:'rgba(255,255,255,0.5)'}}>AI creates a personal plan from this kitchen's menu</p>
      </div>

      <div className="px-5 py-5 max-w-lg mx-auto space-y-5">
        <div>
          <p className="text-[11px] font-semibold mb-2" style={{color:'#5A6B5A'}}>DIET</p>
          <div className="flex gap-2 flex-wrap">{['No preference','Vegetarian','Non-veg heavy'].map(v=>chip(v,diet,setDiet))}</div>
        </div>
        <div>
          <p className="text-[11px] font-semibold mb-2" style={{color:'#5A6B5A'}}>GOAL</p>
          <div className="flex gap-2 flex-wrap">{['Balanced','High protein','Light & fresh','Comfort food'].map(v=>chip(v,goal,setGoal))}</div>
        </div>

        <button onClick={generate} disabled={busy} className="w-full py-4 rounded-2xl text-[14px] font-bold disabled:opacity-60" style={{background:D,color:A}}>
          {busy ? '✨ Building your plan...' : plan ? '↻ Shuffle — new plan' : '✨ Generate my plan'}
        </button>

        {plan && <>
          <div className="space-y-2.5">
            {plan.days.map(d=>(
              <div key={d.day} className="rounded-2xl p-3.5 bg-white flex gap-3" style={{border:`0.5px solid ${BR}`}}>
                <div className="w-11 h-11 rounded-xl flex flex-col items-center justify-center flex-shrink-0" style={{background:D}}>
                  <span className="text-[9px] font-bold" style={{color:A}}>{d.day}</span>
                  <span className="text-[14px]">{d.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <p className="text-[13px] font-semibold" style={{color:D}}>{d.name}</p>
                    <p className="text-[13px] font-bold flex-shrink-0" style={{color:D}}>${d.price}</p>
                  </div>
                  <p className="text-[11px] mt-0.5" style={{color:'#8A9A8A'}}>{d.description}</p>
                  <p className="text-[10px] mt-1" style={{color:'#A8B4A8'}}>{d.items.join(' · ')} — {d.calories} cal · {d.protein}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl p-4" style={{background:LT,border:`0.5px solid ${A}`}}>
            <div className="flex justify-between text-[12px]" style={{color:'#8A9A8A'}}><span>Items total</span><span>${plan.subtotal}</span></div>
            <div className="flex justify-between text-[12px] mt-1" style={{color:'#C8941A'}}><span>Plan discount ({plan.discountPct}%)</span><span>−${(plan.subtotal-plan.total).toFixed(2)}</span></div>
            <div className="flex justify-between text-[16px] font-bold mt-2 pt-2" style={{color:D,borderTop:`0.5px solid ${A}`}}><span>Weekly total</span><span>${plan.total}</span></div>
          </div>
          <button onClick={()=>{toast.success('Plan added! Checkout coming next.');}} className="w-full py-4 rounded-2xl text-[15px] font-bold" style={{background:A,color:D}}>
            Get this plan — ${plan.total}/week
          </button>
        </>}
      </div>
    </div>
  );
}
