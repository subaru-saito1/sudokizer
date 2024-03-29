
# sudokizer: 数独アナライザー

---

## URL

https://subaru-saito1.github.io/sudokizer


## 概要

ニコリのパズル「数独」の解析ツールです。<br>
自動解答、一意解チェック、難易度推定などができます。<br>

ニコリスト向けのツールを想定しているので、XY-Wing以上の手筋はすべて「背理法」として邪険に処理します。<br>
そのかわりunique系手筋は結構細かく分類しています<br>

### 機能

- ぱずぷれ代わりに数独で遊んだり作ったり
- 数字のハイライト機能（X-wingさがしに便利）
- 自動解答と解の個数の報告
- １ステップずつ解いてその手筋のログをとる機能
- 手筋のログから難易度を自動推定する機能

### 操作方法

https://subaru-saito1.github.io/sudokizer/howtouse.html


---

## インストール

これをベースとして追加機能を開発したい場合の話です。<br>
`git clone https://github.com/subaru-saito1/sudokizer.git` でレポジトリをクローンします。<br>
特に依存しているライブラリはないため、そのままローカルで動かせると思います。<br>


---

## バージョン情報

- v1.0：一通りの機能も揃ったしバグも自分が見つけた分はとったのでリリース。

開発：Subaru Saito (Twitter: @Subaru_Saito) <br>
      <yuma.s8102@gmail.com>


