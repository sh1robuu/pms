'use client';

// Lightweight donut chart component (no external deps)
interface DonutChartProps {
    segments: { label: string; value: number; color: string }[];
    size?: number;
    thickness?: number;
}

export function DonutChart({ segments, size = 160, thickness = 20 }: DonutChartProps) {
    const total = segments.reduce((s, seg) => s + seg.value, 0);
    if (total === 0) return <div style={{ width: size, height: size }} className="rounded-full bg-white/[0.04]" />;

    const radius = (size - thickness) / 2;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                {segments.map((seg, i) => {
                    const pct = seg.value / total;
                    const dashArray = `${pct * circumference} ${circumference}`;
                    const dashOffset = -offset * circumference;
                    offset += pct;
                    return (
                        <circle
                            key={i}
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={seg.color}
                            strokeWidth={thickness}
                            strokeDasharray={dashArray}
                            strokeDashoffset={dashOffset}
                            strokeLinecap="round"
                            className="transition-all duration-700"
                            style={{ opacity: 0.85 }}
                        />
                    );
                })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-pms-text">{total}</span>
                <span className="text-[10px] text-pms-text-muted uppercase tracking-wider">Rooms</span>
            </div>
        </div>
    );
}

// Mini sparkline bar chart
interface SparkBarProps {
    data: { label: string; value: number; color: string }[];
    height?: number;
}

export function SparkBar({ data, height = 64 }: SparkBarProps) {
    const max = Math.max(...data.map((d) => d.value), 1);

    return (
        <div className="flex items-end gap-1.5" style={{ height }}>
            {data.map((d, i) => {
                const barHeight = Math.max(4, (d.value / max) * height);
                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                            className="w-full rounded-t-md transition-all duration-500"
                            style={{ height: barHeight, backgroundColor: d.color, opacity: 0.7 }}
                        />
                        <span className="text-[8px] text-white/30">{d.label}</span>
                    </div>
                );
            })}
        </div>
    );
}
