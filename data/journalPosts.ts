export type JournalSection = {
  heading?: string;
  paragraphs?: string[];
  image?: string;
  imageAlt?: string;
  quote?: string;
};

export type JournalPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readingTime: string;

  coverImage: string;
  coverAlt: string;

  sections: JournalSection[];
};

export const journalPosts: JournalPost[] = [
  {
    slug: "booking-my-germany-exchange-flight",

    title: "今天，我終於訂下前往德國交換的機票",

    excerpt:
      "從一個模糊的交換夢想到真正按下付款鍵，原來訂機票不只是買一張票，而是第一次感覺這趟旅程真的要開始了。",

    category: "Exchange Diary",
    date: "2026-07-23",
    readingTime: "5 min read",

    coverImage:
      "/images/journal/booking-flight-cover.jpg",

    coverAlt:
      "準備前往德國交換的機票與旅行物品",

    sections: [
      {
        paragraphs: [
          "今天，我終於把前往德國交換的機票訂下來了。",
          "明明在按下付款之前，我已經查過很多次航班、價格、轉機方式和行李規定，但真正看到訂位完成的那一刻，還是有一種很不真實的感覺。",
          "交換這件事原本一直存在於申請資料、學校名單和待辦事項裡，直到機票確認後，它才第一次變成一個有確切日期的未來。",
        ],
      },
      {
        heading: "買機票前，我在意的不只有價格",

        paragraphs: [
          "一開始查機票時，我最直覺比較的是價格，但後來發現，長途交換和一般短期旅行不太一樣。",
          "除了票價，我還需要考慮托運行李、轉機時間、抵達城市、航班時間，以及如果臨時改變計畫，機票是否能調整。",
          "便宜幾千元的選項，不一定真的比較適合。若要多轉一次機、行李額度比較少，或抵達時間很不方便，整趟旅程可能反而更累。",
        ],
      },
      {
        image:
          "/images/journal/booking-flight-01.jpg",

        imageAlt:
          "查看前往德國航班資訊的畫面",
      },
      {
        heading: "按下付款的那一刻",

        paragraphs: [
          "我在付款頁面停了很久，一方面是因為金額真的不小，另一方面則是因為這個動作代表我正式把自己送往一段未知的生活。",
          "接下來，我要開始處理住宿、保險、簽證、行李和歐洲旅行規劃。事情似乎一下子變得很多，但也因此讓我更期待。",
        ],

        quote:
          "機票不是旅程的開始，但它讓一個遙遠的夢，第一次有了確切的日期。",
      },
      {
        heading: "我現在的心情",

        paragraphs: [
          "有興奮，也有一點緊張。",
          "我不知道抵達德國後，自己會不會很快適應，也不知道未來幾個月會發生什麼事。",
          "但至少今天，我替未來的自己做了一個很勇敢的決定。",
          "下一次打開這篇文章時，我可能已經在德國了。",
        ],
      },
    ],
  },

  {
    slug: "starting-my-airline-miles-journey",

    title: "交換生活的花費，可以順便累積航空里程嗎？",

    excerpt:
      "準備到德國生活後，我開始思考：既然海外消費和機票支出無法避免，能不能讓這些花費慢慢變成下一趟旅程？",

    category: "Miles & Money",
    date: "2026-07-23",
    readingTime: "7 min read",

    coverImage:
      "/images/journal/miles-cover.jpg",

    coverAlt:
      "航空里程、信用卡與旅行規劃",

    sections: [
      {
        paragraphs: [
          "訂完機票之後，我開始認真研究航空里程。",
          "以前的我只知道搭飛機可以累積里程，卻沒有真正理解信用卡消費、航空聯盟和兌換機票之間的關係。",
          "準備到德國交換後，我才發現，未來半年會有不少海外消費。如果這些原本就會支出的生活費，能順便累積一些里程，也許可以替下一趟旅行省下一部分費用。",
        ],
      },
      {
        heading: "我一開始的想法很簡單",

        paragraphs: [
          "我原本以為，只要辦一張有哩程回饋的信用卡，在海外刷卡，就可以很快累積到一張免費機票。",
          "但實際研究後才發現，還需要考慮海外交易手續費、每一元可以累積多少里程、里程是否會過期，以及可以轉換到哪些航空公司。",
          "有些卡片看起來回饋很高，但扣掉海外手續費後，不一定真的划算；有些卡片則比較適合累積特定航空公司的里程。",
        ],
      },
      {
        image:
          "/images/journal/miles-01.jpg",

        imageAlt:
          "整理海外刷卡與航空里程的筆記",
      },
      {
        heading: "去德國後，會常搭哪些航空公司？",

        paragraphs: [
          "如果未來在德國念書或長期生活，我可能會比較常接觸漢莎航空，以及同一航空聯盟的航班。",
          "因此，與其只看某張信用卡給多少回饋，我還需要先想清楚：自己未來最常搭哪一家航空公司、希望兌換哪一條航線，以及里程要集中在哪一個計畫。",
          "若把里程分散在太多地方，最後可能每一個帳戶都不足以兌換機票。",
        ],
      },
      {
        heading: "交換半年，需要辦德國信用卡嗎？",

        paragraphs: [
          "短期交換期間，我不一定能立刻申請到德國信用卡，因此比較實際的方式，可能是使用台灣的海外回饋信用卡，再搭配 Revolut 等簽帳卡管理日常支出。",
          "信用卡可以負責有回饋的大額消費，簽帳卡則可以用於轉帳、換匯或不方便刷台灣信用卡的情況。",
          "但無論使用哪一張卡，都必須確認匯率、海外手續費與回饋上限，而不是只看到宣傳上的回饋百分比。",
        ],
      },
      {
        heading: "里程不是免費，而是一種規劃",

        paragraphs: [
          "研究後，我覺得里程不應該成為讓自己多花錢的理由。",
          "最理想的方式，是把原本就需要支付的機票、住宿、交通和生活費集中在合適的卡片上，慢慢累積。",
          "如果為了拿里程購買不需要的東西，最後省下的機票錢，可能早就被額外消費抵銷了。",
        ],

        quote:
          "真正划算的里程，是從原本就會發生的支出裡累積，而不是為了里程製造更多支出。",
      },
      {
        heading: "我的現階段策略",

        paragraphs: [
          "目前我不打算一次辦很多張卡，而是先選擇一張適合海外消費、回饋規則清楚，而且能轉換到自己可能使用之航空計畫的卡片。",
          "交換期間先記錄實際消費與累積速度，再決定未來到德國念碩士時，要不要申請當地信用卡或調整里程策略。",
          "我不確定最後能不能真的用里程換到商務艙，但至少這次研究，讓我開始用更長期的角度安排旅行支出。",
        ],
      },
    ],
  },
];

export function getJournalPost(
  slug: string,
): JournalPost | undefined {
  return journalPosts.find(
    (post) => post.slug === slug,
  );
}