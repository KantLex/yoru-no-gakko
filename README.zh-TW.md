![夜の学校 · Yoru no Gakkō](docs/images/title.jpg)

# 夜の学校 · Yoru no Gakkō

[English](README.md) · [简体中文](README.zh-CN.md) · **繁體中文** · [日本語](README.ja.md)

**一款以凌晨兩點的日本高中為舞台的復古固定視角生存恐怖遊戲。**<br>七大不可思議。一個被遺忘的名字。免費、開源，打開瀏覽器就能玩。

### ▶ [立即遊玩](https://kantlex.github.io/yoru-no-gakko/)

追蹤 [X 上的 @aisongman](https://x.com/aisongman) 取得最新消息。

https://github.com/user-attachments/assets/328f2bfb-8d6e-4ca4-8f84-791624bd6b13

| | |
|---|---|
| ![二樓走廊](docs/images/corridor.jpg) | ![提燈妖怪](docs/images/lantern.jpg) |
| ![廁所裡的花子](docs/images/hanako.jpg) | ![籠中鳥](docs/images/kagome.jpg) |
| ![大首女的追逐](docs/images/okubi.jpg) | ![餓者髑髏](docs/images/gashadokuro.jpg) |

## 故事

> 放課後、剣道部の練習のあと、教室で眠ってしまった。
> *放學後，劍道社練習結束，我在教室裡睡著了。*
>
> 目が覚めると、午前二時だった。
> *醒來時，已經是凌晨兩點。*

每所日本學校都有自己的「七大不可思議」：第三間廁所隔間裡的少女、沒有臉的老師、用手肘在走廊上爬行的東西。青嵐高中的七大不可思議比任何人記得的都還要古老，而它們被寫下來，是有原因的。

活到天亮，查明是誰寫下了這七大不可思議，以及為什麼一個名字如此重要。這裡就不再劇透了。

## 遊戲內容

- 致敬初代《鬼屋魔影》（Alone in the Dark）的**固定視角與坦克式操作**，以 480×300 解析度渲染，搭配平面著色、抖色、底片顆粒與暗角。
- 橫跨三層校舍、體育館和頂樓的**十六個房間**：教室、音樂教室、保健室、理化實驗室、圖書室與書庫。
- 以**日本妖怪與校園怪談**取代殭屍：提燈妖怪、廁所裡的花子、無臉鬼（野篦坊）、轆轤首、Teke Teke（テケテケ）、狐狗狸（碟仙）、餓者髑髏，還有一場與大首女的走廊追逐戰——光是她的頭就幾乎塞滿整條走廊。
- **兩幕四章**，紙條、日記與舊班級照片會一點一點改寫你以為的故事。
- 用竹刀、淨鹽和符咒反擊；靠飯糰、彈珠汽水和繃帶撐下去。
- 遊戲文字為**日英雙語**（日文在上、英文在下），另有 WebAudio 程序化音效、瀏覽器自動存檔，以及手機與平板上的觸控操作。

## 操作

| 動作 | 鍵盤 | 觸控 |
|---|---|---|
| 移動 / 轉向（坦克式操作） | 方向鍵或 WASD | 方向鍵盤 |
| 奔跑 | Shift | 走（切換） |
| 調查 / 互動 | E 或 Enter | 調 |
| 用裝備的道具攻擊 | Space | 撃 |
| 道具欄 | I 或 Tab | 持 |
| 切換道具 | Q | 替 |
| 地圖 | M | |
| 暫停 | Esc 或 P | |

## 本機執行

遊戲只是一個 HTML 頁面，不需要建置工具，也不需要安裝任何相依套件。Three.js 從 jsDelivr 載入，字型來自 Google Fonts。

```sh
./build.sh                  # 將 src/ 合併為 index.html
python3 -m http.server 8000 # 然後開啟 http://localhost:8000
```

原始碼以編號分段的形式放在 `src/`，`build.sh` 會依序把它們合併進同一個 `<script type="module">`：

| 檔案 | 內容 |
|---|---|
| `00-head.html` | 頁面結構、CSS 與 UI 疊層 |
| `01-core.js` | 渲染器、低解析度渲染目標與後製著色器、輸入、固定鏡頭 |
| `02-audio.js` | WebAudio 程序化音效與環境音 |
| `03-textures*.js` | 以 Canvas 繪製的材質 |
| `04-models*.js` | 女主角與所有妖怪，以基本幾何體組成 |
| `05a-builder.js` | 房間建構器：牆壁、窗戶、門、碰撞 |
| `05b`–`05e-rooms*.js` | 十六個房間 |
| `06a-state-ui.js` | 遊戲狀態、道具、道具欄、存檔 |
| `06b-actors.js` | 敵人行為 |
| `06c-flow.js` | 標題、開場、房間切換、遊戲結束、結局 |
| `06d-act2.js` | 第二幕、追逐段落與章節標題卡 |

## 致謝與授權

- 程式碼：[MIT](LICENSE) © 2026 KantLex
- [three.js](https://threejs.org)（MIT），從 jsDelivr 載入
- 字型來自 Google Fonts，採用 SIL Open Font License：Yuji Syuku、DotGothic16、Klee One
- 所有聲音皆在瀏覽器中程序化合成
- 妖怪與「七大不可思議」源自日本民間傳說與校園怪談。角色、故事與學校皆為虛構。
