"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  Heart,
  Home,
  PawPrint,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const asset = (path: string) => `${BASE_PATH}/${path}`;

const PAGE_COUNT = 12;
const STORAGE_KEY = "ragdoll-home-guide-progress-v1";

const safetyItems = [
  ["window", "窗戶、陽台完成真正的防墜固定"],
  ["cords", "電線、髮圈、細繩與塑膠袋都收好"],
  ["plants", "確認家中植物與清潔用品對貓安全"],
  ["machines", "洗衣機、烘衣機使用前會先檢查"],
  ["gaps", "封好家具內襯與可能卡住的縫隙"],
  ["room", "準備一個安靜、能躲藏的適應空間"],
] as const;

const supplyItems = [
  ["litterboxes", "XL 貓砂盆 × 2，分開擺放"],
  ["litter", "沿用貓舍原本使用的貓砂"],
  ["food", "先準備原本吃的主食與寬口食碗"],
  ["water", "穩固水碗或容易清洗的飲水機"],
  ["carrier", "可承重的大型硬殼外出籠"],
  ["scratch", "直式與平面抓板各一"],
  ["tree", "平台夠大、底座穩的貓跳台"],
  ["groom", "金屬排梳、指甲剪與黏毛滾輪"],
] as const;

const breederItems = [
  ["hcm", "父母雙方 HCM DNA 檢測結果"],
  ["parents", "父母資料、健康狀況與生活環境"],
  ["records", "疫苗、驅蟲與健檢紀錄"],
  ["chip", "晶片資料與所有權轉移方式"],
  ["contract", "買賣契約及遺傳疾病處理條款"],
  ["handover", "交付時間與幼貓社會化情況"],
  ["routine", "目前吃的食物、用的砂與作息"],
] as const;

const allChecklistIds = [
  ...safetyItems.map(([id]) => id),
  ...supplyItems.map(([id]) => id),
  ...breederItems.map(([id]) => id),
];

type TurnDirection = "next" | "prev";
type Stage = "intro" | "opening" | "reading";

type GuideState = {
  checked: string[];
  bearSigned: boolean;
  lionSigned: boolean;
};

const initialGuideState: GuideState = {
  checked: [],
  bearSigned: false,
  lionSigned: false,
};

function Checklist({
  items,
  checked,
  onToggle,
  staticMode = false,
}: {
  items: ReadonlyArray<readonly [string, string]>;
  checked: Set<string>;
  onToggle: (id: string) => void;
  staticMode?: boolean;
}) {
  return (
    <div className="checklist">
      {items.map(([id, label]) => {
        const isChecked = checked.has(id);
        return (
          <label className={`check-row ${isChecked ? "is-checked" : ""}`} key={id}>
            <Checkbox
              checked={isChecked}
              disabled={staticMode}
              onCheckedChange={() => onToggle(id)}
              aria-label={label}
            />
            <span>{label}</span>
          </label>
        );
      })}
    </div>
  );
}

function PageHeader({
  eyebrow,
  title,
  icon,
}: {
  eyebrow: string;
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <header className="page-header">
      <div className="page-icon" aria-hidden="true">
        {icon}
      </div>
      <div>
        <p className="page-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
    </header>
  );
}

function StoryPage({
  index,
  checked,
  onToggle,
  bearSigned,
  lionSigned,
  onSign,
  staticMode = false,
}: {
  index: number;
  checked: Set<string>;
  onToggle: (id: string) => void;
  bearSigned: boolean;
  lionSigned: boolean;
  onSign: (who: "bear" | "lion") => void;
  staticMode?: boolean;
}) {
  const common = { checked, onToggle, staticMode };

  return (
    <article className={`story-page story-page-${index}`} aria-label={`第 ${index + 1} 頁`}>
      <div className="page-stitch" aria-hidden="true" />
      {index === 0 && (
        <>
          <div className="paper-tape tape-top" aria-hidden="true" />
          <p className="formal-label">給熊與獅子的正式文件</p>
          <h2 className="opening-title">布偶貓<br />回家準備書</h2>
          <div className="portrait-frame">
            <img src={asset("assets/cat-portrait.webp")} alt="白色布偶貓坐在櫃子裡的照片" />
          </div>
          <p className="opening-copy">
            帶我回家不只是一個可愛的決定，<br />也是每天都要好好照顧我的約定。
          </p>
          <div className="tiny-seal"><PawPrint size={18} /> 先認識，再承諾</div>
        </>
      )}

      {index === 1 && (
        <>
          <PageHeader eyebrow="01｜先看最重要的數字" title="我們準備好了嗎？" icon={<Heart size={22} />} />
          <div className="hero-number-grid">
            <div className="hero-number pink"><strong>每天</strong><b>45–90</b><span>分鐘的專心照顧</span></div>
            <div className="hero-number blue"><strong>每月</strong><b>6,000–8,000</b><span>元的穩定預算</span></div>
            <div className="hero-number gold"><strong>預備</strong><b>50,000–100,000</b><span>元緊急醫療基金</span></div>
          </div>
          <div className="cat-note">
            <PawPrint size={18} />
            <p>幼貓前幾個月需要更多分散式陪伴，建議每天抓 1.5–2 小時。</p>
          </div>
          <p className="page-quote">「不是把我放在家裡，<br />是把我放進你們的生活裡。」</p>
        </>
      )}

      {index === 2 && (
        <>
          <PageHeader eyebrow="02｜比漂亮家具更優先" title="先把家變安全" icon={<ShieldCheck size={22} />} />
          <p className="page-lead">布偶貓體型大、好奇又信任人。先消除會墜落、纏繞、誤食與受困的風險。</p>
          <Checklist items={safetyItems} {...common} />
          <div className="warning-note"><strong>一般紗窗 ≠ 防墜網</strong><span>防護必須牢固固定，不能只靠磁吸或黏貼。</span></div>
        </>
      )}

      {index === 3 && (
        <>
          <PageHeader eyebrow="03｜接我以前先買好" title="必要用品清單" icon={<Home size={22} />} />
          <Checklist items={supplyItems} {...common} />
          <div className="scribble-note">
            <span>布偶專屬提醒</span>
            砂盆、外出籠、跳台平台都直接選大型；幼貓現在用得下，不代表成年後塞得下。
          </div>
        </>
      )}

      {index === 4 && (
        <>
          <PageHeader eyebrow="04｜開始養以前" title="一次性預算" icon={<WalletCards size={22} />} />
          <div className="budget-stack">
            <div><span>買布偶貓</span><strong>NT$40,000–60,000</strong></div>
            <div><span>用品＋環境</span><strong>NT$20,000–40,000</strong></div>
            <div><span>醫療預備金</span><strong>NT$50,000–100,000</strong></div>
          </div>
          <div className="budget-total"><small>可動用資源，包含買貓</small><strong>NT$110,000–200,000</strong></div>
          <p className="fine-print">真正接回家前通常先支出約 6–10 萬元；醫療基金是保留在旁邊，不代表第一天就會花掉。</p>
        </>
      )}

      {index === 5 && (
        <>
          <PageHeader eyebrow="05｜每個月穩定留下" title="生活預算" icon={<WalletCards size={22} />} />
          <div className="monthly-list">
            {[
              ["主食", "2,000–3,500"], ["貓砂", "600–1,000"], ["零食", "200–500"],
              ["抓板、玩具", "300–500"], ["驅蟲", "300–500"], ["清潔耗材", "200–300"],
              ["醫療／健檢預提", "1,000–2,000"],
            ].map(([label, price]) => <div key={label}><span>{label}</span><b>NT${price}</b></div>)}
          </div>
          <div className="monthly-total"><span>安心抓</span><strong>每月 NT$6,000–8,000</strong></div>
          <p className="fine-print">個別月份可能更低或更高；重點是有預算承受驅蟲、耗材與突然看診。</p>
        </>
      )}

      {index === 6 && (
        <>
          <PageHeader eyebrow="06｜不是整天黏著，是每天做到" title="一天怎麼陪我" icon={<Clock3 size={22} />} />
          <div className="day-clock">
            <div className="clock-ring"><Clock3 size={38} /><strong>45–90</strong><span>分鐘／天</span></div>
            <ol className="time-list">
              <li><b>10–15 分</b><span>餵食、洗碗、換水</span></li>
              <li><b>5–10 分</b><span>鏟砂並觀察排泄</span></li>
              <li><b>20–30 分 × 1–2</b><span>互動遊戲與運動</span></li>
              <li><b>每週 1–2 次</b><span>金屬排梳梳到毛根</span></li>
            </ol>
          </div>
          <div className="weekly-note">每週另留 30–60 分鐘清洗砂盆、飲水設備與環境。</div>
        </>
      )}

      {index === 7 && (
        <>
          <PageHeader eyebrow="07｜每天照顧的四件事" title="吃、喝、玩、梳" icon={<Sparkles size={22} />} />
          <div className="care-grid">
            <div><span>吃</span><b>第一週照舊</b><p>先沿用原食物；穩定後才逐步換食，並定量觀察體重。</p></div>
            <div><span>喝</span><b>每天乾淨水</b><p>水碗或飲水機都可以，重點是容易清洗、願意喝。</p></div>
            <div><span>玩</span><b>每天互動</b><p>逗貓棒、球與抓板，讓大型布偶維持活動量。</p></div>
            <div><span>梳</span><b>每週 1–2 次</b><p>腋下與換毛期多檢查；指甲約每月依生長速度修剪。</p></div>
          </div>
          <p className="page-quote small">漂亮貓窩可以晚點買，<br />乾淨的水、穩定的飯和陪玩不能晚。</p>
        </>
      )}

      {index === 8 && (
        <>
          <PageHeader eyebrow="08｜健康來源比毛色更重要" title="布偶貓必查 HCM" icon={<Stethoscope size={22} />} />
          <div className="hcm-card">
            <span>HCM</span>
            <div><strong>肥厚性心肌病</strong><p>布偶貓有可檢測的遺傳風險。看貓時要看繁殖種貓的 DNA 檢測結果，不只看血統書。</p></div>
          </div>
          <ul className="health-list">
            <li><Check size={16} />接回後找固定獸醫建立健康基準</li>
            <li><Check size={16} />確認疫苗、驅蟲、晶片與登記資料</li>
            <li><Check size={16} />定期觀察體重、食慾、呼吸與排泄</li>
            <li><Check size={16} />醫療預備金不要拿去補一般消費</li>
          </ul>
          <div className="law-note">台灣自 2026 年起，未依規定替貓植入晶片並辦理寵物登記，可處 NT$3,000–15,000 罰鍰。</div>
        </>
      )}

      {index === 9 && (
        <>
          <PageHeader eyebrow="09｜不要急著把全家介紹完" title="回家第一週" icon={<Home size={22} />} />
          <div className="week-timeline">
            <div><b>第 1–2 天</b><p>待在安靜安全房，提供躲藏處。沿用原本的飯與砂，不強抱、不圍觀。</p></div>
            <div><b>第 3–4 天</b><p>短時間陪玩，讓牠主動靠近；記錄吃喝、尿量與便便。</p></div>
            <div><b>第 5–7 天</b><p>依適應狀況慢慢擴大活動範圍，安排自己的獸醫初診。</p></div>
          </div>
          <div className="urgent-note">若持續不吃、不排尿、呼吸異常或精神明顯變差，直接聯絡獸醫，不要只在網路上等答案。</div>
        </>
      )}

      {index === 10 && (
        <>
          <PageHeader eyebrow="10｜去貓舍時逐項確認" title="一定要問清楚" icon={<ShieldCheck size={22} />} />
          <Checklist items={breederItems} {...common} />
          <div className="warning-note compact"><strong>健康檢測 ≠ 血統證書</strong><span>兩份資料都重要，但彼此不能互相取代。</span></div>
          <div className="sources">
            <span>資料依據</span>
            <a href="https://tica.org/breed/ragdoll/" target="_blank" rel="noreferrer">TICA：Ragdoll</a>
            <a href="https://cfa.org/breed/ragdoll/" target="_blank" rel="noreferrer">CFA：Ragdoll</a>
            <a href="https://animal.moa.gov.tw/Frontend/News/Detail/N0000000001529" target="_blank" rel="noreferrer">農業部：貓隻寵物登記</a>
          </div>
        </>
      )}

      {index === 11 && (
        <>
          <p className="formal-label">共同照顧聲明書</p>
          <h2 className="promise-title">我們不是衝動帶你回家，<br />是認真準備讓你成為家人。</h2>
          <img className="bear-lion" src={asset("assets/bear-lion.webp")} alt="白熊與獅子一起讀照顧說明書的插畫" />
          <p className="promise-copy">本熊與獅子願意提供安全、陪伴、穩定飲食與必要醫療，並尊重每一隻貓自己的個性與適應速度。</p>
          <div className="signature-row">
            <button
              type="button"
              className={`signature ${bearSigned ? "signed" : ""}`}
              onClick={() => !staticMode && onSign("bear")}
              disabled={staticMode}
            >
              <PawPrint size={26} /><span>{bearSigned ? "熊已按爪印" : "熊按爪印"}</span>
            </button>
            <button
              type="button"
              className={`signature ${lionSigned ? "signed" : ""}`}
              onClick={() => !staticMode && onSign("lion")}
              disabled={staticMode}
            >
              <PawPrint size={26} /><span>{lionSigned ? "獅子已按爪印" : "獅子按爪印"}</span>
            </button>
          </div>
          {bearSigned && lionSigned && <div className="promise-complete"><Heart size={17} fill="currentColor" /> 那我可以安心期待回家了。</div>}
        </>
      )}
      <span className="page-number">{String(index + 1).padStart(2, "0")}</span>
    </article>
  );
}

export default function HomePage() {
  const [stage, setStage] = useState<Stage>("intro");
  const [introReply, setIntroReply] = useState(false);
  const [spreadStart, setSpreadStart] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [turning, setTurning] = useState<TurnDirection | null>(null);
  const [guideState, setGuideState] = useState<GuideState>(initialGuideState);
  const [hydrated, setHydrated] = useState(false);
  const pointerStart = useRef<number | null>(null);

  const checked = useMemo(() => new Set(guideState.checked), [guideState.checked]);
  const completedCount = guideState.checked.filter((id) => allChecklistIds.includes(id)).length;
  const progress = Math.round((completedCount / allChecklistIds.length) * 100);
  const step = isMobile ? 1 : 2;
  const maxStart = isMobile ? PAGE_COUNT - 1 : PAGE_COUNT - 2;
  const visibleLeft = spreadStart;
  const visibleRight = isMobile ? spreadStart : spreadStart + 1;

  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setGuideState({ ...initialGuideState, ...JSON.parse(saved) });
    } catch {
      // The book remains fully usable when browser storage is unavailable.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(guideState));
  }, [guideState, hydrated]);

  useEffect(() => {
    setSpreadStart((current) => {
      if (isMobile) return Math.min(current, PAGE_COUNT - 1);
      return Math.min(current % 2 === 0 ? current : current - 1, PAGE_COUNT - 2);
    });
  }, [isMobile]);

  const toggleItem = useCallback((id: string) => {
    setGuideState((current) => ({
      ...current,
      checked: current.checked.includes(id)
        ? current.checked.filter((item) => item !== id)
        : [...current.checked, id],
    }));
  }, []);

  const sign = useCallback((who: "bear" | "lion") => {
    setGuideState((current) => ({
      ...current,
      ...(who === "bear" ? { bearSigned: true } : { lionSigned: true }),
    }));
  }, []);

  const turnPage = useCallback((direction: TurnDirection) => {
    if (turning || stage !== "reading") return;
    const nextStart = direction === "next"
      ? Math.min(spreadStart + step, maxStart)
      : Math.max(spreadStart - step, 0);
    if (nextStart === spreadStart) return;
    setTurning(direction);
    window.setTimeout(() => {
      setSpreadStart(nextStart);
      setTurning(null);
    }, 680);
  }, [maxStart, spreadStart, stage, step, turning]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") turnPage("next");
      if (event.key === "ArrowLeft") turnPage("prev");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [turnPage]);

  const beginReading = () => {
    setStage("opening");
    window.setTimeout(() => setStage("reading"), 1250);
  };

  const pageProps = {
    checked,
    onToggle: toggleItem,
    bearSigned: guideState.bearSigned,
    lionSigned: guideState.lionSigned,
    onSign: sign,
  };

  const turningFront = turning === "next" ? visibleRight : visibleLeft;
  const turningBack = turning === "next"
    ? Math.min(spreadStart + step, PAGE_COUNT - 1)
    : Math.max(spreadStart - 1, 0);

  return (
    <main className={`storybook stage-${stage}`}>
      <div className="ambient-dots" aria-hidden="true" />

      {stage !== "reading" && (
        <section className="intro-scene" aria-label="布偶貓邀請你一起讀照顧說明書">
          <div className={`closed-book ${stage === "opening" ? "is-opening" : ""}`}>
            <div className="book-shadow" aria-hidden="true" />
            <div className="inside-paper" aria-hidden="true"><PawPrint /></div>
            <div className="front-cover">
              <div className="cover-tape" aria-hidden="true" />
              <p>共同生活準備文件</p>
              <h1>布偶貓<br />照顧說明書</h1>
              <div className="cover-photo">
                <img src={asset("assets/cat-cover.webp")} alt="女友喜歡的白色布偶貓封面照片" />
              </div>
              <span>熊 × 獅子 × 一隻藍眼睛的貓</span>
              <div className="cover-stamp"><PawPrint size={34} /><b>回家前必讀</b></div>
            </div>
          </div>

          <div className={`intro-cat ${introReply ? "is-waiting" : ""}`}>
            <img src={asset("assets/cat-guide.webp")} alt="左臉有灰色花紋的卡通布偶貓跑向書本" />
            <div className="speech-bubble" aria-live="polite">
              <span className="bubble-name">藍眼睛的新朋友</span>
              {introReply ? (
                <p>沒關係，我會等你。<br />但可以先陪我把這本書讀完嗎？</p>
              ) : (
                <p>熊、獅子……<br />你們願意帶我回家嗎？</p>
              )}
              <div className="intro-actions">
                <Button onClick={beginReading} className="read-button">
                  <BookOpen size={18} /> 好，我們一起讀
                </Button>
                {!introReply && (
                  <button className="wait-button" type="button" onClick={() => setIntroReply(true)}>我還想再準備一下</button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {stage === "reading" && (
        <section className="reading-scene" aria-label="互動式布偶貓照顧說明書">
          <header className="reading-toolbar">
            <div className="toolbar-title"><PawPrint size={20} /><span>布偶貓回家準備書</span></div>
            <div className="check-progress" aria-label={`準備清單完成 ${progress}%`}>
              <span>{completedCount}/{allChecklistIds.length} 項準備</span>
              <Progress value={progress} />
            </div>
          </header>

          <div className="book-and-guide">
            <div
              className={`open-book ${isMobile ? "single-page" : "two-page"}`}
              onPointerDown={(event) => { pointerStart.current = event.clientX; }}
              onPointerUp={(event) => {
                if (pointerStart.current === null) return;
                const delta = event.clientX - pointerStart.current;
                pointerStart.current = null;
                if (Math.abs(delta) < 52) return;
                turnPage(delta < 0 ? "next" : "prev");
              }}
            >
              <div className="book-block" aria-hidden="true" />
              {!isMobile && (
                <div className="book-page left-page">
                  <StoryPage index={visibleLeft} {...pageProps} />
                </div>
              )}
              <div className={`book-page ${isMobile ? "mobile-page" : "right-page"}`}>
                <StoryPage index={visibleRight} {...pageProps} />
              </div>

              {turning && (
                <div className={`turning-sheet ${turning} ${isMobile ? "mobile-sheet" : ""}`} aria-hidden="true">
                  <div className="sheet-face sheet-front"><StoryPage index={turningFront} {...pageProps} staticMode /></div>
                  <div className="sheet-face sheet-back"><StoryPage index={turningBack} {...pageProps} staticMode /></div>
                </div>
              )}

              <button
                className="page-hotspot hotspot-prev"
                type="button"
                aria-label="翻到上一頁"
                disabled={spreadStart === 0 || Boolean(turning)}
                onClick={() => turnPage("prev")}
              />
              <button
                className="page-hotspot hotspot-next"
                type="button"
                aria-label="翻到下一頁"
                disabled={spreadStart >= maxStart || Boolean(turning)}
                onClick={() => turnPage("next")}
              />
            </div>

            <aside className="guide-cat" aria-label="布偶貓導讀員">
              <div className="guide-bubble">
                {visibleRight < 4 && "先把安全和用品一項一項準備好。"}
                {visibleRight >= 4 && visibleRight < 8 && "時間和預算都穩定，照顧才不會變壓力。"}
                {visibleRight >= 8 && visibleRight < 11 && "健康資料要親眼確認，不要只聽口頭保證。"}
                {visibleRight === 11 && !(guideState.bearSigned && guideState.lionSigned) && "最後，換熊和獅子留下爪印。"}
                {visibleRight === 11 && guideState.bearSigned && guideState.lionSigned && "謝謝你們願意認真準備我的一生。"}
              </div>
              <img src={asset("assets/cat-guide.webp")} alt="卡通布偶貓站在書旁導讀" />
            </aside>
          </div>

          <footer className="book-controls">
            <Button variant="outline" onClick={() => turnPage("prev")} disabled={spreadStart === 0 || Boolean(turning)}>
              <ArrowLeft size={18} /> 上一頁
            </Button>
            <div className="page-indicator" aria-live="polite">
              <span>{isMobile ? visibleRight + 1 : `${visibleLeft + 1}–${visibleRight + 1}`} / {PAGE_COUNT}</span>
              <small>也可以滑動頁面或用方向鍵</small>
            </div>
            <Button onClick={() => turnPage("next")} disabled={spreadStart >= maxStart || Boolean(turning)}>
              下一頁 <ArrowRight size={18} />
            </Button>
          </footer>
        </section>
      )}
    </main>
  );
}
