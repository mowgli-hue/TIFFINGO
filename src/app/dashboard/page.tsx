'use client';
import { useState } from 'react';
import { ShoppingBag, Users, DollarSign, Star, Bell, ChevronRight, Clock, ChefHat, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const D='#1A3A2A', A='#F0B429', B='#2D6A4A', C='#F5F5F0', LT='#FFFBEB', BR='#D8DDD0';

const ORDERS = [
  { id:'001', customer:'Priya S.', meal:'Masala Chai + Paneer Paratha', status:'PREPARING', time:'12pm', amount:12 },
  { id:'002', customer:'Rahul M.', meal:'Masala Chai + Paneer Paratha', status:'ON_THE_WAY', time:'12pm', amount:12 },
  { id:'003', customer:'Simran K.', meal:'Weekly Package', status:'DELIVERED', time:'12pm', amount:50 },
  { id:'004', customer:'David L.', meal:'Masala Chai + Paneer Paratha', status:'CONFIRMED', time:'5pm', amount:12 },
];

const MEALS = [
  { day:'Mon', emoji:'🫖', name:'Masala Chai + Paneer Paratha', orders:34, price:12 },
  { day:'Tue', emoji:'🌯', name:'Kadak Chai + Loaded Wrap', orders:28, price:12 },
  { day:'Wed', emoji:'🍟', name:'Elaichi Chai + Mix Pakoda', orders:22, price:12 },
  { day:'Thu', emoji:'🍔', name:'Kesar Milk + Paneer Burger', orders:19, price:12 },
  { day:'Fri', emoji:'🥗', name:'Kashmiri Chai + Samosa Chaat', orders:31, price:12 },
];

const ST: Record<string,{bg:string;c:string;l:string}> = {
  CONFIRMED:  {bg:'#E8F0E8',c:'#2D6A4A',l:'Confirmed'},
  PREPARING:  {bg:LT,c:'#C8941A',l:'Preparing'},
  ON_THE_WAY: {bg:'#EEF2FF',c:'#3B5BDB',l:'On the way'},
  DELIVERED:  {bg:'#F0EEE8',c:'#5A6B5A',l:'Delivered'},
};

export default function Dashboard() {
  const [tab, setTab] = useState<'overview'|'orders'|'meals'|'earnings'>('overview');

  return (
    <div className="min-h-screen" style={{background:C}}>
      <div style={{background:`linear-gradient(160deg,${D},${B})`}} className="px-5 pt-14 pb-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:A}}>
              <ChefHat size={18} style={{color:D}} />
            </div>
            <div>
              <p className="text-[11px] font-medium" style={{color:'rgba(255,255,255,0.5)'}}>MERCHANT PORTAL</p>
              <p className="text-[15px] font-semibold text-white">The Chai Bar — Surrey</p>
            </div>
          </div>
          <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{background:'rgba(255,255,255,0.1)'}}>
            <Bell size={15} style={{color:'rgba(255,255,255,0.6)'}} />
          </button>
        </div>
        <div className="flex gap-1.5">
          {(['overview','orders','meals','earnings'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-2 rounded-xl text-[11px] font-semibold capitalize transition-all"
              style={{background:tab===t?A:'rgba(255,255,255,0.1)',color:tab===t?D:'rgba(255,255,255,0.6)'}}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 max-w-2xl mx-auto">
        {tab==='overview' && <>
          <div className="rounded-2xl p-4 mb-4 flex gap-3" style={{background:D}}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:A}}>
              <span className="text-[16px]">🤖</span>
            </div>
            <div>
              <p className="text-[9px] font-bold tracking-wider mb-1" style={{color:A}}>AI PREP ALERT</p>
              <p className="text-[13px] font-semibold text-white">Prep <span style={{color:A}}>34 portions</span> of Masala Chai + Paneer Paratha</p>
              <p className="text-[11px] mt-0.5" style={{color:'rgba(255,255,255,0.45)'}}>Today · Noon slot · 34 confirmed orders</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              {icon:ShoppingBag,label:"Today's orders",val:'34',sub:'+4 since 9am',color:A},
              {icon:DollarSign,label:"Net revenue",val:'$367',sub:'After 10% commission',color:'#52B788'},
              {icon:Users,label:'Subscribers',val:'48',sub:'+3 this week',color:'#748FFC'},
              {icon:Star,label:'Avg rating',val:'4.9 ★',sub:'Last 30 orders',color:A},
            ].map(({icon:Icon,label,val,sub,color})=>(
              <div key={label} className="rounded-2xl p-3.5 bg-white" style={{border:`0.5px solid ${BR}`}}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:color+'20'}}>
                    <Icon size={14} style={{color}} />
                  </div>
                  <span className="text-[10px]" style={{color:'#5A6B5A'}}>{label}</span>
                </div>
                <p className="text-[22px] font-bold" style={{color:D}}>{val}</p>
                <p className="text-[10px] mt-0.5" style={{color:'#8A9A8A'}}>{sub}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-4 mb-4" style={{background:LT,border:`0.5px solid ${A}`}}>
            <p className="text-[11px] font-bold mb-1" style={{color:'#C8941A'}}>💸 Saved vs Uber Eats this month</p>
            <p className="text-[30px] font-bold" style={{color:D}}>$1,840</p>
            <p className="text-[11px]" style={{color:'#C8941A'}}>Uber charges 30% · TiffinGo charges 10%</p>
          </div>

          <p className="text-[12px] font-semibold mb-2" style={{color:D}}>Live orders</p>
          <div className="space-y-2">
            {ORDERS.slice(0,3).map(o=>{const s=ST[o.status];return(
              <div key={o.id} className="rounded-2xl p-3.5 flex items-center gap-3 bg-white" style={{border:`0.5px solid ${BR}`}}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{background:LT}}>🍵</div>
                <div className="flex-1">
                  <p className="text-[13px] font-medium" style={{color:D}}>{o.customer}</p>
                  <p className="text-[11px]" style={{color:'#8A9A8A'}}>{o.meal}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-medium px-2 py-1 rounded-full" style={{background:s.bg,color:s.c}}>{s.l}</span>
                  <p className="text-[11px] mt-1" style={{color:'#8A9A8A'}}>${o.amount}</p>
                </div>
              </div>
            );})}
          </div>
        </>}

        {tab==='orders' && <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[14px] font-bold" style={{color:D,fontFamily:'Fraunces,serif'}}>All orders today</p>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full" style={{background:LT,color:'#C8941A'}}>{ORDERS.length} orders</span>
          </div>
          <div className="space-y-2.5">
            {ORDERS.map(o=>{const s=ST[o.status];return(
              <div key={o.id} className="rounded-2xl p-4 bg-white" style={{border:`0.5px solid ${BR}`}}>
                <div className="flex justify-between mb-2">
                  <div>
                    <p className="text-[14px] font-semibold" style={{color:D}}>{o.customer}</p>
                    <p className="text-[12px]" style={{color:'#8A9A8A'}}>{o.meal}</p>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-1 rounded-full h-fit" style={{background:s.bg,color:s.c}}>{s.l}</span>
                </div>
                <div className="flex items-center pt-2" style={{borderTop:`0.5px solid #EEF0EA`}}>
                  <Clock size={11} style={{color:'#8A9A8A'}} />
                  <span className="text-[11px] ml-1" style={{color:'#8A9A8A'}}>{o.time}</span>
                  <div className="flex-1" />
                  <span className="text-[14px] font-bold" style={{color:D}}>${o.amount}</span>
                </div>
              </div>
            );})}
          </div>
        </>}

        {tab==='meals' && <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[14px] font-bold" style={{color:D,fontFamily:'Fraunces,serif'}}>This week's meals</p>
            <button className="text-[11px] font-semibold px-3 py-1.5 rounded-xl text-white" style={{background:D}}>Edit week</button>
          </div>
          <div className="space-y-2.5">
            {MEALS.map(m=>(
              <div key={m.day} className="rounded-2xl p-3.5 flex items-center gap-3 bg-white" style={{border:`0.5px solid ${BR}`}}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{background:LT}}>{m.emoji}</div>
                <div className="flex-1">
                  <p className="text-[13px] font-medium" style={{color:D}}>{m.name}</p>
                  <p className="text-[11px]" style={{color:'#8A9A8A'}}>{m.day} · {m.orders} orders · ${m.price}/meal</p>
                </div>
                <ChevronRight size={16} style={{color:'#A8B4A8'}} />
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl p-4" style={{background:'#E8F0E8',border:`0.5px solid #52B788`}}>
            <p className="text-[12px] font-bold mb-1" style={{color:'#2D6A4A'}}>🤖 AI suggestion</p>
            <p className="text-[12px]" style={{color:'#2D6A4A'}}>Mix Pakoda combo had 40% more reorders. Feature it again next week.</p>
          </div>
        </>}

        {tab==='earnings' && <>
          <div className="rounded-2xl p-5 mb-4 bg-white" style={{border:`0.5px solid ${BR}`}}>
            <p className="text-[11px] font-medium mb-1" style={{color:'#8A9A8A'}}>THIS WEEK</p>
            <p className="text-[36px] font-bold" style={{color:D,fontFamily:'Fraunces,serif'}}>$1,458</p>
            <p className="text-[12px]" style={{color:'#52B788'}}>+$234 vs last week</p>
            <div className="flex gap-1.5 mt-4 items-end h-14">
              {[65,80,55,70,90,75,85].map((h,i)=>(
                <div key={i} className="flex-1 rounded-t-lg" style={{height:`${h}%`,background:i===6?A:'#E8EDE8'}} />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              {['M','T','W','T','F','S','S'].map((d,i)=>(
                <span key={i} className="flex-1 text-center text-[9px]" style={{color:'#8A9A8A'}}>{d}</span>
              ))}
            </div>
          </div>
          {[
            {label:'Gross revenue',val:'$1,620',note:'Before commission'},
            {label:'Commission (10%)',val:'-$162',note:'Platform fee'},
            {label:'Net earnings',val:'$1,458',note:'Paid Sunday'},
            {label:'Next payout',val:'Sunday',note:'Direct to bank'},
          ].map(row=>(
            <div key={row.label} className="rounded-2xl p-3.5 mb-2 flex justify-between items-center bg-white" style={{border:`0.5px solid ${BR}`}}>
              <div>
                <p className="text-[13px] font-medium" style={{color:D}}>{row.label}</p>
                <p className="text-[11px]" style={{color:'#8A9A8A'}}>{row.note}</p>
              </div>
              <p className="text-[15px] font-bold" style={{color:D}}>{row.val}</p>
            </div>
          ))}
        </>}
      </div>
    </div>
  );
}
