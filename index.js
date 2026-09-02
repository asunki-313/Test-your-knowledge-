const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore, FieldValue, Timestamp} = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

const XP_CORRECT = 10;
const XP_WRONG = 5;
const XP_PER_LEVEL = 500;

const ACH_REWARDS = Object.freeze({
  first: 50,
  ten: 100,
  perfect: 250,
  hundred: 150,
  daily1: 100,
  streak7: 300,
  streak30: 1000,
  level5: 100,
  level10: 200,
  level15: 300,
  level20: 400,
  level25: 500,
  level30: 750,
  level35: 1000,
  level40: 1250,
  level45: 1500,
  level50: 2000,
});

const LEVEL_ACH = [5,10,15,20,25,30,35,40,45,50];

function asInt(v, min, max, name) {
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new HttpsError("invalid-argument", `${name} غير صالح`);
  }
  return n;
}

function dayKeyRiyadh(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(date).reduce((a,p)=>(a[p.type]=p.value,a),{});
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function monthKeyRiyadh(date = new Date()) {
  return dayKeyRiyadh(date).slice(0,7);
}

function previousDayKeyRiyadh() {
  return dayKeyRiyadh(new Date(Date.now() - 24*60*60*1000));
}

function calcLevel(totalXP) {
  return Math.max(1, Math.floor(Math.max(0,totalXP)/XP_PER_LEVEL)+1);
}

function awardAchievements({existing, right, newQuestions, isDaily, streak, newLevel}) {
  const have = new Set(Array.isArray(existing) ? existing : []);
  const newly = [];

  const grant = id => {
    if (!have.has(id)) {
      have.add(id);
      newly.push(id);
    }
  };

  if (right > 0) grant("first");
  if (!isDaily && right >= 10) grant("ten");
  if (!isDaily && right === 20) grant("perfect");
  if (newQuestions >= 100) grant("hundred");
  if (isDaily) grant("daily1");
  if (streak >= 7) grant("streak7");
  if (streak >= 30) grant("streak30");
  for (const lvl of LEVEL_ACH) if (newLevel >= lvl) grant(`level${lvl}`);

  const coins = newly.reduce((sum,id)=>sum+(ACH_REWARDS[id]||0),0);
  return {all:[...have], newly, coins};
}

exports.submitGameResult = onCall(
  {region: "me-central2", enforceAppCheck: false},
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "سجّل الدخول أولًا.");

    const uid = request.auth.uid;
    const d = request.data || {};
    const mode = d.mode === "daily" ? "daily" : d.mode === "normal" ? "normal" : null;
    if (!mode) throw new HttpsError("invalid-argument", "نوع اللعبة غير صالح.");

    const right = asInt(d.right, 0, 20, "right");
    const wrong = asInt(d.wrong, 0, 20, "wrong");
    const answered = asInt(d.answered, 0, 20, "answered");
    if (right + wrong > answered) throw new HttpsError("invalid-argument", "نتيجة غير متناسقة.");

    const sessionId = String(d.sessionId || "").trim();
    if (!/^[A-Za-z0-9_-]{12,100}$/.test(sessionId)) {
      throw new HttpsError("invalid-argument", "sessionId غير صالح.");
    }

    const doubleReward = mode === "normal" && d.doubleReward === true;
    const mult = doubleReward ? 2 : 1;

    let dailyCoins = 0;
    let dailyScore = 0;
    if (mode === "daily") {
      dailyCoins = asInt(d.dailyCoins, 0, 250, "dailyCoins");
      dailyScore = asInt(d.dailyScore, 0, 100, "dailyScore");
    }

    const userRef = db.collection("users").doc(uid);
    const serverRef = db.collection("serverUsers").doc(uid);
    const eventRef = db.collection("rewardEvents").doc(`${uid}_${sessionId}`);

    return db.runTransaction(async tx => {
      const [userSnap, serverSnap, eventSnap] = await Promise.all([
        tx.get(userRef), tx.get(serverRef), tx.get(eventRef)
      ]);

      if (eventSnap.exists) return eventSnap.data().response;

      const user = userSnap.exists ? userSnap.data() : {};
      const server = serverSnap.exists ? serverSnap.data() : {};

      const today = dayKeyRiyadh();
      if (mode === "daily" && server.lastDailyRewardDate === today) {
        throw new HttpsError("already-exists", "تم اعتماد تحدي اليوم مسبقًا.");
      }

      const oldTotalXP = Number(user.totalXP || 0);
      const oldLevel = calcLevel(oldTotalXP);

      const earnedPositiveXP = right * XP_CORRECT * mult;
      const lostXP = wrong * XP_WRONG;
      const netXP = earnedPositiveXP - lostXP;
      const newTotalXP = Math.max(0, oldTotalXP + netXP);
      const newLevel = calcLevel(newTotalXP);
      const levelCoins = Math.max(0, newLevel - oldLevel) * 50;

      const oldQuestions = Number(user.questionsAnswered || 0);
      const newQuestions = oldQuestions + answered;

      let streak = Number(user.streak || 0);
      if (mode === "daily") {
        streak = server.lastDailyRewardDate === previousDayKeyRiyadh() ? streak + 1 : 1;
      }

      const ach = awardAchievements({
        existing: server.achievements,
        right,
        newQuestions,
        isDaily: mode === "daily",
        streak,
        newLevel
      });

      const baseCoins = mode === "normal" ? right * 10 * mult : dailyCoins;
      const totalCoinReward = baseCoins + levelCoins + ach.coins;
      const newCoins = Math.max(0, Number(user.coins || 0) + totalCoinReward);

      const mk = monthKeyRiyadh();
      const oldMonthly = user.monthlyKey === mk ? Number(user.monthlyXP || 0) : 0;
      const newMonthly = oldMonthly + earnedPositiveXP;

      const publicPatch = {
        uid,
        level: newLevel,
        xp: Math.max(0, newTotalXP - (newLevel-1)*XP_PER_LEVEL),
        totalXP: newTotalXP,
        coins: newCoins,
        correctTotal: Number(user.correctTotal || 0) + right,
        wrongAnswers: Number(user.wrongAnswers || 0) + wrong,
        questionsAnswered: newQuestions,
        gamesPlayed: Number(user.gamesPlayed || 0) + 1,
        monthlyXP: newMonthly,
        monthlyKey: mk,
        lastPlayed: new Date().toISOString(),
        updatedAt: FieldValue.serverTimestamp(),
        playerSyncVersion: "V.16.12.14-SERVER"
      };

      if (mode === "daily") {
        publicPatch.dailyScore = dailyScore;
        publicPatch.streak = streak;
      }

      const serverPatch = {
        achievements: ach.all,
        updatedAt: FieldValue.serverTimestamp()
      };
      if (mode === "daily") serverPatch.lastDailyRewardDate = today;

      const response = {
        ok: true,
        mode,
        right,
        wrong,
        answered,
        netXP,
        earnedPositiveXP,
        level: newLevel,
        xp: publicPatch.xp,
        totalXP: newTotalXP,
        monthlyXP: newMonthly,
        monthlyKey: mk,
        coins: newCoins,
        baseCoins,
        levelCoins,
        achievementCoins: ach.coins,
        newlyUnlocked: ach.newly,
        streak: mode === "daily" ? streak : Number(user.streak || 0),
        dailyScore: mode === "daily" ? dailyScore : Number(user.dailyScore || 0),
        correctTotal: publicPatch.correctTotal,
        wrongAnswers: publicPatch.wrongAnswers,
        questionsAnswered: publicPatch.questionsAnswered,
        gamesPlayed: publicPatch.gamesPlayed,
        lastPlayed: publicPatch.lastPlayed,
        achievements: ach.all,
        totalCoinReward
      };

      tx.set(userRef, publicPatch, {merge:true});
      tx.set(serverRef, serverPatch, {merge:true});
      tx.set(eventRef, {
        uid, sessionId, mode,
        createdAt: FieldValue.serverTimestamp(),
        response
      });

      return response;
    });
  }
);
