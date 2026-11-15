import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:3001";

function formatTime(iso) {
  const d = new Date(iso);
  const day = d.toLocaleDateString("en-MY", { weekday: "short" });
  const time = d.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" });
  return day + " " + time;
}

function formatTime2(iso) {
  const d = new Date(iso);
  return d.getHours() + ":" + d.getMinutes();
}

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
      const res = await fetch(API_URL + "/api/members");
      const data = await res.json();
      setMembers(data);
    }
    loadMembers();
  }, []);

  useEffect(() => {
    async function loadClasses() {
      const res = await fetch(API_URL + "/api/classes");
      const data = await res.json();
      setClasses(data);
    }
    loadClasses();
  }, []);

  async function refreshData(email) {
    const res = await fetch(API_URL + "/api/classes");
    const data = await res.json();
    setClasses(data);
    const res2 = await fetch(API_URL + "/api/bookings/" + email);
    const data2 = await res2.json();
    setBookings(data2);
  }

  async function selectMember(value) {
    setEmail(value);
    await refreshData(value);
  }

  async function bookClass(classId) {
    try {
      const bookRes = await fetch(API_URL + "/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, classId: classId }),
      });
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
      const cancelRes = await fetch(API_URL + "/api/bookings/" + id, {
        method: "DELETE",
      });
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

function ClassCard({ cls, email, bookClass }) {
  const spotsLeft = cls.capacity - cls.booked;
  let label = spotsLeft + " spots left";
  if (spotsLeft === 0) {
    label = "Full";
  } else if (spotsLeft <= 3) {
    label = "Almost full! " + spotsLeft + " left";
  }
  return (
    <article>
      <h3>{cls.title}</h3>
      <p>
        {cls.coach}, {formatTime(cls.starts_at)}
      </p>
      <p>{label}</p>
      <BookButton classId={cls.id} email={email} bookClass={bookClass} />
    </article>
  );
}

function BookButton({ classId, email, bookClass }) {
  return (
    <button disabled={email === ""} onClick={() => bookClass(classId)}>
      Book
    </button>
  );
}

export default App;
