import { HoleInfo } from "@/data/courses";

interface Props {
  holes: HoleInfo[];
  courseName: string;
}

export default function CourseScorecard({ holes, courseName }: Props) {
  const front = holes.slice(0, 9);
  const back = holes.slice(9, 18);

  const frontPar   = front.reduce((s, h) => s + h.par, 0);
  const backPar    = back.reduce((s, h) => s + h.par, 0);
  const frontYards = front.reduce((s, h) => s + h.yards, 0);
  const backYards  = back.reduce((s, h) => s + h.yards, 0);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="bg-[#1a3c2b] text-white px-4 py-2.5 flex items-center justify-between">
        <span className="font-semibold text-sm">{courseName}</span>
        <div className="flex gap-4 text-xs text-white/60">
          <span>Par <strong className="text-white">{frontPar + backPar}</strong></span>
          <span>{(frontYards + backYards).toLocaleString()} yds</span>
        </div>
      </div>

      {/* Mobile: two stacked tables */}
      <div className="md:hidden divide-y divide-gray-100">
        <MobileNine holes={front} label="OUT" total={{ par: frontPar, yards: frontYards }} />
        <MobileNine holes={back}  label="IN"  total={{ par: backPar,  yards: backYards  }} />
      </div>

      {/* Desktop: single full-width table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-center border-collapse text-[11px]">
          <thead>
            <tr className="bg-[#1a3c2b] text-white font-semibold">
              <td className="px-3 py-2 text-left w-14">Hole</td>
              {front.map((h) => <td key={h.hole} className="py-2 w-9">{h.hole}</td>)}
              <td className="px-2 py-2 font-bold bg-[#122b1f]">OUT</td>
              {back.map((h) => <td key={h.hole} className="py-2 w-9">{h.hole}</td>)}
              <td className="px-2 py-2 font-bold bg-[#122b1f]">IN</td>
              <td className="px-2 py-2 font-bold bg-[#0d1f16]">TOT</td>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-[#F5C842] text-[#1a3c2b] font-semibold">
              <td className="px-3 py-1.5 text-left">Par</td>
              {front.map((h) => <td key={h.hole} className="py-1.5">{h.par}</td>)}
              <td className="px-2 py-1.5 font-bold bg-[#e8b830]">{frontPar}</td>
              {back.map((h) => <td key={h.hole} className="py-1.5">{h.par}</td>)}
              <td className="px-2 py-1.5 font-bold bg-[#e8b830]">{backPar}</td>
              <td className="px-2 py-1.5 font-bold bg-[#daa820]">{frontPar + backPar}</td>
            </tr>
            <tr className="bg-white text-gray-500">
              <td className="px-3 py-1.5 text-left">Yards</td>
              {front.map((h) => <td key={h.hole} className="py-1.5">{h.yards}</td>)}
              <td className="px-2 py-1.5 font-semibold text-gray-700 bg-gray-50">{frontYards}</td>
              {back.map((h) => <td key={h.hole} className="py-1.5">{h.yards}</td>)}
              <td className="px-2 py-1.5 font-semibold text-gray-700 bg-gray-50">{backYards}</td>
              <td className="px-2 py-1.5 font-semibold text-gray-700 bg-gray-100">{frontYards + backYards}</td>
            </tr>
            <tr className="bg-gray-50 text-gray-400">
              <td className="px-3 py-1.5 text-left">SI</td>
              {front.map((h) => <td key={h.hole} className="py-1.5">{h.strokeIndex}</td>)}
              <td className="px-2 py-1.5 bg-gray-100" />
              {back.map((h) => <td key={h.hole} className="py-1.5">{h.strokeIndex}</td>)}
              <td className="px-2 py-1.5 bg-gray-100" />
              <td className="px-2 py-1.5 bg-gray-200" />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MobileNine({
  holes,
  label,
  total,
}: {
  holes: HoleInfo[];
  label: string;
  total: { par: number; yards: number };
}) {
  return (
    <table className="w-full text-center border-collapse text-[11px]">
      <thead>
        <tr className="bg-[#1a3c2b] text-white font-semibold">
          <td className="px-2 py-1.5 text-left w-12">Hole</td>
          {holes.map((h) => <td key={h.hole} className="py-1.5 w-8">{h.hole}</td>)}
          <td className="px-2 py-1.5 font-bold">{label}</td>
        </tr>
      </thead>
      <tbody>
        <tr className="bg-[#F5C842] text-[#1a3c2b] font-semibold">
          <td className="px-2 py-1.5 text-left">Par</td>
          {holes.map((h) => <td key={h.hole} className="py-1.5">{h.par}</td>)}
          <td className="px-2 py-1.5 font-bold">{total.par}</td>
        </tr>
        <tr className="bg-white text-gray-500">
          <td className="px-2 py-1.5 text-left">Yards</td>
          {holes.map((h) => <td key={h.hole} className="py-1.5">{h.yards}</td>)}
          <td className="px-2 py-1.5 font-semibold text-gray-700">{total.yards}</td>
        </tr>
        <tr className="bg-gray-50 text-gray-400">
          <td className="px-2 py-1.5 text-left">SI</td>
          {holes.map((h) => <td key={h.hole} className="py-1.5">{h.strokeIndex}</td>)}
          <td className="px-2 py-1.5" />
        </tr>
      </tbody>
    </table>
  );
}
