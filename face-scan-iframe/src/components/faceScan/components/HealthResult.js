const HealthResult = ({ value, name }) => {
  return (
    <div className="flex items-end justify-between w-full mb-2">
      <div className="font-bold text-black capitalize text-end">{name}</div>
      <div className="font-bold text-right text-black">{value}</div>
    </div>
  );
};

export default HealthResult;
