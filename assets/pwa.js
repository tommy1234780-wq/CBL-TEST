(function () {
  "use strict";

  // PWA 更新檢查獨立於推播面板，讓所有載入本檔的頁面都能自動更新。
  if ("serviceWorker" in navigator) {
    let reloading = false;

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    });

    navigator.serviceWorker
      .register("./sw.js", { updateViaCache: "none" })
      .then((registration) => {
        // 每次開啟網站 / PWA 都主動向伺服器確認 sw.js 是否有新版。
        registration.update().catch(() => {});

        // PWA 從背景回到前景時再檢查一次，避免長時間不關閉而錯過更新。
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") {
            registration.update().catch(() => {});
          }
        });
      })
      .catch(() => {});
  }

  const teams = [
    ["OFFICIAL", "CBL 官方通知"],
    ["A", "戰狼棒球隊"], ["B", "神清163棒球隊"], ["C", "遊牧者棒球隊"], ["D", "好Chill棒球隊"],
    ["E", "台中樂天棒球隊"], ["F", "台中NGU棒球隊"], ["G", "T.C.W棒球隊"], ["H", "創邑棒球隊"],
    ["I", "捷創科技 JTRON"], ["J", "安穆科技棒球隊"]
  ];
  const config = window.CBL_PUSH_CONFIG || {
    supabaseUrl: "https://iwwwpgdrasrhmrhncsim.supabase.co",
    supabasePublishableKey: "sb_publishable_2Ko8glEiFB6NfunRyCr_4A_c1c1fvmO",
    subscribeEndpoint: "https://iwwwpgdrasrhmrhncsim.supabase.co/functions/v1/push-subscribe",
    unsubscribeEndpoint: "https://iwwwpgdrasrhmrhncsim.supabase.co/functions/v1/push-unsubscribe",
    vapidPublicKey: "BA461i_ApeYPTt5PLjpC9JWvlXCRBlBn8i6RvJhasK0doPIpJM3YS01qQsCYq4DtvRug-j3VnCsHRtfmzfUqFxE"
  };
  const panel = document.querySelector("[data-push-panel]");
  if (!panel) return;
  const options = panel.querySelector("[data-team-options]");
  const status = panel.querySelector("[data-push-status]");
  const enable = panel.querySelector("[data-enable-push]");
  const disable = panel.querySelector("[data-disable-push]");
  const toggle = panel.querySelector("[data-push-toggle]");
  const settings = panel.querySelector("[data-push-settings]");
  const saved = JSON.parse(localStorage.getItem("cbl-followed-teams") || "[]");

  function setExpanded(expanded) {
    settings.hidden = !expanded;
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.textContent = expanded ? "收起設定" : "✦ 設定通知";
  }
  toggle.addEventListener("click", () => setExpanded(settings.hidden));

  const authClient = window.supabase?.createClient(config.supabaseUrl, config.supabasePublishableKey);
  async function accessToken() {
    if (!authClient) throw new Error("auth_client_unavailable");
    let { data: { session }, error: sessionError } = await authClient.auth.getSession();
    if (sessionError) throw new Error("auth_session_failed");
    if (!session) {
      const result = await authClient.auth.signInAnonymously();
      if (result.error || !result.data.session) throw new Error("anonymous_signin_failed");
      session = result.data.session;
    }
    return session.access_token;
  }

  options.innerHTML = teams.map(([id, name]) => '<label class="team-option"><input type="checkbox" value="' + id + '" ' + (saved.includes(id) ? "checked" : "") + "><span>" + name + "</span></label>").join("");
  const selectedTeams = () => [...options.querySelectorAll("input:checked")].map((input) => input.value);
  const setStatus = (message) => { status.textContent = message; };

  function pushErrorMessage(error) {
    const code = error?.message || "";
    if (code === "permission_denied") return "通知權限被拒絕，請到瀏覽器或主畫面 App 設定中允許通知。";
    if (code === "auth_client_unavailable") return "通知登入元件尚未載入，請重新整理頁面後再試。";
    if (code === "auth_session_failed" || code === "anonymous_signin_failed") return "通知身分建立失敗，請重新整理頁面後再試。";
    if (code === "push_subscription_failed") return "無法建立瀏覽器推播訂閱，請確認通知權限後再試。";
    if (code === "subscribe_401") return "通知登入已失效，請重新整理頁面後再試。";
    if (code === "subscribe_400") return "通知資料格式不完整，請重新選擇球隊後再試。";
    if (code === "subscribe_409") return "此裝置的舊通知資料發生衝突，請重新整理後再試。";
    if (code === "subscribe_500") return "通知伺服器暫時無法寫入訂閱資料，請稍後再試。";
    if (code.startsWith("subscribe_")) return "通知伺服器回應異常（" + code.replace("subscribe_", "") + "），請稍後再試。";
    return "推播設定失敗，請重新整理頁面後再試。";
  }

  if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    enable.disabled = true; setStatus("此瀏覽器不支援網站推播，仍可保存你的球隊選擇。");
  }

  enable.addEventListener("click", async () => {
    const teamIds = selectedTeams();
    if (!teamIds.length) return setStatus("請至少選擇一支球隊。");
    localStorage.setItem("cbl-followed-teams", JSON.stringify(teamIds));
    if (!config.vapidPublicKey) return setStatus("通知頻道已保存。完成推播伺服器設定後即可收到通知。");
    enable.disabled = true;
    setStatus("正在設定通知…");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") throw new Error("permission_denied");
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        try {
          subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(config.vapidPublicKey) });
        } catch (_) {
          throw new Error("push_subscription_failed");
        }
      }
      const token = await accessToken();
      const response = await fetch(config.subscribeEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token, "apikey": config.supabasePublishableKey },
        body: JSON.stringify({ subscription, teamIds })
      });
      if (!response.ok) throw new Error("subscribe_" + response.status);
      enable.hidden = true;
      disable.hidden = false;
      setStatus("已開啟推播：" + teamIds.length + " 個通知頻道。");
    } catch (error) {
      setStatus(pushErrorMessage(error));
    } finally {
      enable.disabled = false;
    }
  });

  disable.addEventListener("click", async () => {
    localStorage.removeItem("cbl-followed-teams");
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      try {
        const token = await accessToken();
        await fetch(config.unsubscribeEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token, "apikey": config.supabasePublishableKey },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        });
      } catch (_) {}
      await subscription.unsubscribe();
    }
    options.querySelectorAll("input").forEach((input) => { input.checked = false; });
    disable.hidden = true; enable.hidden = false; setStatus("已取消球隊推播。");
  });

  function urlBase64ToUint8Array(base64String) { const padding = "=".repeat((4 - base64String.length % 4) % 4); const rawData = atob((base64String + padding).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0))); }
})();
