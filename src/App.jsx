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

// Sample data matching your schema (Russian field names kept for clarity)
const SAMPLE_DATA = [
   {
      id: 1,
      Название: "ЖК Солнечный",
      Район: "Центр",
      Тип_строительства: "монолит",
      Класс_жилья: "комфорт+",
      Шахматка: "https://example.com/shahmatka1.png",
      Цена_за_кв: 420000,
      Способы_оплаты: ["Ипотека", "Рассрочка", "Наличный"],
      Скидка: "до 5%",
      готов_или_нет: true,
      срок_сдачи: "2024-12-01",
      Коммерция: true,
      Состояние: "чистовая",
      Этажность: "12",
      Высота_потолков: 2.8,
      Паркинг: true,
      Фасад: "стекло",
      Окна: "на юг",
      Двор: "закрытый",
      Презентация: "https://example.com/pres1.pdf",
   },
   {
      id: 2,
      Название: "ЖК Набережный",
      Район: "Пригород",
      Тип_строительства: "кирпич",
      Класс_жилья: "комфорт",
      Шахматка: "https://example.com/shahmatka2.png",
      Цена_за_кв: 310000,
      Способы_оплаты: ["Рассрочка", "Наличный"],
      Скидка: "до 3%",
      готов_или_нет: false,
      срок_сдачи: "2026-03-15",
      Коммерция: false,
      Состояние: "черновая",
      Этажность: "9",
      Высота_потолков: 2.7,
      Паркинг: false,
      Фасад: "керамогранит",
      Окна: "на восток",
      Двор: "открытый",
      Презентация: "https://example.com/pres2.pdf",
   },
   {
      id: 3,
      Название: "ЖК Вершина",
      Район: "Северный",
      Тип_строительства: "монолит",
      Класс_жилья: "бизнес",
      Шахматка: "https://example.com/shahmatka3.png",
      Цена_за_кв: 620000,
      Способы_оплаты: ["Ипотека", "Наличный", "Рассрочка", "Бартер"],
      Скидка: "7%",
      готов_или_нет: false,
      срок_сдачи: "2025-08-01",
      Коммерция: true,
      Состояние: "предчистовая",
      Этажность: "20",
      Высота_потолков: 3.0,
      Паркинг: true,
      Фасад: "композит",
      Окна: "на запад",
      Двор: "ландшафтный",
      Презентация: "https://example.com/pres3.pdf",
   },
   // Добавьте больше объектов по необходимости
];

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
         // payment methods: require that item has all selected payment methods
         if (paymentMethods.length > 0) {
            const payments = item.Способы_оплаты || []; // безопасно
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

   return (
      <aside className="w-80 p-4 border-r h-screen sticky top-0 overflow-auto">
         <h2 className="text-xl font-semibold mb-3">Фильтры</h2>

         <input
            value={filters.query}
            onChange={(e) => filters.setQuery(e.target.value)}
            placeholder="По названию"
            className="w-full mb-3 p-2 rounded border"
         />

         <label className="block mb-2">
            Район
            <select
               value={filters.district}
               onChange={(e) => filters.setDistrict(e.target.value)}
               className="w-full p-2 rounded border mt-1"
            >
               <option value="">Все</option>
               {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                     {d}
                  </option>
               ))}
            </select>
         </label>

         <label className="block mb-2">
            Тип строительства
            <select
               value={filters.construction}
               onChange={(e) => filters.setConstruction(e.target.value)}
               className="w-full p-2 rounded border mt-1"
            >
               <option value="">Все</option>
               {CONSTRUCTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                     {t}
                  </option>
               ))}
            </select>
         </label>

         <label className="block mb-2">
            Класс жилья
            <select
               value={filters.klass}
               onChange={(e) => filters.setKlass(e.target.value)}
               className="w-full p-2 rounded border mt-1"
            >
               <option value="">Все</option>
               {CLASSES.map((c) => (
                  <option key={c} value={c}>
                     {c}
                  </option>
               ))}
            </select>
         </label>

         <label className="block mb-2">
            Состояние
            <select
               value={filters.state}
               onChange={(e) => filters.setState(e.target.value)}
               className="w-full p-2 rounded border mt-1"
            >
               <option value="">Все</option>
               {STATES.map((s) => (
                  <option key={s} value={s}>
                     {s}
                  </option>
               ))}
            </select>
         </label>

         <div className="mb-3">
            <div className="flex gap-2">
               <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) =>
                     filters.setMinPrice(
                        e.target.value ? Number(e.target.value) : 0
                     )
                  }
               />
               <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) =>
                     filters.setMaxPrice(
                        e.target.value ? Number(e.target.value) : Infinity
                     )
                  }
               />
            </div>
         </div>

         <div className="mb-3">
            <div className="font-medium">Способы оплаты</div>
            <div className="flex flex-col mt-1">
               {PAYMENT_OPTIONS.map((pm) => (
                  <label key={pm} className="inline-flex items-center gap-2">
                     <input
                        type="checkbox"
                        checked={filters.paymentMethods.includes(pm)}
                        onChange={() => togglePayment(pm)}
                     />
                     <span>{pm}</span>
                  </label>
               ))}
            </div>
         </div>

         <div className="flex flex-col gap-2">
            <label className="inline-flex items-center gap-2">
               <input
                  type="checkbox"
                  checked={filters.readyOnly}
                  onChange={(e) => filters.setReadyOnly(e.target.checked)}
               />{" "}
               Готовые
            </label>
            <label className="inline-flex items-center gap-2">
               <input
                  type="checkbox"
                  checked={filters.commerceOnly}
                  onChange={(e) => filters.setCommerceOnly(e.target.checked)}
               />{" "}
               Коммерция
            </label>
            <label className="inline-flex items-center gap-2">
               <input
                  type="checkbox"
                  checked={filters.parkingOnly}
                  onChange={(e) => filters.setParkingOnly(e.target.checked)}
               />{" "}
               Паркинг
            </label>
         </div>

         <div className="mt-4">
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
               className="px-3 py-2 rounded border mt-2 w-full"
            >
               Сбросить
            </button>
         </div>
      </aside>
   );
}

function Card({ item, updateApartment }) {
   const [editing, setEditing] = useState(false);
   const [comment, setComment] = useState(item.comment || "");

   const borderColor = item.готов ? "border-green-500" : "border-red-500";

   const handleSave = (e) => {
      e.stopPropagation(); // чтобы не срабатывал Link
      if (typeof updateApartment !== "function") {
         alert("Ошибка: updateApartment не передан");
         return;
      }

      updateApartment(item.id, { comment });
      setEditing(false);
      // alert("Комментарий сохранён ✅");
   };

   return (
      <div className="relative">
         <Link
            to={`/${item.id}`}
            className={`block border-2 ${borderColor} rounded p-4 hover:shadow-lg transition`}
         >
            <div className="text-lg font-semibold">{item.Название}</div>
            <div className="text-sm text-gray-600">
               {item.Класс} • {item.Район}
            </div>

            <div className="mt-2 text-xl font-bold">
               {(item.Цена ?? 0).toLocaleString()} тг/м²
            </div>

            <div
               className={`mt-2 text-sm font-medium ${
                  item.готов ? "text-green-600" : "text-red-600"
               }`}
            >
               {item.готов ? "Готов" : "Строится"}
            </div>

            {item.comment && !editing && (
               <div className="mt-3 text-sm text-gray-700 border-l-4 border-gray-300 pl-2">
                  💬 {item.comment}
               </div>
            )}
         </Link>

         {/* Кнопка редактирования */}
         <button
            onClick={(e) => {
               e.preventDefault(); // не перейти по Link
               e.stopPropagation();
               setEditing(!editing);
            }}
            className="
               absolute top-3 right-3 
               bg-yellow-400 hover:bg-yellow-500 
               text-black text-xs px-2 py-1 rounded shadow
            "
         >
            ✏️ Комментарий
         </button>

         {/* Форма редактирования */}
         {editing && (
            <div className="mt-2 bg-white border p-3 rounded shadow">
               <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                  rows={3}
                  placeholder="Введите комментарий..."
               />

               <div className="mt-2 flex gap-2">
                  <button
                     onClick={handleSave}
                     className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700"
                  >
                     Сохранить
                  </button>

                  <button
                     onClick={() => {
                        setEditing(false);
                        setComment(item.comment || "");
                     }}
                     className="bg-gray-300 text-sm px-3 py-1 rounded hover:bg-gray-400"
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
      <div className="flex">
         <SidebarFilters filters={filters} />

         <main className="p-6 flex-1">
            <div className="mb-4 flex justify-between items-center">
               <h1 className="text-2xl font-bold">Объекты</h1>
               <div className="text-sm text-gray-600">
                  Найдено: {filters.filtered.length}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {filters.filtered.map((item) => (
                  <Card
                     key={item.id}
                     item={item}
                     updateApartment={updateApartment}
                  />
               ))}
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
         <div className="p-6">
            Объект не найден. <Link to="/">Назад</Link>
         </div>
      );

   return (
      <div className="p-6">
         <Link to="/" className="text-sm text-blue-600">
            ← Вернуться к списку
         </Link>
         <h1 className="text-2xl font-bold mt-4">{item.Название}</h1>
         <div className="mt-2 text-gray-600">
            {item.Район} • {item.Класс} • {item.Тип_строительства}
         </div>

         <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded p-4">
               <div className="font-medium">Цена за кв</div>
               <div className="text-xl font-bold">
                  {(Number(item.Цена) || 0).toLocaleString()} тг/м²
               </div>

               <div className="mt-3">
                  <div className="font-medium">Способы оплаты</div>
                  <ul className="list-disc pl-5">
                     {(item.Способы || []).map((p) => (
                        <li key={p}>{p}</li>
                     ))}
                  </ul>
               </div>

               <div className="mt-3">Скидка: {item.скидка}</div>
               <div>Готовность: {item.готов ? "Готов" : "Строится"}</div>
               <div>
                  Срок сдачи:{" "}
                  {item.срок_сдачи
                     ? item.срок_сдачи.toDate().toLocaleDateString()
                     : "-"}
               </div>

               <div>Коммерция: {item.Коммерция ? "Да" : "Нет"}</div>
            </div>

            <div className="border rounded p-4">
               <div className="font-medium">Технические данные</div>
               <div>Состояние: {item.Состояние}</div>
               <div>Этажность: {item.Этажность}</div>
               <div>Высота потолков: {item.Потолок} м</div>
               <div>Паркинг: {item.Паркинг ? "Есть" : "Нет"}</div>
               <div>Фасад: {item.Фасад}</div>
               <div>Окна: {item.Окна}</div>
               <div>Двор: {item.Двор}</div>
               <div>Ближайшая_школа: В {item.Ближайшая_школа} метрах</div>
               <div>Ближайший_садик: В {item.Ближайший_садик} метрах</div>
               <div>ТРЦ: В {item.ТРЦ} метрах</div>

               <div className="mt-3">
                  <a
                     href={item.Шахматка}
                     target="_blank"
                     rel="noreferrer"
                     className="block underline"
                  >
                     Открыть шахматку
                  </a>
                  <a
                     href={item.Презентация}
                     target="_blank"
                     rel="noreferrer"
                     className="block underline mt-1"
                  >
                     Скачать презентацию
                  </a>
               </div>
            </div>
            <div>{item.comment}</div>
         </div>
      </div>
   );
};

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
      // alert("Объект успешно обновлён!");
   };

   if (loading) return <div>Загрузка...</div>;
   if (!apartments.length) return <div>Нет объектов для отображения</div>;

   return (
      <BrowserRouter>
         {/* кнопка Admin */}
         <Link
            to="/admin"
            className="
           fixed bottom-6 right-6 
           bg-blue-600 text-white 
           px-5 py-3 
           rounded-full shadow-xl 
           hover:bg-blue-700 
           transition transform hover:scale-105 
           z-50
        "
         >
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
