export default function Card({ children, bg = "bg-white" }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden ${bg} border-2 border-brand-aqua flex flex-col gap-2 md:gap-3 p-4 xl:p-5 items-start justify-between text-left`}
    >
      {children}
    </div>
  );
}
