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
    this.num = '0';          // 空白
    this.ishint = false;   // ヒントフラグ
    this.qhint = false;    // ?ヒントフラグ
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

  
}


