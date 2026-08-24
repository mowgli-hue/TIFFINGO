'use client';
import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal } from 'lucide-react';
import NavBar from '@/components/NavBar';
import KitchenCard from '@/components/KitchenCard';
import { CATEGORIES } from '@/lib/mock-data';
import { useKitchens } from '@/lib/kitchens';
import clsx from 'clsx';

const SORT_OPTIONS = ['Recommended', 'Highest rated', 'Fastest delivery', 'Price: low to high'];

function ExplorePage() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(
    filterParam === 'tiffin' ? 'Tiffin plans' : filterParam === 'restaurant' ? 'Indian' : 'All'
  );
  const [sort, setSort] = useState('Recommended');
  const [showSort, setShowSort] = useState(false);

  const { kitchens, loading, failed } = useKitchens('Surrey');

  const results = useMemo(() => {
    let list = [...kitchens];
    if (category === 'Tiffin plans') list = list.filter(k => k.type === 'tiffin');
    else if (category === 'Healthy')    list = list.filter(k => ['Healthy', 'Vegan'].includes(k.cuisine));
    else if (category === 'Indian')     list = list.filter(k => ['Indian', 'Punjabi', 'Pakistani'].includes(k.cuisine));
    else if (category === 'Halal')      list = list.filter(k => k.isHalal);
    else if (category === 'Vegetarian') list = list.filter(k => k.isVeg);
    else if (category === 'Vegan')      list = list.filter(k => k.cuisine === 'Vegan');

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(k => k.name.toLowerCase().includes(q) || k.cuisine.toLowerCase().includes(q));
    }

    if (sort === 'Highest rated')         list.sort((a, b) => b.rating - a.rating);
    else if (sort === 'Price: low to high') list.sort((a, b) => (a.pricePerMeal ?? 0) - (b.pricePerMeal ?? 0));

    return list;
  }, [kitchens, search, category, sort]);

  return (
    <div className="min-h-screen bg-[#F5F5F0] pb-24">
      <div className="px-5 pt-14 pb-4">
        <h1 className="font-serif text-[22px] text-[#1A3A2A] mb-4">Explore</h1>

        {/* Search + filter row */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 flex items-center gap-2 bg-white border border-[#D8DDD0] rounded-xl px-3 py-2.5">
            <Search size={14} className="text-[#B4B2A9] flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search kitchens..."
              className="flex-1 text-[13px] placeholder-[#B4B2A9] bg-transparent border-none outline-none"
            />
          </div>
          <button
            onClick={() => setShowSort(!showSort)}
            className="w-10 h-10 bg-white border border-[#D8DDD0] rounded-xl flex items-center justify-center"
          >
            <SlidersHorizontal size={15} className="text-[#5F5E5A]" />
          </button>
        </div>

        {/* Sort dropdown */}
        {showSort && (
          <div className="mb-3 card overflow-hidden">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => { setSort(opt); setShowSort(false); }}
                className={clsx(
                  'w-full px-4 py-2.5 text-left text-[13px] border-b border-[#F1EFE8] last:border-0 transition-colors',
                  sort === opt ? 'text-[#1A3A2A] font-medium bg-[#FFF8F4]' : 'text-[#5F5E5A]'
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={clsx(
                'flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all',
                category === cat ? 'bg-[#1A3A2A] text-white border-[#1A3A2A]' : 'bg-white text-[#5F5E5A] border-[#D8DDD0]'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="px-5">
        {!loading && !failed && (
          <p className="text-[12px] text-[#8A9A8A] mb-3">
            {results.length} kitchen{results.length !== 1 ? 's' : ''} · sorted by {sort.toLowerCase()}
          </p>
        )}

        {loading && (
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl bg-white border border-[#D8DDD0] h-[190px] animate-pulse" />
            ))}
          </div>
        )}

        {failed && !loading && (
          <div className="text-center py-16">
            <p className="text-[14px] font-medium text-[#1A3A2A] mb-1">We can&rsquo;t load kitchens right now</p>
            <p className="text-[12px] text-[#8A9A8A] mb-4">Something went wrong on our side, not yours.</p>
            <button onClick={() => location.reload()}
              className="px-4 py-2 rounded-full text-[12.5px] font-semibold bg-[#043F28] text-white">
              Try again
            </button>
          </div>
        )}

        {!loading && !failed && (
          <div className="grid grid-cols-2 gap-3">
            {results.map(k => <KitchenCard key={k.id} kitchen={k} />)}
          </div>
        )}

        {!loading && !failed && results.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[14px] font-medium text-[#1A3A2A] mb-1">
              {kitchens.length === 0 ? 'No kitchens here yet' : 'Nothing found'}
            </p>
            <p className="text-[12px] text-[#8A9A8A]">
              {kitchens.length === 0
                ? 'We\u2019re signing up kitchens in Surrey now \u2014 check back soon.'
                : 'Try a different category or search term'}
            </p>
          </div>
        )}
      </div>

      <NavBar />
    </div>
  );
}

export default function ExplorePageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center"><p className="text-[#888780]">Loading...</p></div>}>
      <ExplorePage />
    </Suspense>
  );
}
