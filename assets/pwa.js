(function () {
  "use strict";

  const teams = [
    ["A", "戰狼棒球隊"], ["B", "神清163棒球隊"], ["C", "遊牧者棒球隊"], ["D", "好Chill棒球隊"],
    ["E", "台中樂天棒球隊"], ["F", "台中NGU棒球隊"], ["G", "T.C.W棒球隊"], ["H", "創邑棒球隊"],
    ["I", "捷創科技 JTRON"], ["J", "安穆科技棒球隊"]
  ];
  const config = window.CBL_PUSH_CONFIG || { subscribeEndpoint: "/api/push/subscribe", unsubscribeEndpoint: "/api/push/unsubscribe", vapidPublicKey: "" };
  const panel = document.querySelector("[data-push-panel]");
  if (!panel) return;
  const options = panel.querySelector("[data-team-options]");
  const status = panel.querySelector("[data-push-status]");
  const enable = panel.querySelector("[data-enable-push]");
  const disable = panel.querySelector("[data-disable-push]");
  const saved = JSON.parse(localStorage.getItem("cbl-followed-teams") || "[]");

  options.innerHTML = teams.map(([id, name]) => '<label class="team-option"><input type="checkbox" value="' + id + '" ' + (saved.includes(id) ? "checked" : "") + "><span>" + name + "</span></label>").join("");
  const selectedTeams = () => [...options.querySelectorAll("input:checked")].map((input) => input.value);
  const setStatus = (message) => { status.textContent = message; };

  if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(() => {});
  if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    enable.disabled = true; setStatus("此瀏覽器不支援網站推播，仍可保存你的球隊選擇。");
  }

  enable.addEventListener("click", async () => {
    const teamIds = selectedTeams();
    if (!teamIds.length) return setStatus("請至少選擇一支球隊。");
    localStorage.setItem("cbl-followed-teams", JSON.stringify(teamIds));
    if (!config.vapidPublicKey) return setStatus("球隊已保存。完成網站 HTTPS 與推播伺服器設定後即可收到通知。");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return setStatus("你尚未允許通知，可稍後再試。");
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(config.vapidPublicKey) });
      const response = await fetch(config.subscribeEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subscription, teamIds }) });
      if (!response.ok) throw new Error("subscribe failed");
      enable.hidden = true; disable.hidden = false; setStatus("已開啟推播：" + teamIds.length + " 支球隊。");
    } catch (_) { setStatus("推播設定失敗，請確認網站使用 HTTPS 並稍後再試。"); }
  });

  disable.addEventListener("click", async () => {
    localStorage.removeItem("cbl-followed-teams");
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) { await fetch(config.unsubscribeEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: subscription.endpoint }) }).catch(() => {}); await subscription.unsubscribe(); }
    options.querySelectorAll("input").forEach((input) => { input.checked = false; });
    disable.hidden = true; enable.hidden = false; setStatus("已取消球隊推播。");
  });

  function urlBase64ToUint8Array(base64String) { const padding = "=".repeat((4 - base64String.length % 4) % 4); const rawData = atob((base64String + padding).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0))); }
})();
