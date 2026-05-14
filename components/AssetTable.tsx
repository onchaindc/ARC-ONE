import { assets } from "@/lib/demo-data";
import { Card } from "@/components/ui/card";
import { money } from "@/lib/utils";

export function AssetTable() {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-lg font-black">Portfolio</h2>
        <button className="text-sm font-bold text-arcblue" type="button">View all</button>
      </div>
      <div className="space-y-2">
        {assets.map((asset) => (
          <div key={asset.symbol} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl p-3 transition hover:bg-white/[0.06] sm:grid-cols-[1fr_8rem_7rem]">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black">
                <asset.icon size={20} aria-hidden="true" />
              </span>
              <div>
                <p className="font-black text-white">{asset.symbol}</p>
                <p className="text-sm text-muted">{asset.name}</p>
              </div>
            </div>
            <div className="hidden text-right sm:block">
              <p className="font-bold text-white">{asset.amount}</p>
              <p className="text-sm text-muted">{money(asset.value)}</p>
            </div>
            <div className="text-right">
              <p className="font-black text-white sm:hidden">{money(asset.value)}</p>
              <p className={asset.change >= 0 ? "text-sm font-bold text-gain" : "text-sm font-bold text-loss"}>
                {asset.change >= 0 ? "+" : ""}{asset.change}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
