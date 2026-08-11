V.13.50.3 Firebase Connection Test

1) افتح اللعبة من HTTPS/GitHub Pages وليس file://.
2) افتح حساب اللاعب واضغط اختبار اتصال Firebase.
3) من Firebase Console > Project settings > General > Your apps > Web app > SDK setup and configuration انسخ كائن firebaseConfig كاملًا والصقه في الحقل.
4) اضغط اختبار الاتصال الآن.

مهم: لم يتم اختراع أو تضمين API key/appId داخل النسخة لأن ملف V.13.50.2 الموجود لا يحتوي firebaseConfig الفعلي. Production Rules قد تعطي permission-denied للقراءة المجهولة؛ النسخة تفسر ذلك كنجاح اتصال مع منع الوصول، وهو المتوقع قبل تسجيل الدخول.
