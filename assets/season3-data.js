(function () {
  "use strict";

  const divisions = {
    "black-hole": {
      name: "黑洞組",
      englishName: "BLACK HOLE DIVISION",
      logo: "assets/black-hole-division-logo.webp",
      tagline: "深不可測，萬有引力。"
    },
    stellar: {
      name: "恆星組",
      englishName: "STELLAR DIVISION",
      logo: "assets/stellar-division-logo.webp",
      tagline: "燃燒核心，照亮戰場。"
    }
  };

  const teams = [
    {
      id: "tcw",
      channelId: "G",
      division: "black-hole",
      shortName: "TCW",
      displayName: "T.C.W 棒球隊",
      logo: "assets/teams/season3/tcw.webp",
      aliases: ["TCW", "T.C.W", "台中金鋼狼", "Taichung City Wolverines"],
      summary: "融合國內外球員，以速度、拚勁與不服輸的態度迎戰每一次挑戰。",
      tagline: "團結、挑戰、勝利，為每一場超越自我。",
      introduction: [
        "T.C.W 棒球隊是 Taichung City Wolverines（台中金鋼狼）的縮寫，也象徵團結（Teamwork）、挑戰（Challenge）與勝利（Win）的信念。",
        "球隊成員對棒球都有無比的執著與熱情，並透過棒球邀請英國、美國等國際球員加入。不同背景的球員在場上並肩作戰，讓每次出賽都有充滿活力的國際交流氛圍。",
        "T.C.W 是一支年輕且具備競爭力的隊伍，速度、拚勁與不服輸的態度，是他們最鮮明的特色。棒球讓隊員相聚，也讓彼此成為球場之外緊密的朋友。",
        "對 T.C.W 而言，每一場比賽都是超越自我、實踐團隊精神的挑戰。"
      ]
    },
    {
      id: "hell-angels",
      channelId: "K",
      division: "black-hole",
      shortName: "地獄天使",
      displayName: "地獄天使棒球隊 Hell Angels",
      logo: "assets/teams/season3/hell-angels.webp",
      aliases: ["地獄天使", "Hell Angels"],
      summary: "在艱難戰局中守住節奏，以團隊與韌性等待致命反擊。",
      tagline: "踏入地獄淬鍊，展現天使之擊。",
      introduction: [
        "地獄天使棒球隊，是由一群對棒球懷抱熱忱、相信團隊力量的夥伴共同組成。",
        "「地獄天使」代表著一種截然不同的比賽信念：面對如地獄般艱難的戰局，依然能承受壓力、守住節奏；當機會來臨，便毫不猶豫地揮出如天使般純粹而致命的一擊。",
        "他們以紮實守備與穩定投手群建立防線，透過確實的補位、溝通與基本功，一個出局數、一個壘包地守住比賽。打線不只追求長打火力，也善於選球、推進與積極跑壘，用持續不斷的壓力撕開對手防線。",
        "真正讓地獄天使難纏的，是面對逆境時的韌性。無論比分領先或落後，從第一球直到最後一個出局數，都不輕易放棄任何反擊的可能。",
        "對他們而言，真正的強大不是從未陷入困境，而是即使身處地獄，依然知道如何並肩走出去。",
        "百鍊成鋼、團結求勝、永不放棄。地獄天使，熬得過地獄，就等得到天使之擊。"
      ]
    },
    {
      id: "good-chill",
      channelId: "D",
      division: "black-hole",
      shortName: "好CHILL",
      displayName: "好CHILL 棒球隊",
      logo: "assets/teams/season3/good-chill.webp",
      aliases: ["好CHILL", "好Chill", "好chill", "好丘"],
      summary: "氣氛輕鬆卻充滿競爭力，在享受比賽的同時保持強烈的求勝心。",
      tagline: "不只 Chill，更要 Win。",
      introduction: [
        "正如隊名，好CHILL 是一支風格自由、氣氛輕鬆，卻潛力驚人的隊伍。",
        "球員來自各行各業，用行動證明「認真打球，也能很 Chill」。儘管賽場講求勝負，他們同樣重視參與、快樂與彼此的信任。",
        "場上的笑容不代表鬆懈。明快的比賽節奏、強烈的進攻意識與靈活守備，讓好CHILL 成為不容忽視的競爭者。",
        "他們要在保持自身風格的同時，向更好的成績前進。"
      ]
    },
    {
      id: "anmu-tech",
      channelId: "J",
      division: "black-hole",
      shortName: "安穆科技",
      displayName: "安穆科技棒球隊",
      logo: "assets/teams/season3/anmu-tech.webp",
      aliases: ["安穆科技", "安穆科技棒球隊"],
      summary: "以穩定、精準與策略配合迎戰強敵，展現安穆人的專注與戰鬥力。",
      tagline: "穩中求勝，精準出擊。",
      introduction: [
        "安穆科技棒球隊是來自高科技產業的代表性隊伍之一，球員來自不同領域，共同構成豐富而緊密的球隊文化。",
        "球隊對棒球充滿熱情，足跡遍及北中南不同球場，也曾遠赴日本東京巨蛋與日本社會人球隊交流。",
        "他們秉持「穩中求勝、精準出擊」的精神，練球嚴謹，戰術布陣也帶有智慧型球風。",
        "安穆科技重視團隊溝通與策略配合，即使面對強敵，也能冷靜應對、穩住陣腳。作為聯盟老牌球隊之一，他們將持續展現安穆人不容小覷的戰鬥力。"
      ]
    },
    {
      id: "jtron",
      channelId: "I",
      division: "black-hole",
      shortName: "捷創科技",
      displayName: "捷創科技 JTRON 棒球隊",
      logo: "assets/teams/season3/jtron.webp",
      aliases: ["捷創科技", "捷創", "JTRON"],
      summary: "把科技產業的嚴謹與專注帶進球場，以冷靜布局尋找致勝一擊。",
      tagline: "無聲布局，一擊必殺。",
      introduction: [
        "捷創科技 JTRON 是一支來自高科技產業的隊伍，長年穿梭於半導體設備維修與精密儀器的世界。如今，他們將那份嚴謹與專注投射到球場，打造兼具科技理性與戰鬥本能的球隊。",
        "在企業中，他們秉持「精準服務，超越期待」的核心精神；在球場上，這句話也成為行動準則。練球如同調校儀器，出賽彷彿執行任務。",
        "JTRON 重視溝通與戰術默契，如同精密系統之間的數據傳輸，無需多言也能心領神會。面對強敵，他們善於分析與調整，用冷靜而銳利的攻勢尋找突破口。",
        "用冷靜取勝、用專業說話、用榮耀戰鬥。沉默，是因為目標鎖定；出擊，必是致命一擊。"
      ]
    },
    {
      id: "jf-sport",
      channelId: "L",
      division: "black-hole",
      shortName: "聚福運動",
      displayName: "聚福運動 JF SPORT",
      logo: "assets/teams/season3/jf-sport.webp",
      aliases: ["聚福運動", "JF SPORT", "JFSPORT"],
      summary: "從訓練基地出發，把每一次練習化為賽場上的節奏與力量。",
      tagline: "JF SPORT，從基地出發，向 CBL 進擊。",
      introduction: [
        "聚福運動 JF SPORT，是一支從室內棒壘訓練基地出發的戰隊。",
        "他們不只是帶著 JF SPORT 隊名加入 CBL，而是把平日訓練館裡累積的揮棒、守備、每一項訓練與默契，帶進正式比賽場上。",
        "對 JF SPORT 來說，每一次練習都不是單純重複，而是在為下一次出擊做準備。",
        "隊徽中的雙貓象徵敏捷、觀察與反應，也代表球隊靈活而專注的球風。飛行中的棒球與交叉球棒，象徵他們從訓練基地出發，準備在聯盟戰場展現 JF 的節奏。",
        "這是一支帶著不斷訓練的能量走進 CBL 的新戰隊。他們不只為參賽而來，而是準備用每一次攻防、每一次揮擊，留下屬於 JF SPORT 的名字。"
      ]
    },
    {
      id: "ngu",
      channelId: "F",
      division: "stellar",
      shortName: "NGU",
      displayName: "台中 NGU 棒球隊",
      logo: "assets/teams/season3/ngu.webp",
      aliases: ["NGU", "台中NGU", "台中 NGU"],
      summary: "因棒球而聚，以休閒交流為起點，在球場累積友誼與共同回憶。",
      tagline: "為熱愛而聚，讓每次上場都值得。",
      introduction: [
        "台中 NGU 是一支以休閒娛樂為主軸的棒球隊，成立的初衷很簡單：讓每一位喜歡棒球的朋友，都能在下班後與週末時光揮棒流汗、放鬆身心。",
        "球隊成員來自各行各業，年齡層多元。無論是剛入門的新手，還是熱愛球場多年的老手，都能在這裡找到一起打球的夥伴。",
        "平時以練習交流為主，也透過比賽享受競技樂趣、珍惜彼此相處的時光。",
        "在 NGU，不只是在打球，也是在球場上累積友誼與回憶，重新找回對棒球的熱情。"
      ]
    },
    {
      id: "chungyi",
      channelId: "H",
      division: "stellar",
      shortName: "創邑",
      displayName: "創邑棒球隊 ChungYi Baseball",
      logo: "assets/teams/season3/chungyi.webp",
      aliases: ["創邑", "ChungYi", "ChungYi Baseball"],
      summary: "以創意、活力與團隊合作迎戰挑戰，在每場比賽中持續成長。",
      tagline: "創無止境，邑戰到底。",
      introduction: [
        "創邑棒球隊是一支充滿創意與活力的隊伍，秉持「創造勝利，築夢未來」的信念，用棒球揮灑青春、展現無限可能。",
        "成員來自各行各業，因熱愛棒球而齊聚一堂，用汗水與團隊合作寫下屬於自己的熱血篇章。",
        "在球場上，創邑不只追求勝負，也重視團隊精神與快樂打球的意義。他們以笑容迎戰挑戰，在每場比賽中找到成長與喜悅。"
      ]
    },
    {
      id: "taichung-social",
      channelId: "M",
      division: "stellar",
      shortName: "台中社會人",
      displayName: "台中社會人",
      logo: "assets/teams/season3/taichung-social.webp",
      aliases: ["台中社會人"],
      summary: "來自不同生活崗位，因棒球並肩而戰；年輕、熱血、團結，為熱愛拚到底。",
      tagline: "年輕、熱血、團結，拚戰到底。",
      introduction: [
        "台中社會人，是一支由年輕、熱血、有活力的夥伴所組成的棒球隊。",
        "他們來自不同的工作崗位，也有著不同的生活背景，但只要踏進球場，大家都有同一個身份：棒球人。球場是他們放下日常壓力、重新燃起熱情的地方；每一次揮棒、每一次撲接、每一次全力衝刺，都是他們對棒球最直接的回應。",
        "隊徽中揮棒出擊的身影，象徵台中社會人不畏挑戰、主動迎戰的精神。綠白色系展現年輕、清爽與團結的球隊氣質，也代表這支隊伍帶著充滿生命力的節奏，準備在 CBL 賽場上打出自己的風格。",
        "對台中社會人來說，勝利很重要，但更重要的是一起並肩作戰的過程。球場上揮灑汗水，球場下分享歡笑，這份情誼與默契，正是他們最珍惜的團隊精神。",
        "台中社會人，為熱愛而戰。"
      ]
    },
    {
      id: "bad-bears",
      channelId: "N",
      division: "stellar",
      shortName: "安穆壞壞熊",
      displayName: "台中安穆科技壞壞熊",
      logo: "assets/teams/season3/bad-bears.webp",
      aliases: ["台中安穆科技壞壞熊", "安穆科技壞壞熊", "安穆壞壞熊", "壞壞熊"],
      summary: "你以為是二軍，NoNo~而是安穆科技更奔放、更具侵略性的另一種戰鬥人格。",
      tagline: "壞得有態度，瘋得有章法。",
      introduction: [
        "不是二軍，是另一種戰鬥人格。台中安穆科技壞壞熊，是由台中安穆科技所組織的第二支戰隊。",
        "他們的出現，不是為了成為原有球隊的影子，也不是單純作為分支隊伍加入戰局。壞壞熊代表安穆科技另一種截然不同的比賽性格：更奔放、更具侵略性，也更敢在場上製造變數。",
        "當其他隊伍以為他們只是第二戰隊時，壞壞熊會用自己的方式證明：他們不是來陪跑的，也不是來低調練兵的。",
        "他們要用更壞、更瘋、更追逐勝利的競技野球，把比賽節奏攪動起來。",
        "隊徽中的藍色壞熊帶著挑釁般的笑容，象徵野性、壓迫感與不服輸的競爭心。那不是溫馴的笑，而是準備出擊的信號；也不是單純的可愛，而是把對抗變成樂趣的戰鬥姿態。",
        "台中安穆科技壞壞熊，壞得有態度，瘋得有章法。"
      ]
    },
    {
      id: "rakuten",
      channelId: "E",
      division: "stellar",
      shortName: "樂天",
      displayName: "台中樂天棒球隊",
      logo: "assets/teams/season3/rakuten.webp",
      aliases: ["台中樂天", "樂天", "台中樂天棒球隊"],
      summary: "以積極樂觀的態度迎接每場比賽，在默契與信任中持續成長。",
      tagline: "以樂天精神，迎戰每一次挑戰。",
      introduction: [
        "台中樂天棒球隊是一支充滿正能量的球隊，以積極樂觀的態度迎接每場比賽，不論勝敗都能從中找到學習與成長的樂趣。",
        "隊員來自各行各業，從日常工作走進球場，彼此的默契與信任成為球隊最大的資產。",
        "樂天是聯盟元老球隊之一，擁有穩定打線與默契十足的團隊組合，是一支攻守平衡的勁旅。",
        "他們相信，只要保持熱情與正向態度，任何挑戰都能迎刃而解，並將持續用精彩比賽打出團隊的榮耀與驕傲。"
      ]
    },
    {
      id: "nomads",
      channelId: "C",
      division: "stellar",
      shortName: "遊牧者",
      displayName: "遊牧者棒球隊",
      logo: "assets/teams/season3/nomads.webp",
      aliases: ["遊牧者", "遊牧者棒球隊"],
      summary: "風格自由奔放、節奏靈活多變，在信任與鼓勵中保持強烈競爭力。",
      tagline: "自由奔放，在變化中找到致勝節拍。",
      introduction: [
        "遊牧者棒球隊是一支風格自由奔放、充滿活力與動力的隊伍。",
        "成員來自不同產業與年齡層，因對棒球的熱愛而聚集。正如「遊牧」一詞，人員來來去去，對棒球的本心始終不變。",
        "他們的比賽節奏靈活多變、戰術大膽，不服輸的精神讓他們成為難以預測的對手。",
        "遊牧者重視態度與氣氛，球隊文化不拘形式，強調彼此信任與鼓勵。",
        "他們在自由的節奏中找到致勝節拍，用行動證明，享受比賽的同時也能在球場展現強烈存在感。"
      ]
    }
  ];

  const videos = [
    { id: "jiuKIi0mycc", title: "遊牧者 vs 神清163", label: "CBL 聯盟賽事", game: "GAME 01" },
    { id: "yLhFPCSkVL4", title: "好CHILL vs 樂天", label: "CBL 聯盟賽事", game: "GAME 02" },
    { id: "ANlf4Bt6ZQg", title: "創邑 vs 台中 NGU", label: "CBL 聯盟賽事", game: "GAME 03" }
  ];

  function normalizeTeamName(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/棒球隊|科技/g, "")
      .replace(/[\s.．·・_\-]/g, "");
  }

  function findTeam(value) {
    const normalized = normalizeTeamName(value);
    if (!normalized) return null;
    const candidates = teams.flatMap((team) =>
      [team.displayName, team.shortName, ...team.aliases].map((alias) => ({ team, alias }))
    ).sort((a, b) => normalizeTeamName(b.alias).length - normalizeTeamName(a.alias).length);
    return candidates.find((candidate) => normalized.includes(normalizeTeamName(candidate.alias)))?.team || null;
  }

  window.CBL_SEASON3 = { divisions, teams, videos, normalizeTeamName, findTeam };
})();
