import { ClassCard } from "./ClassCard";

export function Schedule({ classes, day, setDay, email, bookClass }) {
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
