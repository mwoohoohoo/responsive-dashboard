export default function Card({ children, bg = "bg-white" }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden ${bg} border-2 border-brand-aqua flex flex-col gap-6 p-6 items-start justify-between text-left`}
    >
      {children}
    </div>
  );
}
