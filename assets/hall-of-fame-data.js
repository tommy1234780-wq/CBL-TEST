(function () {
  "use strict";

  window.CBL_HALL_OF_FAME = Object.freeze({
    defaultSeason: "2",
    seasons: {
      "1": {
        label: "第一屆",
        recordLabel: "第一屆正式紀錄",
        awardCount: 11,
        playerCount: 10,
        description: "第一屆例行賽個人獎項與年度最高榮耀，完整保存每一份開創聯盟歷史的成績。",
        highlights: [
          {
            id: "s1-mvp",
            kind: "mvp",
            award: "年度 MVP",
            awardEn: "MOST VALUABLE PLAYER",
            player: "賴韋廷",
            team: "安穆科技棒球隊",
            photo: "images/賴韋廷.jpg",
            photoPosition: "center top",
            logo: "assets/teams/J.webp",
            quote: "以整季穩定輸出與關鍵長打承擔勝負，也讓球隊的每一場努力，被聯盟正式記錄。",
            metrics: [
              { label: "AVG", value: ".517" },
              { label: "HR", value: "6" },
              { label: "RBI", value: "20" }
            ]
          }
        ],
        hitting: [
          award("s1-h-01", "打擊王", "BATTING AVERAGE", ".533 AVG", [winner("王瑋鋐", "好Chill 棒球隊", "images/王瑋鋐.jpg", "assets/teams/D.webp")]),
          award("s1-h-02", "安打王", "HITS LEADER", "15 H", [
            winner("詹承憲", "遊牧者棒球隊", "images/詹承憲.jpg", "assets/teams/C.webp"),
            winner("賴韋廷", "安穆科技棒球隊", "images/賴韋廷.jpg", "assets/teams/J.webp"),
            winner("施昱綸", "好Chill 棒球隊", "images/施昱綸.jpg", "assets/teams/D.webp"),
            winner("李統裕", "遊牧者棒球隊", "images/李統裕.jpg", "assets/teams/C.webp")
          ], true),
          award("s1-h-03", "全壘打王", "HOME RUN LEADER", "6 HR", [winner("賴韋廷", "安穆科技棒球隊", "images/賴韋廷.jpg", "assets/teams/J.webp")]),
          award("s1-h-04", "打點王", "RBI LEADER", "20 RBI", [winner("賴韋廷", "安穆科技棒球隊", "images/賴韋廷.jpg", "assets/teams/J.webp")]),
          award("s1-h-05", "盜壘王", "STOLEN BASE LEADER", "17 SB", [winner("賴丞郁", "遊牧者棒球隊", "images/賴承郁.jpg", "assets/teams/C.webp")])
        ],
        pitching: [
          award("s1-p-01", "防禦率王", "EARNED RUN AVERAGE", "2.97 ERA", [winner("林銘孝", "安穆科技棒球隊", "images/林銘孝.jpg", "assets/teams/J.webp")]),
          award("s1-p-02", "勝投王", "WIN LEADER", "3 W", [winner("羅迪", "安穆科技棒球隊", "images/羅迪.jpg", "assets/teams/J.webp")]),
          award("s1-p-03", "三振王", "STRIKEOUT LEADER", "22 K", [winner("王瑋鋐", "好Chill 棒球隊", "images/王瑋鋐.jpg", "assets/teams/D.webp")]),
          award("s1-p-04", "中繼王", "HOLD LEADER", "6 HLD", [winner("林晏辰", "T.C.W 棒球隊", "images/林晏辰.jpg", "assets/teams/G.webp")]),
          award("s1-p-05", "救援王", "SAVE LEADER", "3 SV", [
            winner("李統裕", "遊牧者棒球隊", "images/李統裕.jpg", "assets/teams/C.webp"),
            winner("陳麒文", "安穆科技棒球隊", "images/陳麒文.jpg", "assets/teams/J.webp")
          ], true)
        ]
      },
      "2": {
        label: "第二屆",
        recordLabel: "第二屆正式紀錄",
        awardCount: 12,
        playerCount: 11,
        description: "第二屆年度票選與例行賽個人獎項，正式收錄每位在球場上留下代表性成就的球員。",
        highlights: [
          {
            id: "s2-mvp",
            kind: "mvp",
            award: "年度 MVP",
            awardEn: "MOST VALUABLE PLAYER",
            player: "林銘孝",
            team: "安穆科技",
            photo: "assets/players/season2/lin-ming-hsiao.webp",
            photoPosition: "center 18%",
            logo: "assets/teams/J.webp",
            quote: "以打擊與投球的雙向貢獻，獲得球員數據、球迷支持與聯盟評選的年度最高肯定。",
            tags: ["例行賽年度最高個人榮耀", "正式票選紀錄"]
          },
          {
            id: "s2-popularity",
            kind: "popularity",
            award: "人氣王",
            awardEn: "FAN FAVORITE AWARD",
            player: "張智翔",
            team: "樂天",
            photo: "assets/players/season2/chang-chih-hsiang.webp",
            photoPosition: "35% 31%",
            photoScale: 1.28,
            logo: "assets/teams/E.webp",
            quote: "以鮮明球風與賽場表現獲得球迷支持，成為第二屆最受矚目的社群人氣代表。",
            tags: ["球迷支持榮耀", "第二屆正式紀錄"]
          }
        ],
        hitting: [
          award("s2-h-01", "打擊王", "BATTING AVERAGE", "0.625 AVG", [winner("吳承軒", "捷創科技", "assets/players/season2/wu-cheng-hsuan.webp", "assets/teams/I.webp", "center 22%")]),
          award("s2-h-02", "全壘打王", "HOME RUN LEADER", "5 HR", [winner("賴韋廷", "安穆科技", "assets/players/season2/lai-wei-ting.webp", "assets/teams/J.webp", "center 13%")], false, true),
          award("s2-h-03", "全壘打王", "HOME RUN LEADER", "5 HR", [winner("張智翔", "樂天", "assets/players/season2/chang-chih-hsiang.webp", "assets/teams/E.webp", "35% 31%", 1.28)], false, true),
          award("s2-h-04", "打點王", "RBI LEADER", "24 RBI", [winner("陳尚季", "T.C.W", "assets/players/season2/chen-shang-chi.webp", "assets/teams/G.webp", "center 30%", 1.22)]),
          award("s2-h-05", "盜壘王", "STOLEN BASE LEADER", "23 SB", [winner("陸沅頡", "T.C.W", "assets/players/season2/lu-yuan-chieh.webp", "assets/teams/G.webp", "center 2%")]),
          award("s2-h-06", "安打王", "HITS LEADER", "29 H", [winner("陳尚季", "T.C.W", "assets/players/season2/chen-shang-chi.webp", "assets/teams/G.webp", "center 30%", 1.22)], false, true),
          award("s2-h-07", "安打王", "HITS LEADER", "29 H", [winner("蕭銓廷", "好Chill野球", "assets/players/season2/hsiao-chuan-ting.webp", "assets/teams/D.webp", "center 9%")], false, true)
        ],
        pitching: [
          award("s2-p-01", "防禦率王", "EARNED RUN AVERAGE", "2.39 ERA", [winner("王瑋鋐", "好Chill野球", "assets/players/season2/wang-wei-hung.webp", "assets/teams/D.webp", "center 4%")]),
          award("s2-p-02", "中繼王", "HOLD LEADER", "3 HLD", [winner("翁郁程", "T.C.W", "assets/players/season2/weng-yu-cheng.webp", "assets/teams/G.webp", "center 5%")]),
          award("s2-p-03", "三振王", "STRIKEOUT LEADER", "67 K", [winner("陳啟賢", "創邑", "assets/players/season2/chen-chi-hsien.webp", "assets/teams/H.webp", "center 19%", 1.35)]),
          award("s2-p-04", "救援王", "SAVE LEADER", "3 SV", [winner("王瑋鋐", "好Chill野球", "assets/players/season2/wang-wei-hung.webp", "assets/teams/D.webp", "center 4%")]),
          award("s2-p-05", "勝投王", "WIN LEADER", "6 W", [winner("呂銘杰", "T.C.W", "assets/players/season2/lu-ming-chieh.webp", "assets/teams/G.webp", "center 5%")])
        ]
      }
    }
  });

  function award(id, name, nameEn, stat, winners, shared = false, tied = false) {
    return { id, name, nameEn, stat, winners, shared, tied };
  }

  function winner(name, team, photo, logo, photoPosition = "center top", photoScale = 1) {
    return { name, team, photo, logo, photoPosition, photoScale };
  }
})();
