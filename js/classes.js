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
    this.num = 0;          // 空白
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
    this.numcells = Sudokizer.bsize ** 2;
    this.board = [];
    for (let i = 0; i < this.numcells; i++) {
      this.board.push(new Cell());
    }
  }
}


