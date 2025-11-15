import React, { useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useParams } from "react-router-dom";

// Sample data matching your schema (Russian field names kept for clarity)
const SAMPLE_DATA = [
  {
    id: 1,
    Название: "Four Seasons",
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
    Район: "Yhfknj",
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

const DISTRICTS = ["Ханшатыр", "Талдыкол", "Туран", "Ұлы дала", "Мечеть", "Expo", "Нұрлы жол", "Выше Нұрлы жол", "Әзірет Сұлтан", "Выше Айтматова"];
const CONSTRUCTION_TYPES = ["кирпич", "монолит"];
const CLASSES = ["стандарт", "комфорт", "комфорт+", "бизнес"];
const STATES = ["черновая", "улучшенная черновая", "предчистовая", "чистовая"];
const PAYMENT_METHODS = ["ст.Ипотека", "Рассрочка", "Наличный", "Отбасы", "Отсрочка", "Trade-in"];

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
      if (query && !item.Название.toLowerCase().includes(query.toLowerCase())) return false;
      if (district && item.Район !== district) return false;
      if (construction && item.Тип_строительства !== construction) return false;
      if (klass && item.Класс_жилья !== klass) return false;
      if (state && item.Состояние !== state) return false;
      if (item.Цена_за_кв < minPrice || item.Цена_за_кв > maxPrice) return false;
      if (readyOnly && !item.готов_или_нет) return false;
      if (commerceOnly && !item.Коммерция) return false;
      if (parkingOnly && !item.Паркинг) return false;
      // payment methods: require that item has all selected payment methods
      if (paymentMethods.length > 0) {
        for (let pm of paymentMethods) {
          if (!item.Способы_оплаты.includes(pm)) return false;
        }
      }
      return true;
    });
  }, [data, query, district, construction, klass, state, minPrice, maxPrice, paymentMethods, readyOnly, commerceOnly, parkingOnly]);

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
      filters.setPaymentMethods(filters.paymentMethods.filter((p) => p !== pm));
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
        <select value={filters.district} onChange={(e) => filters.setDistrict(e.target.value)} className="w-full p-2 rounded border mt-1">
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
        <select value={filters.construction} onChange={(e) => filters.setConstruction(e.target.value)} className="w-full p-2 rounded border mt-1">
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
        <select value={filters.klass} onChange={(e) => filters.setKlass(e.target.value)} className="w-full p-2 rounded border mt-1">
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
        <select value={filters.state} onChange={(e) => filters.setState(e.target.value)} className="w-full p-2 rounded border mt-1">
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
          <input type="number" value={filters.minPrice} onChange={(e) => filters.setMinPrice(Number(e.target.value))} className="p-2 rounded border w-1/2" placeholder="Мин" />
          <input type="number" value={filters.maxPrice} onChange={(e) => filters.setMaxPrice(Number(e.target.value))} className="p-2 rounded border w-1/2" placeholder="Макс" />
        </div>
      </div>

      <div className="mb-3">
        <div className="font-medium">Способы оплаты</div>
        <div className="flex flex-col mt-1">
          {PAYMENT_METHODS.map((pm) => (
            <label key={pm} className="inline-flex items-center gap-2">
              <input type="checkbox" checked={filters.paymentMethods.includes(pm)} onChange={() => togglePayment(pm)} />
              <span>{pm}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={filters.readyOnly} onChange={(e) => filters.setReadyOnly(e.target.checked)} /> Готовые
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={filters.commerceOnly} onChange={(e) => filters.setCommerceOnly(e.target.checked)} /> Коммерция
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={filters.parkingOnly} onChange={(e) => filters.setParkingOnly(e.target.checked)} /> Паркинг
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

function Card({ item }) {
  return (
    <Link to={`/${item.id}`} className="block border rounded p-4 hover:shadow">
      <div className="text-lg font-semibold">{item.Название}</div>
      <div className="text-sm text-gray-600">{item.Класс_жилья} • {item.Район}</div>
      <div className="mt-2 text-xl font-bold">{item.Цена_за_кв.toLocaleString()} тг/м²</div>
    </Link>
  );
}

function ListPage({ data }) {
  const filters = useFilters(data);

  return (
    <div className="flex">
      <SidebarFilters filters={filters} />

      <main className="p-6 flex-1">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Объекты</h1>
          <div className="text-sm text-gray-600">Найдено: {filters.filtered.length}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filters.filtered.map((item) => (
            <Card key={item.id} item={item} />
          ))}
        </div>
      </main>
    </div>
  );
}

function DetailPage({ data }) {
  const { id } = useParams();
  const item = data.find((d) => String(d.id) === id);
  if (!item) return <div className="p-6">Объект не найден. <Link to="/">Назад</Link></div>;

  return (
    <div className="p-6">
      <Link to="/" className="text-sm text-blue-600">← Вернуться к списку</Link>
      <h1 className="text-2xl font-bold mt-4">{item.Название}</h1>
      <div className="mt-2 text-gray-600">{item.Район} • {item.Класс_жилья} • {item.Тип_строительства}</div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded p-4">
          <div className="font-medium">Цена за кв</div>
          <div className="text-xl font-bold">{item.Цена_за_кв.toLocaleString()} тг/м²</div>

          <div className="mt-3">
            <div className="font-medium">Способы оплаты</div>
            <ul className="list-disc pl-5">
              {item.Способы_оплаты.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>

          <div className="mt-3">Скидка: {item.Скидка}</div>
          <div>Готовность: {item.готов_или_нет ? "Готов" : "Строится"}</div>
          <div>Срок сдачи: {item.срок_сдачи}</div>
          <div>Коммерция: {item.Коммерция ? "Да" : "Нет"}</div>
        </div>

        <div className="border rounded p-4">
          <div className="font-medium">Технические данные</div>
          <div>Состояние: {item.Состояние}</div>
          <div>Этажность: {item.Этажность}</div>
          <div>Высота потолков: {item.Высота_потолков} м</div>
          <div>Паркинг: {item.Паркинг ? "Есть" : "Нет"}</div>
          <div>Фасад: {item.Фасад}</div>
          <div>Окна: {item.Окна}</div>
          <div>Двор: {item.Двор}</div>

          <div className="mt-3">
            <a href={item.Шахматка} target="_blank" rel="noreferrer" className="block underline">Открыть шахматку</a>
            <a href={item.Презентация} target="_blank" rel="noreferrer" className="block underline mt-1">Скачать презентацию</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // In real project data should be loaded from API — here we keep local sample data
  const [data] = useState(SAMPLE_DATA);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ListPage data={data} />} />
        <Route path="/:id" element={<DetailPage data={data} />} />
      </Routes>
    </BrowserRouter>
  );
}
