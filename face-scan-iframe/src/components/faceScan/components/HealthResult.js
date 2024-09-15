const HealthResult = ({ value, name }) => {
  return (
    <div className="flex items-center justify-between w-full mb-2">
      <div className="font-bold text-center capitalize text-[#8C8C8C]">{name}</div>
      <div className="font-bold text-right text-[#4B465C]">{value}</div>
    </div>
  );
};

export default HealthResult;
