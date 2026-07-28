import { useId, useMemo, useState } from "react";

/**
 * React reference sample. It deliberately imports no unpublished EIX package.
 * Replace `ChartRenderer` with your ECharts or SVG adapter and keep the same
 * ChartSpec, table, evidence, accessibility, and validation contract.
 */

type ChartView = "chart" | "table" | "explanation";

type ChartSpec = {
  id: string;
  resultRef: string;
  revision: number;
  claim: {
    kind: "fact" | "calculation" | "hypothesis" | "forecast" | "recommendation" | "question";
    text: string;
    status: "unverified" | "supported" | "verified" | "contested" | "stale" | "insufficient";
  };
  scope: {
    metric: string;
    period: string;
    version: string;
    unit: string;
    grain: string;
    freshness: string;
  };
  accessibleSummary: string;
  evidenceRefs: string[];
  limitations?: string[];
  dataTable: {
    columns: Array<{ key: string; label: string; format?: string }>;
    rows: Array<Record<string, unknown>>;
  };
  interactions: {
    actions: Array<"explain" | "compare" | "filter" | "drill">;
  };
};

type Props = {
  spec: ChartSpec;
  validation: { status: "pass" | "partial" | "blocked"; fallback?: string | null };
  ChartRenderer: React.ComponentType<{ spec: ChartSpec }>;
  onAction?: (action: ChartSpec["interactions"]["actions"][number], spec: ChartSpec) => void;
};

const statusLabel = {
  unverified: "未核验",
  supported: "有依据",
  verified: "已核验",
  contested: "有争议",
  stale: "已过期",
  insufficient: "依据不足",
};

const actionLabel = { explain: "解释", compare: "比较", filter: "筛选", drill: "下钻" };

export function ChartBlock({ spec, validation, ChartRenderer, onAction }: Props) {
  const [view, setView] = useState<ChartView>("chart");
  const titleId = useId();
  const views = useMemo(
    () =>
      [
        ["chart", "图形"],
        ["table", "数据表"],
        ["explanation", "解释"],
      ] as const,
    [],
  );

  return (
    <article className="eix-chart-block" aria-labelledby={titleId}>
      <header className="eix-chart-block__header">
        <div>
          <span className="eix-chart-block__eyebrow">分析结果</span>
          <h2 className="eix-chart-block__title" id={titleId}>
            {spec.claim.text}
          </h2>
          <div className="eix-chart-block__scope">
            {[spec.scope.metric, spec.scope.period, spec.scope.version, spec.scope.unit, spec.scope.freshness].map(
              (item) => <span key={item}>{item}</span>,
            )}
          </div>
        </div>
        <span className="eix-chart-block__status">{statusLabel[spec.claim.status]}</span>
      </header>

      <div className="eix-chart-block__toolbar">
        <div className="eix-chart-block__views" role="group" aria-label="结果表达">
          {views.map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={view === id}
              onClick={() => setView(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="eix-chart-block__actions">
          {spec.interactions.actions.map((action) => (
            <button key={action} type="button" onClick={() => onAction?.(action, spec)}>
              {actionLabel[action]}
            </button>
          ))}
        </div>
      </div>

      <div className="eix-chart-block__view">
        {view === "chart" &&
          (validation.status === "blocked" ? (
            <div className="eix-chart-block__blocked" role="status">
              <h3>前置条件不足，保留基础结果</h3>
              <p>建议降级为：{validation.fallback || "支撑数据表"}</p>
            </div>
          ) : (
            <>
              <ChartRenderer spec={spec} />
              <p className="eix-chart-block__annotation">
                <strong>等价摘要：</strong>
                {spec.accessibleSummary}
              </p>
            </>
          ))}

        {view === "table" && (
          <table className="eix-chart-table">
            <caption>与图形同源的支撑数据</caption>
            <thead>
              <tr>
                {spec.dataTable.columns.map((column) => <th key={column.key}>{column.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {spec.dataTable.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {spec.dataTable.columns.map((column) => (
                    <td key={column.key}>{String(row[column.key] ?? "—")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {view === "explanation" && (
          <div className="eix-chart-block__explanation">
            <h3>{spec.claim.text}</h3>
            {spec.limitations?.length ? (
              <ul>{spec.limitations.map((item) => <li key={item}>{item}</li>)}</ul>
            ) : null}
          </div>
        )}
      </div>

      <footer className="eix-chart-block__footer">
        <span className="eix-chart-block__meta">
          结果 {spec.resultRef} · 修订 {spec.revision}
        </span>
        <details className="eix-chart-block__evidence">
          <summary>查看依据（{spec.evidenceRefs.length}）</summary>
          <ul>{spec.evidenceRefs.map((reference) => <li key={reference}>{reference}</li>)}</ul>
        </details>
      </footer>
    </article>
  );
}

