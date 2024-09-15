const ProgressRing = ({ value, label, opposite }) => {
  const radius = 80;
  const centerX = 100;
  const centerY = 90;
  const circumference = Math.PI * radius;

  const progress = (value / 100) * circumference;

  const pathDescription = `
      M ${centerX - radius} ${centerY}
      A ${radius} ${radius} 0 0,1 ${centerX + radius} ${centerY}
    `;

  const endAngle = (progress / circumference) * Math.PI;
  const endX = centerX + radius * Math.cos(Math.PI + endAngle);
  const endY = centerY + radius * Math.sin(Math.PI + endAngle);

  const faceScanInstances = ["Excellent", "Good", "Poor"];
  const labelToDisplay = faceScanInstances.includes(label) ? label : `${label} risk`;

  return (
    <div className="relative mx-auto mobileN:h-[250px] mobileN:w-[250px] h-80 w-80">
      <div className={`${opposite ? "" : "inBetween:pl-10"}`}>
        <svg viewBox="15 0 170 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#013000" />
              <stop offset="50%" stopColor="#9CE452" />
              <stop offset="100%" stopColor="#339A31" />
            </linearGradient>
          </defs>
          <path d={pathDescription} stroke="#E7F4E7" strokeWidth="2" fill="none" />
          <path
            d={pathDescription}
            stroke="url(#grad1)"
            strokeWidth="2"
            fill="none"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={circumference - progress}
            className="transition-all duration-500"
          />
          <circle className="shadow-xl" cx={endX} cy={endY} r="4" fill="#fff" stroke="#f2f2f2" strokeWidth="0.5" />
        </svg>

        <div className={`absolute inset-0 flex items-center justify-center mt-9 ${opposite ? "mt-9" : "inBetween:pl-10 inBetween:mt-0"}`}>
          <div className="flex flex-col items-center justify-center mb-4 bg-white rounded-full shadow-xl w-[250px] h-[250px] inBetween:w-[225px] inBetween:h-[225px] mobileN:w-[200px] mobileN:h-[200px]">
            <div className="text-3xl font-grotesk text-[#339A31]">{labelToDisplay}</div>
            <div className="text-4xl mt-4 font-grotesk text-[#339A31]">{value}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressRing;
