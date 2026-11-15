import { formatTime } from "../utils";

export function ClassCard({ cls, email, bookClass }) {
  const spotsLeft = cls.capacity - cls.booked;
  let label = spotsLeft + " spots left";
  if (spotsLeft === 0) {
    label = "FULL";
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
