"use strict";

/**
 * classes.js
 * 
 * クラス定義のためのファイル
 * 本当はinit.jsにまとめたいけどホイスティングが効かないとなるとねえ
 */


/**
 * Cellsクラス
 */
class Cell {
  constructor() {
    this.num = '0';        // 空白
    this.ishint = false;   // ヒントフラグ
    this.qhint = false;    // ?ヒントフラグ
    this.klevel = 0;       // 仮定レベル
    this.kouho = [];       // 候補リスト
    this.exkouho = [];     // 除外候補リスト
    for (let i = 0; i < Sudokizer.bsize; i++) {
      this.kouho.push(false);
      this.exkouho.push(false);
    }
  }
}

/**
 * Boardクラス
 */
class Board {
  constructor() {
    this.puzzlename = 'sudoku';
    this.bsize = Sudokizer.bsize;
    this.numcells = Sudokizer.bsize ** 2;
    this.board = [];
    for (let i = 0; i < this.numcells; i++) {
      this.board.push(new Cell());
    }
  }


  /**
   * URL出力関数メインルーチン
   * 
   * @return string URLのクエリ部分
   */
  urlWrite() {
    let prefix = this.puzzlename + '/' + this.bsize + '/' + this.bsize + '/';
    let urlpuz = '';  // パズル部分のURL
    let spcnt = 0;    // 空白の連続数
    // URLパズル部分の生成
    for (let ci = 0; ci < this.numcells; ci++) {
      let c = this.board[ci].num;
      // 空白
      if (c === '0') {
        spcnt++;
      } else {
        // 空白の連続分を出力
        urlpuz += this.urlWriteSpace(spcnt);
        spcnt = 0;
        // ヒント数字
        if (c >= '1' && c <= '9') {
          urlpuz += c;
        // ?ヒント
        } else if (c === '?') {
          urlpuz += '.';
        } else {
          alert('内部URL出力エラー');
          console.log(this.board);
        }
      }
    }
    urlpuz += this.urlWriteSpace(spcnt);
    
    return prefix + urlpuz;
  }

  /**
   * 連続スペースに相当するパズルURL形式の文字列を出力
   * 
   * @param int spcnt 連続するスペースの個数
   * @return string 空白部分の文字列
   */
  urlWriteSpace(spcnt) {
    let urlpuz = '';
    while (spcnt > 0) {
      let tmp_spcnt = spcnt;
      if (tmp_spcnt > 20) {
        tmp_spcnt = 20;
      }
      urlpuz += String.fromCharCode(102 + tmp_spcnt);   // 102 = 'f'のこと
      spcnt -= tmp_spcnt;
    }
    return urlpuz;
  }

  /**
   * URL入力関数メインルーチン
   * 
   * @param url string: URLのクエリ部分
   * this.board に変更あり
   */
  urlRead(url) {
    let urlparts = url.split('/');
    // 基本バリデーションがNGなら何もしない
    if (!this.urlValidate(urlparts)) {
      return;
    }

    // パズル部分のパース。this.boardを直接変更
    let urlpuz = urlparts[3];
    let ci = 0;      // 今何番目のマスにいるか
    for (let c of urlpuz) {
      // マスの範囲を超えていたら脱出
      if (ci >= this.numcells) {
        break;
      }
      // 数字判定： <todo: 3x3以外の場合は未対応>
      if (c >= '1' && c <= '9') {
        this.board[ci].num = c;
        this.board[ci].ishint = true;
        ci++;
      // 連続空白
      } else if (c >= 'g' && c <= 'z') {
        let cs = c.charCodeAt(0) - 'g'.charCodeAt(0) + 1;
        // オーバーする場合はそのまま脱出
        if (ci + cs >= this.numcells) {  
          break;
        }
        for (; cs > 0; cs--) {
          this.board[ci].num = '0';
          ci++;
        }
      // ?ヒント
      } else if (c === '.') {
        this.board[ci].num = '?';
        this.board[ci].ishint = true;
        this.board[ci].qhint = true;
        ci++;
      // それ以外の不正な記号
      } else {
        alert('URLのパズルフォーマットが不正です');
        break;
      }
    }
  }

  /**
   * URL検証関数
   * 
   * @param urlparts array: URLを/で区切った結果の配列
   */
  urlValidate(urlparts) {
    if (urlparts.length <= 3) {
      alert('URLクエリが不正です');
      return false;
    }
    if (urlparts[0] !== this.puzzlename) {
      alert('URLのパズル名が不正です');
      return false;
    }
    if (urlparts[1] !== String(this.bsize) || urlparts[2] != String(this.bsize)) {
      alert('URLの盤面サイズが不正です');
      return false;
    }
    return true;
  }
  

  /**
   * canvasへの描画
   */
  drawBoardCanvas() {
    let canvas = document.querySelector('#main_board');
    let ctx = canvas.getContext('2d');
    let ofs = Sudokizer.config.drawpadding;
    let csize = Sudokizer.config.dispsize;
    let allsize = ofs * 2 + csize * this.bsize;  // 全体のサイズ

    // 背景描画
    ctx.fillStyle = Sudokizer.config.colorset.bg;
    ctx.fillRect(0, 0, allsize, allsize);
    ctx.strokeStyle = "black";
    // セルの描画
    for (let i = 0; i < this.bsize; i++) {
      for (let j = 0; j < this.bsize; j++) {
        ctx.strokeRect(ofs + csize * j, ofs + csize * i, csize, csize);
      }
    }
    // 境界線描画
    ctx.lineWidth = 3;
    let csqrt = Math.sqrt(this.bsize);
    for (let i = 0; i < csqrt; i++) {
      for (let j = 0; j < csqrt; j++) {
        ctx.strokeRect(ofs + csize * j * csqrt, ofs + csize * i * csqrt,
                       csize * csqrt, csize * csqrt);
      }
    }
    ctx.lineWidth = 1;
    // テキスト描画
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    this.drawBoardCanvasTexts(ctx, ofs, csize);
    // カーソル描画
    this.drawBoardCanvasCursor(ctx, ofs, csize);
  }

  /**
   * canvasへの描画：ヒント数字と候補数字の部分
   * @param object ctx  : 描画コンテキスト
   * @param int ofs  : 盤面描画オフセット
   * @param int csize: セルの大きさ
   */
  drawBoardCanvasTexts(ctx, ofs, csize) {
    for (let i = 0; i < this.bsize; i++) {
      for (let j = 0; j < this.bsize; j++) {
        let cid = i * this.bsize + j;
        let ofsx = ofs + j * csize;
        let ofsy = ofs + i * csize;
        let fontsize = csize / 1.2;
        // ヒントマス
        if (this.board[cid].ishint) {
          // ヒント数字
          ctx.fillStyle = Sudokizer.config.colorset.ht;
          if (this.board[cid].num !== '0') {
            ctx.font = fontsize + 'px ' + Sudokizer.config.dispfont;
            ctx.fillText(this.board[cid].num, ofsx + csize / 2, ofsy + csize / 2);
          }
          // 除外候補数字 (?ヒントマスのみ)
          ctx.fillStyle = Sudokizer.config.colorset.ex;
          if (this.board[cid].num === '?') {
            this.drawBoardCanvasKouho(ctx, this.board[cid].kouho, ofsx, ofsy, csize, true)
          }
        // 通常マス
        } else {
          ctx.fillStyle = Sudokizer.config.colorset['l' + this.board[cid].klevel];
          // 入力数字（非ヒントの入力済みマス）
          if (this.board[cid].num !== '0') {
            ctx.font = fontsize + 'px ' + Sudokizer.config.dispfont;
            ctx.fillText(this.board[cid].num, ofsx + csize / 2, ofsy + csize / 2);
          // 候補数字（非ヒントの空白マス）
          } else {
            this.drawBoardCanvasKouho(ctx, this.board[cid].kouho, ofsx, ofsy, csize, false)
          }
        }
      }
    }
    ctx.fillStyle = "black";
  }

  /**
   * canvasへの候補数字の描画
   * @param object ctx : 描画コンテキスト
   * @param array kouho: 候補のブール配列
   * @param int ofsx   : 横方向マスオフセット
   * @param int ofsy   : 縦方向マスオフセット
   * @param int csize  : セルサイズ
   * @param bool exflg : 除外候補かどうかのフラグ
   */
  drawBoardCanvasKouho(ctx, kouho, ofsx, ofsy, csize, exflg) {
    let fontsize = csize / 3.5;         
    let csqrt = Math.sqrt(this.bsize);  // 3

    ctx.font = fontsize + 'px sans-serif';;
    for (let ki = 0; ki < csqrt; ki++) {
      for (let kj = 0; kj < csqrt; kj++) {
        let k = ki * csqrt + kj;
        // k番目の候補がONだった場合、候補を所定位置に表示
        if (kouho[k]) {
          let posx = ofsx + (csize / csqrt) * (kj + 0.5);    // フォントx座標
          let posy = ofsy + (csize / csqrt) * (ki + 0.5);   // フォントy座標
          ctx.fillText(k + 1, posx, posy);
          // 除外候補の場合は斜線を引く
          if (exflg) {
            ctx.fillText('＼', posx, posy);
          }
        }
      }
    }
  }

  /**
   * canvasへのカーソルの描画
   * @param object ctx : 描画コンテキスト
   * @param int ofs    : 盤面のオフセット
   * @param int csize  : マスのサイズ
   */
  drawBoardCanvasCursor(ctx, ofs, csize) {
    let cpos = Sudokizer.config.cursorpos;
    let cx = cpos % this.bsize;
    let cy = Math.floor(cpos / this.bsize);

    ctx.lineWidth = 2;
    if (Sudokizer.config.qamode === 'question') {   // 問題モード
      ctx.strokeStyle = Sudokizer.config.colorset.ex;
    } else {                                        // 解答モード
      ctx.strokeStyle = Sudokizer.config.colorset['l' + Sudokizer.config.kateilevel];
    }
    if (Sudokizer.config.kouhomode) {  // 候補モード：点線
      ctx.setLineDash([5, 3]);
    }
    ctx.strokeRect(ofs + cx * csize + 2, ofs + cy * csize + 2, csize - 4, csize - 4);
    // 各種描画プロパティを元に戻す
    ctx.setLineDash([]); 
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
  }


  /**
   * SVGへの描画
   */
  drawBoardSVG() {
    alert('draw Board SVG');
  }

  /**
   * コンソールへの出力（デバッグ用）
   */
  drawBoardConsole() {
    let line = '';
    let horizon = ' +-------+-------+-------+';
    for (let i = 0; i < this.numcells; i++) {
      if (i % 27 === 0) {
        console.log(horizon);
      }
      if (i % 3 === 0) {
        line += ' |';
      }
      line += ' ' + this.board[i].num;
      if (i % 9 === 8) {
        line += ' |'
        console.log(line);
        line = '';
      }
    }
    console.log(horizon);
  }

}


