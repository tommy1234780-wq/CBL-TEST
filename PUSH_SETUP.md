# CBL 球隊推播後端設定

目前網站前端已經完成 PWA 安裝、Service Worker、球隊選擇與 Push API 訂閱流程。要真的發送跨裝置通知，請在 HTTPS 網域提供下列 API，並將 `vapidPublicKey` 寫入頁面載入前的 `window.CBL_PUSH_CONFIG`。

```html
<script>
  window.CBL_PUSH_CONFIG = {
    vapidPublicKey: "你的 VAPID 公鑰",
    subscribeEndpoint: "/api/push/subscribe",
    unsubscribeEndpoint: "/api/push/unsubscribe"
  };
</script>
```

## API 契約

### `POST /api/push/subscribe`

請求 JSON：

```json
{
  "subscription": {
    "endpoint": "瀏覽器提供的 endpoint",
    "keys": { "p256dh": "...", "auth": "..." }
  },
  "teamIds": ["A", "E"]
}
```

後端應保存 `subscription`、`teamIds` 與建立時間。不要把訂閱資料只存在瀏覽器的 localStorage，否則無法在使用者離線時發送通知。

### `POST /api/push/unsubscribe`

請求 JSON：

```json
{ "endpoint": "要移除的 subscription endpoint" }
```

當賽程結果或公告發布時，後端依消息的 `teamId` 找出訂閱者，使用 Web Push（例如 Node.js `web-push` 套件）發送：

```json
{
  "title": "CBL｜戰狼棒球隊賽程提醒",
  "body": "本週六 14:00 對戰神清163，歡迎到場加油！",
  "url": "./賽程戰績表.html"
}
```

## 上線注意事項

- 必須使用 HTTPS；`localhost` 僅適合開發測試。
- VAPID 私鑰只能放在後端環境變數，不能放進網站檔案。
- 推播權限要由使用者點擊按鈕觸發，不能頁面一載入就跳出授權視窗。
- 發送失敗或回傳 `404/410` 的訂閱應從資料庫刪除。


## 官方通知

前端現在提供「CBL 官方通知」選項，送到後端的頻道 ID 是 OFFICIAL。球隊頻道則是 A 到 J。

後端發送時，依頻道篩選訂閱資料。例如官方公告應選出包含 OFFICIAL 的訂閱，再透過 Web Push 發送：

POST /api/push/send

請求 JSON：

{
  "channelId": "OFFICIAL",
  "title": "CBL 官方公告",
  "body": "第三屆最新賽事公告已發布。",
  "url": "https://tommy1234780-wq.github.io/CBL-TEST/"
}

這個發送 API 必須限制管理員使用，VAPID 私鑰只能放在伺服器環境變數，不能放在前端或 GitHub repository。
