import type { ClassicMovie, ClassicScreening, ScreeningSourceItem, ScreeningWeek } from "../types";

// This file is generated from ../../../电影.txt by scripts/import-screening-history.mjs.
// Edit 电影.txt, then run `npm run screenings:import-history` to refresh it.

export const generatedScreeningHistorySource = {
  "sourceFile": "电影.txt",
  "sourceHash": "703d4260b23109e6f3ca76f1f646bd2659b256fbb8cd6cc3efb0ad6806ca5592",
  "generatedAt": "2026-06-07T07:07:12.574Z",
  "totalScreenings": 99,
  "totalItems": 151
};

export const generatedScreeningHistoryWeeks = [
  {
    "id": "screening-2022-01-18-098",
    "date": "2022-01-18",
    "startsAt": "2022-01-18T20:00:00+08:00",
    "title": "《西游记续集》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-bdxux1",
        "libraryId": "history-bdxux1",
        "type": "topic",
        "title": "西游记续集",
        "description": "2022-01-18 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1JF411p7mL/?spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2022",
          "Bilibili"
        ],
        "note": "2022.1.18-2.12 归档；已记录播放入口。"
      }
    ],
    "notes": "2022.1.18-2.12；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1JF411p7mL/?spm_id_from=333.1369.0.0",
    "archivedAt": "2022-01-18T23:30:00+08:00"
  },
  {
    "id": "screening-2022-01-22-099",
    "date": "2022-01-22",
    "startsAt": "2022-01-22T20:00:00+08:00",
    "title": "《剧场版 少女☆歌剧 Revue Starlight》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1nod4g0",
        "libraryId": "history-1nod4g0",
        "type": "anime",
        "title": "剧场版 少女☆歌剧 Revue Starlight",
        "description": "2022-01-22 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1dL4y1s7jd?t=2h31m15s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2022",
          "Bilibili",
          "动画"
        ],
        "note": "2022.1.22 归档；已记录播放入口。"
      }
    ],
    "notes": "2022.1.22；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1dL4y1s7jd?t=2h31m15s&spm_id_from=333.1369.0.0",
    "archivedAt": "2022-01-22T23:30:00+08:00"
  },
  {
    "id": "screening-2022-02-19-097",
    "date": "2022-02-19",
    "startsAt": "2022-02-19T20:00:00+08:00",
    "title": "《红楼梦》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-17hvu6f",
        "libraryId": "history-17hvu6f",
        "type": "topic",
        "title": "红楼梦",
        "description": "2022-02-19 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1WZ4y1d7X2?spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2022",
          "Bilibili"
        ],
        "note": "2022.2.19 归档；已记录播放入口。"
      }
    ],
    "notes": "2022.2.19；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1WZ4y1d7X2?spm_id_from=333.1369.0.0",
    "archivedAt": "2022-02-19T23:30:00+08:00"
  },
  {
    "id": "screening-2022-05-13-096",
    "date": "2022-05-13",
    "startsAt": "2022-05-13T20:00:00+08:00",
    "title": "《彗星来的那一夜》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1rsnn3r",
        "libraryId": "history-1rsnn3r",
        "type": "topic",
        "title": "彗星来的那一夜",
        "description": "2022-05-13 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1WU4y1m7gK?t=29s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2022",
          "Bilibili"
        ],
        "note": "2022.5.13 归档；已记录播放入口。"
      }
    ],
    "notes": "2022.5.13；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1WU4y1m7gK?t=29s&spm_id_from=333.1369.0.0",
    "archivedAt": "2022-05-13T23:30:00+08:00"
  },
  {
    "id": "screening-2022-05-23-095",
    "date": "2022-05-23",
    "startsAt": "2022-05-23T20:00:00+08:00",
    "title": "《90婚介所2022》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-qick4r",
        "libraryId": "history-qick4r",
        "type": "topic",
        "title": "90婚介所2022",
        "description": "2022-05-23 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1CT411V79M/?spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2022",
          "Bilibili"
        ],
        "note": "2022.5.23~2022.8.22 归档；已记录播放入口。"
      }
    ],
    "notes": "2022.5.23~2022.8.22；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1CT411V79M/?spm_id_from=333.1369.0.0",
    "archivedAt": "2022-05-23T23:30:00+08:00"
  },
  {
    "id": "screening-2022-09-06-094",
    "date": "2022-09-06",
    "startsAt": "2022-09-06T20:00:00+08:00",
    "title": "《康熙王朝》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-o6ro7h",
        "libraryId": "history-o6ro7h",
        "type": "topic",
        "title": "康熙王朝",
        "description": "2022-09-06 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/opus/728257987773202435?spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2022",
          "Bilibili",
          "动态/网盘"
        ],
        "note": "2022.9.6~2022.10.4 归档；已记录播放入口。"
      }
    ],
    "notes": "2022.9.6~2022.10.4；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/opus/728257987773202435?spm_id_from=333.1369.0.0",
    "archivedAt": "2022-09-06T23:30:00+08:00"
  },
  {
    "id": "screening-2022-10-05-093",
    "date": "2022-10-05",
    "startsAt": "2022-10-05T20:00:00+08:00",
    "title": "《Just Because!》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-16w7vcm",
        "libraryId": "history-16w7vcm",
        "type": "anime",
        "title": "Just Because!",
        "description": "2022-10-05 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV12G41177Nh/?spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2022",
          "Bilibili",
          "动画"
        ],
        "note": "2022.10.5~2022.10.6 归档；已记录播放入口。"
      }
    ],
    "notes": "2022.10.5~2022.10.6；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV12G41177Nh/?spm_id_from=333.1369.0.0",
    "archivedAt": "2022-10-05T23:30:00+08:00"
  },
  {
    "id": "screening-2023-02-21-092",
    "date": "2023-02-21",
    "startsAt": "2023-02-21T20:00:00+08:00",
    "title": "《雍正王朝》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-qsxz5l",
        "libraryId": "history-qsxz5l",
        "type": "topic",
        "title": "雍正王朝",
        "description": "2023-02-21 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1rX4y1Q7mG/?spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2023",
          "Bilibili"
        ],
        "note": "2023.2.21~2023.3.27 归档；已记录播放入口。"
      }
    ],
    "notes": "2023.2.21~2023.3.27；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1rX4y1Q7mG/?spm_id_from=333.1369.0.0",
    "archivedAt": "2023-02-21T23:30:00+08:00"
  },
  {
    "id": "screening-2023-03-18-091",
    "date": "2023-03-18",
    "startsAt": "2023-03-18T20:00:00+08:00",
    "title": "《战勇。》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-10vuix2",
        "libraryId": "history-10vuix2",
        "type": "anime",
        "title": "战勇。",
        "description": "2023-03-18 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1iP411d7V5/?spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2023",
          "Bilibili",
          "动画"
        ],
        "note": "2023.3.18 归档；已记录播放入口。"
      }
    ],
    "notes": "2023.3.18；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1iP411d7V5/?spm_id_from=333.1369.0.0",
    "archivedAt": "2023-03-18T23:30:00+08:00"
  },
  {
    "id": "screening-2023-06-20-090",
    "date": "2023-06-20",
    "startsAt": "2023-06-20T20:00:00+08:00",
    "title": "《灰与幻想的格林姆迦尔》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-kjsqyu",
        "libraryId": "history-kjsqyu",
        "type": "anime",
        "title": "灰与幻想的格林姆迦尔",
        "description": "2023-06-20 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV14M4y1E7U4/?spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2023",
          "Bilibili",
          "动画"
        ],
        "note": "2023.6.20 归档；已记录播放入口。"
      }
    ],
    "notes": "2023.6.20；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV14M4y1E7U4/?spm_id_from=333.1369.0.0",
    "archivedAt": "2023-06-20T23:30:00+08:00"
  },
  {
    "id": "screening-2023-11-05-089",
    "date": "2023-11-05",
    "startsAt": "2023-11-05T20:00:00+08:00",
    "title": "《古立特宇宙》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-ocgsb3",
        "libraryId": "history-ocgsb3",
        "type": "anime",
        "title": "古立特宇宙",
        "description": "2023-11-05 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV17u4y187Ar?t=234.8&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2023",
          "Bilibili",
          "动画"
        ],
        "note": "2023.11.5 归档；已记录播放入口。"
      }
    ],
    "notes": "2023.11.5；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV17u4y187Ar?t=234.8&spm_id_from=333.1369.0.0",
    "archivedAt": "2023-11-05T23:30:00+08:00"
  },
  {
    "id": "screening-2024-01-25-088",
    "date": "2024-01-25",
    "startsAt": "2024-01-25T20:00:00+08:00",
    "title": "《逃学威龙》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1wl0h16",
        "libraryId": "history-1wl0h16",
        "type": "topic",
        "title": "逃学威龙",
        "description": "2024-01-25 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1Uk4y1Z7dC/?spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili"
        ],
        "note": "2024.1.25 归档；已记录播放入口。"
      }
    ],
    "notes": "2024.1.25；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1Uk4y1Z7dC/?spm_id_from=333.1369.0.0",
    "archivedAt": "2024-01-25T23:30:00+08:00"
  },
  {
    "id": "screening-2024-02-18-087",
    "date": "2024-02-18",
    "startsAt": "2024-02-18T20:00:00+08:00",
    "title": "《逃学威龙2》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-afdn6g",
        "libraryId": "history-afdn6g",
        "type": "topic",
        "title": "逃学威龙2",
        "description": "2024-02-18 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV18Z42117mq/?spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili"
        ],
        "note": "2024.2.18 归档；已记录播放入口。"
      }
    ],
    "notes": "2024.2.18；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV18Z42117mq/?spm_id_from=333.1369.0.0",
    "archivedAt": "2024-02-18T23:30:00+08:00"
  },
  {
    "id": "screening-2024-03-10-086",
    "date": "2024-03-10",
    "startsAt": "2024-03-10T20:00:00+08:00",
    "title": "《特别篇 吹响！悠风号～合奏比赛～》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-pffvo6",
        "libraryId": "history-pffvo6",
        "type": "anime",
        "title": "特别篇 吹响！悠风号～合奏比赛～",
        "description": "2024-03-10 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV18H4y1W7Df/?spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili",
          "动画"
        ],
        "note": "2024.3.10 归档；已记录播放入口。"
      }
    ],
    "notes": "2024.3.10；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV18H4y1W7Df/?spm_id_from=333.1369.0.0",
    "archivedAt": "2024-03-10T23:30:00+08:00"
  },
  {
    "id": "screening-2024-03-17-085",
    "date": "2024-03-17",
    "startsAt": "2024-03-17T20:00:00+08:00",
    "title": "《太空丹迪》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1jp7iey",
        "libraryId": "history-1jp7iey",
        "type": "anime",
        "title": "太空丹迪",
        "description": "2024-03-17 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV13r42187k7/?spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili",
          "动画"
        ],
        "note": "2024.3.17 归档；已记录播放入口。"
      }
    ],
    "notes": "2024.3.17；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV13r42187k7/?spm_id_from=333.1369.0.0",
    "archivedAt": "2024-03-17T23:30:00+08:00"
  },
  {
    "id": "screening-2024-04-08-084",
    "date": "2024-04-08",
    "startsAt": "2024-04-08T20:00:00+08:00",
    "title": "《地球脉动》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1l72pxp",
        "libraryId": "history-1l72pxp",
        "type": "topic",
        "title": "地球脉动",
        "description": "2024-04-08 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1zx4y1Y7Kq/?spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili",
          "纪录片"
        ],
        "note": "2024.4.8~2024.4.12 归档；已记录播放入口。"
      }
    ],
    "notes": "2024.4.8~2024.4.12；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1zx4y1Y7Kq/?spm_id_from=333.1369.0.0",
    "archivedAt": "2024-04-08T23:30:00+08:00"
  },
  {
    "id": "screening-2024-04-17-083",
    "date": "2024-04-17",
    "startsAt": "2024-04-17T20:00:00+08:00",
    "title": "《pop子与pipi美的日常》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1mw0djp",
        "libraryId": "history-1mw0djp",
        "type": "anime",
        "title": "pop子与pipi美的日常",
        "description": "2024-04-17 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1tC41137tr/?spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili",
          "动画"
        ],
        "note": "2024.4.17 归档；已记录播放入口。"
      }
    ],
    "notes": "2024.4.17；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1tC41137tr/?spm_id_from=333.1369.0.0",
    "archivedAt": "2024-04-17T23:30:00+08:00"
  },
  {
    "id": "screening-2024-05-13-082",
    "date": "2024-05-13",
    "startsAt": "2024-05-13T20:00:00+08:00",
    "title": "《浮生一日 Life in a Day》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1ncdtfl",
        "libraryId": "history-1ncdtfl",
        "type": "topic",
        "title": "浮生一日 Life in a Day",
        "description": "2024-05-13 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1n1421q7LL/?spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili",
          "纪录片"
        ],
        "note": "2024.5.13 纪录片 归档；已记录播放入口。"
      }
    ],
    "notes": "2024.5.13 纪录片；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1n1421q7LL/?spm_id_from=333.1369.0.0",
    "archivedAt": "2024-05-13T23:30:00+08:00"
  },
  {
    "id": "screening-2024-06-09-081",
    "date": "2024-06-09",
    "startsAt": "2024-06-09T20:00:00+08:00",
    "title": "《乒乓》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1vrpceq",
        "libraryId": "history-1vrpceq",
        "type": "anime",
        "title": "乒乓",
        "description": "2024-06-09 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1zE421P7sV/?spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili",
          "动画"
        ],
        "note": "2024.6.9 归档；已记录播放入口。"
      }
    ],
    "notes": "2024.6.9；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1zE421P7sV/?spm_id_from=333.1369.0.0",
    "archivedAt": "2024-06-09T23:30:00+08:00"
  },
  {
    "id": "screening-2024-06-11-080",
    "date": "2024-06-11",
    "startsAt": "2024-06-11T20:00:00+08:00",
    "title": "《旋风管家》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-y79wab",
        "libraryId": "history-y79wab",
        "type": "anime",
        "title": "旋风管家",
        "description": "2024-06-11 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1Y4421Q78B/?spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili",
          "动画"
        ],
        "note": "2024.6.11~2024.6.20 归档；已记录播放入口。"
      }
    ],
    "notes": "2024.6.11~2024.6.20；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1Y4421Q78B/?spm_id_from=333.1369.0.0",
    "archivedAt": "2024-06-11T23:30:00+08:00"
  },
  {
    "id": "screening-2024-07-07-079",
    "date": "2024-07-07",
    "startsAt": "2024-07-07T20:00:00+08:00",
    "title": "《坏男孩雄狮联盟狮王之路》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-9wst58",
        "libraryId": "history-9wst58",
        "type": "topic",
        "title": "坏男孩雄狮联盟狮王之路",
        "description": "2024-07-07 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1CH4y1F734/?spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili"
        ],
        "note": "2024.7.7 归档；已记录播放入口。"
      }
    ],
    "notes": "2024.7.7；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1CH4y1F734/?spm_id_from=333.1369.0.0",
    "archivedAt": "2024-07-07T23:30:00+08:00"
  },
  {
    "id": "screening-2024-08-09-078",
    "date": "2024-08-09",
    "startsAt": "2024-08-09T20:00:00+08:00",
    "title": "《毒战》与《导火索》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-4d5dxz",
        "libraryId": "history-4d5dxz",
        "type": "topic",
        "title": "毒战",
        "description": "2024-08-09 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://t.bilibili.com/982477651640844291?spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili",
          "动态/网盘"
        ],
        "note": "2024.8.9 归档；已记录播放入口。"
      },
      {
        "id": "history-1tm7uhi",
        "libraryId": "history-1tm7uhi",
        "type": "topic",
        "title": "导火索",
        "description": "2024-08-09 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://t.bilibili.com/982477651640844291?spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili",
          "动态/网盘"
        ],
        "note": "2024.8.9 归档；已记录播放入口。"
      }
    ],
    "notes": "2024.8.9；原始记录已保留在电影.txt。",
    "recordUrl": "https://t.bilibili.com/982477651640844291?spm_id_from=333.1369.0.0",
    "archivedAt": "2024-08-09T23:30:00+08:00"
  },
  {
    "id": "screening-2024-09-16-077",
    "date": "2024-09-16",
    "startsAt": "2024-09-16T20:00:00+08:00",
    "title": "《疯狂的赛车》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1fdw14l",
        "libraryId": "history-1fdw14l",
        "type": "topic",
        "title": "疯狂的赛车",
        "description": "2024-09-16 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1Ebt8eCEJz?t=0h2m9s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili"
        ],
        "note": "2024.9.16 归档；已记录播放入口。"
      }
    ],
    "notes": "2024.9.16；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1Ebt8eCEJz?t=0h2m9s&spm_id_from=333.1369.0.0",
    "archivedAt": "2024-09-16T23:30:00+08:00"
  },
  {
    "id": "screening-2024-09-27-076",
    "date": "2024-09-27",
    "startsAt": "2024-09-27T20:00:00+08:00",
    "title": "《年会不能停》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1ukrtwj",
        "libraryId": "history-1ukrtwj",
        "type": "topic",
        "title": "年会不能停",
        "description": "2024-09-27 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://t.bilibili.com/982477651640844291?spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili",
          "动态/网盘"
        ],
        "note": "2024.9.27 归档；已记录播放入口。"
      }
    ],
    "notes": "2024.9.27；原始记录已保留在电影.txt。",
    "recordUrl": "https://t.bilibili.com/982477651640844291?spm_id_from=333.1369.0.0",
    "archivedAt": "2024-09-27T23:30:00+08:00"
  },
  {
    "id": "screening-2024-10-14-075",
    "date": "2024-10-14",
    "startsAt": "2024-10-14T20:00:00+08:00",
    "title": "《扬名立万》与《甲方乙方》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-174f69g",
        "libraryId": "history-174f69g",
        "type": "topic",
        "title": "扬名立万",
        "description": "2024-10-14 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1DomEYYEx3?t=0h9m49s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili"
        ],
        "note": "2024.10.14 归档；已记录播放入口。"
      },
      {
        "id": "history-q2g0ai",
        "libraryId": "history-q2g0ai",
        "type": "topic",
        "title": "甲方乙方",
        "description": "2024-10-14 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1DomEYYEx3?t=2h18m20s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili"
        ],
        "note": "2024.10.14 归档；已记录播放入口。"
      }
    ],
    "notes": "2024.10.14；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1DomEYYEx3?t=0h9m49s&spm_id_from=333.1369.0.0",
    "archivedAt": "2024-10-14T23:30:00+08:00"
  },
  {
    "id": "screening-2024-10-17-074",
    "date": "2024-10-17",
    "startsAt": "2024-10-17T20:00:00+08:00",
    "title": "《甘城光辉游乐园》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1pcu11s",
        "libraryId": "history-1pcu11s",
        "type": "anime",
        "title": "甘城光辉游乐园",
        "description": "2024-10-17 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1LJyKY8Eur?spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili",
          "动画"
        ],
        "note": "2024.10.17~2024.10.18 归档；已记录播放入口。"
      }
    ],
    "notes": "2024.10.17~2024.10.18；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1LJyKY8Eur?spm_id_from=333.1369.0.0",
    "archivedAt": "2024-10-17T23:30:00+08:00"
  },
  {
    "id": "screening-2024-10-18-073",
    "date": "2024-10-18",
    "startsAt": "2024-10-18T20:00:00+08:00",
    "title": "《从21世纪安全撤离》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-qhx8gk",
        "libraryId": "history-qhx8gk",
        "type": "topic",
        "title": "从21世纪安全撤离",
        "description": "2024-10-18 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1XvCSY5EeP?t=0h2m5s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili"
        ],
        "note": "2024.10.18 归档；已记录播放入口。"
      }
    ],
    "notes": "2024.10.18；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1XvCSY5EeP?t=0h2m5s&spm_id_from=333.1369.0.0",
    "archivedAt": "2024-10-18T23:30:00+08:00"
  },
  {
    "id": "screening-2024-11-10-072",
    "date": "2024-11-10",
    "startsAt": "2024-11-10T20:00:00+08:00",
    "title": "《孤注一掷》与《烈日灼心》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1lmtacs",
        "libraryId": "history-1lmtacs",
        "type": "topic",
        "title": "孤注一掷",
        "description": "2024-11-10 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1ZwiZYWEuo?t=0h0m14s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili"
        ],
        "note": "2024.11.10 归档；已记录播放入口。"
      },
      {
        "id": "history-p0hbaf",
        "libraryId": "history-p0hbaf",
        "type": "topic",
        "title": "烈日灼心",
        "description": "2024-11-10 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1ZwiZYWEuo?t=0h0m14s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili"
        ],
        "note": "2024.11.10 归档；已记录播放入口。"
      }
    ],
    "notes": "2024.11.10；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1ZwiZYWEuo?t=0h0m14s&spm_id_from=333.1369.0.0",
    "archivedAt": "2024-11-10T23:30:00+08:00"
  },
  {
    "id": "screening-2024-11-18-071",
    "date": "2024-11-18",
    "startsAt": "2024-11-18T20:00:00+08:00",
    "title": "《白箱》与《剧场版 白箱》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-nwopcr",
        "libraryId": "history-nwopcr",
        "type": "anime",
        "title": "白箱",
        "description": "2024-11-18 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1fkUsYcEPz/?spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili",
          "动画"
        ],
        "note": "2024.11.18~2024.11.20 归档；已记录播放入口。"
      },
      {
        "id": "history-749dqe",
        "libraryId": "history-749dqe",
        "type": "anime",
        "title": "剧场版 白箱",
        "description": "2024-11-18 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1fkUsYcEPz/?spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili",
          "动画"
        ],
        "note": "2024.11.18~2024.11.20 归档；已记录播放入口。"
      }
    ],
    "notes": "2024.11.18~2024.11.20；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1fkUsYcEPz/?spm_id_from=333.1369.0.0",
    "archivedAt": "2024-11-18T23:30:00+08:00"
  },
  {
    "id": "screening-2024-11-22-070",
    "date": "2024-11-22",
    "startsAt": "2024-11-22T20:00:00+08:00",
    "title": "《电器街的漫画店》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-15mk4de",
        "libraryId": "history-15mk4de",
        "type": "anime",
        "title": "电器街的漫画店",
        "description": "2024-11-22 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1vXB6YVEr1?spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili",
          "动画"
        ],
        "note": "2024.11.22&2024.11.25 归档；已记录播放入口。"
      }
    ],
    "notes": "2024.11.22&2024.11.25；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1vXB6YVEr1?spm_id_from=333.1369.0.0",
    "archivedAt": "2024-11-22T23:30:00+08:00"
  },
  {
    "id": "screening-2024-11-24-069",
    "date": "2024-11-24",
    "startsAt": "2024-11-24T20:00:00+08:00",
    "title": "《解除好友2:暗网》与《宇宙探索编辑部》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1ln1wri",
        "libraryId": "history-1ln1wri",
        "type": "topic",
        "title": "解除好友2:暗网",
        "description": "2024-11-24 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1xoBaYBEVq?t=0h6m27s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili"
        ],
        "note": "2024.11.24 归档；已记录播放入口。"
      },
      {
        "id": "history-1vc27vs",
        "libraryId": "history-1vc27vs",
        "type": "topic",
        "title": "宇宙探索编辑部",
        "description": "2024-11-24 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1xoBaYBEVq?t=1h45m28s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili"
        ],
        "note": "2024.11.24 归档；已记录播放入口。"
      }
    ],
    "notes": "2024.11.24；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1xoBaYBEVq?t=0h6m27s&spm_id_from=333.1369.0.0",
    "archivedAt": "2024-11-24T23:30:00+08:00"
  },
  {
    "id": "screening-2024-12-01-068",
    "date": "2024-12-01",
    "startsAt": "2024-12-01T20:00:00+08:00",
    "title": "《逆行人生》与《走走停停》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-9ji4j4",
        "libraryId": "history-9ji4j4",
        "type": "topic",
        "title": "逆行人生",
        "description": "2024-12-01 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1bUzfYXEzi?t=0h5m53s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili"
        ],
        "note": "2024.12.1 归档；已记录播放入口。"
      },
      {
        "id": "history-csivrh",
        "libraryId": "history-csivrh",
        "type": "topic",
        "title": "走走停停",
        "description": "2024-12-01 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1bUzfYXEzi?t=2h14m11s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili"
        ],
        "note": "2024.12.1 归档；已记录播放入口。"
      }
    ],
    "notes": "2024.12.1；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1bUzfYXEzi?t=0h5m53s&spm_id_from=333.1369.0.0",
    "archivedAt": "2024-12-01T23:30:00+08:00"
  },
  {
    "id": "screening-2024-12-08-067",
    "date": "2024-12-08",
    "startsAt": "2024-12-08T20:00:00+08:00",
    "title": "《749局》与《明日边缘》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1mho9mf",
        "libraryId": "history-1mho9mf",
        "type": "topic",
        "title": "749局",
        "description": "2024-12-08 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1yJqxY1EFM?t=0h6m4s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili"
        ],
        "note": "2024.12.8 归档；已记录播放入口。"
      },
      {
        "id": "history-nxdmxx",
        "libraryId": "history-nxdmxx",
        "type": "topic",
        "title": "明日边缘",
        "description": "2024-12-08 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1yJqxY1EFM?t=2h17m17s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili"
        ],
        "note": "2024.12.8 归档；已记录播放入口。"
      }
    ],
    "notes": "2024.12.8；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1yJqxY1EFM?t=0h6m4s&spm_id_from=333.1369.0.0",
    "archivedAt": "2024-12-08T23:30:00+08:00"
  },
  {
    "id": "screening-2024-12-16-066",
    "date": "2024-12-16",
    "startsAt": "2024-12-16T20:00:00+08:00",
    "title": "《浪客剑心》与《浪客剑心 最终章 追忆篇》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1mineph",
        "libraryId": "history-1mineph",
        "type": "anime",
        "title": "浪客剑心",
        "description": "2024-12-16 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV14AkrY3E3d?t=0h6m52s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili",
          "动画"
        ],
        "note": "2024.12.16 归档；已记录播放入口。"
      },
      {
        "id": "history-yhpy5p",
        "libraryId": "history-yhpy5p",
        "type": "anime",
        "title": "浪客剑心 最终章 追忆篇",
        "description": "2024-12-16 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV14AkrY3E3d?p=2&t=0h19m38s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili",
          "动画"
        ],
        "note": "2024.12.16 归档；已记录播放入口。"
      }
    ],
    "notes": "2024.12.16；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV14AkrY3E3d?t=0h6m52s&spm_id_from=333.1369.0.0",
    "archivedAt": "2024-12-16T23:30:00+08:00"
  },
  {
    "id": "screening-2024-12-17-065",
    "date": "2024-12-17",
    "startsAt": "2024-12-17T20:00:00+08:00",
    "title": "《浪客剑心：京都大火篇》与《浪客剑心：传说的完结篇》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-e07kxl",
        "libraryId": "history-e07kxl",
        "type": "anime",
        "title": "浪客剑心：京都大火篇",
        "description": "2024-12-17 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1KAkrY3ECS?t=0h5m13s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili",
          "动画"
        ],
        "note": "2024.12.17 归档；已记录播放入口。"
      },
      {
        "id": "history-myy60z",
        "libraryId": "history-myy60z",
        "type": "anime",
        "title": "浪客剑心：传说的完结篇",
        "description": "2024-12-17 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1KAkrY3ECS?p=2&t=0h21m17s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili",
          "动画"
        ],
        "note": "2024.12.17 归档；已记录播放入口。"
      }
    ],
    "notes": "2024.12.17；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1KAkrY3ECS?t=0h5m13s&spm_id_from=333.1369.0.0",
    "archivedAt": "2024-12-17T23:30:00+08:00"
  },
  {
    "id": "screening-2024-12-18-064",
    "date": "2024-12-18",
    "startsAt": "2024-12-18T20:00:00+08:00",
    "title": "《浪客剑心最终章 人诛篇》与《剑心之路》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-w2ggk7",
        "libraryId": "history-w2ggk7",
        "type": "anime",
        "title": "浪客剑心最终章 人诛篇",
        "description": "2024-12-18 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1bFkrYVETo?t=0h3m55s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili",
          "动画",
          "纪录片"
        ],
        "note": "2024.12.18 归档；已记录播放入口。"
      },
      {
        "id": "history-l0virr",
        "libraryId": "history-l0virr",
        "type": "anime",
        "title": "剑心之路",
        "description": "2024-12-18 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1bFkrYVETo?p=2&t=0h25m52s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili",
          "动画",
          "纪录片"
        ],
        "note": "2024.12.18 归档；已记录播放入口。"
      }
    ],
    "notes": "2024.12.18；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1bFkrYVETo?t=0h3m55s&spm_id_from=333.1369.0.0",
    "archivedAt": "2024-12-18T23:30:00+08:00"
  },
  {
    "id": "screening-2024-12-29-063",
    "date": "2024-12-29",
    "startsAt": "2024-12-29T20:00:00+08:00",
    "title": "《赛马娘 Pretty Derby 新时代之门》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-ydcqg4",
        "libraryId": "history-ydcqg4",
        "type": "anime",
        "title": "赛马娘 Pretty Derby 新时代之门",
        "description": "2024-12-29 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1y76gYkETx?t=0h11m24s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2024",
          "Bilibili",
          "动画"
        ],
        "note": "2024.12.29 归档；已记录播放入口。"
      }
    ],
    "notes": "2024.12.29；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1y76gYkETx?t=0h11m24s&spm_id_from=333.1369.0.0",
    "archivedAt": "2024-12-29T23:30:00+08:00"
  },
  {
    "id": "screening-2025-01-12-062",
    "date": "2025-01-12",
    "startsAt": "2025-01-12T20:00:00+08:00",
    "title": "《火星异种真人版》与《源代码》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-us8sdl",
        "libraryId": "history-us8sdl",
        "type": "topic",
        "title": "火星异种真人版",
        "description": "2025-01-12 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1D3ckebEnR?t=0h16m49s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.1.12 归档；已记录播放入口。"
      },
      {
        "id": "history-13yyvtr",
        "libraryId": "history-13yyvtr",
        "type": "topic",
        "title": "源代码",
        "description": "2025-01-12 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1D3ckebEnR?t=2h5m2s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.1.12 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.1.12；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1D3ckebEnR?t=0h16m49s&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-01-12T23:30:00+08:00"
  },
  {
    "id": "screening-2025-01-19-061",
    "date": "2025-01-19",
    "startsAt": "2025-01-19T20:00:00+08:00",
    "title": "《富春山居图》与《解救吾先生》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1h8tb2u",
        "libraryId": "history-1h8tb2u",
        "type": "topic",
        "title": "富春山居图",
        "description": "2025-01-19 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1CGwkeQETF?t=0h7m4s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.1.19 归档；已记录播放入口。"
      },
      {
        "id": "history-11nttdk",
        "libraryId": "history-11nttdk",
        "type": "topic",
        "title": "解救吾先生",
        "description": "2025-01-19 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1CGwkeQETF?t=2h10m32s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.1.19 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.1.19；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1CGwkeQETF?t=0h7m4s&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-01-19T23:30:00+08:00"
  },
  {
    "id": "screening-2025-01-26-060",
    "date": "2025-01-26",
    "startsAt": "2025-01-26T20:00:00+08:00",
    "title": "《鲨卷风》与《萨利机长》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-cw7vai",
        "libraryId": "history-cw7vai",
        "type": "topic",
        "title": "鲨卷风",
        "description": "2025-01-26 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV15SfCYvEjg?t=0h7m18s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.1.26 归档；已记录播放入口。"
      },
      {
        "id": "history-1ktvgwd",
        "libraryId": "history-1ktvgwd",
        "type": "topic",
        "title": "萨利机长",
        "description": "2025-01-26 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV15SfCYvEjg?t=1h34m38s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.1.26 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.1.26；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV15SfCYvEjg?t=0h7m18s&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-01-26T23:30:00+08:00"
  },
  {
    "id": "screening-2025-02-14-059",
    "date": "2025-02-14",
    "startsAt": "2025-02-14T20:00:00+08:00",
    "title": "《抓娃娃》与《网络谜踪》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-zc07bk",
        "libraryId": "history-zc07bk",
        "type": "topic",
        "title": "抓娃娃",
        "description": "2025-02-14 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1eyKuexEXq?t=0h11m59s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.2.14 归档；已记录播放入口。"
      },
      {
        "id": "history-t6sp4q",
        "libraryId": "history-t6sp4q",
        "type": "topic",
        "title": "网络谜踪",
        "description": "2025-02-14 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1eyKuexEXq?t=2h29m33s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.2.14 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.2.14；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1eyKuexEXq?t=0h11m59s&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-02-14T23:30:00+08:00"
  },
  {
    "id": "screening-2025-02-18-058",
    "date": "2025-02-18",
    "startsAt": "2025-02-18T20:00:00+08:00",
    "title": "《路人女主的养成方法》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-17kpxev",
        "libraryId": "history-17kpxev",
        "type": "anime",
        "title": "路人女主的养成方法",
        "description": "2025-02-18 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1rDAveiEGk/?spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili",
          "动画"
        ],
        "note": "2025.2.18~2.20 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.2.18~2.20；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1rDAveiEGk/?spm_id_from=333.1369.0.0",
    "archivedAt": "2025-02-18T23:30:00+08:00"
  },
  {
    "id": "screening-2025-03-02-057",
    "date": "2025-03-02",
    "startsAt": "2025-03-02T20:00:00+08:00",
    "title": "《蜘蛛侠3》与《成为约翰·马尔科维奇》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-12eddlp",
        "libraryId": "history-12eddlp",
        "type": "topic",
        "title": "蜘蛛侠3",
        "description": "2025-03-02 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1899hY1EDF?t=0h7m0s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.3.2 归档；已记录播放入口。"
      },
      {
        "id": "history-1mpm0vc",
        "libraryId": "history-1mpm0vc",
        "type": "topic",
        "title": "成为约翰·马尔科维奇",
        "description": "2025-03-02 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1899hY1EDF?t=2h25m13s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.3.2 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.3.2；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1899hY1EDF?t=0h7m0s&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-03-02T23:30:00+08:00"
  },
  {
    "id": "screening-2025-03-09-056",
    "date": "2025-03-09",
    "startsAt": "2025-03-09T20:00:00+08:00",
    "title": "《蒸发太平洋》与《大白鲨》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1xwhnny",
        "libraryId": "history-1xwhnny",
        "type": "topic",
        "title": "蒸发太平洋",
        "description": "2025-03-09 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1BaRvYgEo3?t=0h3m35s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.3.9 归档；已记录播放入口。"
      },
      {
        "id": "history-1019enf",
        "libraryId": "history-1019enf",
        "type": "topic",
        "title": "大白鲨",
        "description": "2025-03-09 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1BaRvYgEo3?t=1h34m35s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.3.9 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.3.9；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1BaRvYgEo3?t=0h3m35s&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-03-09T23:30:00+08:00"
  },
  {
    "id": "screening-2025-03-10-055",
    "date": "2025-03-10",
    "startsAt": "2025-03-10T20:00:00+08:00",
    "title": "《绝对双刃》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-gul5m",
        "libraryId": "history-gul5m",
        "type": "anime",
        "title": "绝对双刃",
        "description": "2025-03-10 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1qoRLYHEUC?t=0h6m15s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili",
          "动画"
        ],
        "note": "2025.3.10 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.3.10；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1qoRLYHEUC?t=0h6m15s&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-03-10T23:30:00+08:00"
  },
  {
    "id": "screening-2025-03-11-054",
    "date": "2025-03-11",
    "startsAt": "2025-03-11T20:00:00+08:00",
    "title": "《圣剑使的禁咒咏唱》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1anwgz5",
        "libraryId": "history-1anwgz5",
        "type": "anime",
        "title": "圣剑使的禁咒咏唱",
        "description": "2025-03-11 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1xFQJYKEqa?t=0h9m51s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili",
          "动画"
        ],
        "note": "2025.3.11 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.3.11；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1xFQJYKEqa?t=0h9m51s&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-03-11T23:30:00+08:00"
  },
  {
    "id": "screening-2025-03-16-053",
    "date": "2025-03-16",
    "startsAt": "2025-03-16T20:00:00+08:00",
    "title": "《科洛弗档案》与《布达佩斯大饭店》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-5jdkat",
        "libraryId": "history-5jdkat",
        "type": "topic",
        "title": "科洛弗档案",
        "description": "2025-03-16 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1egQeYREqA?t=10m46s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.3.16 归档；已记录播放入口。"
      },
      {
        "id": "history-1nky5lx",
        "libraryId": "history-1nky5lx",
        "type": "topic",
        "title": "布达佩斯大饭店",
        "description": "2025-03-16 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1egQeYREqA?t=1h30m26s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.3.16 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.3.16；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1egQeYREqA?t=10m46s&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-03-16T23:30:00+08:00"
  },
  {
    "id": "screening-2025-03-17-052",
    "date": "2025-03-17",
    "startsAt": "2025-03-17T20:00:00+08:00",
    "title": "《铳皇无尽的法夫纳》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1tv2bih",
        "libraryId": "history-1tv2bih",
        "type": "anime",
        "title": "铳皇无尽的法夫纳",
        "description": "2025-03-17 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1AjXuYBEsY/?spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili",
          "动画"
        ],
        "note": "2025.3.17 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.3.17；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1AjXuYBEsY/?spm_id_from=333.1369.0.0",
    "archivedAt": "2025-03-17T23:30:00+08:00"
  },
  {
    "id": "screening-2025-03-18-051",
    "date": "2025-03-18",
    "startsAt": "2025-03-18T20:00:00+08:00",
    "title": "《轻拍翻转小魔女》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-abg4ni",
        "libraryId": "history-abg4ni",
        "type": "anime",
        "title": "轻拍翻转小魔女",
        "description": "2025-03-18 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1MsX7YNEJM/?spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili",
          "动画"
        ],
        "note": "2025.3.18~3.19 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.3.18~3.19；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1MsX7YNEJM/?spm_id_from=333.1369.0.0",
    "archivedAt": "2025-03-18T23:30:00+08:00"
  },
  {
    "id": "screening-2025-03-23-050",
    "date": "2025-03-23",
    "startsAt": "2025-03-23T20:00:00+08:00",
    "title": "《永春白鹤拳之擎天画卷》与《无人区》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1792o82",
        "libraryId": "history-1792o82",
        "type": "topic",
        "title": "永春白鹤拳之擎天画卷",
        "description": "2025-03-23 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1eHozYnEHC?t=5m46s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.3.23 归档；已记录播放入口。"
      },
      {
        "id": "history-89shkv",
        "libraryId": "history-89shkv",
        "type": "topic",
        "title": "无人区",
        "description": "2025-03-23 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1eHozYnEHC?t=1h41m33s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.3.23 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.3.23；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1eHozYnEHC?t=5m46s&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-03-23T23:30:00+08:00"
  },
  {
    "id": "screening-2025-04-11-049",
    "date": "2025-04-11",
    "startsAt": "2025-04-11T20:00:00+08:00",
    "title": "《守望者》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-uaa3bn",
        "libraryId": "history-uaa3bn",
        "type": "topic",
        "title": "守望者",
        "description": "2025-04-11 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1VzdXYpEZq?t=0h24m16s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.4.11 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.4.11；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1VzdXYpEZq?t=0h24m16s&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-04-11T23:30:00+08:00"
  },
  {
    "id": "screening-2025-04-20-048",
    "date": "2025-04-20",
    "startsAt": "2025-04-20T20:00:00+08:00",
    "title": "《金钱堡垒》与《大空头》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-2h0zyo",
        "libraryId": "history-2h0zyo",
        "type": "topic",
        "title": "金钱堡垒",
        "description": "2025-04-20 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1GGLPzREmW?t=0h6m7s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.4.20 归档；已记录播放入口。"
      },
      {
        "id": "history-dk08w",
        "libraryId": "history-dk08w",
        "type": "topic",
        "title": "大空头",
        "description": "2025-04-20 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1GGLPzREmW?t=1h40m59s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.4.20 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.4.20；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1GGLPzREmW?t=0h6m7s&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-04-20T23:30:00+08:00"
  },
  {
    "id": "screening-2025-05-04-047",
    "date": "2025-05-04",
    "startsAt": "2025-05-04T20:00:00+08:00",
    "title": "《不二神探》与《热血警探》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-cr4i5o",
        "libraryId": "history-cr4i5o",
        "type": "topic",
        "title": "不二神探",
        "description": "2025-05-04 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1efVNzsEUh?t=0h3m17s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.5.4 归档；已记录播放入口。"
      },
      {
        "id": "history-gqny9k",
        "libraryId": "history-gqny9k",
        "type": "topic",
        "title": "热血警探",
        "description": "2025-05-04 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1efVNzsEUh?t=1h49m00s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.5.4 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.5.4；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1efVNzsEUh?t=0h3m17s&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-05-04T23:30:00+08:00"
  },
  {
    "id": "screening-2025-05-11-046",
    "date": "2025-05-11",
    "startsAt": "2025-05-11T20:00:00+08:00",
    "title": "《涉过愤怒的海》与《盗钥匙的方法》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-fjrhxu",
        "libraryId": "history-fjrhxu",
        "type": "topic",
        "title": "涉过愤怒的海",
        "description": "2025-05-11 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1wLEGziEm1?t=0h8m54s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.5.11 归档；已记录播放入口。"
      },
      {
        "id": "history-19g8yse",
        "libraryId": "history-19g8yse",
        "type": "topic",
        "title": "盗钥匙的方法",
        "description": "2025-05-11 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1wLEGziEm1?t=9804.6&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.5.11 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.5.11；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1wLEGziEm1?t=0h8m54s&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-05-11T23:30:00+08:00"
  },
  {
    "id": "screening-2025-05-15-045",
    "date": "2025-05-15",
    "startsAt": "2025-05-15T20:00:00+08:00",
    "title": "《刺杀肯尼迪》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-gqjg4i",
        "libraryId": "history-gqjg4i",
        "type": "topic",
        "title": "刺杀肯尼迪",
        "description": "2025-05-15 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV17wEnz7EYs?t=810.6&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.5.15 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.5.15；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV17wEnz7EYs?t=810.6&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-05-15T23:30:00+08:00"
  },
  {
    "id": "screening-2025-05-23-044",
    "date": "2025-05-23",
    "startsAt": "2025-05-23T20:00:00+08:00",
    "title": "《忍者杀手》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1scaxbe",
        "libraryId": "history-1scaxbe",
        "type": "anime",
        "title": "忍者杀手",
        "description": "2025-05-23 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1FCjHzHEYb?t=389.6&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili",
          "动画"
        ],
        "note": "2025.5.23 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.5.23；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1FCjHzHEYb?t=389.6&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-05-23T23:30:00+08:00"
  },
  {
    "id": "screening-2025-05-25-043",
    "date": "2025-05-25",
    "startsAt": "2025-05-25T20:00:00+08:00",
    "title": "《环大西洋》与《变形金刚》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-176nltx",
        "libraryId": "history-176nltx",
        "type": "topic",
        "title": "环大西洋",
        "description": "2025-05-25 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV149jVzrESL?t=0h7m30s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.5.25 归档；已记录播放入口。"
      },
      {
        "id": "history-1gemfow",
        "libraryId": "history-1gemfow",
        "type": "topic",
        "title": "变形金刚",
        "description": "2025-05-25 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV149jVzrESL?t=1h37m40s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.5.25 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.5.25；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV149jVzrESL?t=0h7m30s&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-05-25T23:30:00+08:00"
  },
  {
    "id": "screening-2025-06-01-042",
    "date": "2025-06-01",
    "startsAt": "2025-06-01T20:00:00+08:00",
    "title": "《夺命三头鲨》与《侏罗纪公园》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1d7bg8f",
        "libraryId": "history-1d7bg8f",
        "type": "topic",
        "title": "夺命三头鲨",
        "description": "2025-06-01 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1uV7yzPECW?t=0h6m45s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.6.1 归档；已记录播放入口。"
      },
      {
        "id": "history-1w6obmo",
        "libraryId": "history-1w6obmo",
        "type": "topic",
        "title": "侏罗纪公园",
        "description": "2025-06-01 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1uV7yzPECW?t=1h35m25s&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.6.1 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.6.1；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1uV7yzPECW?t=0h6m45s&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-06-01T23:30:00+08:00"
  },
  {
    "id": "screening-2025-06-15-041",
    "date": "2025-06-15",
    "startsAt": "2025-06-15T20:00:00+08:00",
    "title": "《全城高考》与《垫底辣妹》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-imc3pq",
        "libraryId": "history-imc3pq",
        "type": "topic",
        "title": "全城高考",
        "description": "2025-06-15 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1doMbzLEH7?t=337.8&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.6.15 归档；已记录播放入口。"
      },
      {
        "id": "history-1pnmaq1",
        "libraryId": "history-1pnmaq1",
        "type": "topic",
        "title": "垫底辣妹",
        "description": "2025-06-15 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1doMbzLEH7?t=6032.0&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.6.15 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.6.15；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1doMbzLEH7?t=337.8&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-06-15T23:30:00+08:00"
  },
  {
    "id": "screening-2025-06-20-040",
    "date": "2025-06-20",
    "startsAt": "2025-06-20T20:00:00+08:00",
    "title": "《碧蓝之海》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-10s6qln",
        "libraryId": "history-10s6qln",
        "type": "anime",
        "title": "碧蓝之海",
        "description": "2025-06-20 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1AJKKzxEZv?spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili",
          "动画"
        ],
        "note": "2025.6.20 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.6.20；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1AJKKzxEZv?spm_id_from=333.1369.0.0",
    "archivedAt": "2025-06-20T23:30:00+08:00"
  },
  {
    "id": "screening-2025-06-22-039",
    "date": "2025-06-22",
    "startsAt": "2025-06-22T20:00:00+08:00",
    "title": "《环大西洋2》与《变形金刚2：卷土重来》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-xyc21h",
        "libraryId": "history-xyc21h",
        "type": "topic",
        "title": "环大西洋2",
        "description": "2025-06-22 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1oeK4ziESV?t=187.5&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.6.22 归档；已记录播放入口。"
      },
      {
        "id": "history-116ikvs",
        "libraryId": "history-116ikvs",
        "type": "topic",
        "title": "变形金刚2：卷土重来",
        "description": "2025-06-22 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1oeK4ziESV?t=5354.1&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.6.22 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.6.22；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1oeK4ziESV?t=187.5&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-06-22T23:30:00+08:00"
  },
  {
    "id": "screening-2025-07-06-038",
    "date": "2025-07-06",
    "startsAt": "2025-07-06T20:00:00+08:00",
    "title": "《江湖论剑实录》与《捕蝇纸》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-11g0n24",
        "libraryId": "history-11g0n24",
        "type": "topic",
        "title": "江湖论剑实录",
        "description": "2025-07-06 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1yP36zwEWf?t=280.1&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.7.6 归档；已记录播放入口。"
      },
      {
        "id": "history-14cguxj",
        "libraryId": "history-14cguxj",
        "type": "topic",
        "title": "捕蝇纸",
        "description": "2025-07-06 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1yP36zwEWf?t=6318.1&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.7.6 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.7.6；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1yP36zwEWf?t=280.1&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-07-06T23:30:00+08:00"
  },
  {
    "id": "screening-2025-07-13-037",
    "date": "2025-07-13",
    "startsAt": "2025-07-13T20:00:00+08:00",
    "title": "《搜救》与《菲利普船长》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-7wicqm",
        "libraryId": "history-7wicqm",
        "type": "topic",
        "title": "搜救",
        "description": "2025-07-13 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1XPuPzBE3T?t=490.2&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.7.13 归档；已记录播放入口。"
      },
      {
        "id": "history-i93m0u",
        "libraryId": "history-i93m0u",
        "type": "topic",
        "title": "菲利普船长",
        "description": "2025-07-13 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1XPuPzBE3T?t=6788.2&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.7.13 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.7.13；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1XPuPzBE3T?t=490.2&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-07-13T23:30:00+08:00"
  },
  {
    "id": "screening-2025-08-03-036",
    "date": "2025-08-03",
    "startsAt": "2025-08-03T20:00:00+08:00",
    "title": "《地狱小丑/瓦斯科小丑》与《宿醉》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-bm5yh7",
        "libraryId": "history-bm5yh7",
        "type": "topic",
        "title": "地狱小丑/瓦斯科小丑",
        "description": "2025-08-03 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1RxtFzkEWN/?t=299.8&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.8.3 归档；已记录播放入口。"
      },
      {
        "id": "history-1l62nid",
        "libraryId": "history-1l62nid",
        "type": "topic",
        "title": "宿醉",
        "description": "2025-08-03 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1RxtFzkEWN?t=5232.6&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.8.3 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.8.3；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1RxtFzkEWN/?t=299.8&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-08-03T23:30:00+08:00"
  },
  {
    "id": "screening-2025-08-10-035",
    "date": "2025-08-10",
    "startsAt": "2025-08-10T20:00:00+08:00",
    "title": "《城市游戏》与《极速车王》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-hqcdd0",
        "libraryId": "history-hqcdd0",
        "type": "topic",
        "title": "城市游戏",
        "description": "2025-08-10 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1wgbMzSEh6?t=199.5&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.8.10 归档；已记录播放入口。"
      },
      {
        "id": "history-in7voi",
        "libraryId": "history-in7voi",
        "type": "topic",
        "title": "极速车王",
        "description": "2025-08-10 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1wgbMzSEh6?t=5246.1&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.8.10 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.8.10；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1wgbMzSEh6?t=199.5&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-08-10T23:30:00+08:00"
  },
  {
    "id": "screening-2025-08-17-034",
    "date": "2025-08-17",
    "startsAt": "2025-08-17T20:00:00+08:00",
    "title": "《战国》与《大明劫》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1jaoe0e",
        "libraryId": "history-1jaoe0e",
        "type": "topic",
        "title": "战国",
        "description": "2025-08-17 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1mLYnzBERe?t=248.1&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.8.17 归档；已记录播放入口。"
      },
      {
        "id": "history-xvmosp",
        "libraryId": "history-xvmosp",
        "type": "topic",
        "title": "大明劫",
        "description": "2025-08-17 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1mLYnzBERe?t=745.5&p=2&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.8.17 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.8.17；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1mLYnzBERe?t=248.1&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-08-17T23:30:00+08:00"
  },
  {
    "id": "screening-2025-08-24-033",
    "date": "2025-08-24",
    "startsAt": "2025-08-24T20:00:00+08:00",
    "title": "《密室之不可告人》与《如月疑云》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-5swemw",
        "libraryId": "history-5swemw",
        "type": "topic",
        "title": "密室之不可告人",
        "description": "2025-08-24 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV167enzcEUq?t=286.0&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.8.24 归档；已记录播放入口。"
      },
      {
        "id": "history-ooekjd",
        "libraryId": "history-ooekjd",
        "type": "topic",
        "title": "如月疑云",
        "description": "2025-08-24 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV167enzcEUq?t=6155.7&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.8.24 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.8.24；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV167enzcEUq?t=286.0&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-08-24T23:30:00+08:00"
  },
  {
    "id": "screening-2025-08-31-032",
    "date": "2025-08-31",
    "startsAt": "2025-08-31T20:00:00+08:00",
    "title": "《花豹与鬣狗》与《了不起的狐狸爸爸》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1wfksz9",
        "libraryId": "history-1wfksz9",
        "type": "topic",
        "title": "花豹与鬣狗",
        "description": "2025-08-31 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV15saLzPEik?t=783.8&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili",
          "纪录片"
        ],
        "note": "2025.8.31 归档；已记录播放入口。"
      },
      {
        "id": "history-miy507",
        "libraryId": "history-miy507",
        "type": "topic",
        "title": "了不起的狐狸爸爸",
        "description": "2025-08-31 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV15saLzPEik?t=3767.9&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili",
          "纪录片"
        ],
        "note": "2025.8.31 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.8.31；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV15saLzPEik?t=783.8&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-08-31T23:30:00+08:00"
  },
  {
    "id": "screening-2025-09-05-031",
    "date": "2025-09-05",
    "startsAt": "2025-09-05T20:00:00+08:00",
    "title": "《夏洛特》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-8wf90y",
        "libraryId": "history-8wf90y",
        "type": "anime",
        "title": "夏洛特",
        "description": "2025-09-05 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1xeaazwEpQ?t=396.5&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili",
          "动画"
        ],
        "note": "2025.9.5 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.9.5；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1xeaazwEpQ?t=396.5&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-09-05T23:30:00+08:00"
  },
  {
    "id": "screening-2025-09-07-030",
    "date": "2025-09-07",
    "startsAt": "2025-09-07T20:00:00+08:00",
    "title": "《好像也没那么热血沸腾》与《铁甲钢拳》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-ylpuql",
        "libraryId": "history-ylpuql",
        "type": "topic",
        "title": "好像也没那么热血沸腾",
        "description": "2025-09-07 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1pLa9z9ECC?t=275.3&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.9.7 归档；已记录播放入口。"
      },
      {
        "id": "history-1xwgkxt",
        "libraryId": "history-1xwgkxt",
        "type": "topic",
        "title": "铁甲钢拳",
        "description": "2025-09-07 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1pLa9z9ECC?t=8685.5&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.9.7 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.9.7；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1pLa9z9ECC?t=275.3&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-09-07T23:30:00+08:00"
  },
  {
    "id": "screening-2025-09-11-029",
    "date": "2025-09-11",
    "startsAt": "2025-09-11T20:00:00+08:00",
    "title": "《哈利波特与魔法石》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-12fqgnp",
        "libraryId": "history-12fqgnp",
        "type": "topic",
        "title": "哈利波特与魔法石",
        "description": "2025-09-11 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1GuHzzKEiu?t=598.8&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.9.11 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.9.11；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1GuHzzKEiu?t=598.8&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-09-11T23:30:00+08:00"
  },
  {
    "id": "screening-2025-09-12-028",
    "date": "2025-09-12",
    "startsAt": "2025-09-12T20:00:00+08:00",
    "title": "《哈利波特与密室》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1m6i7xh",
        "libraryId": "history-1m6i7xh",
        "type": "topic",
        "title": "哈利波特与密室",
        "description": "2025-09-12 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1orpVz3EjL?t=246.7&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.9.12 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.9.12；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1orpVz3EjL?t=246.7&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-09-12T23:30:00+08:00"
  },
  {
    "id": "screening-2025-09-14-027",
    "date": "2025-09-14",
    "startsAt": "2025-09-14T20:00:00+08:00",
    "title": "《哈利波特与阿兹卡班的囚徒》与《哈利波特与火焰杯》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-agk1o7",
        "libraryId": "history-agk1o7",
        "type": "topic",
        "title": "哈利波特与阿兹卡班的囚徒",
        "description": "2025-09-14 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1eNpwzTEcP?t=242.5&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.9.14 归档；已记录播放入口。"
      },
      {
        "id": "history-8x2swp",
        "libraryId": "history-8x2swp",
        "type": "topic",
        "title": "哈利波特与火焰杯",
        "description": "2025-09-14 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1eNpwzTEcP?t=953.1&p=2&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.9.14 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.9.14；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1eNpwzTEcP?t=242.5&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-09-14T23:30:00+08:00"
  },
  {
    "id": "screening-2025-09-15-026",
    "date": "2025-09-15",
    "startsAt": "2025-09-15T20:00:00+08:00",
    "title": "《哈利波特与凤凰社》与《哈利波特与混血王子》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1hfkr4v",
        "libraryId": "history-1hfkr4v",
        "type": "topic",
        "title": "哈利波特与凤凰社",
        "description": "2025-09-15 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1Ynp6z6E5T?t=454.6&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.9.15 归档；已记录播放入口。"
      },
      {
        "id": "history-knge0j",
        "libraryId": "history-knge0j",
        "type": "topic",
        "title": "哈利波特与混血王子",
        "description": "2025-09-15 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1Ynp6z6E5T?t=8326.0&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.9.15 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.9.15；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1Ynp6z6E5T?t=454.6&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-09-15T23:30:00+08:00"
  },
  {
    "id": "screening-2025-09-16-025",
    "date": "2025-09-16",
    "startsAt": "2025-09-16T20:00:00+08:00",
    "title": "《哈利波特与死亡圣器（上）》与《哈利波特与死亡圣器（下）》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1lzhj3d",
        "libraryId": "history-1lzhj3d",
        "type": "topic",
        "title": "哈利波特与死亡圣器（上）",
        "description": "2025-09-16 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1z7pUzyEDF?t=278.0&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.9.16 归档；已记录播放入口。"
      },
      {
        "id": "history-1vz1ycs",
        "libraryId": "history-1vz1ycs",
        "type": "topic",
        "title": "哈利波特与死亡圣器（下）",
        "description": "2025-09-16 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1z7pUzyEDF?t=1241.3&p=2&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.9.16 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.9.16；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1z7pUzyEDF?t=278.0&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-09-16T23:30:00+08:00"
  },
  {
    "id": "screening-2025-10-12-024",
    "date": "2025-10-12",
    "startsAt": "2025-10-12T20:00:00+08:00",
    "title": "《普罗米修斯》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-li6ixk",
        "libraryId": "history-li6ixk",
        "type": "topic",
        "title": "普罗米修斯",
        "description": "2025-10-12 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1Xc4VzVECN?t=1245.1&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.10.12 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.10.12；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1Xc4VzVECN?t=1245.1&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-10-12T23:30:00+08:00"
  },
  {
    "id": "screening-2025-10-19-023",
    "date": "2025-10-19",
    "startsAt": "2025-10-19T20:00:00+08:00",
    "title": "《明日战记》与《变形金刚3》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-ph5ohg",
        "libraryId": "history-ph5ohg",
        "type": "topic",
        "title": "明日战记",
        "description": "2025-10-19 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV11SsKz6E7D?t=193.2&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.10.19 归档；已记录播放入口。"
      },
      {
        "id": "history-6ldqm1",
        "libraryId": "history-6ldqm1",
        "type": "topic",
        "title": "变形金刚3",
        "description": "2025-10-19 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV11SsKz6E7D?t=6547.4&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.10.19 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.10.19；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV11SsKz6E7D?t=193.2&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-10-19T23:30:00+08:00"
  },
  {
    "id": "screening-2025-10-26-022",
    "date": "2025-10-26",
    "startsAt": "2025-10-26T20:00:00+08:00",
    "title": "《冰封：重生之门》与《时空恋旅人》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-t63qjn",
        "libraryId": "history-t63qjn",
        "type": "topic",
        "title": "冰封：重生之门",
        "description": "2025-10-26 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1eRmQBWEe1?t=152.4&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.10.26 归档；已记录播放入口。"
      },
      {
        "id": "history-6i67o9",
        "libraryId": "history-6i67o9",
        "type": "topic",
        "title": "时空恋旅人",
        "description": "2025-10-26 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1eRmQBWEe1?t=5485.0&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.10.26 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.10.26；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1eRmQBWEe1?t=152.4&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-10-26T23:30:00+08:00"
  },
  {
    "id": "screening-2025-11-02-021",
    "date": "2025-11-02",
    "startsAt": "2025-11-02T20:00:00+08:00",
    "title": "《鲨卷风2》与《猩球崛起》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-i2ldxk",
        "libraryId": "history-i2ldxk",
        "type": "topic",
        "title": "鲨卷风2",
        "description": "2025-11-02 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV17ayfBrEyH?t=231.8&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.11.02 归档；已记录播放入口。"
      },
      {
        "id": "history-1ouvrnb",
        "libraryId": "history-1ouvrnb",
        "type": "topic",
        "title": "猩球崛起",
        "description": "2025-11-02 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV17ayfBrEyH?t=5606.3&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.11.02 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.11.02；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV17ayfBrEyH?t=231.8&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-11-02T23:30:00+08:00"
  },
  {
    "id": "screening-2025-11-09-020",
    "date": "2025-11-09",
    "startsAt": "2025-11-09T20:00:00+08:00",
    "title": "《鲨卷风3》与《猩球崛起2：黎明之战》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-ickzmj",
        "libraryId": "history-ickzmj",
        "type": "topic",
        "title": "鲨卷风3",
        "description": "2025-11-09 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1PDkQBbEBH?t=316.4&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.11.09 归档；已记录播放入口。"
      },
      {
        "id": "history-gf0rd0",
        "libraryId": "history-gf0rd0",
        "type": "topic",
        "title": "猩球崛起2：黎明之战",
        "description": "2025-11-09 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1PDkQBbEBH?t=5692.5&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.11.09 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.11.09；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1PDkQBbEBH?t=316.4&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-11-09T23:30:00+08:00"
  },
  {
    "id": "screening-2025-11-23-019",
    "date": "2025-11-23",
    "startsAt": "2025-11-23T20:00:00+08:00",
    "title": "《鲨卷风4：四度觉醒》与《猩球崛起3：终极之战》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1amhohu",
        "libraryId": "history-1amhohu",
        "type": "topic",
        "title": "鲨卷风4：四度觉醒",
        "description": "2025-11-23 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1WZUKBmEyT?t=276.1&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.11.23 归档；已记录播放入口。"
      },
      {
        "id": "history-8uodem",
        "libraryId": "history-8uodem",
        "type": "topic",
        "title": "猩球崛起3：终极之战",
        "description": "2025-11-23 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1WZUKBmEyT?t=5809.0&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.11.23 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.11.23；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1WZUKBmEyT?t=276.1&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-11-23T23:30:00+08:00"
  },
  {
    "id": "screening-2025-11-30-018",
    "date": "2025-11-30",
    "startsAt": "2025-11-30T20:00:00+08:00",
    "title": "《敦刻尔克行动》与《1917》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1dncemz",
        "libraryId": "history-1dncemz",
        "type": "topic",
        "title": "敦刻尔克行动",
        "description": "2025-11-30 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1pDSBBiEn4?t=215.7&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.11.30 归档；已记录播放入口。"
      },
      {
        "id": "history-an172f",
        "libraryId": "history-an172f",
        "type": "topic",
        "title": "1917",
        "description": "2025-11-30 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1pDSBBiEn4?t=6127.6&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.11.30 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.11.30；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1pDSBBiEn4?t=215.7&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-11-30T23:30:00+08:00"
  },
  {
    "id": "screening-2025-12-07-017",
    "date": "2025-12-07",
    "startsAt": "2025-12-07T20:00:00+08:00",
    "title": "《神奇》与《绝杀慕尼黑》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1jzemnm",
        "libraryId": "history-1jzemnm",
        "type": "topic",
        "title": "神奇",
        "description": "2025-12-07 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1YhmNBWEkv?t=260.4&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.12.7 归档；已记录播放入口。"
      },
      {
        "id": "history-1bivq0w",
        "libraryId": "history-1bivq0w",
        "type": "topic",
        "title": "绝杀慕尼黑",
        "description": "2025-12-07 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1YhmNBWEkv?t=7006.1&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.12.7 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.12.7；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1YhmNBWEkv?t=260.4&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-12-07T23:30:00+08:00"
  },
  {
    "id": "screening-2025-12-12-016",
    "date": "2025-12-12",
    "startsAt": "2025-12-12T20:00:00+08:00",
    "title": "《彼方的阿斯特拉》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-15g1eq",
        "libraryId": "history-15g1eq",
        "type": "anime",
        "title": "彼方的阿斯特拉",
        "description": "2025-12-12 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1RsmUBjEEF?t=339.7&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili",
          "动画"
        ],
        "note": "2025.12.12、12.15 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.12.12、12.15；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1RsmUBjEEF?t=339.7&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-12-12T23:30:00+08:00"
  },
  {
    "id": "screening-2025-12-14-015",
    "date": "2025-12-14",
    "startsAt": "2025-12-14T20:00:00+08:00",
    "title": "《鲨卷风5：全球鲨暴》与《鲨卷风6：最后的鲨卷风》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1kr754",
        "libraryId": "history-1kr754",
        "type": "topic",
        "title": "鲨卷风5：全球鲨暴",
        "description": "2025-12-14 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV18FmrBnE9C?t=235.1&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.12.14 归档；已记录播放入口。"
      },
      {
        "id": "history-2jnzf1",
        "libraryId": "history-2jnzf1",
        "type": "topic",
        "title": "鲨卷风6：最后的鲨卷风",
        "description": "2025-12-14 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV18FmrBnE9C?t=5493.6&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2025",
          "Bilibili"
        ],
        "note": "2025.12.14 归档；已记录播放入口。"
      }
    ],
    "notes": "2025.12.14；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV18FmrBnE9C?t=235.1&spm_id_from=333.1369.0.0",
    "archivedAt": "2025-12-14T23:30:00+08:00"
  },
  {
    "id": "screening-2026-01-04-014",
    "date": "2026-01-04",
    "startsAt": "2026-01-04T20:00:00+08:00",
    "title": "《剧场版 链锯人 蕾塞篇》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-tm6o7m",
        "libraryId": "history-tm6o7m",
        "type": "anime",
        "title": "剧场版 链锯人 蕾塞篇",
        "description": "2026-01-04 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV183inBAEBr?t=1254.7&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2026",
          "Bilibili",
          "动画"
        ],
        "note": "2026.1.4 归档；已记录播放入口。"
      }
    ],
    "notes": "2026.1.4；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV183inBAEBr?t=1254.7&spm_id_from=333.1369.0.0",
    "archivedAt": "2026-01-04T23:30:00+08:00"
  },
  {
    "id": "screening-2026-01-11-013",
    "date": "2026-01-11",
    "startsAt": "2026-01-11T20:00:00+08:00",
    "title": "《人类清除计划》与《银翼杀手2049》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1oy64a4",
        "libraryId": "history-1oy64a4",
        "type": "topic",
        "title": "人类清除计划",
        "rating": 6,
        "description": "2026-01-11 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1hd6fBnEVp?t=269&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2026",
          "Bilibili"
        ],
        "note": "2026.1.11 归档；已记录播放入口。"
      },
      {
        "id": "history-vv0acf",
        "libraryId": "history-vv0acf",
        "type": "good",
        "title": "银翼杀手2049",
        "rating": 8.3,
        "description": "2026-01-11 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1hd6fBnEVp?t=5718&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2026",
          "Bilibili",
          "好评"
        ],
        "note": "2026.1.11 归档；已记录播放入口。"
      }
    ],
    "notes": "2026.1.11；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1hd6fBnEVp?t=269&spm_id_from=333.1369.0.0",
    "archivedAt": "2026-01-11T23:30:00+08:00"
  },
  {
    "id": "screening-2026-01-25-012",
    "date": "2026-01-25",
    "startsAt": "2026-01-25T20:00:00+08:00",
    "title": "《孤岛惊魂》与《落水狗》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-13t6ogs",
        "libraryId": "history-13t6ogs",
        "type": "bad",
        "title": "孤岛惊魂",
        "rating": 3.6,
        "description": "2026-01-25 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1AKzbBJET2?t=201.4&p=2&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2026",
          "Bilibili",
          "反面案例"
        ],
        "note": "2026.1.25 归档；已记录播放入口。"
      },
      {
        "id": "history-wmll15",
        "libraryId": "history-wmll15",
        "type": "good",
        "title": "落水狗",
        "rating": 8.4,
        "description": "2026-01-25 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1AKzbBJET2?p=2&t=5885&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2026",
          "Bilibili",
          "好评"
        ],
        "note": "2026.1.25 归档；已记录播放入口。"
      }
    ],
    "notes": "2026.1.25；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1AKzbBJET2?t=201.4&p=2&spm_id_from=333.1369.0.0",
    "archivedAt": "2026-01-25T23:30:00+08:00"
  },
  {
    "id": "screening-2026-02-01-011",
    "date": "2026-02-01",
    "startsAt": "2026-02-01T20:00:00+08:00",
    "title": "《超时空辉夜姬！》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-jl889y",
        "libraryId": "history-jl889y",
        "type": "anime",
        "title": "超时空辉夜姬！",
        "rating": 8.3,
        "description": "2026-02-01 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1WQ6tBXEpx?t=323&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2026",
          "Bilibili",
          "动画"
        ],
        "note": "2026.2.1 归档；已记录播放入口。"
      }
    ],
    "notes": "2026.2.1；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1WQ6tBXEpx?t=323&spm_id_from=333.1369.0.0",
    "archivedAt": "2026-02-01T23:30:00+08:00"
  },
  {
    "id": "screening-2026-03-01-010",
    "date": "2026-03-01",
    "startsAt": "2026-03-01T20:00:00+08:00",
    "title": "《八恶人》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-n1qwyy",
        "libraryId": "history-n1qwyy",
        "type": "classic",
        "title": "八恶人",
        "rating": 8.7,
        "description": "2026-03-01 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1jvP5z8E8o?t=224&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2026",
          "Bilibili",
          "经典"
        ],
        "note": "2026.3.1 归档；已记录播放入口。"
      }
    ],
    "notes": "2026.3.1；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1jvP5z8E8o?t=224&spm_id_from=333.1369.0.0",
    "archivedAt": "2026-03-01T23:30:00+08:00"
  },
  {
    "id": "screening-2026-03-08-009",
    "date": "2026-03-08",
    "startsAt": "2026-03-08T20:00:00+08:00",
    "title": "《美人鱼的夏天》与《加勒比海盗》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-yfko3l",
        "libraryId": "history-yfko3l",
        "type": "bad",
        "title": "美人鱼的夏天",
        "rating": 4,
        "description": "2026-03-08 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1xnPDz1Eru?t=219&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2026",
          "Bilibili",
          "反面案例"
        ],
        "note": "2026.3.8 归档；已记录播放入口。"
      },
      {
        "id": "history-1h1i4h3",
        "libraryId": "history-1h1i4h3",
        "type": "classic",
        "title": "加勒比海盗",
        "rating": 8.8,
        "description": "2026-03-08 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1xnPDz1Eru?t=5702&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2026",
          "Bilibili",
          "经典"
        ],
        "note": "2026.3.8 归档；已记录播放入口。"
      }
    ],
    "notes": "2026.3.8；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1xnPDz1Eru?t=219&spm_id_from=333.1369.0.0",
    "archivedAt": "2026-03-08T23:30:00+08:00"
  },
  {
    "id": "screening-2026-03-15-008",
    "date": "2026-03-15",
    "startsAt": "2026-03-15T20:00:00+08:00",
    "title": "《危机航线》与《徒手攀岩》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-zgvcj9",
        "libraryId": "history-zgvcj9",
        "type": "bad",
        "title": "危机航线",
        "rating": 5.5,
        "description": "2026-03-15 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV18ewUz3E4F?t=276&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2026",
          "Bilibili",
          "反面案例",
          "纪录片"
        ],
        "note": "2026.3.15 归档；已记录播放入口。"
      },
      {
        "id": "history-19naabp",
        "libraryId": "history-19naabp",
        "type": "topic",
        "title": "徒手攀岩",
        "rating": 8.8,
        "description": "2026-03-15 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV18ewUz3E4F?t=7886&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2026",
          "Bilibili",
          "纪录片"
        ],
        "note": "2026.3.15 归档；已记录播放入口。"
      }
    ],
    "notes": "2026.3.15；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV18ewUz3E4F?t=276&spm_id_from=333.1369.0.0",
    "archivedAt": "2026-03-15T23:30:00+08:00"
  },
  {
    "id": "screening-2026-03-29-007",
    "date": "2026-03-29",
    "startsAt": "2026-03-29T20:00:00+08:00",
    "title": "《蓦然回首》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-2mgie5",
        "libraryId": "history-2mgie5",
        "type": "anime",
        "title": "蓦然回首",
        "rating": 8.1,
        "description": "2026-03-29 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1pEXQB2E3D?t=232&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2026",
          "Bilibili",
          "动画"
        ],
        "note": "2026.3.29 归档；已记录播放入口。"
      }
    ],
    "notes": "2026.3.29；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1pEXQB2E3D?t=232&spm_id_from=333.1369.0.0",
    "archivedAt": "2026-03-29T23:30:00+08:00"
  },
  {
    "id": "screening-2026-04-12-006",
    "date": "2026-04-12",
    "startsAt": "2026-04-12T20:00:00+08:00",
    "title": "《隋朝来客》与《回到未来》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-mhs3py",
        "libraryId": "history-mhs3py",
        "type": "bad",
        "title": "隋朝来客",
        "rating": 4.7,
        "description": "2026-04-12 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1GWQxBWEvv?t=280&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2026",
          "Bilibili",
          "反面案例"
        ],
        "note": "2026.4.12 归档；已记录播放入口。"
      },
      {
        "id": "history-1a2wy16",
        "libraryId": "history-1a2wy16",
        "type": "classic",
        "title": "回到未来",
        "rating": 8.8,
        "description": "2026-04-12 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1GWQxBWEvv?t=6369&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2026",
          "Bilibili",
          "经典"
        ],
        "note": "2026.4.12 归档；已记录播放入口。"
      }
    ],
    "notes": "2026.4.12；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1GWQxBWEvv?t=280&spm_id_from=333.1369.0.0",
    "archivedAt": "2026-04-12T23:30:00+08:00"
  },
  {
    "id": "screening-2026-04-20-005",
    "date": "2026-04-20",
    "startsAt": "2026-04-20T20:00:00+08:00",
    "title": "《有完没完》与《触不可及》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-1cffxh1",
        "libraryId": "history-1cffxh1",
        "type": "bad",
        "title": "有完没完",
        "rating": 5.2,
        "description": "2026-04-20 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1XpowBeENV?t=204&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2026",
          "Bilibili",
          "反面案例"
        ],
        "note": "2026.4.20 归档；已记录播放入口。"
      },
      {
        "id": "history-zx2duh",
        "libraryId": "history-zx2duh",
        "type": "classic",
        "title": "触不可及",
        "rating": 9.3,
        "description": "2026-04-20 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1XpowBeENV?t=6270&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2026",
          "Bilibili",
          "经典"
        ],
        "note": "2026.4.20 归档；已记录播放入口。"
      }
    ],
    "notes": "2026.4.20；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1XpowBeENV?t=204&spm_id_from=333.1369.0.0",
    "archivedAt": "2026-04-20T23:30:00+08:00"
  },
  {
    "id": "screening-2026-05-10-004",
    "date": "2026-05-10",
    "startsAt": "2026-05-10T20:00:00+08:00",
    "title": "《夺命五头鲨》与《加勒比海盗2：亡灵的宝藏》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-7rdzc0",
        "libraryId": "history-7rdzc0",
        "type": "bad",
        "title": "夺命五头鲨",
        "rating": 3.3,
        "description": "2026-05-10 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1Wn5H6uEoe?t=263&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2026",
          "Bilibili",
          "反面案例"
        ],
        "note": "2026.5.10 归档；已记录播放入口。"
      },
      {
        "id": "history-s1qg3b",
        "libraryId": "history-s1qg3b",
        "type": "classic",
        "title": "加勒比海盗2：亡灵的宝藏",
        "rating": 8.5,
        "description": "2026-05-10 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1Wn5H6uEoe?t=5602&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2026",
          "Bilibili",
          "经典"
        ],
        "note": "2026.5.10 归档；已记录播放入口。"
      }
    ],
    "notes": "2026.5.10；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1Wn5H6uEoe?t=263&spm_id_from=333.1369.0.0",
    "archivedAt": "2026-05-10T23:30:00+08:00"
  },
  {
    "id": "screening-2026-05-17-003",
    "date": "2026-05-17",
    "startsAt": "2026-05-17T20:00:00+08:00",
    "title": "《夺命六头鲨》与《加勒比海盗3：世界的尽头》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 2 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-4u3moj",
        "libraryId": "history-4u3moj",
        "type": "bad",
        "title": "夺命六头鲨",
        "rating": 3.8,
        "description": "2026-05-17 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1JBLF63EQp?t=166&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2026",
          "Bilibili",
          "反面案例"
        ],
        "note": "2026.5.17 归档；已记录播放入口。"
      },
      {
        "id": "history-8v7dkl",
        "libraryId": "history-8v7dkl",
        "type": "good",
        "title": "加勒比海盗3：世界的尽头",
        "rating": 8.4,
        "description": "2026-05-17 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1JBLF63EQp?t=5460&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2026",
          "Bilibili",
          "好评"
        ],
        "note": "2026.5.17 归档；已记录播放入口。"
      }
    ],
    "notes": "2026.5.17；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1JBLF63EQp?t=166&spm_id_from=333.1369.0.0",
    "archivedAt": "2026-05-17T23:30:00+08:00"
  },
  {
    "id": "screening-2026-05-18-002",
    "date": "2026-05-18",
    "startsAt": "2026-05-18T20:00:00+08:00",
    "title": "《迷家》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-dcrgn4",
        "libraryId": "history-dcrgn4",
        "type": "bad",
        "title": "迷家",
        "rating": 4.1,
        "description": "2026-05-18 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1QyLN6rE5A?t=368&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2026",
          "Bilibili",
          "反面案例",
          "动画"
        ],
        "note": "2026.5.18 归档；已记录播放入口。"
      }
    ],
    "notes": "2026.5.18；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1QyLN6rE5A?t=368&spm_id_from=333.1369.0.0",
    "archivedAt": "2026-05-18T23:30:00+08:00"
  },
  {
    "id": "screening-2026-05-24-001",
    "date": "2026-05-24",
    "startsAt": "2026-05-24T20:00:00+08:00",
    "title": "《变形金刚4：绝迹重生》",
    "theme": "从电影.txt 导入的真实历史放映记录，包含 1 个片目。",
    "status": "ended",
    "statusText": "已归档",
    "movies": [
      {
        "id": "history-ylqkc4",
        "libraryId": "history-ylqkc4",
        "type": "topic",
        "title": "变形金刚4：绝迹重生",
        "rating": 6.7,
        "description": "2026-05-24 周末放映会历史记录，来源于电影.txt。",
        "sourceUrl": "https://www.bilibili.com/video/BV1p4Gn6bEcz?t=282&spm_id_from=333.1369.0.0",
        "tags": [
          "历史放映",
          "电影.txt",
          "2026",
          "Bilibili"
        ],
        "note": "2026.5.24 归档；已记录播放入口。"
      }
    ],
    "notes": "2026.5.24；原始记录已保留在电影.txt。",
    "recordUrl": "https://www.bilibili.com/video/BV1p4Gn6bEcz?t=282&spm_id_from=333.1369.0.0",
    "archivedAt": "2026-05-24T23:30:00+08:00"
  }
] as ScreeningWeek[];

export const generatedScreeningHistoryLibraryItems = [
  {
    "id": "history-ylqkc4",
    "title": "变形金刚4：绝迹重生",
    "type": "movie",
    "category": "topic",
    "rating": 6.7,
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2026-05-24。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2026",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1p4Gn6bEcz?t=282&spm_id_from=333.1369.0.0",
    "sourceNote": "2026.5.24 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2026-05-24",
    "addedAt": "2026-05-24"
  },
  {
    "id": "history-dcrgn4",
    "title": "迷家",
    "type": "anime",
    "category": "bad",
    "rating": 4.1,
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2026-05-18。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2026",
      "Bilibili",
      "反面案例",
      "动画"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1QyLN6rE5A?t=368&spm_id_from=333.1369.0.0",
    "sourceNote": "2026.5.18 归档；已记录播放入口。",
    "status": "watched",
    "priority": "high",
    "timesWatched": 1,
    "lastWatchedAt": "2026-05-18",
    "addedAt": "2026-05-18"
  },
  {
    "id": "history-4u3moj",
    "title": "夺命六头鲨",
    "type": "movie",
    "category": "bad",
    "rating": 3.8,
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2026-05-17。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2026",
      "Bilibili",
      "反面案例"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1JBLF63EQp?t=166&spm_id_from=333.1369.0.0",
    "sourceNote": "2026.5.17 归档；已记录播放入口。",
    "status": "watched",
    "priority": "high",
    "timesWatched": 1,
    "lastWatchedAt": "2026-05-17",
    "addedAt": "2026-05-17"
  },
  {
    "id": "history-8v7dkl",
    "title": "加勒比海盗3：世界的尽头",
    "type": "movie",
    "category": "good",
    "rating": 8.4,
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2026-05-17。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2026",
      "Bilibili",
      "好评"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1JBLF63EQp?t=5460&spm_id_from=333.1369.0.0",
    "sourceNote": "2026.5.17 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2026-05-17",
    "addedAt": "2026-05-17"
  },
  {
    "id": "history-7rdzc0",
    "title": "夺命五头鲨",
    "type": "movie",
    "category": "bad",
    "rating": 3.3,
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2026-05-10。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2026",
      "Bilibili",
      "反面案例"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1Wn5H6uEoe?t=263&spm_id_from=333.1369.0.0",
    "sourceNote": "2026.5.10 归档；已记录播放入口。",
    "status": "watched",
    "priority": "high",
    "timesWatched": 1,
    "lastWatchedAt": "2026-05-10",
    "addedAt": "2026-05-10"
  },
  {
    "id": "history-s1qg3b",
    "title": "加勒比海盗2：亡灵的宝藏",
    "type": "movie",
    "category": "classic",
    "rating": 8.5,
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2026-05-10。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2026",
      "Bilibili",
      "经典"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1Wn5H6uEoe?t=5602&spm_id_from=333.1369.0.0",
    "sourceNote": "2026.5.10 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2026-05-10",
    "addedAt": "2026-05-10"
  },
  {
    "id": "history-1cffxh1",
    "title": "有完没完",
    "type": "movie",
    "category": "bad",
    "rating": 5.2,
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2026-04-20。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2026",
      "Bilibili",
      "反面案例"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1XpowBeENV?t=204&spm_id_from=333.1369.0.0",
    "sourceNote": "2026.4.20 归档；已记录播放入口。",
    "status": "watched",
    "priority": "high",
    "timesWatched": 1,
    "lastWatchedAt": "2026-04-20",
    "addedAt": "2026-04-20"
  },
  {
    "id": "history-zx2duh",
    "title": "触不可及",
    "type": "movie",
    "category": "classic",
    "rating": 9.3,
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2026-04-20。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2026",
      "Bilibili",
      "经典"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1XpowBeENV?t=6270&spm_id_from=333.1369.0.0",
    "sourceNote": "2026.4.20 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2026-04-20",
    "addedAt": "2026-04-20"
  },
  {
    "id": "history-mhs3py",
    "title": "隋朝来客",
    "type": "movie",
    "category": "bad",
    "rating": 4.7,
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2026-04-12。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2026",
      "Bilibili",
      "反面案例"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1GWQxBWEvv?t=280&spm_id_from=333.1369.0.0",
    "sourceNote": "2026.4.12 归档；已记录播放入口。",
    "status": "watched",
    "priority": "high",
    "timesWatched": 1,
    "lastWatchedAt": "2026-04-12",
    "addedAt": "2026-04-12"
  },
  {
    "id": "history-1a2wy16",
    "title": "回到未来",
    "type": "movie",
    "category": "classic",
    "rating": 8.8,
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2026-04-12。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2026",
      "Bilibili",
      "经典"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1GWQxBWEvv?t=6369&spm_id_from=333.1369.0.0",
    "sourceNote": "2026.4.12 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2026-04-12",
    "addedAt": "2026-04-12"
  },
  {
    "id": "history-2mgie5",
    "title": "蓦然回首",
    "type": "anime",
    "category": "anime",
    "rating": 8.1,
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2026-03-29。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2026",
      "Bilibili",
      "动画"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1pEXQB2E3D?t=232&spm_id_from=333.1369.0.0",
    "sourceNote": "2026.3.29 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2026-03-29",
    "addedAt": "2026-03-29"
  },
  {
    "id": "history-zgvcj9",
    "title": "危机航线",
    "type": "movie",
    "category": "bad",
    "rating": 5.5,
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2026-03-15。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2026",
      "Bilibili",
      "反面案例",
      "纪录片"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV18ewUz3E4F?t=276&spm_id_from=333.1369.0.0",
    "sourceNote": "2026.3.15 归档；已记录播放入口。",
    "status": "watched",
    "priority": "high",
    "timesWatched": 1,
    "lastWatchedAt": "2026-03-15",
    "addedAt": "2026-03-15"
  },
  {
    "id": "history-19naabp",
    "title": "徒手攀岩",
    "type": "other",
    "category": "topic",
    "rating": 8.8,
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2026-03-15。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2026",
      "Bilibili",
      "纪录片"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV18ewUz3E4F?t=7886&spm_id_from=333.1369.0.0",
    "sourceNote": "2026.3.15 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2026-03-15",
    "addedAt": "2026-03-15"
  },
  {
    "id": "history-yfko3l",
    "title": "美人鱼的夏天",
    "type": "movie",
    "category": "bad",
    "rating": 4,
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2026-03-08。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2026",
      "Bilibili",
      "反面案例"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1xnPDz1Eru?t=219&spm_id_from=333.1369.0.0",
    "sourceNote": "2026.3.8 归档；已记录播放入口。",
    "status": "watched",
    "priority": "high",
    "timesWatched": 1,
    "lastWatchedAt": "2026-03-08",
    "addedAt": "2026-03-08"
  },
  {
    "id": "history-1h1i4h3",
    "title": "加勒比海盗",
    "type": "movie",
    "category": "classic",
    "rating": 8.8,
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2026-03-08。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2026",
      "Bilibili",
      "经典"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1xnPDz1Eru?t=5702&spm_id_from=333.1369.0.0",
    "sourceNote": "2026.3.8 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2026-03-08",
    "addedAt": "2026-03-08"
  },
  {
    "id": "history-n1qwyy",
    "title": "八恶人",
    "type": "movie",
    "category": "classic",
    "rating": 8.7,
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2026-03-01。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2026",
      "Bilibili",
      "经典"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1jvP5z8E8o?t=224&spm_id_from=333.1369.0.0",
    "sourceNote": "2026.3.1 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2026-03-01",
    "addedAt": "2026-03-01"
  },
  {
    "id": "history-jl889y",
    "title": "超时空辉夜姬！",
    "type": "anime",
    "category": "anime",
    "rating": 8.3,
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2026-02-01。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2026",
      "Bilibili",
      "动画"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1WQ6tBXEpx?t=323&spm_id_from=333.1369.0.0",
    "sourceNote": "2026.2.1 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2026-02-01",
    "addedAt": "2026-02-01"
  },
  {
    "id": "history-13t6ogs",
    "title": "孤岛惊魂",
    "type": "movie",
    "category": "bad",
    "rating": 3.6,
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2026-01-25。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2026",
      "Bilibili",
      "反面案例"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1AKzbBJET2?t=201.4&p=2&spm_id_from=333.1369.0.0",
    "sourceNote": "2026.1.25 归档；已记录播放入口。",
    "status": "watched",
    "priority": "high",
    "timesWatched": 1,
    "lastWatchedAt": "2026-01-25",
    "addedAt": "2026-01-25"
  },
  {
    "id": "history-wmll15",
    "title": "落水狗",
    "type": "movie",
    "category": "good",
    "rating": 8.4,
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2026-01-25。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2026",
      "Bilibili",
      "好评"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1AKzbBJET2?p=2&t=5885&spm_id_from=333.1369.0.0",
    "sourceNote": "2026.1.25 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2026-01-25",
    "addedAt": "2026-01-25"
  },
  {
    "id": "history-1oy64a4",
    "title": "人类清除计划",
    "type": "movie",
    "category": "topic",
    "rating": 6,
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2026-01-11。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2026",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1hd6fBnEVp?t=269&spm_id_from=333.1369.0.0",
    "sourceNote": "2026.1.11 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2026-01-11",
    "addedAt": "2026-01-11"
  },
  {
    "id": "history-vv0acf",
    "title": "银翼杀手2049",
    "type": "movie",
    "category": "good",
    "rating": 8.3,
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2026-01-11。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2026",
      "Bilibili",
      "好评"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1hd6fBnEVp?t=5718&spm_id_from=333.1369.0.0",
    "sourceNote": "2026.1.11 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2026-01-11",
    "addedAt": "2026-01-11"
  },
  {
    "id": "history-tm6o7m",
    "title": "剧场版 链锯人 蕾塞篇",
    "type": "anime",
    "category": "anime",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2026-01-04。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2026",
      "Bilibili",
      "动画"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV183inBAEBr?t=1254.7&spm_id_from=333.1369.0.0",
    "sourceNote": "2026.1.4 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2026-01-04",
    "addedAt": "2026-01-04"
  },
  {
    "id": "history-1kr754",
    "title": "鲨卷风5：全球鲨暴",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-12-14。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV18FmrBnE9C?t=235.1&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.12.14 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-12-14",
    "addedAt": "2025-12-14"
  },
  {
    "id": "history-2jnzf1",
    "title": "鲨卷风6：最后的鲨卷风",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-12-14。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV18FmrBnE9C?t=5493.6&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.12.14 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-12-14",
    "addedAt": "2025-12-14"
  },
  {
    "id": "history-15g1eq",
    "title": "彼方的阿斯特拉",
    "type": "anime",
    "category": "anime",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-12-12。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili",
      "动画"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1RsmUBjEEF?t=339.7&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.12.12、12.15 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-12-12",
    "addedAt": "2025-12-12"
  },
  {
    "id": "history-1jzemnm",
    "title": "神奇",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-12-07。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1YhmNBWEkv?t=260.4&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.12.7 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-12-07",
    "addedAt": "2025-12-07"
  },
  {
    "id": "history-1bivq0w",
    "title": "绝杀慕尼黑",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-12-07。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1YhmNBWEkv?t=7006.1&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.12.7 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-12-07",
    "addedAt": "2025-12-07"
  },
  {
    "id": "history-1dncemz",
    "title": "敦刻尔克行动",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-11-30。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1pDSBBiEn4?t=215.7&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.11.30 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-11-30",
    "addedAt": "2025-11-30"
  },
  {
    "id": "history-an172f",
    "title": "1917",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-11-30。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1pDSBBiEn4?t=6127.6&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.11.30 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-11-30",
    "addedAt": "2025-11-30"
  },
  {
    "id": "history-1amhohu",
    "title": "鲨卷风4：四度觉醒",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-11-23。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1WZUKBmEyT?t=276.1&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.11.23 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-11-23",
    "addedAt": "2025-11-23"
  },
  {
    "id": "history-8uodem",
    "title": "猩球崛起3：终极之战",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-11-23。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1WZUKBmEyT?t=5809.0&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.11.23 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-11-23",
    "addedAt": "2025-11-23"
  },
  {
    "id": "history-ickzmj",
    "title": "鲨卷风3",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-11-09。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1PDkQBbEBH?t=316.4&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.11.09 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-11-09",
    "addedAt": "2025-11-09"
  },
  {
    "id": "history-gf0rd0",
    "title": "猩球崛起2：黎明之战",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-11-09。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1PDkQBbEBH?t=5692.5&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.11.09 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-11-09",
    "addedAt": "2025-11-09"
  },
  {
    "id": "history-i2ldxk",
    "title": "鲨卷风2",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-11-02。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV17ayfBrEyH?t=231.8&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.11.02 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-11-02",
    "addedAt": "2025-11-02"
  },
  {
    "id": "history-1ouvrnb",
    "title": "猩球崛起",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-11-02。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV17ayfBrEyH?t=5606.3&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.11.02 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-11-02",
    "addedAt": "2025-11-02"
  },
  {
    "id": "history-t63qjn",
    "title": "冰封：重生之门",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-10-26。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1eRmQBWEe1?t=152.4&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.10.26 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-10-26",
    "addedAt": "2025-10-26"
  },
  {
    "id": "history-6i67o9",
    "title": "时空恋旅人",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-10-26。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1eRmQBWEe1?t=5485.0&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.10.26 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-10-26",
    "addedAt": "2025-10-26"
  },
  {
    "id": "history-ph5ohg",
    "title": "明日战记",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-10-19。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV11SsKz6E7D?t=193.2&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.10.19 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-10-19",
    "addedAt": "2025-10-19"
  },
  {
    "id": "history-6ldqm1",
    "title": "变形金刚3",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-10-19。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV11SsKz6E7D?t=6547.4&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.10.19 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-10-19",
    "addedAt": "2025-10-19"
  },
  {
    "id": "history-li6ixk",
    "title": "普罗米修斯",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-10-12。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1Xc4VzVECN?t=1245.1&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.10.12 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-10-12",
    "addedAt": "2025-10-12"
  },
  {
    "id": "history-1lzhj3d",
    "title": "哈利波特与死亡圣器（上）",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-09-16。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1z7pUzyEDF?t=278.0&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.9.16 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-09-16",
    "addedAt": "2025-09-16"
  },
  {
    "id": "history-1vz1ycs",
    "title": "哈利波特与死亡圣器（下）",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-09-16。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1z7pUzyEDF?t=1241.3&p=2&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.9.16 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-09-16",
    "addedAt": "2025-09-16"
  },
  {
    "id": "history-1hfkr4v",
    "title": "哈利波特与凤凰社",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-09-15。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1Ynp6z6E5T?t=454.6&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.9.15 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-09-15",
    "addedAt": "2025-09-15"
  },
  {
    "id": "history-knge0j",
    "title": "哈利波特与混血王子",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-09-15。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1Ynp6z6E5T?t=8326.0&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.9.15 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-09-15",
    "addedAt": "2025-09-15"
  },
  {
    "id": "history-agk1o7",
    "title": "哈利波特与阿兹卡班的囚徒",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-09-14。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1eNpwzTEcP?t=242.5&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.9.14 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-09-14",
    "addedAt": "2025-09-14"
  },
  {
    "id": "history-8x2swp",
    "title": "哈利波特与火焰杯",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-09-14。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1eNpwzTEcP?t=953.1&p=2&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.9.14 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-09-14",
    "addedAt": "2025-09-14"
  },
  {
    "id": "history-1m6i7xh",
    "title": "哈利波特与密室",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-09-12。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1orpVz3EjL?t=246.7&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.9.12 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-09-12",
    "addedAt": "2025-09-12"
  },
  {
    "id": "history-12fqgnp",
    "title": "哈利波特与魔法石",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-09-11。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1GuHzzKEiu?t=598.8&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.9.11 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-09-11",
    "addedAt": "2025-09-11"
  },
  {
    "id": "history-ylpuql",
    "title": "好像也没那么热血沸腾",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-09-07。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1pLa9z9ECC?t=275.3&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.9.7 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-09-07",
    "addedAt": "2025-09-07"
  },
  {
    "id": "history-1xwgkxt",
    "title": "铁甲钢拳",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-09-07。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1pLa9z9ECC?t=8685.5&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.9.7 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-09-07",
    "addedAt": "2025-09-07"
  },
  {
    "id": "history-8wf90y",
    "title": "夏洛特",
    "type": "anime",
    "category": "anime",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-09-05。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili",
      "动画"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1xeaazwEpQ?t=396.5&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.9.5 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-09-05",
    "addedAt": "2025-09-05"
  },
  {
    "id": "history-1wfksz9",
    "title": "花豹与鬣狗",
    "type": "other",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-08-31。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili",
      "纪录片"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV15saLzPEik?t=783.8&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.8.31 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-08-31",
    "addedAt": "2025-08-31"
  },
  {
    "id": "history-miy507",
    "title": "了不起的狐狸爸爸",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-08-31。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili",
      "纪录片"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV15saLzPEik?t=3767.9&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.8.31 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-08-31",
    "addedAt": "2025-08-31"
  },
  {
    "id": "history-5swemw",
    "title": "密室之不可告人",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-08-24。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV167enzcEUq?t=286.0&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.8.24 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-08-24",
    "addedAt": "2025-08-24"
  },
  {
    "id": "history-ooekjd",
    "title": "如月疑云",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-08-24。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV167enzcEUq?t=6155.7&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.8.24 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-08-24",
    "addedAt": "2025-08-24"
  },
  {
    "id": "history-1jaoe0e",
    "title": "战国",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-08-17。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1mLYnzBERe?t=248.1&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.8.17 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-08-17",
    "addedAt": "2025-08-17"
  },
  {
    "id": "history-xvmosp",
    "title": "大明劫",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-08-17。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1mLYnzBERe?t=745.5&p=2&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.8.17 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-08-17",
    "addedAt": "2025-08-17"
  },
  {
    "id": "history-hqcdd0",
    "title": "城市游戏",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-08-10。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1wgbMzSEh6?t=199.5&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.8.10 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-08-10",
    "addedAt": "2025-08-10"
  },
  {
    "id": "history-in7voi",
    "title": "极速车王",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-08-10。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1wgbMzSEh6?t=5246.1&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.8.10 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-08-10",
    "addedAt": "2025-08-10"
  },
  {
    "id": "history-bm5yh7",
    "title": "地狱小丑/瓦斯科小丑",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-08-03。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1RxtFzkEWN/?t=299.8&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.8.3 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-08-03",
    "addedAt": "2025-08-03"
  },
  {
    "id": "history-1l62nid",
    "title": "宿醉",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-08-03。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1RxtFzkEWN?t=5232.6&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.8.3 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-08-03",
    "addedAt": "2025-08-03"
  },
  {
    "id": "history-7wicqm",
    "title": "搜救",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-07-13。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1XPuPzBE3T?t=490.2&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.7.13 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-07-13",
    "addedAt": "2025-07-13"
  },
  {
    "id": "history-i93m0u",
    "title": "菲利普船长",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-07-13。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1XPuPzBE3T?t=6788.2&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.7.13 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-07-13",
    "addedAt": "2025-07-13"
  },
  {
    "id": "history-11g0n24",
    "title": "江湖论剑实录",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-07-06。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1yP36zwEWf?t=280.1&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.7.6 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-07-06",
    "addedAt": "2025-07-06"
  },
  {
    "id": "history-14cguxj",
    "title": "捕蝇纸",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-07-06。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1yP36zwEWf?t=6318.1&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.7.6 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-07-06",
    "addedAt": "2025-07-06"
  },
  {
    "id": "history-xyc21h",
    "title": "环大西洋2",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-06-22。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1oeK4ziESV?t=187.5&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.6.22 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-06-22",
    "addedAt": "2025-06-22"
  },
  {
    "id": "history-116ikvs",
    "title": "变形金刚2：卷土重来",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-06-22。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1oeK4ziESV?t=5354.1&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.6.22 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-06-22",
    "addedAt": "2025-06-22"
  },
  {
    "id": "history-10s6qln",
    "title": "碧蓝之海",
    "type": "anime",
    "category": "anime",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-06-20。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili",
      "动画"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1AJKKzxEZv?spm_id_from=333.1369.0.0",
    "sourceNote": "2025.6.20 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-06-20",
    "addedAt": "2025-06-20"
  },
  {
    "id": "history-imc3pq",
    "title": "全城高考",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-06-15。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1doMbzLEH7?t=337.8&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.6.15 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-06-15",
    "addedAt": "2025-06-15"
  },
  {
    "id": "history-1pnmaq1",
    "title": "垫底辣妹",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-06-15。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1doMbzLEH7?t=6032.0&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.6.15 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-06-15",
    "addedAt": "2025-06-15"
  },
  {
    "id": "history-1d7bg8f",
    "title": "夺命三头鲨",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-06-01。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1uV7yzPECW?t=0h6m45s&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.6.1 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-06-01",
    "addedAt": "2025-06-01"
  },
  {
    "id": "history-1w6obmo",
    "title": "侏罗纪公园",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-06-01。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1uV7yzPECW?t=1h35m25s&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.6.1 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-06-01",
    "addedAt": "2025-06-01"
  },
  {
    "id": "history-176nltx",
    "title": "环大西洋",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-05-25。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV149jVzrESL?t=0h7m30s&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.5.25 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-05-25",
    "addedAt": "2025-05-25"
  },
  {
    "id": "history-1gemfow",
    "title": "变形金刚",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-05-25。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV149jVzrESL?t=1h37m40s&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.5.25 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-05-25",
    "addedAt": "2025-05-25"
  },
  {
    "id": "history-1scaxbe",
    "title": "忍者杀手",
    "type": "anime",
    "category": "anime",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-05-23。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili",
      "动画"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1FCjHzHEYb?t=389.6&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.5.23 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-05-23",
    "addedAt": "2025-05-23"
  },
  {
    "id": "history-gqjg4i",
    "title": "刺杀肯尼迪",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-05-15。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV17wEnz7EYs?t=810.6&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.5.15 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-05-15",
    "addedAt": "2025-05-15"
  },
  {
    "id": "history-fjrhxu",
    "title": "涉过愤怒的海",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-05-11。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1wLEGziEm1?t=0h8m54s&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.5.11 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-05-11",
    "addedAt": "2025-05-11"
  },
  {
    "id": "history-19g8yse",
    "title": "盗钥匙的方法",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-05-11。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1wLEGziEm1?t=9804.6&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.5.11 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-05-11",
    "addedAt": "2025-05-11"
  },
  {
    "id": "history-cr4i5o",
    "title": "不二神探",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-05-04。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1efVNzsEUh?t=0h3m17s&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.5.4 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-05-04",
    "addedAt": "2025-05-04"
  },
  {
    "id": "history-gqny9k",
    "title": "热血警探",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-05-04。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1efVNzsEUh?t=1h49m00s&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.5.4 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-05-04",
    "addedAt": "2025-05-04"
  },
  {
    "id": "history-2h0zyo",
    "title": "金钱堡垒",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-04-20。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1GGLPzREmW?t=0h6m7s&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.4.20 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-04-20",
    "addedAt": "2025-04-20"
  },
  {
    "id": "history-dk08w",
    "title": "大空头",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-04-20。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1GGLPzREmW?t=1h40m59s&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.4.20 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-04-20",
    "addedAt": "2025-04-20"
  },
  {
    "id": "history-uaa3bn",
    "title": "守望者",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-04-11。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1VzdXYpEZq?t=0h24m16s&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.4.11 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-04-11",
    "addedAt": "2025-04-11"
  },
  {
    "id": "history-1792o82",
    "title": "永春白鹤拳之擎天画卷",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-03-23。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1eHozYnEHC?t=5m46s&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.3.23 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-03-23",
    "addedAt": "2025-03-23"
  },
  {
    "id": "history-89shkv",
    "title": "无人区",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-03-23。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1eHozYnEHC?t=1h41m33s&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.3.23 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-03-23",
    "addedAt": "2025-03-23"
  },
  {
    "id": "history-abg4ni",
    "title": "轻拍翻转小魔女",
    "type": "anime",
    "category": "anime",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-03-18。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili",
      "动画"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1MsX7YNEJM/?spm_id_from=333.1369.0.0",
    "sourceNote": "2025.3.18~3.19 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-03-18",
    "addedAt": "2025-03-18"
  },
  {
    "id": "history-1tv2bih",
    "title": "铳皇无尽的法夫纳",
    "type": "anime",
    "category": "anime",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-03-17。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili",
      "动画"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1AjXuYBEsY/?spm_id_from=333.1369.0.0",
    "sourceNote": "2025.3.17 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-03-17",
    "addedAt": "2025-03-17"
  },
  {
    "id": "history-5jdkat",
    "title": "科洛弗档案",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-03-16。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1egQeYREqA?t=10m46s&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.3.16 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-03-16",
    "addedAt": "2025-03-16"
  },
  {
    "id": "history-1nky5lx",
    "title": "布达佩斯大饭店",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-03-16。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1egQeYREqA?t=1h30m26s&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.3.16 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-03-16",
    "addedAt": "2025-03-16"
  },
  {
    "id": "history-1anwgz5",
    "title": "圣剑使的禁咒咏唱",
    "type": "anime",
    "category": "anime",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-03-11。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili",
      "动画"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1xFQJYKEqa?t=0h9m51s&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.3.11 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-03-11",
    "addedAt": "2025-03-11"
  },
  {
    "id": "history-gul5m",
    "title": "绝对双刃",
    "type": "anime",
    "category": "anime",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-03-10。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili",
      "动画"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1qoRLYHEUC?t=0h6m15s&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.3.10 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-03-10",
    "addedAt": "2025-03-10"
  },
  {
    "id": "history-1xwhnny",
    "title": "蒸发太平洋",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-03-09。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1BaRvYgEo3?t=0h3m35s&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.3.9 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-03-09",
    "addedAt": "2025-03-09"
  },
  {
    "id": "history-1019enf",
    "title": "大白鲨",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-03-09。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1BaRvYgEo3?t=1h34m35s&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.3.9 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-03-09",
    "addedAt": "2025-03-09"
  },
  {
    "id": "history-12eddlp",
    "title": "蜘蛛侠3",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-03-02。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1899hY1EDF?t=0h7m0s&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.3.2 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-03-02",
    "addedAt": "2025-03-02"
  },
  {
    "id": "history-1mpm0vc",
    "title": "成为约翰·马尔科维奇",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-03-02。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1899hY1EDF?t=2h25m13s&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.3.2 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-03-02",
    "addedAt": "2025-03-02"
  },
  {
    "id": "history-17kpxev",
    "title": "路人女主的养成方法",
    "type": "anime",
    "category": "anime",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-02-18。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili",
      "动画"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1rDAveiEGk/?spm_id_from=333.1369.0.0",
    "sourceNote": "2025.2.18~2.20 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-02-18",
    "addedAt": "2025-02-18"
  },
  {
    "id": "history-zc07bk",
    "title": "抓娃娃",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-02-14。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1eyKuexEXq?t=0h11m59s&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.2.14 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-02-14",
    "addedAt": "2025-02-14"
  },
  {
    "id": "history-t6sp4q",
    "title": "网络谜踪",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-02-14。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1eyKuexEXq?t=2h29m33s&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.2.14 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-02-14",
    "addedAt": "2025-02-14"
  },
  {
    "id": "history-cw7vai",
    "title": "鲨卷风",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-01-26。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV15SfCYvEjg?t=0h7m18s&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.1.26 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-01-26",
    "addedAt": "2025-01-26"
  },
  {
    "id": "history-1ktvgwd",
    "title": "萨利机长",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-01-26。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV15SfCYvEjg?t=1h34m38s&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.1.26 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-01-26",
    "addedAt": "2025-01-26"
  },
  {
    "id": "history-1h8tb2u",
    "title": "富春山居图",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-01-19。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1CGwkeQETF?t=0h7m4s&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.1.19 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-01-19",
    "addedAt": "2025-01-19"
  },
  {
    "id": "history-11nttdk",
    "title": "解救吾先生",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-01-19。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1CGwkeQETF?t=2h10m32s&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.1.19 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-01-19",
    "addedAt": "2025-01-19"
  },
  {
    "id": "history-us8sdl",
    "title": "火星异种真人版",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-01-12。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1D3ckebEnR?t=0h16m49s&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.1.12 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-01-12",
    "addedAt": "2025-01-12"
  },
  {
    "id": "history-13yyvtr",
    "title": "源代码",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2025-01-12。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2025",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1D3ckebEnR?t=2h5m2s&spm_id_from=333.1369.0.0",
    "sourceNote": "2025.1.12 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2025-01-12",
    "addedAt": "2025-01-12"
  },
  {
    "id": "history-ydcqg4",
    "title": "赛马娘 Pretty Derby 新时代之门",
    "type": "anime",
    "category": "anime",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-12-29。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili",
      "动画"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1y76gYkETx?t=0h11m24s&spm_id_from=333.1369.0.0",
    "sourceNote": "2024.12.29 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-12-29",
    "addedAt": "2024-12-29"
  },
  {
    "id": "history-w2ggk7",
    "title": "浪客剑心最终章 人诛篇",
    "type": "anime",
    "category": "anime",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-12-18。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili",
      "动画",
      "纪录片"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1bFkrYVETo?t=0h3m55s&spm_id_from=333.1369.0.0",
    "sourceNote": "2024.12.18 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-12-18",
    "addedAt": "2024-12-18"
  },
  {
    "id": "history-l0virr",
    "title": "剑心之路",
    "type": "other",
    "category": "anime",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-12-18。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili",
      "动画",
      "纪录片"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1bFkrYVETo?p=2&t=0h25m52s&spm_id_from=333.1369.0.0",
    "sourceNote": "2024.12.18 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-12-18",
    "addedAt": "2024-12-18"
  },
  {
    "id": "history-e07kxl",
    "title": "浪客剑心：京都大火篇",
    "type": "anime",
    "category": "anime",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-12-17。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili",
      "动画"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1KAkrY3ECS?t=0h5m13s&spm_id_from=333.1369.0.0",
    "sourceNote": "2024.12.17 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-12-17",
    "addedAt": "2024-12-17"
  },
  {
    "id": "history-myy60z",
    "title": "浪客剑心：传说的完结篇",
    "type": "anime",
    "category": "anime",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-12-17。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili",
      "动画"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1KAkrY3ECS?p=2&t=0h21m17s&spm_id_from=333.1369.0.0",
    "sourceNote": "2024.12.17 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-12-17",
    "addedAt": "2024-12-17"
  },
  {
    "id": "history-1mineph",
    "title": "浪客剑心",
    "type": "anime",
    "category": "anime",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-12-16。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili",
      "动画"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV14AkrY3E3d?t=0h6m52s&spm_id_from=333.1369.0.0",
    "sourceNote": "2024.12.16 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-12-16",
    "addedAt": "2024-12-16"
  },
  {
    "id": "history-yhpy5p",
    "title": "浪客剑心 最终章 追忆篇",
    "type": "anime",
    "category": "anime",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-12-16。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili",
      "动画"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV14AkrY3E3d?p=2&t=0h19m38s&spm_id_from=333.1369.0.0",
    "sourceNote": "2024.12.16 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-12-16",
    "addedAt": "2024-12-16"
  },
  {
    "id": "history-1mho9mf",
    "title": "749局",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-12-08。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1yJqxY1EFM?t=0h6m4s&spm_id_from=333.1369.0.0",
    "sourceNote": "2024.12.8 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-12-08",
    "addedAt": "2024-12-08"
  },
  {
    "id": "history-nxdmxx",
    "title": "明日边缘",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-12-08。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1yJqxY1EFM?t=2h17m17s&spm_id_from=333.1369.0.0",
    "sourceNote": "2024.12.8 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-12-08",
    "addedAt": "2024-12-08"
  },
  {
    "id": "history-9ji4j4",
    "title": "逆行人生",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-12-01。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1bUzfYXEzi?t=0h5m53s&spm_id_from=333.1369.0.0",
    "sourceNote": "2024.12.1 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-12-01",
    "addedAt": "2024-12-01"
  },
  {
    "id": "history-csivrh",
    "title": "走走停停",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-12-01。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1bUzfYXEzi?t=2h14m11s&spm_id_from=333.1369.0.0",
    "sourceNote": "2024.12.1 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-12-01",
    "addedAt": "2024-12-01"
  },
  {
    "id": "history-1ln1wri",
    "title": "解除好友2:暗网",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-11-24。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1xoBaYBEVq?t=0h6m27s&spm_id_from=333.1369.0.0",
    "sourceNote": "2024.11.24 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-11-24",
    "addedAt": "2024-11-24"
  },
  {
    "id": "history-1vc27vs",
    "title": "宇宙探索编辑部",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-11-24。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1xoBaYBEVq?t=1h45m28s&spm_id_from=333.1369.0.0",
    "sourceNote": "2024.11.24 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-11-24",
    "addedAt": "2024-11-24"
  },
  {
    "id": "history-15mk4de",
    "title": "电器街的漫画店",
    "type": "anime",
    "category": "anime",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-11-22。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili",
      "动画"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1vXB6YVEr1?spm_id_from=333.1369.0.0",
    "sourceNote": "2024.11.22&2024.11.25 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-11-22",
    "addedAt": "2024-11-22"
  },
  {
    "id": "history-nwopcr",
    "title": "白箱",
    "type": "anime",
    "category": "anime",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-11-18。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili",
      "动画"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1fkUsYcEPz/?spm_id_from=333.1369.0.0",
    "sourceNote": "2024.11.18~2024.11.20 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-11-18",
    "addedAt": "2024-11-18"
  },
  {
    "id": "history-749dqe",
    "title": "剧场版 白箱",
    "type": "anime",
    "category": "anime",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-11-18。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili",
      "动画"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1fkUsYcEPz/?spm_id_from=333.1369.0.0",
    "sourceNote": "2024.11.18~2024.11.20 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-11-18",
    "addedAt": "2024-11-18"
  },
  {
    "id": "history-1lmtacs",
    "title": "孤注一掷",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-11-10。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1ZwiZYWEuo?t=0h0m14s&spm_id_from=333.1369.0.0",
    "sourceNote": "2024.11.10 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-11-10",
    "addedAt": "2024-11-10"
  },
  {
    "id": "history-p0hbaf",
    "title": "烈日灼心",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-11-10。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1ZwiZYWEuo?t=0h0m14s&spm_id_from=333.1369.0.0",
    "sourceNote": "2024.11.10 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-11-10",
    "addedAt": "2024-11-10"
  },
  {
    "id": "history-qhx8gk",
    "title": "从21世纪安全撤离",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-10-18。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1XvCSY5EeP?t=0h2m5s&spm_id_from=333.1369.0.0",
    "sourceNote": "2024.10.18 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-10-18",
    "addedAt": "2024-10-18"
  },
  {
    "id": "history-1pcu11s",
    "title": "甘城光辉游乐园",
    "type": "anime",
    "category": "anime",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-10-17。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili",
      "动画"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1LJyKY8Eur?spm_id_from=333.1369.0.0",
    "sourceNote": "2024.10.17~2024.10.18 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-10-17",
    "addedAt": "2024-10-17"
  },
  {
    "id": "history-174f69g",
    "title": "扬名立万",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-10-14。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1DomEYYEx3?t=0h9m49s&spm_id_from=333.1369.0.0",
    "sourceNote": "2024.10.14 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-10-14",
    "addedAt": "2024-10-14"
  },
  {
    "id": "history-q2g0ai",
    "title": "甲方乙方",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-10-14。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1DomEYYEx3?t=2h18m20s&spm_id_from=333.1369.0.0",
    "sourceNote": "2024.10.14 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-10-14",
    "addedAt": "2024-10-14"
  },
  {
    "id": "history-1ukrtwj",
    "title": "年会不能停",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-09-27。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili",
      "动态/网盘"
    ],
    "sourceUrl": "https://t.bilibili.com/982477651640844291?spm_id_from=333.1369.0.0",
    "sourceNote": "2024.9.27 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-09-27",
    "addedAt": "2024-09-27"
  },
  {
    "id": "history-1fdw14l",
    "title": "疯狂的赛车",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-09-16。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1Ebt8eCEJz?t=0h2m9s&spm_id_from=333.1369.0.0",
    "sourceNote": "2024.9.16 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-09-16",
    "addedAt": "2024-09-16"
  },
  {
    "id": "history-4d5dxz",
    "title": "毒战",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-08-09。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili",
      "动态/网盘"
    ],
    "sourceUrl": "https://t.bilibili.com/982477651640844291?spm_id_from=333.1369.0.0",
    "sourceNote": "2024.8.9 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-08-09",
    "addedAt": "2024-08-09"
  },
  {
    "id": "history-1tm7uhi",
    "title": "导火索",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-08-09。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili",
      "动态/网盘"
    ],
    "sourceUrl": "https://t.bilibili.com/982477651640844291?spm_id_from=333.1369.0.0",
    "sourceNote": "2024.8.9 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-08-09",
    "addedAt": "2024-08-09"
  },
  {
    "id": "history-9wst58",
    "title": "坏男孩雄狮联盟狮王之路",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-07-07。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1CH4y1F734/?spm_id_from=333.1369.0.0",
    "sourceNote": "2024.7.7 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-07-07",
    "addedAt": "2024-07-07"
  },
  {
    "id": "history-y79wab",
    "title": "旋风管家",
    "type": "anime",
    "category": "anime",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-06-11。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili",
      "动画"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1Y4421Q78B/?spm_id_from=333.1369.0.0",
    "sourceNote": "2024.6.11~2024.6.20 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-06-11",
    "addedAt": "2024-06-11"
  },
  {
    "id": "history-1vrpceq",
    "title": "乒乓",
    "type": "anime",
    "category": "anime",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-06-09。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili",
      "动画"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1zE421P7sV/?spm_id_from=333.1369.0.0",
    "sourceNote": "2024.6.9 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-06-09",
    "addedAt": "2024-06-09"
  },
  {
    "id": "history-1ncdtfl",
    "title": "浮生一日 Life in a Day",
    "type": "other",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-05-13。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili",
      "纪录片"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1n1421q7LL/?spm_id_from=333.1369.0.0",
    "sourceNote": "2024.5.13 纪录片 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-05-13",
    "addedAt": "2024-05-13"
  },
  {
    "id": "history-1mw0djp",
    "title": "pop子与pipi美的日常",
    "type": "anime",
    "category": "anime",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-04-17。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili",
      "动画"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1tC41137tr/?spm_id_from=333.1369.0.0",
    "sourceNote": "2024.4.17 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-04-17",
    "addedAt": "2024-04-17"
  },
  {
    "id": "history-1l72pxp",
    "title": "地球脉动",
    "type": "other",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-04-08。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili",
      "纪录片"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1zx4y1Y7Kq/?spm_id_from=333.1369.0.0",
    "sourceNote": "2024.4.8~2024.4.12 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-04-08",
    "addedAt": "2024-04-08"
  },
  {
    "id": "history-1jp7iey",
    "title": "太空丹迪",
    "type": "anime",
    "category": "anime",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-03-17。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili",
      "动画"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV13r42187k7/?spm_id_from=333.1369.0.0",
    "sourceNote": "2024.3.17 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-03-17",
    "addedAt": "2024-03-17"
  },
  {
    "id": "history-pffvo6",
    "title": "特别篇 吹响！悠风号～合奏比赛～",
    "type": "anime",
    "category": "anime",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-03-10。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili",
      "动画"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV18H4y1W7Df/?spm_id_from=333.1369.0.0",
    "sourceNote": "2024.3.10 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-03-10",
    "addedAt": "2024-03-10"
  },
  {
    "id": "history-afdn6g",
    "title": "逃学威龙2",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-02-18。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV18Z42117mq/?spm_id_from=333.1369.0.0",
    "sourceNote": "2024.2.18 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-02-18",
    "addedAt": "2024-02-18"
  },
  {
    "id": "history-1wl0h16",
    "title": "逃学威龙",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2024-01-25。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2024",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1Uk4y1Z7dC/?spm_id_from=333.1369.0.0",
    "sourceNote": "2024.1.25 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2024-01-25",
    "addedAt": "2024-01-25"
  },
  {
    "id": "history-ocgsb3",
    "title": "古立特宇宙",
    "type": "anime",
    "category": "anime",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2023-11-05。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2023",
      "Bilibili",
      "动画"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV17u4y187Ar?t=234.8&spm_id_from=333.1369.0.0",
    "sourceNote": "2023.11.5 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2023-11-05",
    "addedAt": "2023-11-05"
  },
  {
    "id": "history-kjsqyu",
    "title": "灰与幻想的格林姆迦尔",
    "type": "anime",
    "category": "anime",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2023-06-20。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2023",
      "Bilibili",
      "动画"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV14M4y1E7U4/?spm_id_from=333.1369.0.0",
    "sourceNote": "2023.6.20 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2023-06-20",
    "addedAt": "2023-06-20"
  },
  {
    "id": "history-10vuix2",
    "title": "战勇。",
    "type": "anime",
    "category": "anime",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2023-03-18。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2023",
      "Bilibili",
      "动画"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1iP411d7V5/?spm_id_from=333.1369.0.0",
    "sourceNote": "2023.3.18 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2023-03-18",
    "addedAt": "2023-03-18"
  },
  {
    "id": "history-qsxz5l",
    "title": "雍正王朝",
    "type": "series",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2023-02-21。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2023",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1rX4y1Q7mG/?spm_id_from=333.1369.0.0",
    "sourceNote": "2023.2.21~2023.3.27 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2023-02-21",
    "addedAt": "2023-02-21"
  },
  {
    "id": "history-16w7vcm",
    "title": "Just Because!",
    "type": "anime",
    "category": "anime",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2022-10-05。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2022",
      "Bilibili",
      "动画"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV12G41177Nh/?spm_id_from=333.1369.0.0",
    "sourceNote": "2022.10.5~2022.10.6 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2022-10-05",
    "addedAt": "2022-10-05"
  },
  {
    "id": "history-o6ro7h",
    "title": "康熙王朝",
    "type": "series",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2022-09-06。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2022",
      "Bilibili",
      "动态/网盘"
    ],
    "sourceUrl": "https://www.bilibili.com/opus/728257987773202435?spm_id_from=333.1369.0.0",
    "sourceNote": "2022.9.6~2022.10.4 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2022-09-06",
    "addedAt": "2022-09-06"
  },
  {
    "id": "history-qick4r",
    "title": "90婚介所2022",
    "type": "series",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2022-05-23。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2022",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1CT411V79M/?spm_id_from=333.1369.0.0",
    "sourceNote": "2022.5.23~2022.8.22 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2022-05-23",
    "addedAt": "2022-05-23"
  },
  {
    "id": "history-1rsnn3r",
    "title": "彗星来的那一夜",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2022-05-13。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2022",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1WU4y1m7gK?t=29s&spm_id_from=333.1369.0.0",
    "sourceNote": "2022.5.13 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2022-05-13",
    "addedAt": "2022-05-13"
  },
  {
    "id": "history-17hvu6f",
    "title": "红楼梦",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2022-02-19。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2022",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1WZ4y1d7X2?spm_id_from=333.1369.0.0",
    "sourceNote": "2022.2.19 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2022-02-19",
    "addedAt": "2022-02-19"
  },
  {
    "id": "history-1nod4g0",
    "title": "剧场版 少女☆歌剧 Revue Starlight",
    "type": "anime",
    "category": "anime",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2022-01-22。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2022",
      "Bilibili",
      "动画"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1dL4y1s7jd?t=2h31m15s&spm_id_from=333.1369.0.0",
    "sourceNote": "2022.1.22 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2022-01-22",
    "addedAt": "2022-01-22"
  },
  {
    "id": "history-bdxux1",
    "title": "西游记续集",
    "type": "movie",
    "category": "topic",
    "description": "从电影.txt 导入的真实历史片源，首次归档于 2022-01-18。",
    "tags": [
      "历史放映",
      "电影.txt",
      "2022",
      "Bilibili"
    ],
    "sourceUrl": "https://www.bilibili.com/video/BV1JF411p7mL/?spm_id_from=333.1369.0.0",
    "sourceNote": "2022.1.18-2.12 归档；已记录播放入口。",
    "status": "watched",
    "priority": "normal",
    "timesWatched": 1,
    "lastWatchedAt": "2022-01-18",
    "addedAt": "2022-01-18"
  }
] as ScreeningSourceItem[];

export const generatedScreeningHistoryTags = [
  "真实历史",
  "电影.txt",
  "周末放映会",
  "历史放映",
  "2026",
  "Bilibili",
  "反面案例",
  "动画",
  "好评",
  "经典",
  "纪录片",
  "2025",
  "2024",
  "动态/网盘",
  "2023",
  "2022"
] as string[];

export const generatedScreeningClassicsTimeline = [
  {
    "id": "memory-screening-2026-05-24-001",
    "year": "2026-05-24",
    "title": "《变形金刚4：绝迹重生》",
    "description": "2026-05-24 已归档，《变形金刚4：绝迹重生》。",
    "image": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop",
    "tags": [
      "历史归档",
      "历史放映",
      "电影.txt",
      "2026"
    ]
  },
  {
    "id": "memory-screening-2026-05-18-002",
    "year": "2026-05-18",
    "title": "《迷家》",
    "description": "2026-05-18 已归档，《迷家》。",
    "image": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop",
    "tags": [
      "历史归档",
      "历史放映",
      "电影.txt",
      "2026"
    ]
  },
  {
    "id": "memory-screening-2026-05-17-003",
    "year": "2026-05-17",
    "title": "《夺命六头鲨》与《加勒比海盗3：世界的尽头》",
    "description": "2026-05-17 已归档，《夺命六头鲨》、《加勒比海盗3：世界的尽头》。",
    "image": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop",
    "tags": [
      "历史归档",
      "历史放映",
      "电影.txt",
      "2026"
    ]
  },
  {
    "id": "memory-screening-2026-05-10-004",
    "year": "2026-05-10",
    "title": "《夺命五头鲨》与《加勒比海盗2：亡灵的宝藏》",
    "description": "2026-05-10 已归档，《夺命五头鲨》、《加勒比海盗2：亡灵的宝藏》。",
    "image": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop",
    "tags": [
      "历史归档",
      "历史放映",
      "电影.txt",
      "2026"
    ]
  },
  {
    "id": "memory-screening-2026-04-20-005",
    "year": "2026-04-20",
    "title": "《有完没完》与《触不可及》",
    "description": "2026-04-20 已归档，《有完没完》、《触不可及》。",
    "image": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop",
    "tags": [
      "历史归档",
      "历史放映",
      "电影.txt",
      "2026"
    ]
  },
  {
    "id": "memory-screening-2026-04-12-006",
    "year": "2026-04-12",
    "title": "《隋朝来客》与《回到未来》",
    "description": "2026-04-12 已归档，《隋朝来客》、《回到未来》。",
    "image": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop",
    "tags": [
      "历史归档",
      "历史放映",
      "电影.txt",
      "2026"
    ]
  },
  {
    "id": "memory-screening-2026-03-29-007",
    "year": "2026-03-29",
    "title": "《蓦然回首》",
    "description": "2026-03-29 已归档，《蓦然回首》。",
    "image": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop",
    "tags": [
      "历史归档",
      "历史放映",
      "电影.txt",
      "2026"
    ]
  },
  {
    "id": "memory-screening-2026-03-15-008",
    "year": "2026-03-15",
    "title": "《危机航线》与《徒手攀岩》",
    "description": "2026-03-15 已归档，《危机航线》、《徒手攀岩》。",
    "image": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop",
    "tags": [
      "历史归档",
      "历史放映",
      "电影.txt",
      "2026"
    ]
  },
  {
    "id": "memory-screening-2026-03-08-009",
    "year": "2026-03-08",
    "title": "《美人鱼的夏天》与《加勒比海盗》",
    "description": "2026-03-08 已归档，《美人鱼的夏天》、《加勒比海盗》。",
    "image": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop",
    "tags": [
      "历史归档",
      "历史放映",
      "电影.txt",
      "2026"
    ]
  },
  {
    "id": "memory-screening-2026-03-01-010",
    "year": "2026-03-01",
    "title": "《八恶人》",
    "description": "2026-03-01 已归档，《八恶人》。",
    "image": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop",
    "tags": [
      "历史归档",
      "历史放映",
      "电影.txt",
      "2026"
    ]
  },
  {
    "id": "memory-screening-2026-02-01-011",
    "year": "2026-02-01",
    "title": "《超时空辉夜姬！》",
    "description": "2026-02-01 已归档，《超时空辉夜姬！》。",
    "image": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop",
    "tags": [
      "历史归档",
      "历史放映",
      "电影.txt",
      "2026"
    ]
  },
  {
    "id": "memory-screening-2026-01-25-012",
    "year": "2026-01-25",
    "title": "《孤岛惊魂》与《落水狗》",
    "description": "2026-01-25 已归档，《孤岛惊魂》、《落水狗》。",
    "image": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop",
    "tags": [
      "历史归档",
      "历史放映",
      "电影.txt",
      "2026"
    ]
  },
  {
    "id": "memory-screening-2026-01-11-013",
    "year": "2026-01-11",
    "title": "《人类清除计划》与《银翼杀手2049》",
    "description": "2026-01-11 已归档，《人类清除计划》、《银翼杀手2049》。",
    "image": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop",
    "tags": [
      "历史归档",
      "历史放映",
      "电影.txt",
      "2026"
    ]
  },
  {
    "id": "memory-screening-2026-01-04-014",
    "year": "2026-01-04",
    "title": "《剧场版 链锯人 蕾塞篇》",
    "description": "2026-01-04 已归档，《剧场版 链锯人 蕾塞篇》。",
    "image": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop",
    "tags": [
      "历史归档",
      "历史放映",
      "电影.txt",
      "2026"
    ]
  },
  {
    "id": "memory-screening-2025-12-14-015",
    "year": "2025-12-14",
    "title": "《鲨卷风5：全球鲨暴》与《鲨卷风6：最后的鲨卷风》",
    "description": "2025-12-14 已归档，《鲨卷风5：全球鲨暴》、《鲨卷风6：最后的鲨卷风》。",
    "image": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop",
    "tags": [
      "历史归档",
      "历史放映",
      "电影.txt",
      "2025"
    ]
  },
  {
    "id": "memory-screening-2025-12-12-016",
    "year": "2025-12-12",
    "title": "《彼方的阿斯特拉》",
    "description": "2025-12-12 已归档，《彼方的阿斯特拉》。",
    "image": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop",
    "tags": [
      "历史归档",
      "历史放映",
      "电影.txt",
      "2025"
    ]
  },
  {
    "id": "memory-screening-2025-12-07-017",
    "year": "2025-12-07",
    "title": "《神奇》与《绝杀慕尼黑》",
    "description": "2025-12-07 已归档，《神奇》、《绝杀慕尼黑》。",
    "image": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop",
    "tags": [
      "历史归档",
      "历史放映",
      "电影.txt",
      "2025"
    ]
  },
  {
    "id": "memory-screening-2025-11-30-018",
    "year": "2025-11-30",
    "title": "《敦刻尔克行动》与《1917》",
    "description": "2025-11-30 已归档，《敦刻尔克行动》、《1917》。",
    "image": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop",
    "tags": [
      "历史归档",
      "历史放映",
      "电影.txt",
      "2025"
    ]
  }
] as ClassicScreening[];

export const generatedScreeningFeaturedMovies = [
  {
    "id": "classic-history-zx2duh",
    "title": "触不可及",
    "reason": "2026.4.20 归档；已记录播放入口。",
    "date": "2026-04-20",
    "viewers": 0,
    "rating": 9.3
  },
  {
    "id": "classic-history-1a2wy16",
    "title": "回到未来",
    "reason": "2026.4.12 归档；已记录播放入口。",
    "date": "2026-04-12",
    "viewers": 0,
    "rating": 8.8
  },
  {
    "id": "classic-history-19naabp",
    "title": "徒手攀岩",
    "reason": "2026.3.15 归档；已记录播放入口。",
    "date": "2026-03-15",
    "viewers": 0,
    "rating": 8.8
  },
  {
    "id": "classic-history-1h1i4h3",
    "title": "加勒比海盗",
    "reason": "2026.3.8 归档；已记录播放入口。",
    "date": "2026-03-08",
    "viewers": 0,
    "rating": 8.8
  },
  {
    "id": "classic-history-n1qwyy",
    "title": "八恶人",
    "reason": "2026.3.1 归档；已记录播放入口。",
    "date": "2026-03-01",
    "viewers": 0,
    "rating": 8.7
  },
  {
    "id": "classic-history-s1qg3b",
    "title": "加勒比海盗2：亡灵的宝藏",
    "reason": "2026.5.10 归档；已记录播放入口。",
    "date": "2026-05-10",
    "viewers": 0,
    "rating": 8.5
  }
] as ClassicMovie[];

export const generatedScreeningAnimeHistoryMovies = [
  {
    "id": "anime-history-dcrgn4",
    "title": "迷家",
    "reason": "2026.5.18 归档；已记录播放入口。",
    "date": "2026-05-18",
    "viewers": 0,
    "rating": 4.1
  },
  {
    "id": "anime-history-2mgie5",
    "title": "蓦然回首",
    "reason": "2026.3.29 归档；已记录播放入口。",
    "date": "2026-03-29",
    "viewers": 0,
    "rating": 8.1
  },
  {
    "id": "anime-history-jl889y",
    "title": "超时空辉夜姬！",
    "reason": "2026.2.1 归档；已记录播放入口。",
    "date": "2026-02-01",
    "viewers": 0,
    "rating": 8.3
  },
  {
    "id": "anime-history-tm6o7m",
    "title": "剧场版 链锯人 蕾塞篇",
    "reason": "2026.1.4 归档；已记录播放入口。",
    "date": "2026-01-04",
    "viewers": 0
  },
  {
    "id": "anime-history-15g1eq",
    "title": "彼方的阿斯特拉",
    "reason": "2025.12.12、12.15 归档；已记录播放入口。",
    "date": "2025-12-12",
    "viewers": 0
  },
  {
    "id": "anime-history-8wf90y",
    "title": "夏洛特",
    "reason": "2025.9.5 归档；已记录播放入口。",
    "date": "2025-09-05",
    "viewers": 0
  },
  {
    "id": "anime-history-10s6qln",
    "title": "碧蓝之海",
    "reason": "2025.6.20 归档；已记录播放入口。",
    "date": "2025-06-20",
    "viewers": 0
  },
  {
    "id": "anime-history-1scaxbe",
    "title": "忍者杀手",
    "reason": "2025.5.23 归档；已记录播放入口。",
    "date": "2025-05-23",
    "viewers": 0
  },
  {
    "id": "anime-history-abg4ni",
    "title": "轻拍翻转小魔女",
    "reason": "2025.3.18~3.19 归档；已记录播放入口。",
    "date": "2025-03-18",
    "viewers": 0
  },
  {
    "id": "anime-history-1tv2bih",
    "title": "铳皇无尽的法夫纳",
    "reason": "2025.3.17 归档；已记录播放入口。",
    "date": "2025-03-17",
    "viewers": 0
  },
  {
    "id": "anime-history-1anwgz5",
    "title": "圣剑使的禁咒咏唱",
    "reason": "2025.3.11 归档；已记录播放入口。",
    "date": "2025-03-11",
    "viewers": 0
  },
  {
    "id": "anime-history-gul5m",
    "title": "绝对双刃",
    "reason": "2025.3.10 归档；已记录播放入口。",
    "date": "2025-03-10",
    "viewers": 0
  }
] as ClassicMovie[];

export const generatedScreeningHistoryStats = {
  "totalMovies": 151,
  "goodMovies": 41,
  "badMovies": 8,
  "totalScreenings": 99,
  "totalRecordUrls": 99,
  "topBadMovie": {
    "title": "夺命五头鲨",
    "rating": 3.3,
    "note": "2026.5.10 归档；已记录播放入口。",
    "votes": 0
  }
};
