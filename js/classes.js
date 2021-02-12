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
   */
  urlWrite() {
    // ?以降の部分を生成
    prefix = board['puzname'] + '/' + board['cols'] + '/' + board['rows'] + '/';
    // boardの中身から読み取っていく処理
    // ヒント数字は1,2,3,4,5,6,7,8,9
    // ?ヒントは"." 
    // 空白はg=1, h=2, i=3, ..., z=20 単位
    // 解答と候補は無視
    alert('URL Write');
  }

  
  /**
   * URL入力関数メインルーチン
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
      // 超えていたら脱出
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
        if (ci + cs >= this.numcells) {  // オーバーする場合は不正、脱出
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
        alert('パズルのフォーマットが不正です');
        break;
      }
    }
  }

  /**
   * URL検証関数
   */
  urlValidate(urlparts) {
    if (urlparts.length <= 3) {
      alert('不正なURLクエリです');
      return false;
    }
    if (urlparts[0] !== this.puzzlename) {
      alert('不正なパズル名です');
      return false;
    }
    if (urlparts[1] !== String(this.bsize) || urlparts[2] != String(this.bsize)) {
      alert('不正なサイズ指定です');
      return false;
    }
    return true;
  }

}


