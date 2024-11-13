import { prisma } from "@/lib/prisma";
import CountChart from "./CountChart";

const CountChartContainer = async () => {
  const data = await prisma.pet.groupBy({
    by: ["sex"],
    _count: true,
  });

  const male = data.find((d) => d.sex === "male")?._count || 0;
  const female = data.find((d) => d.sex === "female")?._count || 0;

  return (
    <div className="bg-white rounded-xl w-full h-full p-4 shadow-lg">
      {/* TITLE */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Pets</h1>
      </div>
      {/* CHART */}
      <CountChart male={male} female={female} />
      {/* BOTTOM */}
      <div className="flex justify-center gap-16">
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-mainColor-400 rounded-full" />
          <h1 className="font-bold">{male}</h1>
          <h2 className="text-xs text-gray-300">
            Male ({Math.round((male / (male + female)) * 100)}%)
          </h2>
        </div>
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-mainColor-light rounded-full" />
          <h1 className="font-bold">{female}</h1>
          <h2 className="text-xs text-gray-300">
            Female ({Math.round((female / (male + female)) * 100)}%)
          </h2>
        </div>
      </div>
    </div>
  );
};

export default CountChartContainer;
