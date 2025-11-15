import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

export function useApartments() {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const snapshot = await getDocs(collection(db, "cards")); // название коллекции из твоего AdminPanel
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setApartments(data);
        console.log("apartments:", data); // для отладки
      } catch (err) {
        console.error("Ошибка получения данных из Firebase:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { apartments, loading };
}
