'use client';
import { useState } from 'react';
import { Store, Users, Truck, DollarSign, CheckCircle, XCircle, MapPin } from 'lucide-react';

const D='#1A3A2A',A='#F0B429',B='#2D6A4A',C='#F5F5F0',BR='#D8DDD0';

const KITCHENS=[
  {id:'1',name:'The Chai Bar',city:'Surrey',type:'Restaurant',status:'LIVE',orders:34,revenue:408,rating:4.8},
  {id:'2',name:'Ghar Ka Khana',city:'Surrey',type:'Tiffin',status:'PENDING',orders:0,revenue:0,rating:0},
];
const ORDERS=[
  {id:'TG001',customer:'Priya S.',kitchen:'Chai Bar',driver:'Arjun S.',amount:12,status:'ON_THE_WAY'},
  {id:'TG002',customer:'Rahul M.',kitchen:'Chai Bar',driver:'Arjun S.',amount:50,status:'PREPARING'},
  {id:'TG003',customer:'Simran K.',kitchen:'Chai Bar',driver:'Neha P.',amount:12,status:'DELIVERED'},
];
const DRIVERS=[
  {name:'Arjun S.',status:'ON_DELIVERY',deliveries:6,earnings:68.40,rating:4.97},
  {name:'Neha P.',status:'ON_DELIVERY',deliveries:4,earnings:42.80,rating:4.92},
  {name:'Raj K.',status:'ONLINE',deliveries:2,earnings:18.60,rating:4.85},
];
const SC:Record<string,{bg:string;c:string}>={
  LIVE:{bg:'#E8F0E8',c:B},PENDING:{bg:'#FFFBEB',c:'#C8941A'},
  ON_THE_WAY:{bg:'#EEF2FF',c:'#3B5BDB'},PREPARING:{bg:'#FFFBEB',c:'#C8941A'},
  DELIVERED:{bg:'#F0EEE8',c:'#5A6B5A'},ON_DELIVERY:{bg:'#EEF2FF',c:'#3B5BDB'},
  ONLINE:{bg:'#E8F0E8',c:B},
};

export default function AdminPanel() {
  const [tab,setTab]=useState<'overview'|'kitchens'|'orders'|'drivers'>('overview');
  return (
    <div className="min-h-screen" style={{background:C}}>
      <div style={{background:`linear-gradient(160deg,${D},${B})`}} className="px-5 pt-14 pb-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{background:A}}>⚡</div>
          <div>
            <p className="text-[11px] font-medium" style={{color:'rgba(255,255,255,0.5)'}}>ADMIN PANEL</p>
            <p className="text-[16px] font-bold text-white" style={{fontFamily:'Fraunces,serif'}}>TiffinGo Command Centre</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {(['overview','kitchens','orders','drivers'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              className="flex-1 py-2 rounded-xl text-[11px] font-semibold capitalize transition-all"
              style={{background:tab===t?A:'rgba(255,255,255,0.1)',color:tab===t?D:'rgba(255,255,255,0.6)'}}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 max-w-2xl mx-auto">
        {tab==='overview' && <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              {icon:DollarSign,label:'GMV today',val:'$1,284',color:A},
              {icon:Store,label:'Kitchens',val:'1 live · 1 pending',color:B},
              {icon:Users,label:'Customers',val:'48',color:'#748FFC'},
              {icon:Truck,label:'Drivers online',val:'3',color:A},
            ].map(({icon:Icon,label,val,color})=>(
              <div key={label} className="rounded-2xl p-3.5 bg-white" style={{border:`0.5px solid ${BR}`}}>
                <Icon size={14} style={{color}} />
                <p className="text-[20px] font-bold mt-1" style={{color:D,fontFamily:'Fraunces,serif'}}>{val}</p>
                <p className="text-[10px] mt-0.5" style={{color:'#8A9A8A'}}>{label}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl p-4 mb-4" style={{background:D}}>
            <p className="text-[9px] font-bold tracking-wider mb-2" style={{color:A}}>TIFFINGO REVENUE (10% COMMISSION)</p>
            <p className="text-[32px] font-bold text-white" style={{fontFamily:'Fraunces,serif'}}>$128.40</p>
            <p className="text-[12px]" style={{color:'rgba(255,255,255,0.4)'}}>Today · ~$3,840 projected this month</p>
          </div>
          <p className="text-[12px] font-semibold mb-2" style={{color:D}}>Pending approvals</p>
          {KITCHENS.filter(k=>k.status==='PENDING').map(k=>(
            <div key={k.id} className="rounded-2xl p-4 bg-white" style={{border:`0.5px solid ${BR}`}}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{background:'#FFFBEB'}}>🍛</div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold" style={{color:D}}>{k.name}</p>
                  <p className="text-[11px]" style={{color:'#8A9A8A'}}>{k.city} · {k.type}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold text-white flex items-center justify-center gap-1.5" style={{background:B}}>
                  <CheckCircle size={13} /> Approve
                </button>
                <button className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5" style={{background:'#FFEBEB',color:'#C0392B'}}>
                  <XCircle size={13} /> Reject
                </button>
              </div>
            </div>
          ))}
        </>}

        {tab==='kitchens' && <div className="space-y-2.5">
          {KITCHENS.map(k=>{const s=SC[k.status];return(
            <div key={k.id} className="rounded-2xl p-4 bg-white" style={{border:`0.5px solid ${BR}`}}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{background:'#FFFBEB'}}>🍛</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-semibold" style={{color:D}}>{k.name}</p>
                    <span className="text-[9px] font-medium px-2 py-0.5 rounded-full" style={{background:s.bg,color:s.c}}>{k.status}</span>
                  </div>
                  <p className="text-[11px] flex items-center gap-1" style={{color:'#8A9A8A'}}><MapPin size={10}/>{k.city} · {k.type}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3" style={{borderTop:`0.5px solid #EEF0EA`}}>
                {[{l:'Orders',v:k.orders},{l:'Revenue',v:`$${k.revenue}`},{l:'Rating',v:k.rating||'—'}].map(x=>(
                  <div key={x.l} className="text-center">
                    <p className="text-[15px] font-bold" style={{color:D}}>{x.v}</p>
                    <p className="text-[9px]" style={{color:'#8A9A8A'}}>{x.l}</p>
                  </div>
                ))}
              </div>
            </div>
          );})}
        </div>}

        {tab==='orders' && <div className="space-y-2.5">
          {ORDERS.map(o=>{const s=SC[o.status];return(
            <div key={o.id} className="rounded-2xl p-4 bg-white" style={{border:`0.5px solid ${BR}`}}>
              <div className="flex justify-between mb-2">
                <p className="text-[11px] font-mono" style={{color:'#8A9A8A'}}>#{o.id}</p>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{background:s.bg,color:s.c}}>{o.status.replace('_',' ')}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {[{l:'Customer',v:o.customer},{l:'Kitchen',v:o.kitchen},{l:'Driver',v:o.driver}].map(x=>(
                  <div key={x.l}>
                    <p className="text-[10px]" style={{color:'#8A9A8A'}}>{x.l}</p>
                    <p className="text-[12px] font-medium" style={{color:D}}>{x.v}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-2" style={{borderTop:`0.5px solid #EEF0EA`}}>
                <p className="text-[15px] font-bold" style={{color:D}}>${o.amount}</p>
              </div>
            </div>
          );})}
        </div>}

        {tab==='drivers' && <div className="space-y-2.5">
          {DRIVERS.map(d=>{const s=SC[d.status];return(
            <div key={d.name} className="rounded-2xl p-4 bg-white" style={{border:`0.5px solid ${BR}`}}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{background:'#FFFBEB'}}>🧑</div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold" style={{color:D}}>{d.name}</p>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{background:s.bg,color:s.c}}>
                    {d.status==='ON_DELIVERY'?'On delivery':'Online'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3" style={{borderTop:`0.5px solid #EEF0EA`}}>
                {[{l:'Deliveries',v:d.deliveries,color:D},{l:'Earned',v:`$${d.earnings.toFixed(2)}`,color:A},{l:'Rating',v:`★${d.rating}`,color:D}].map(x=>(
                  <div key={x.l} className="text-center">
                    <p className="text-[15px] font-bold" style={{color:x.color}}>{x.v}</p>
                    <p className="text-[9px]" style={{color:'#8A9A8A'}}>{x.l}</p>
                  </div>
                ))}
              </div>
            </div>
          );})}
        </div>}
      </div>
    </div>
  );
}
