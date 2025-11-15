import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

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

const PAYMENT_OPTIONS = ["Ипотека", "Наличный", "Рассрочка", "Бартер"];

export default function AdminPanel() {
  const [cards, setCards] = useState([]);
  const [form, setForm] = useState({
    Название: "",
    Район: DISTRICTS[0],
    Тип_строительства: "монолит",
    Класс: "комфорт+",
    Состояние: "Черновая",
    Этажность: "",
    Потолок: "",
    Паркинг: false,
    Двор: "",
    Фасад: "",
    Окна: "",
    Коммерция: false,
    Способы: [],
    Цена: "",
    Шахматка: "",
    готов: false,
    скидка: "",
    срок_сдачи: "", // хранится как ISO строка для input
  });

  const cardsCollection = collection(db, "cards");

  // Получаем все карточки
  const fetchCards = async () => {
    const snapshot = await getDocs(cardsCollection);
    setCards(
      snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Преобразуем Firestore Timestamp в JS Date для рендера
          срок_сдачи: data.срок_сдачи ? data.срок_сдачи.toDate() : null,
        };
      })
    );
  };

  useEffect(() => {
    fetchCards();
  }, []);

  // Добавление карточки
  const addCard = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      Цена: Number(form.Цена),
      Этажность: Number(form.Этажность),
      Потолок: Number(form.Потолок),
      скидка: Number(form.скидка),
      // сохраняем как Firestore Timestamp
      срок_сдачи: form.срок_сдачи
        ? Timestamp.fromDate(new Date(form.срок_сдачи))
        : null,
    };

    await addDoc(cardsCollection, data);

    // сброс формы
    setForm({
      Название: "",
      Район: DISTRICTS[0],
      Тип_строительства: "монолит",
      Класс: "комфорт+",
      Состояние: "Черновая",
      Этажность: "",
      Потолок: "",
      Паркинг: false,
      Двор: "",
      Фасад: "",
      Окна: "",
      Коммерция: false,
      Способы: [],
      Цена: "",
      Шахматка: "",
      готов: false,
      скидка: "",
      срок_сдачи: "",
    });

    fetchCards();
  };

  // Удаление карточки
  const removeCard = async (id) => {
    await deleteDoc(doc(db, "cards", id));
    fetchCards();
  };

  const togglePayment = (method) => {
    setForm((prev) => ({
      ...prev,
      Способы: prev.Способы.includes(method)
        ? prev.Способы.filter((m) => m !== method)
        : [...prev.Способы, method],
    }));
  };

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>
      <h2>Admin Panel - Добавление карточки</h2>
      <a href="/">Выход</a>

      <form
        onSubmit={addCard}
        style={{ display: "flex", flexDirection: "column", gap: 10 }}
      >
        <input
          placeholder="Название"
          value={form.Название}
          onChange={(e) => setForm({ ...form, Название: e.target.value })}
        />

        <select
          value={form.Район}
          onChange={(e) => setForm({ ...form, Район: e.target.value })}
        >
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={form.Тип_строительства}
          onChange={(e) =>
            setForm({ ...form, Тип_строительства: e.target.value })
          }
        >
          <option value="монолит">Монолит</option>
          <option value="кирпич">Кирпич</option>
        </select>

        <select
          value={form.Класс}
          onChange={(e) => setForm({ ...form, Класс: e.target.value })}
        >
          <option value="стандарт">Стандарт</option>
          <option value="комфорт">Комфорт</option>
          <option value="комфорт+">Комфорт+</option>
          <option value="бизнес">Бизнес</option>
        </select>

        <select
          value={form.Состояние}
          onChange={(e) => setForm({ ...form, Состояние: e.target.value })}
        >
          <option value="Черновая">Черновая</option>
          <option value="Улучшенная черновая">Улучшенная черновая</option>
          <option value="Предчистовая">Предчистовая</option>
          <option value="Чистовая">Чистовая</option>
        </select>

        <input
          type="number"
          placeholder="Этажность"
          value={form.Этажность}
          onChange={(e) => setForm({ ...form, Этажность: e.target.value })}
        />
        <input
          type="number"
          placeholder="Потолок"
          value={form.Потолок}
          onChange={(e) => setForm({ ...form, Потолок: e.target.value })}
        />
        <input
          placeholder="Двор"
          value={form.Двор}
          onChange={(e) => setForm({ ...form, Двор: e.target.value })}
        />
        <input
          placeholder="Фасад"
          value={form.Фасад}
          onChange={(e) => setForm({ ...form, Фасад: e.target.value })}
        />
        <input
          placeholder="Окна"
          value={form.Окна}
          onChange={(e) => setForm({ ...form, Окна: e.target.value })}
        />
        <input
          type="number"
          placeholder="Цена"
          value={form.Цена}
          onChange={(e) => setForm({ ...form, Цена: e.target.value })}
        />
        <input
          placeholder="Шахматка (URL)"
          value={form.Шахматка}
          onChange={(e) => setForm({ ...form, Шахматка: e.target.value })}
        />
        <input
          type="number"
          placeholder="Скидка %"
          value={form.скидка}
          onChange={(e) => setForm({ ...form, скидка: e.target.value })}
        />
        <input
          type="datetime-local"
          value={form.срок_сдачи}
          onChange={(e) => setForm({ ...form, срок_сдачи: e.target.value })}
        />

        <label>
          <input
            type="checkbox"
            checked={form.Parкинг}
            onChange={(e) => setForm({ ...form, Паркинг: e.target.checked })}
          />{" "}
          Паркинг
        </label>
        <label>
          <input
            type="checkbox"
            checked={form.Коммерция}
            onChange={(e) =>
              setForm({ ...form, Коммерция: e.target.checked })
            }
          />{" "}
          Коммерция
        </label>
        <label>
          <input
            type="checkbox"
            checked={form.готов}
            onChange={(e) => setForm({ ...form, готов: e.target.checked })}
          />{" "}
          Готов
        </label>

        <div>
          <p>Способы оплаты:</p>
          {PAYMENT_OPTIONS.map((method) => (
            <label key={method} style={{ marginRight: 10 }}>
              <input
                type="checkbox"
                checked={form.Способы.includes(method)}
                onChange={() => togglePayment(method)}
              />{" "}
              {method}
            </label>
          ))}
        </div>

        <button type="submit">Добавить карточку</button>
      </form>

      <hr style={{ margin: "20px 0" }} />

      <h3>Список карточек</h3>
      {cards.map((card) => (
        <div
          key={card.id}
          style={{
            border: "1px solid #ccc",
            borderRadius: 10,
            padding: 10,
            marginBottom: 10,
          }}
        >
          <strong>{card.Название}</strong> - {card.Класс} - {card.Район} -{" "}
          {card.Цена}₸
          <div>Срок сдачи: {card.срок_сдачи ? card.срок_сдачи.toLocaleDateString() : "-"}</div>
          <div>
            <button
              onClick={() => removeCard(card.id)}
              style={{ marginTop: 5 }}
            >
              Удалить
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
