import React, { useEffect, useMemo, useState } from "react";
import {
   BrowserRouter,
   Routes,
   Route,
   Link,
   useParams,
} from "react-router-dom";
import AdminPanel from "../AdminPanel";
import { useApartments } from "../fetcher";


const DISTRICTS = [
   "Зеленый квартал",
   "Талдыкол",
   "Экспо",
   "Мечеть",
   "Нурлы жол",
   "Выше по Айтматова",
   "Сфера Парк",
   "Туран",
   "Улы Дала",
   "Выше Нурлы жол",
];
const CONSTRUCTION_TYPES = ["кирпич", "монолит"];
const CLASSES = ["стандарт", "комфорт", "комфорт+", "бизнес"];
const STATES = ["Черновая", "Улучшенная черновая", "Предчистовая", "Чистовая"];
const PAYMENT_OPTIONS = [
   "ст.Ипотека",
   "Отбасы 30/70",
   "Отбасы 50/50",
   "Отсрочка",
   "Рассрочка",
   "парт. Ипотека",
   "7-20-25",
   "Наурыз",
   "Зеленая отбасы",
   "Trade in",
];

function useFilters(data) {
   const [query, setQuery] = useState("");
   const [district, setDistrict] = useState("");
   const [construction, setConstruction] = useState("");
   const [klass, setKlass] = useState("");
   const [state, setState] = useState("");
   const [minPrice, setMinPrice] = useState(0);
   const [maxPrice, setMaxPrice] = useState(1_000_000_000);
   const [paymentMethods, setPaymentMethods] = useState([]);
   const [readyOnly, setReadyOnly] = useState(false);
   const [commerceOnly, setCommerceOnly] = useState(false);
   const [parkingOnly, setParkingOnly] = useState(false);

   const filtered = useMemo(() => {
      return data.filter((item) => {
         if (
            query &&
            !item.Название.toLowerCase().includes(query.toLowerCase())
         )
            return false;
         if (district && item.Район !== district) return false;
         if (construction && item.Тип_строительства !== construction)
            return false;
         if (klass && item.Класс !== klass) return false;
         if (state && item.Состояние !== state) return false;
         const price = Number(item.Цена) || 0;
         if (price < minPrice || price > maxPrice) return false;

         if (readyOnly && !item.готов) return false;
         if (commerceOnly && !item.Коммерция) return false;
         if (parkingOnly && !item.Паркинг) return false;
         if (paymentMethods.length > 0) {
            const payments = item.Способы || [];
            for (let pm of paymentMethods) {
               if (!payments.includes(pm)) return false;
            }
         }

         return true;
      });
   }, [
      data,
      query,
      district,
      construction,
      klass,
      state,
      minPrice,
      maxPrice,
      paymentMethods,
      readyOnly,
      commerceOnly,
      parkingOnly,
   ]);

   return {
      query,
      setQuery,
      district,
      setDistrict,
      construction,
      setConstruction,
      klass,
      setKlass,
      state,
      setState,
      minPrice,
      setMinPrice,
      maxPrice,
      setMaxPrice,
      paymentMethods,
      setPaymentMethods,
      readyOnly,
      setReadyOnly,
      commerceOnly,
      setCommerceOnly,
      parkingOnly,
      setParkingOnly,
      filtered,
   };
}

function SidebarFilters({ filters }) {
   const togglePayment = (pm) => {
      if (filters.paymentMethods.includes(pm)) {
         filters.setPaymentMethods(
            filters.paymentMethods.filter((p) => p !== pm)
         );
      } else {
         filters.setPaymentMethods([...filters.paymentMethods, pm]);
      }
   };

   const selectClass = "w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer hover:border-gray-300";
   const labelClass = "block text-sm font-medium text-gray-600 mb-1.5";
   const checkboxClass = "w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer";

   return (
      <aside className="w-80 bg-gradient-to-b from-slate-50 to-white border-r border-gray-100 h-screen sticky top-0 overflow-auto shadow-sm">
         <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
               </div>
               <h2 className="text-xl font-bold text-gray-800">Фильтры</h2>
            </div>

            <div className="relative mb-5">
               <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
               <input
                  value={filters.query}
                  onChange={(e) => filters.setQuery(e.target.value)}
                  placeholder="Поиск по названию..."
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
               />
            </div>

            <div className="space-y-4">
               <div>
                  <label className={labelClass}>Район</label>
                  <select
                     value={filters.district}
                     onChange={(e) => filters.setDistrict(e.target.value)}
                     className={selectClass}
                  >
                     <option value="">Все районы</option>
                     {DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                     ))}
                  </select>
               </div>

               <div>
                  <label className={labelClass}>Тип строительства</label>
                  <select
                     value={filters.construction}
                     onChange={(e) => filters.setConstruction(e.target.value)}
                     className={selectClass}
                  >
                     <option value="">Любой тип</option>
                     {CONSTRUCTION_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                     ))}
                  </select>
               </div>

               <div>
                  <label className={labelClass}>Класс жилья</label>
                  <select
                     value={filters.klass}
                     onChange={(e) => filters.setKlass(e.target.value)}
                     className={selectClass}
                  >
                     <option value="">Все классы</option>
                     {CLASSES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                     ))}
                  </select>
               </div>

               <div>
                  <label className={labelClass}>Состояние</label>
                  <select
                     value={filters.state}
                     onChange={(e) => filters.setState(e.target.value)}
                     className={selectClass}
                  >
                     <option value="">Любое состояние</option>
                     {STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                     ))}
                  </select>
               </div>

               <div>
                  <label className={labelClass}>Цена за м²</label>
                  <div className="flex gap-2">
                     <input
                        type="number"
                        placeholder="От"
                        value={filters.minPrice || ""}
                        onChange={(e) =>
                           filters.setMinPrice(e.target.value ? Number(e.target.value) : 0)
                        }
                        className="w-1/2 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                     />
                     <input
                        type="number"
                        placeholder="До"
                        value={filters.maxPrice === 1_000_000_000 ? "" : filters.maxPrice}
                        onChange={(e) =>
                           filters.setMaxPrice(e.target.value ? Number(e.target.value) : 1_000_000_000)
                        }
                        className="w-1/2 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                     />
                  </div>
               </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
               <label className={labelClass}>Способы оплаты</label>
               <div className="space-y-2 max-h-40 overflow-auto">
                  {PAYMENT_OPTIONS.map((pm) => (
                     <label key={pm} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                           type="checkbox"
                           checked={filters.paymentMethods.includes(pm)}
                           onChange={() => togglePayment(pm)}
                           className={checkboxClass}
                        />
                        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{pm}</span>
                     </label>
                  ))}
               </div>
            </div>

            <div className="mt-5 p-4 bg-blue-50 rounded-xl space-y-3">
               <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                     type="checkbox"
                     checked={filters.readyOnly}
                     onChange={(e) => filters.setReadyOnly(e.target.checked)}
                     className={checkboxClass}
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Только готовые</span>
               </label>
               <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                     type="checkbox"
                     checked={filters.commerceOnly}
                     onChange={(e) => filters.setCommerceOnly(e.target.checked)}
                     className={checkboxClass}
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">С коммерцией</span>
               </label>
               <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                     type="checkbox"
                     checked={filters.parkingOnly}
                     onChange={(e) => filters.setParkingOnly(e.target.checked)}
                     className={checkboxClass}
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">С паркингом</span>
               </label>
            </div>

            <button
               onClick={() => {
                  filters.setQuery("");
                  filters.setDistrict("");
                  filters.setConstruction("");
                  filters.setKlass("");
                  filters.setState("");
                  filters.setMinPrice(0);
                  filters.setMaxPrice(1_000_000_000);
                  filters.setPaymentMethods([]);
                  filters.setReadyOnly(false);
                  filters.setCommerceOnly(false);
                  filters.setParkingOnly(false);
               }}
               className="mt-5 w-full py-3 px-4 bg-white border-2 border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-2"
            >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
               </svg>
               Сбросить фильтры
            </button>
         </div>
      </aside>
   );
}

function Card({ item, updateApartment }) {
   const [editing, setEditing] = useState(false);
   const [comment, setComment] = useState(item.comment || "");

   const handleSave = (e) => {
      e.stopPropagation();
      if (typeof updateApartment !== "function") {
         alert("Ошибка: updateApartment не передан");
         return;
      }
      updateApartment(item.id, { comment });
      setEditing(false);
   };

   const classColors = {
      "стандарт": "bg-gray-100 text-gray-700",
      "комфорт": "bg-blue-100 text-blue-700",
      "комфорт+": "bg-purple-100 text-purple-700",
      "бизнес": "bg-amber-100 text-amber-700",
   };

   return (
      <div className="group relative">
         <Link
            to={`/${item.id}`}
            className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200"
         >
            <div className={`h-2 ${item.готов ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gradient-to-r from-orange-400 to-red-500'}`} />

            <div className="p-5">
               <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                     {item.Название}
                  </h3>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${classColors[item.Класс] || 'bg-gray-100 text-gray-700'}`}>
                     {item.Класс}
                  </span>
               </div>

               <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{item.Район}</span>
               </div>

               <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                     {(item.Цена ?? 0).toLocaleString()}
                  </span>
                  <span className="text-gray-500 text-sm">тг/м²</span>
               </div>

               <div className="flex flex-wrap gap-2 mb-4">
                  {item.Паркинг && (
                     <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg text-xs text-slate-600">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        Паркинг
                     </span>
                  )}
                  {item.Коммерция && (
                     <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg text-xs text-slate-600">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Коммерция
                     </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg text-xs text-slate-600">
                     {item.Тип_строительства}
                  </span>
               </div>

               <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${item.готов ? 'text-emerald-600' : 'text-orange-600'}`}>
                     <span className={`w-2 h-2 rounded-full ${item.готов ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                     {item.готов ? "Готов к заселению" : "Строится"}
                  </span>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
               </div>

               {item.comment && !editing && (
                  <div className="mt-4 p-3 bg-amber-50 rounded-xl text-sm text-amber-800 border border-amber-100">
                     {item.comment}
                  </div>
               )}
            </div>
         </Link>

         <button
            onClick={(e) => {
               e.preventDefault();
               e.stopPropagation();
               setEditing(!editing);
            }}
            className="absolute top-5 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md opacity-0 group-hover:opacity-100 hover:bg-amber-50 transition-all duration-200"
            title="Добавить комментарий"
         >
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
         </button>

         {editing && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 p-4 rounded-xl shadow-xl z-10">
               <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Введите комментарий..."
               />
               <div className="mt-3 flex gap-2">
                  <button
                     onClick={handleSave}
                     className="flex-1 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                     Сохранить
                  </button>
                  <button
                     onClick={() => {
                        setEditing(false);
                        setComment(item.comment || "");
                     }}
                     className="flex-1 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                     Отмена
                  </button>
               </div>
            </div>
         )}
      </div>
   );
}

function ListPage({ data, updateApartment }) {
   const filters = useFilters(data);

   return (
      <div className="flex min-h-screen bg-gray-50">
         <SidebarFilters filters={filters} />

         <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
               <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                     <h1 className="text-3xl font-bold text-gray-900">Жилые комплексы</h1>
                     <p className="mt-1 text-gray-500">Найдите идеальную квартиру в Астане</p>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
                     <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                     </svg>
                     <span className="text-gray-600">Найдено:</span>
                     <span className="font-bold text-gray-900">{filters.filtered.length}</span>
                  </div>
               </div>

               {filters.filtered.length === 0 ? (
                  <div className="text-center py-16">
                     <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                     </div>
                     <h3 className="text-xl font-semibold text-gray-900 mb-2">Ничего не найдено</h3>
                     <p className="text-gray-500">Попробуйте изменить параметры фильтрации</p>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                     {filters.filtered.map((item) => (
                        <Card
                           key={item.id}
                           item={item}
                           updateApartment={updateApartment}
                        />
                     ))}
                  </div>
               )}
            </div>
         </main>
      </div>
   );
}


function DetailPage({ data }) {
   const { id } = useParams();
   const item = data.find((d) => String(d.id) === id);

   if (!item)
      return (
         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
               <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
               </div>
               <h3 className="text-xl font-semibold text-gray-900 mb-2">Объект не найден</h3>
               <Link to="/" className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Вернуться к списку
               </Link>
            </div>
         </div>
      );

   const classColors = {
      "стандарт": "bg-gray-100 text-gray-700",
      "комфорт": "bg-blue-100 text-blue-700",
      "комфорт+": "bg-purple-100 text-purple-700",
      "бизнес": "bg-amber-100 text-amber-700",
   };

   return (
      <div className="min-h-screen bg-gray-50">
         <div className={`h-3 ${item.готов ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gradient-to-r from-orange-400 to-red-500'}`} />

         <div className="max-w-6xl mx-auto px-6 py-8">
            <Link
               to="/"
               className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors mb-6"
            >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
               </svg>
               Вернуться к списку
            </Link>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-8 border-b border-gray-100">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                     <div>
                        <div className="flex items-center gap-3 mb-3">
                           <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${classColors[item.Класс] || 'bg-gray-100 text-gray-700'}`}>
                              {item.Класс}
                           </span>
                           <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${item.готов ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                              <span className={`w-2 h-2 rounded-full ${item.готов ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                              {item.готов ? "Готов" : "Строится"}
                           </span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.Название}</h1>
                        <div className="flex items-center gap-2 text-gray-500">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                           </svg>
                           <span>{item.Район} | {item.Тип_строительства}</span>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">Цена за м²</div>
                        <div className="text-3xl font-bold text-gray-900">
                           {(Number(item.Цена) || 0).toLocaleString()} <span className="text-lg text-gray-500">тг</span>
                        </div>
                        {item.скидка > 0 && (
                           <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                              Скидка до {item.скидка}%
                           </div>
                        )}
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                  <div className="space-y-6">
                     <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                           <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                           </svg>
                           Способы оплаты
                        </h3>
                        <div className="flex flex-wrap gap-2">
                           {(item.Способы || []).map((p) => (
                              <span key={p} className="px-3 py-1.5 bg-white rounded-lg text-sm text-gray-700 shadow-sm">
                                 {p}
                              </span>
                           ))}
                        </div>
                     </div>

                     <div className="bg-gray-50 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                           <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                           Общая информация
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                 <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                 </svg>
                              </div>
                              <div>
                                 <div className="text-xs text-gray-500">Срок сдачи</div>
                                 <div className="font-semibold text-gray-900">
                                    {item.срок_сдачи ? item.срок_сдачи.toDate().toLocaleDateString() : "-"}
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                 <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                 </svg>
                              </div>
                              <div>
                                 <div className="text-xs text-gray-500">Коммерция</div>
                                 <div className="font-semibold text-gray-900">{item.Коммерция ? "Есть" : "Нет"}</div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div className="bg-gray-50 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                           <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                           </svg>
                           Технические характеристики
                        </h3>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                           <div className="flex justify-between items-center py-2 border-b border-gray-200">
                              <span className="text-gray-600">Состояние</span>
                              <span className="font-medium text-gray-900">{item.Состояние}</span>
                           </div>
                           <div className="flex justify-between items-center py-2 border-b border-gray-200">
                              <span className="text-gray-600">Этажность</span>
                              <span className="font-medium text-gray-900">{item.Этажность}</span>
                           </div>
                           <div className="flex justify-between items-center py-2 border-b border-gray-200">
                              <span className="text-gray-600">Потолки</span>
                              <span className="font-medium text-gray-900">{item.Потолок} м</span>
                           </div>
                           <div className="flex justify-between items-center py-2 border-b border-gray-200">
                              <span className="text-gray-600">Паркинг</span>
                              <span className={`font-medium ${item.Паркинг ? 'text-emerald-600' : 'text-gray-900'}`}>
                                 {item.Паркинг ? "Есть" : "Нет"}
                              </span>
                           </div>
                           <div className="flex justify-between items-center py-2 border-b border-gray-200">
                              <span className="text-gray-600">Фасад</span>
                              <span className="font-medium text-gray-900">{item.Фасад}</span>
                           </div>
                           <div className="flex justify-between items-center py-2 border-b border-gray-200">
                              <span className="text-gray-600">Окна</span>
                              <span className="font-medium text-gray-900">{item.Окна}</span>
                           </div>
                           <div className="flex justify-between items-center py-2 border-b border-gray-200">
                              <span className="text-gray-600">Двор</span>
                              <span className="font-medium text-gray-900">{item.Двор}</span>
                           </div>
                        </div>
                     </div>

                     <div className="bg-emerald-50 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                           <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                           </svg>
                           Инфраструктура
                        </h3>
                        <div className="space-y-3">
                           <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                              <span className="text-gray-600">Ближайшая школа</span>
                              <span className="font-medium text-gray-900">{item.Ближайшая_школа} м</span>
                           </div>
                           <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                              <span className="text-gray-600">Ближайший садик</span>
                              <span className="font-medium text-gray-900">{item.Ближайший_садик} м</span>
                           </div>
                           <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                              <span className="text-gray-600">ТРЦ</span>
                              <span className="font-medium text-gray-900">{item.ТРЦ} м</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="px-8 pb-8">
                  <div className="flex flex-wrap gap-4">
                     {item.Шахматка && (
                        <a
                           href={item.Шахматка}
                           target="_blank"
                           rel="noreferrer"
                           className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
                        >
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                           </svg>
                           Открыть шахматку
                        </a>
                     )}
                     {item.Презентация && (
                        <a
                           href={item.Презентация}
                           target="_blank"
                           rel="noreferrer"
                           className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                        >
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                           </svg>
                           Скачать презентацию
                        </a>
                     )}
                  </div>

                  {item.comment && (
                     <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <div className="flex items-center gap-2 text-amber-800 font-medium mb-2">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                           </svg>
                           Комментарий
                        </div>
                        <p className="text-amber-900">{item.comment}</p>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}

export default function App() {
   const { apartments: fetchedApartments, loading } = useApartments();
   const [apartments, setApartments] = useState([]);

   useEffect(() => {
      if (fetchedApartments && fetchedApartments.length) {
         setApartments(fetchedApartments);
      }
   }, [fetchedApartments]);

   const updateApartment = (id, updatedFields) => {
      setApartments((prev) =>
         prev.map((apt) => (apt.id === id ? { ...apt, ...updatedFields } : apt))
      );
   };

   if (loading) return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
         <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-gray-600 font-medium">Загрузка объектов...</p>
         </div>
      </div>
   );

   if (!apartments.length) return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
         <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
               <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
               </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Нет объектов для отображения</h3>
            <p className="text-gray-500">Добавьте объекты через панель администратора</p>
         </div>
      </div>
   );

   return (
      <BrowserRouter>
         <Link
            to="/admin"
            className="fixed bottom-6 right-6 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-full shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 z-50"
         >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Админка
         </Link>

         <Routes>
            <Route
               path="/"
               element={
                  <ListPage
                     data={apartments}
                     updateApartment={updateApartment}
                  />
               }
            />
            <Route
               path="/:id"
               element={
                  <DetailPage
                     data={apartments}
                     updateApartment={updateApartment}
                  />
               }
            />
            <Route path="/admin" element={<AdminPanel />} />
         </Routes>
      </BrowserRouter>
   );
}
