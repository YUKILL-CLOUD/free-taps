import { prisma } from "@/lib/prisma";
import CountChart from "./CountChart";

const CountChartContainer = async () => {
  const data = await prisma.pet.groupBy({
    by: ["sex"],
    _count: true,
    where: {
      sex: { 
        in: ["male", "female", "Male", "Female"],
        mode: "insensitive",
      },
    },
  });

  const male = data.find((d) => d.sex?.toLowerCase() === "male" || d.sex?.toLowerCase() === "Male")?._count || 0;
  const female = data.find((d) => d.sex?.toLowerCase() === "female" || d.sex?.toLowerCase() === "Female")?._count || 0;

  const total = male + female;

  return (
    <div className="bg-white rounded-xl w-full h-full p-4 shadow-lg">
      {/* TITLE */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Pets Distribution</h1>
        <div className="text-sm text-gray-500">Total: {total}</div>
      </div>
      {/* CHART */}
      <CountChart male={male} female={female} />
      {/* BOTTOM */}
      <div className="flex justify-center gap-16">
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-mainColor-400 rounded-full" />
          <h1 className="font-bold">{male}</h1>
          <h2 className="text-xs text-gray-300">
            Male ({total > 0 ? Math.round((male / total) * 100) : 0}%)
          </h2>
        </div>
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-mainColor-light rounded-full" />
          <h1 className="font-bold">{female}</h1>
          <h2 className="text-xs text-gray-300">
            Female ({total > 0 ? Math.round((female / total) * 100) : 0}%)
          </h2>
        </div>
      </div>
    </div>
  );
};

export default CountChartContainer;
