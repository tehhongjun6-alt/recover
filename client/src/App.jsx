import { useState, useEffect } from "react";
import "./App.css";
import { getMembers, getClasses, getBookings, createBooking, deleteBooking } from "./api";
import { formatTime } from "./utils";
import { ClassCard } from "./components/ClassCard";

function App() {
  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState("");
  const [classes, setClasses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [day, setDay] = useState("All");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    async function loadMembers() {
      const data = await getMembers();
      setMembers(data);
    }
    loadMembers();
  }, []);

  useEffect(() => {
    async function loadClasses() {
      const data = await getClasses();
      setClasses(data);
    }
    loadClasses();
  }, []);

  async function refreshData(email) {
    const data = await getClasses();
    setClasses(data);
    const data2 = await getBookings(email);
    setBookings(data2);
  }

  async function selectMember(value) {
    setEmail(value);
    await refreshData(value);
  }

  async function bookClass(classId) {
    try {
      const bookRes = await createBooking(email, classId);
      if (!bookRes.ok) {
        const errorData = await bookRes.json();
        setToast({ text: errorData.error || "Something went wrong", type: "error" });
        return;
      }
      setToast({ text: "Booked!", type: "success" });
      await refreshData(email);
    } catch (err) {
      console.error(err);
      setToast({ text: "Something went wrong. Try again.", type: "error" });
    }
  }

  async function cancelBooking(id) {
    try {
      const cancelRes = await deleteBooking(id);
      if (!cancelRes.ok) {
        const errorData = await cancelRes.json();
        setToast({ text: errorData.error || "Something went wrong", type: "error" });
        return;
      }
      setToast({ text: "Cancelled", type: "success" });
      await refreshData(email);
    } catch (err) {
      console.error(err);
      setToast({ text: "Something went wrong. Try again.", type: "error" });
    }
  }

  let shown = classes;
  if (day !== "All") {
    shown = classes.filter(
      (c) => new Date(c.starts_at).toLocaleDateString("en-MY", { weekday: "short" }) === day
    );
  }

  return (
    <main>
      <h1>Sweatlah</h1>
      <label>
        Who are you?{" "}
        <select value={email} onChange={(e) => selectMember(e.target.value)}>
          <option value="">Pick your name</option>
          {members.map((m) => (
            <option key={m.email} value={m.email}>
              {m.name}
            </option>
          ))}
        </select>
      </label>

      <Schedule
        classes={shown}
        day={day}
        setDay={setDay}
        email={email}
        bookClass={bookClass}
      />

      <h2>My bookings</h2>
      {bookings.length === 0 && <p>No bookings yet.</p>}
      <ul>
        {bookings.map((b) => (
          <li key={b.id}>
            {b.title}, {formatTime(b.starts_at)}{" "}
            <button onClick={() => cancelBooking(b.id)}>Cancel</button>
          </li>
        ))}
      </ul>

      {toast && (
        <div className={"toast toast-" + toast.type} role="status">
          {toast.text}
        </div>
      )}
    </main>
  );
}

function Schedule({ classes, day, setDay, email, bookClass }) {
  const days = ["All", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return (
    <section>
      <h2>This week</h2>
      <div className="days">
        {days.map((d) => (
          <button key={d} onClick={() => setDay(d)} disabled={d === day}>
            {d}
          </button>
        ))}
      </div>
      {classes.map((c) => (
        <ClassCard key={c.id} cls={c} email={email} bookClass={bookClass} />
      ))}
    </section>
  );
}

export default App;
