interface BilingualFieldProps {
  label: string;
  valueZh: string;
  valueEn: string;
  onChangeZh: (v: string) => void;
  onChangeEn: (v: string) => void;
  type?: "input" | "textarea";
  rows?: number;
  placeholderZh?: string;
  placeholderEn?: string;
}

const inputCls = "w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none";

export function BilingualField({
  label,
  valueZh,
  valueEn,
  onChangeZh,
  onChangeEn,
  type = "input",
  rows = 3,
  placeholderZh,
  placeholderEn,
}: BilingualFieldProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-400">{label} (中文)</label>
        {type === "textarea" ? (
          <textarea
            value={valueZh}
            onChange={(e) => onChangeZh(e.target.value)}
            placeholder={placeholderZh}
            rows={rows}
            className={`${inputCls} resize-none`}
          />
        ) : (
          <input
            type="text"
            value={valueZh}
            onChange={(e) => onChangeZh(e.target.value)}
            placeholder={placeholderZh}
            className={inputCls}
          />
        )}
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-400">{label} (English)</label>
        {type === "textarea" ? (
          <textarea
            value={valueEn}
            onChange={(e) => onChangeEn(e.target.value)}
            placeholder={placeholderEn}
            rows={rows}
            className={`${inputCls} resize-none`}
          />
        ) : (
          <input
            type="text"
            value={valueEn}
            onChange={(e) => onChangeEn(e.target.value)}
            placeholder={placeholderEn}
            className={inputCls}
          />
        )}
      </div>
    </div>
  );
}
