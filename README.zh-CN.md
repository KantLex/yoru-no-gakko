![夜の学校 · Yoru no Gakkō](docs/images/title.jpg)

# 夜の学校 · Yoru no Gakkō

[English](README.md) · **简体中文** · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md)

**一款以凌晨两点的日本高中为舞台的复古固定视角生存恐怖游戏。**<br>七大不可思议。一个被遗忘的名字。免费、开源，打开浏览器即可游玩。

### ▶ [立即游玩](https://kantlex.github.io/yoru-no-gakko/)

关注 [X 上的 @aisongman](https://x.com/aisongman) 获取最新动态。

https://github.com/user-attachments/assets/328f2bfb-8d6e-4ca4-8f84-791624bd6b13

| | |
|---|---|
| ![二楼走廊](docs/images/corridor.jpg) | ![提灯妖怪](docs/images/lantern.jpg) |
| ![厕所里的花子](docs/images/hanako.jpg) | ![笼中鸟](docs/images/kagome.jpg) |
| ![大首女的追逐](docs/images/okubi.jpg) | ![饿者髑髅](docs/images/gashadokuro.jpg) |

## 故事

> 放課後、剣道部の練習のあと、教室で眠ってしまった。
> *放学后，剑道社练习结束，我在教室里睡着了。*
>
> 目が覚めると、午前二時だった。
> *醒来时，已是凌晨两点。*

每所日本学校都有自己的“七大不可思议”：第三间厕所隔间里的少女、没有脸的老师、用手肘在走廊上爬行的东西。青岚高中的七大不可思议比任何人记得的都要古老，而它们被写下来，是有原因的。

活到天亮，查明是谁写下了这七大不可思议，以及为什么一个名字如此重要。这里就不再剧透了。

## 游戏内容

- 致敬初代《鬼屋魔影》（Alone in the Dark）的**固定视角与坦克式操作**，以 480×300 分辨率渲染，搭配平面着色、抖动、胶片颗粒与暗角。
- 横跨三层教学楼、体育馆和天台的**十六个房间**：教室、音乐室、保健室、理科实验室、图书室及书库。
- 以**日本妖怪与校园怪谈**取代丧尸：提灯妖怪、厕所里的花子、无脸怪（野篦坊）、辘轳首、Teke Teke（テケテケ）、狐狗狸（碟仙）、饿者髑髅，还有一场与大首女的走廊追逐战——光是她的头就几乎塞满了整条走廊。
- **两幕四章**，纸条、日记和旧班级照片会一点点改写你以为的故事。
- 用竹刀、净盐和符咒反击；靠饭团、波子汽水和绷带撑下去。
- 游戏文本为**日英双语**（日文在上、英文在下），另有 WebAudio 程序化音效、浏览器自动存档，以及手机和平板上的触屏操作。

## 操作

| 动作 | 键盘 | 触屏 |
|---|---|---|
| 移动 / 转向（坦克式操作） | 方向键或 WASD | 方向键盘 |
| 奔跑 | Shift | 走（切换） |
| 调查 / 互动 | E 或 Enter | 調 |
| 用装备的物品攻击 | Space | 撃 |
| 物品栏 | I 或 Tab | 持 |
| 切换物品 | Q | 替 |
| 地图 | M | |
| 暂停 | Esc 或 P | |

## 本地运行

游戏只是一个 HTML 页面，无需构建工具，也无需安装任何依赖。Three.js 从 jsDelivr 加载，字体来自 Google Fonts。

```sh
./build.sh                  # 将 src/ 合并为 index.html
python3 -m http.server 8000 # 然后打开 http://localhost:8000
```

源代码以编号分段的形式放在 `src/` 中，`build.sh` 会按顺序把它们合并进同一个 `<script type="module">`：

| 文件 | 内容 |
|---|---|
| `00-head.html` | 页面结构、CSS 和 UI 覆盖层 |
| `01-core.js` | 渲染器、低分辨率渲染目标与后处理着色器、输入、固定镜头 |
| `02-audio.js` | WebAudio 程序化音效与环境音 |
| `03-textures*.js` | 用 Canvas 绘制的纹理 |
| `04-models*.js` | 女主角和所有妖怪，由基础几何体搭建 |
| `05a-builder.js` | 房间构建器：墙壁、窗户、门、碰撞 |
| `05b`–`05e-rooms*.js` | 十六个房间 |
| `06a-state-ui.js` | 游戏状态、物品、物品栏、存档 |
| `06b-actors.js` | 敌人行为 |
| `06c-flow.js` | 标题、开场、房间切换、游戏结束、结局 |
| `06d-act2.js` | 第二幕、追逐段落与章节标题卡 |

## 致谢与许可

- 代码：[MIT](LICENSE) © 2026 KantLex
- [three.js](https://threejs.org)（MIT），从 jsDelivr 加载
- 字体来自 Google Fonts，采用 SIL Open Font License：Yuji Syuku、DotGothic16、Klee One
- 所有声音均在浏览器中程序化合成
- 妖怪与“七大不可思议”源自日本民间传说与校园怪谈。角色、故事和学校均为虚构。
