# V.16.12.14 PWA — Task 4C Server Reward Bridge

هذه نسخة اختبار للمهمة 4: ربط نتيجة الجولة مع Cloud Function باسم `submitGameResult`.

## ما تغير
- إضافة Firebase Functions compat SDK.
- كل جولة Normal/Daily تنشئ `sessionId` فريدًا.
- لم يعد XP يتغير مع كل إجابة على العميل قبل اعتماد النتيجة.
- `finish()` و `finishDaily()` يرسلان نتيجة الجولة إلى `submitGameResult`.
- السيرفر يحسب XP / Level / Coins / Achievement rewards / Streak / monthlyXP ويعيد الحالة المعتمدة.
- العميل يستبدل حالته بالقيم التي أعادها السيرفر.
- `rewardEvents/{uid_sessionId}` يمنع Double Submit.

## النشر التجريبي
من داخل هذا المجلد، بعد تسجيل Firebase CLI على المشروع الصحيح:

    firebase deploy --only functions:submitGameResult

المشروع المضبوط في `.firebaserc`: `asunki-quiz313`.

## مهم قبل إكمال Task 4
يوجد fallback محلي مؤقت إذا لم تكن الدالة منشورة أو لم يكن المستخدم مسجلًا. هذا متعمد حتى لا تتعطل اللعبة خلال اختبار الربط.
بعد التأكد من نجاح الدالة في الإنتاج سنفعل الخطوة 4D:
1. إزالة fallback المحلي للمكافآت الحساسة.
2. إيقاف أي مزامنة مباشرة للحقول الحساسة من العميل.
3. نشر Firestore Rules النهائية التي تمنع العميل من كتابة XP/Coins/Score مباشرة.
