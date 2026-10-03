export default function StatCard({
  value,
  label,
  tone,
  revealAt,
  className = "",
  style,
}) {
  const tones = {
    lime: "bg-lime text-road",
    charcoal: "bg-charcoal text-white",
    sky: "bg-sky text-road",
    blaze: "bg-blaze text-road",
  };

  return (
    <div
      data-stat-card="true"
      data-reveal-at={revealAt}
      style={style}
      className={`flex flex-col justify-center gap-1.5 rounded-[14px] px-[20px] py-6 ${tones[tone]} ${className}`}
    >
      <span className="text-[34px] font-extrabold leading-none tracking-tight md:text-[48px]">
        {value}
      </span>
      <span className="text-[13px] leading-snug md:text-[15px]">{label}</span>
    </div>
  );
}
