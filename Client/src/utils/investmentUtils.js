/**
 * Investment Tracker & Portfolio Utility Functions
 */

/**
 * Calculates the total credit card usage / outstanding debt across all card sources and transactions.
 *
 * Checks:
 * 1. Explicit `cardDue` property calculated by backend.
 * 2. Negative `balance` or `currentBalance` on card sources (representing spent credit).
 * 3. Fallback: calculates from transactions if available (Debits on card minus payments/credits/transfers to card).
 *
 * @param {Array} sources - Array of payment sources (from Expense)
 * @param {Array} transactions - Array of expense transactions
 * @returns {number} Total credit card usage / outstanding due
 */
export const getCreditCardUsage = (sources = [], transactions = []) => {
  const cardMap = new Map();

  (sources || []).forEach((s) => {
    if (!s) return;
    const type = (s.type || "").toLowerCase();
    if (type === "card" || type === "credit card") {
      const id = String(s.id || s._id);
      cardMap.set(id, s);
    }
  });

  (transactions || []).forEach((t) => {
    if (!t) return;
    const src = t.sourceId;
    if (src && typeof src === "object") {
      const type = (src.type || "").toLowerCase();
      if ((type === "card" || type === "credit card") && src._id && !cardMap.has(String(src._id))) {
        cardMap.set(String(src._id), src);
      }
    }
    const trg = t.targetSourceId;
    if (trg && typeof trg === "object") {
      const type = (trg.type || "").toLowerCase();
      if ((type === "card" || type === "credit card") && trg._id && !cardMap.has(String(trg._id))) {
        cardMap.set(String(trg._id), trg);
      }
    }
  });

  let totalDue = 0;
  cardMap.forEach((s) => {
    let due = 0;
    if (s.cardDue !== undefined && s.cardDue !== null && Number(s.cardDue) > 0) {
      due = Number(s.cardDue);
    } else {
      const bal = Number(s.currentBalance !== undefined ? s.currentBalance : s.balance) || 0;
      if (bal < 0) {
        due = Math.abs(bal);
      } else if (Array.isArray(transactions) && transactions.length > 0) {
        const sId = String(s.id || s._id);
        const cardDebits = transactions
          .filter((t) => t.type === "Debit" && String(t.sourceId?._id || t.sourceId) === sId)
          .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
        const cardCredits = transactions
          .filter((t) => (t.type === "Credit" || t.type === "Transfer") && (
            String(t.targetSourceId?._id || t.targetSourceId) === sId ||
            String(t.sourceId?._id || t.sourceId) === sId
          ))
          .reduce((acc, t) => {
            if (t.type === "Credit" && String(t.sourceId?._id || t.sourceId) === sId) {
              return acc + (Number(t.amount) || 0);
            }
            if (t.type === "Transfer" && String(t.targetSourceId?._id || t.targetSourceId) === sId) {
              return acc + (Number(t.amount) || 0);
            }
            return acc;
          }, 0);
        const netDue = cardDebits - cardCredits;
        if (netDue > 0) due = netDue;
      }
    }
    totalDue += due;
  });

  return Math.round(totalDue * 100) / 100;
};
