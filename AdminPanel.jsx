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

export default function AdminPanel() {
   const [popup, setPopup] = useState("");
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
      срок_сдачи: "",
      comment: "",
      Ближайшая_школа: "", // <-- новое поле
      Ближайший_садик: "", // <-- новое поле
      ТРЦ: "",
   });

   const cardsCollection = collection(db, "cards");

   // -----------------------------
   // FETCH CARDS
   const fetchCards = async () => {
      const snapshot = await getDocs(cardsCollection);

      const sorted = snapshot.docs
         .map((doc) => {
            const data = doc.data();
            return {
               id: doc.id,
               ...data,
               срок_сдачи: data.срок_сдачи ? data.срок_сдачи.toDate() : null,
               createdAt: data.createdAt
                  ? data.createdAt.toDate()
                  : new Date(0),
            };
         })
         .sort((a, b) => b.createdAt - a.createdAt); // последние первыми

      setCards(sorted);
   };

   useEffect(() => {
      fetchCards();
   }, []);

   // -----------------------------
   // GENERATE 50 RANDOM CARDS
   const addRandomCards = async () => {
      for (let i = 0; i < 20; i++) {
         const data = {
            Название: `Проект ${Math.floor(Math.random() * 1000)}`,
            Район: DISTRICTS[Math.floor(Math.random() * DISTRICTS.length)],
            Тип_строительства: Math.random() > 0.5 ? "монолит" : "кирпич",
            Класс: ["стандарт", "комфорт", "комфорт+", "бизнес"][
               Math.floor(Math.random() * 4)
            ],
            Состояние: [
               "Черновая",
               "Улучшенная черновая",
               "Предчистовая",
               "Чистовая",
            ][Math.floor(Math.random() * 4)],
            Этажность: Math.floor(Math.random() * 20) + 5,
            Потолок: Math.floor(Math.random() * 5) + 2.5,
            Паркинг: Math.random() > 0.5,
            Двор: `Двор ${Math.floor(Math.random() * 10)}`,
            Фасад: `Фасад ${Math.floor(Math.random() * 10)}`,
            Окна: `Окна ${Math.floor(Math.random() * 10)}`,
            Коммерция: Math.random() > 0.5,
            Способы: PAYMENT_OPTIONS.filter(() => Math.random() > 0.7),
            Цена: Math.floor(Math.random() * 50_000_000) + 5_000_000,
            Шахматка: "",
            готов: Math.random() > 0.5,
            скидка: Math.floor(Math.random() * 30),
            срок_сдачи: Timestamp.fromDate(
               new Date(
                  Date.now() +
                     Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000
               )
            ),
            comment: `Комментарий ${Math.floor(Math.random() * 1000)}`,
            createdAt: Timestamp.now(),
            Ближайшая_школа: Math.floor(Math.random() * 20) + 5,
            Ближайший_садик: Math.floor(Math.random() * 20) + 5,
            ТРЦ: Math.floor(Math.random() * 20) + 5,
         };

         await addDoc(cardsCollection, data);
      }

      fetchCards();
      setPopup("20 случайных карточек добавлены!");
      setTimeout(() => setPopup(""), 3000);
   };

   // -----------------------------
   // ADD CARD
   const addCard = async (e) => {
      e.preventDefault();

      const data = {
         ...form,
         Цена: Number(form.Цена),
         Этажность: Number(form.Этажность),
         Потолок: Number(form.Потолок),
         скидка: Number(form.скидка),
         срок_сдачи: form.срок_сдачи
            ? Timestamp.fromDate(new Date(form.срок_сдачи))
            : null,
         createdAt: Timestamp.now(), // дата добавления
         Ближайшая_школа: form.Ближайшая_школа,
         Ближайший_садик: form.Ближайший_садик,
         ТРЦ: form.ТРЦ,
      };

      await addDoc(cardsCollection, data);

      setPopup(`${data.Название} добавлен!`);
      setTimeout(() => setPopup(""), 2000);

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
         comment: "",
      });

      fetchCards();
   };

   // -----------------------------
   // DELETE CARD
   const removeCard = async (id) => {
      await deleteDoc(doc(db, "cards", id));
      fetchCards();
   };

   const removeAllCards = async () => {

   const snapshot = await getDocs(cardsCollection);
   const deletePromises = snapshot.docs.map((docItem) =>
      deleteDoc(doc(db, "cards", docItem.id))
   );

   await Promise.all(deletePromises);
   fetchCards();
   setPopup("Все карточки удалены!");
   setTimeout(() => setPopup(""), 3000);
};


   // -----------------------------
   // TOGGLE PAYMENT
   const togglePayment = (method) => {
      setForm((prev) => ({
         ...prev,
         Способы: prev.Способы.includes(method)
            ? prev.Способы.filter((m) => m !== method)
            : [...prev.Способы, method],
      }));
   };

   return (
      <div
         style={{
            padding: "40px",
            maxWidth: "1100px",
            margin: "0 auto",
            fontFamily: "Arial, sans-serif",
            color: "#222",
         }}
      >
         <button
            onClick={addRandomCards}
            style={{
               marginTop: 20,
               padding: "12px",
               background: "#ff9800",
               border: "none",
               color: "white",
               fontSize: 16,
               borderRadius: 8,
               cursor: "pointer",
            }}
         >
            Добавить 20 случайных карточек
         </button>
         <button
   onClick={removeAllCards}
   style={{
      marginTop: 20,
      marginLeft: 10,
      padding: "12px",
      background: "#d9534f",
      border: "none",
      color: "white",
      fontSize: 16,
      borderRadius: 8,
      cursor: "pointer",
   }}
>
   Удалить все карточки
</button>


         {/* POPUP */}
         {popup && (
            <div
               style={{
                  position: "fixed",
                  top: "20px",
                  right: "20px",
                  background: "#4caf50",
                  color: "white",
                  padding: "14px 20px",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  fontSize: "15px",
                  zIndex: 9999,
                  opacity: popup ? 1 : 0,
                  transition: "opacity 0.3s",
               }}
            >
               {popup}
            </div>
         )}

         <h1 style={{ marginBottom: 20 }}>Admin Panel</h1>

         <a href="/" style={{ color: "#007bff" }}>
            ← Вернуться на сайт
         </a>

         {/* FORM */}
         <div
            style={{
               background: "#fff",
               padding: "25px",
               marginTop: 30,
               borderRadius: 12,
               boxShadow: "0 3px 15px rgba(0,0,0,0.1)",
            }}
         >
            <h2 style={{ marginBottom: 15 }}>Добавить карточку</h2>

            <form
               onSubmit={addCard}
               style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px 20px",
               }}
            >
               {/* LEFT COLUMN */}
               <input
                  placeholder="Название"
                  value={form.Название}
                  onChange={(e) =>
                     setForm({ ...form, Название: e.target.value })
                  }
                  style={inputStyle}
               />

               <select
                  value={form.Район}
                  onChange={(e) => setForm({ ...form, Район: e.target.value })}
                  style={inputStyle}
               >
                  {DISTRICTS.map((d) => (
                     <option key={d}>{d}</option>
                  ))}
               </select>

               <select
                  value={form.Тип_строительства}
                  onChange={(e) =>
                     setForm({ ...form, Тип_строительства: e.target.value })
                  }
                  style={inputStyle}
               >
                  <option value="монолит">Монолит</option>
                  <option value="кирпич">Кирпич</option>
               </select>

               <select
                  value={form.Класс}
                  onChange={(e) => setForm({ ...form, Класс: e.target.value })}
                  style={inputStyle}
               >
                  <option value="стандарт">Стандарт</option>
                  <option value="комфорт">Комфорт</option>
                  <option value="комфорт+">Комфорт+</option>
                  <option value="бизнес">Бизнес</option>
               </select>

               <select
                  value={form.Состояние}
                  onChange={(e) =>
                     setForm({ ...form, Состояние: e.target.value })
                  }
                  style={inputStyle}
               >
                  <option value="Черновая">Черновая</option>
                  <option value="Улучшенная черновая">
                     Улучшенная черновая
                  </option>
                  <option value="Предчистовая">Предчистовая</option>
                  <option value="Чистовая">Чистовая</option>
               </select>

               <input
                  type="number"
                  placeholder="Этажность"
                  value={form.Этажность}
                  onChange={(e) =>
                     setForm({ ...form, Этажность: e.target.value })
                  }
                  style={inputStyle}
               />

               <input
                  type="number"
                  placeholder="Потолок"
                  value={form.Потолок}
                  onChange={(e) =>
                     setForm({ ...form, Потолок: e.target.value })
                  }
                  style={inputStyle}
               />

               <input
                  placeholder="Двор"
                  value={form.Двор}
                  onChange={(e) => setForm({ ...form, Двор: e.target.value })}
                  style={inputStyle}
               />

               <input
                  placeholder="Фасад"
                  value={form.Фасад}
                  onChange={(e) => setForm({ ...form, Фасад: e.target.value })}
                  style={inputStyle}
               />

               <input
                  placeholder="Окна"
                  value={form.Окна}
                  onChange={(e) => setForm({ ...form, Окна: e.target.value })}
                  style={inputStyle}
               />

               <input
                  type="number"
                  placeholder="Цена"
                  value={form.Цена}
                  onChange={(e) => setForm({ ...form, Цена: e.target.value })}
                  style={inputStyle}
               />

               <input
                  placeholder="Шахматка (URL)"
                  value={form.Шахматка}
                  onChange={(e) =>
                     setForm({ ...form, Шахматка: e.target.value })
                  }
                  style={inputStyle}
               />

               <input
                  type="number"
                  placeholder="Скидка %"
                  value={form.скидка}
                  onChange={(e) => setForm({ ...form, скидка: e.target.value })}
                  style={inputStyle}
               />

               <input
                  type="datetime-local"
                  value={form.срок_сдачи}
                  onChange={(e) =>
                     setForm({ ...form, срок_сдачи: e.target.value })
                  }
                  style={inputStyle}
               />
               <input
                  placeholder="Ближайшая школа"
                  value={form.Ближайшая_школа}
                  onChange={(e) =>
                     setForm({ ...form, Ближайшая_школа: e.target.value })
                  }
                  style={inputStyle}
               />

               <input
                  placeholder="Ближайший садик"
                  value={form.Ближайший_садик}
                  onChange={(e) =>
                     setForm({ ...form, Ближайший_садик: e.target.value })
                  }
                  style={inputStyle}
               />

               <input
                  placeholder="ТРЦ"
                  value={form.ТРЦ}
                  onChange={(e) => setForm({ ...form, ТРЦ: e.target.value })}
                  style={inputStyle}
               />

               <textarea
                  placeholder="Комментарий"
                  value={form.comment}
                  onChange={(e) =>
                     setForm({ ...form, comment: e.target.value })
                  }
                  style={{ ...inputStyle, gridColumn: "1 / 3", height: 90 }}
               />

               {/* CHECKBOXES */}
               <div style={{ gridColumn: "1 / 3" }}>
                  <div style={{ marginBottom: 5, fontWeight: 600 }}>Опции:</div>

                  <label style={checkboxStyle}>
                     <input
                        type="checkbox"
                        checked={form.Паркинг}
                        onChange={(e) =>
                           setForm({ ...form, Паркинг: e.target.checked })
                        }
                     />
                     Паркинг
                  </label>

                  <label style={checkboxStyle}>
                     <input
                        type="checkbox"
                        checked={form.Коммерция}
                        onChange={(e) =>
                           setForm({ ...form, Коммерция: e.target.checked })
                        }
                     />
                     Коммерция
                  </label>

                  <label style={checkboxStyle}>
                     <input
                        type="checkbox"
                        checked={form.готов}
                        onChange={(e) =>
                           setForm({ ...form, готов: e.target.checked })
                        }
                     />
                     Готов
                  </label>
               </div>

               {/* PAYMENT OPTIONS */}
               <div style={{ gridColumn: "1 / 3" }}>
                  <p style={{ marginBottom: 5, fontWeight: 600 }}>
                     Способы оплаты:
                  </p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                     {PAYMENT_OPTIONS.map((method) => (
                        <label key={method} style={checkboxStyle}>
                           <input
                              type="checkbox"
                              checked={form.Способы.includes(method)}
                              onChange={() => togglePayment(method)}
                           />
                           {method}
                        </label>
                     ))}
                  </div>
               </div>

               <button
                  type="submit"
                  style={{
                     gridColumn: "1 / 3",
                     padding: "12px",
                     background: "#007bff",
                     border: "none",
                     color: "white",
                     fontSize: 16,
                     borderRadius: 8,
                     cursor: "pointer",
                  }}
               >
                  Добавить карточку
               </button>
            </form>
         </div>

         {/* CARDS LIST */}
         <h2 style={{ marginTop: 40, marginBottom: 10 }}>Список карточек</h2>

         <div
            style={{
               display: "grid",
               gridTemplateColumns: "1fr 1fr",
               gap: 20,
            }}
         >
            {cards.map((card) => (
               <div
                  key={card.id}
                  style={{
                     background: "#fff",
                     borderRadius: 12,
                     padding: 20,
                     boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  }}
               >
                  <h3 style={{ margin: 0 }}>{card.Название}</h3>

                  <div style={{ marginTop: 10, lineHeight: "22px" }}>
                     <div>
                        <strong>Класс:</strong> {card.Класс}
                     </div>
                     <div>
                        <strong>Район:</strong> {card.Район}
                     </div>
                     <div>
                        <strong>Цена:</strong> {card.Цена}₸
                     </div>

                     <div>
                        <strong>Срок сдачи:</strong>{" "}
                        {card.срок_сдачи
                           ? card.срок_сдачи.toLocaleDateString()
                           : "-"}
                     </div>

                     {card.comment && (
                        <div>
                           <strong>Комментарий:</strong> {card.comment}
                        </div>
                     )}
                  </div>

                  <button
                     onClick={() => removeCard(card.id)}
                     style={{
                        marginTop: 15,
                        padding: "10px",
                        background: "#d9534f",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                        width: "100%",
                     }}
                  >
                     Удалить
                  </button>
               </div>
            ))}
         </div>
      </div>
   );
}

const inputStyle = {
   padding: "10px 12px",
   border: "1px solid #ccc",
   borderRadius: 8,
   fontSize: 15,
};

const checkboxStyle = {
   display: "inline-flex",
   alignItems: "center",
   gap: 5,
   marginRight: 15,
};
