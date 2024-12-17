const ProgressRing = ({ value, label, opposite }) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  const progress = (value / 100) * circumference;

  return (
    <div className="relative mx-auto h-[200px] w-[200px]">
      <div className="ml-5">
        <svg viewBox="0 0 250 250" xmlns="http://www.w3.org/2000/svg" className="flex items-center justify-center mx-auto">
          {/* Background Circle */}
          <circle cx="125" cy="125" r="80" stroke="#F0F0F0" strokeWidth="16" fill="none" />
          {/* Progress Circle */}
          <circle
            cx="125"
            cy="125"
            r="80"
            strokeWidth="16"
            fill="none"
            stroke="#339A31"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            className="transition-all duration-500 rounded-xl"
            transform="rotate(-90 125 125)"
          />
        </svg>

        <div className="absolute inset-0 top-[72px] left-[20px]">
          <div className="flex flex-col items-center justify-center">
            <div className="text-4xl font-sourceSans text-[#339A31]">
              <b>{value}%</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressRing;
