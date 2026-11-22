import type { Metadata } from "next";
import { asset } from "@/lib/asset";
import styles from "./privacy.module.css";

export const metadata: Metadata = {
  title: "מדיניות פרטיות — else",
  description: "מדיניות הפרטיות של else — חני בוסקילה.",
};

type Section = { h: string; p: string[]; bullets?: string[] };

const SECTIONS: Section[] = [
  {
    h: "1. המידע שאנו אוספים",
    p: [
      "בעת ההרשמה לרשימת הדיוור שלנו, אנו אוספים מידע אישי בסיסי כגון שם וכתובת דואר אלקטרוני. מידע זה נמסר על ידך מרצונך החופשי בעת מילוי טופס ההרשמה.",
    ],
  },
  {
    h: "2. השימוש במידע",
    p: ["המידע שנאסף משמש אותנו למטרות הבאות בלבד:"],
    bullets: [
      "משלוח עדכונים שוטפים, תכנים אינפורמטיביים והצעות מקצועיות.",
      "משלוח תכנים שיווקיים ופרסומיים (בהתאם להסכמתך בעת ההרשמה).",
      "שיפור חוויית המשתמש והתאמת התכנים הנשלחים אלייך.",
    ],
  },
  {
    h: "3. העברת מידע לצד ג׳",
    p: [
      'אנו מתחייבים לא למכור, לא להשכיר ולא להעביר את המידע האישי שלך לצדדים שלישיים לצרכי השיווק שלהם. המידע נשמר אצלנו ומשמש אך ורק את הפעילות שלנו מולך. המידע עשוי לעבור לספקי שירות טכניים (כמו מערכת הדיוור) אך ורק לצורך ביצוע המשלוח הטכני של המיילים אליך.',
    ],
  },
  {
    h: "4. זכות ההסרה (Opt-Out)",
    p: [
      'על פי חוק התקשורת (בזק ושידורים), התשמ"ב-1982 ("חוק הספאם"), עומדת לך הזכות להסיר את עצמך מרשימת התפוצה בכל עת. בכל מייל שיישלח אליך יופיע קישור ברור בתחתית ההודעה להסרה מיידית וקבועה מהרשימה.',
    ],
  },
  {
    h: "5. אבטחת מידע",
    p: [
      "אנו נוקטים באמצעי אבטחה מקובלים כדי להגן על המידע האישי שלך מפני גישה בלתי מורשית או שינוי. עם זאת, יש לזכור שאף מערכת אינה חסינה לחלוטין.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a className={styles.back} href="/" aria-label="רשימת המעצבים של העולם החדש">
          <span aria-hidden>→</span>
          <span className={styles.backText}>רשימת המעצבים של העולם החדש</span>
        </a>
        <img className={styles.logo} src={asset("/assets/newsletter/else-black.svg")} alt="else — by hani buskila" />
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>מדיניות פרטיות — חני בוסקילה · else</h1>
        <p className={styles.intro}>
          ברוכים הבאים ל‑else — אנו מכבדים את הפרטיות שלך ומחויבים להגן על המידע האישי שאתה משתף איתנו.
          להלן פירוט הדרך בה אנו אוספים ומשתמשים במידע:
        </p>

        {SECTIONS.map((s) => (
          <section key={s.h} className={styles.section}>
            <h2 className={styles.h}>{s.h}</h2>
            {s.p.map((text, i) => (
              <p key={i} className={styles.p}>
                {text}
              </p>
            ))}
            {s.bullets && (
              <ul className={styles.bullets}>
                {s.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section className={styles.section}>
          <h2 className={styles.h}>6. יצירת קשר</h2>
          <p className={styles.p}>
            בכל שאלה בנושא פרטיות או לבקשה לעיון/מחיקה של המידע שלך, ניתן לפנות אלינו במייל:{" "}
            <a className={styles.email} href="mailto:hani@weareelse.co.il">
              hani@weareelse.co.il
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}
