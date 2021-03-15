"use strict";

/**
 * classes.js
 * 
 * クラス定義のためのファイル
 */


// =========================================================================

/**
 * Cellsクラス
 */
class Cell {

  /**
   * コンストラクタ。マス情報の初期化。
   * @param {int} bsize 盤面サイズ(9) 
   */
  constructor(bsize) {
    this.num = '0';        // 0で空白、1~9で数字、?でヒント
    this.ishint = false;   // ヒントフラグ
    this.klevel = 0;       // 仮定レベル
    this.kouho = [];       // 候補リスト
    this.kklevel = [];     // 候補の仮定レベルリスト
    for (let i = 0; i < bsize; i++) {
      this.kouho.push(false);
      this.kklevel.push(0);
    }
  }

  /**
   * セルの中身をクリアする
   * @param {string} mode クリアモード(question, answer, kouho)
   */
  clear(mode) {
    if (mode === 'question') {
      this.num = '0';
      this.ishint = false;
      this.klevel = 0;
      for (let i = 0; i < Sudokizer.board.bsize; i++) {
        this.kouho[i] = false;
        this.kklevel[i] = 0;
      }
    } else {
      if (!this.ishint) {
        // 仮定レベル0なら全消し、それ以外ならそのレベルのものだけ削除
        if (Sudokizer.config.kateilevel === 0 ||
            Sudokizer.config.kateilevel === this.klevel) {
          if (mode === 'answer') {
            this.num = '0';
            this.klevel = 0;
          }
        }
        // 候補数字消去
        for (let i = 0; i < Sudokizer.board.bsize; i++) {
          if (Sudokizer.config.kateilevel === 0) {
            this.kouho[i] = false;
            this.kklevel[i] = 0;
          } else if (Sudokizer.config.kateilevel === this.kklevel[i]) {
            this.kklevel[i] = 0;
          }
        }
      } else if (this.num === '?') {
        // 候補数字消去
        for (let i = 0; i < Sudokizer.board.bsize; i++) {
          if (Sudokizer.config.kateilevel === 0) {
            this.kouho[i] = false;
            this.kklevel[i] = 0;
          } else if (Sudokizer.config.kateilevel === this.kklevel[i]) {
            this.kklevel[i] = 0;
          }
        }
      }
    }
  }

  /**
   * セルの中身を自身にコピーする
   * @param {Cell} fromcell コピー元となるセル
   */
  copyInto(fromcell) {
    this.num = fromcell.num;
    this.ishint = fromcell.ishint;
    this.klevel = fromcell.klevel;
    for (let k = 0; k < Sudokizer.board.bsize; k++) {
      this.kouho[k] = fromcell.kouho[k];
      this.kklevel[k] = fromcell.kklevel[k];
    }
  }

}


// =====================================================================

/**
 * Boardクラス
 */
class Board {

  /**
   * コンストラクタ
   * @param {int} bsize 盤面サイズ(9)
   */
  constructor(bsize = 9) {
    this.puzzlename = 'sudoku';      // パズル名
    this.bsize = bsize;              // 盤面サイズ
    this.numcells = this.bsize ** 2; // セルサイズ
    this.author_ja = '';             // 作者情報
    this.author_en = '';             // 作者情報
    // 盤面の構成単位のマス配列
    this.board = this.createCells();
    this.blocks = this.createUnits('block');
    this.rows = this.createUnits('row');
    this.cols = this.createUnits('col');
    this.lines = Array.prototype.concat(this.rows, this.cols);
    this.units = Array.prototype.concat(this.blocks, this.rows, this.cols);
    this.peers = this.createPeers();
    this.crosses = this.createCrosses();
  }

  // ======================== セルグループのリスト生成　========================
  /**
   * セル x 81の生成
   * @return {array} セルインデックスの配列
   */
  createCells() {
    let cells = []
    for (let c = 0; c < this.numcells; c++) {
      cells.push(new Cell(this.bsize));
    }
    return cells;
  }

  /**
   * ユニット（9マス単位） x 27グループの生成
   * @param {string} unittype block, row, colのいずれか
   * @return {array} Unitオブジェクトの配列
   */
  createUnits(unittype) {
    let units = []
    for (let i = 0; i < this.bsize; i++) {
      units.push(new Unit(unittype, i, this.bsize));
    }
    return units;
  }

  /**
   * ピア（20マス単位） x 81グループの生成
   * @return {array} Peerオブジェクトの配列
   */
  createPeers() {
    let peers = []
    for (let c = 0; c < this.numcells; c++) {
      peers.push(new Peer(c, this.bsize));
    }
    return peers;
  }

  /**
   * クロス (3 + 6x2マス単位) x 54グループの生成
   * @return {array} Crossオブジェクトの配列
   */
  createCrosses() {
    let crosses = []
    let sqrtsize = Math.sqrt(this.bsize);
    // 行クロス
    for (let b = 0; b < this.bsize; b++) {
      for (let i = 0; i < sqrtsize; i++) {
        let ofsy = Math.floor(b / sqrtsize) * sqrtsize;
        crosses.push(new Cross('row', b, ofsy + i, this.bsize));
      }
    }
    // 列クロス
    for (let b = 0; b < this.bsize; b++) {
      for (let j = 0; j < sqrtsize; j++) {
        let ofsx = (b % sqrtsize) * sqrtsize;
        crosses.push(new Cross('col', b, ofsx + j, this.bsize));
      }
    }
    return crosses;
  }


  // ============================ AcomicActions ===============================

  /** 数字入力
   * @param {int} cpos マスの位置
   * @param {string} num 数字
   */
  numSetAtomic(cpos, num) {
    this.board[cpos].num = num;
  }

  /** 数字削除
   * @param {int} cpos マスの位置
   * @param {string} num 数字
   */
  numUnsetAtomic(cpos, num) {
    if (this.board[cpos].num === num) {
      this.board[cpos].num = '0';
    } else {
      throw 'numUnsetAtomic Validation Error!';
    }
  }

  /** 仮定レベルセット
   * @param {int} cpos マスの位置
   * @param {int} klevel 仮定レベル
   */
  klevelSetAtomic(cpos, klevel) {
    this.board[cpos].klevel = klevel;
  }

  /** 仮定レベル削除
   * @param {int} cpos マスの位置
   * @param {int} klevel 仮定レベル
   */
  klevelUnsetAtomic(cpos, klevel) {
    if (this.board[cpos].klevel === klevel) {
      this.board[cpos].klevel = 0;
    } else {
      throw 'klevelUnsetAtomic Validation Error!';
    }
  }

  /** 仮定レベルセット
   * @param {int} cpos マスの位置
   * @param {string} num 候補数字
   * @param {int} klevel 仮定レベル
   */
  kklevelSetAtomic(cpos, num, kklevel) {
    this.board[cpos].kklevel[num - 1] = kklevel;
  }

  /** 仮定レベル削除
   * @param {int} cpos マスの位置
   * @param {string} num 候補数字
   * @param {int} klevel 仮定レベル
   */
  kklevelUnsetAtomic(cpos, num, kklevel) {
    if (this.board[cpos].kklevel[num - 1] === kklevel) {
      this.board[cpos].kklevel[num - 1] = 0;
    } else {
      throw 'kklevelUnsetAtomic Validation Error!';
    }
  }

  /**
   * ヒントフラグ切り替え
   * @param {int} cpos マスの位置
   */
  ishintSwitchAtomic(cpos) {
    this.board[cpos].ishint = !this.board[cpos].ishint;
  }

  /** 候補フラグ切り替え
   * @param {int} cpos マスの位置
   * @param {string} num 数字
   */
  kouhoSwitchAtomic(cpos, num) {
    this.board[cpos].kouho[num-1] = !this.board[cpos].kouho[num-1];
  }


  // ==================== 基本アクション ======================

  /**
   * このセクションの各関数の最後で呼び出す共通処理
   * @param {Array} actionlist 一回分のアクションを構成するコマンドオブジェクトのリスト
   */
  basicAction(actionlist) {
    let action = new Action(actionlist);
    action.commit(this);
    Sudokizer.astack.push(action);
  }

  /**
   * マス解答入力
   * @param {int} cpos マスの位置
   * @param {string} num 候補数字
   * @param {int} klevel 仮定レベル
   */
  ansIns(cpos, num, klevel) {
    let actionlist = []
    if (!this.board[cpos].ishint) {
      // 状態リセット
      if (this.board[cpos].num !== '0') {
        actionlist.push({cmd:'numUnset', cpos:cpos, num: this.board[cpos].num});
        actionlist.push({cmd:'klevelUnset', cpos:cpos, klevel: this.board[cpos].klevel});
      } else {
        for (let k = 0; k < this.bsize; k++) {
          if (this.board[cpos].kouho[k]) {
            actionlist.push({cmd:'kouhoSwitch', cpos:cpos, num:k+1});
            actionlist.push({cmd:'kklevelUnset', 
              cpos:cpos, num:k+1, klevel:this.board[cpos].kklevel[k]});
          }
        }
      }   
      // 状態セット
      actionlist.push({cmd:'numSet', cpos:cpos, num:num});
      actionlist.push({cmd:'klevelSet', cpos:cpos, klevel:klevel});
      this.basicAction(actionlist);
    }
    
  }

  /**
   * マス解答消去
   * @param {int} cpos マスの位置
   */
  ansDel(cpos) {
    let actionlist = []
    if (!this.board[cpos].ishint || this.board[cpos].num === '?') {
      let num = this.board[cpos].num;
      let klevel = this.board[cpos].klevel;
      // 空白マス：候補除去
      if (num === '0' || num === '?') {
        for (let k = 0; k < this.bsize; k++) {
          if (this.board[cpos].kouho[k]) {
            if (Sudokizer.config.kateilevel === 0) {
              actionlist.push({cmd:'kouhoSwitch', cpos:cpos, num:k+1});
              actionlist.push({cmd:'kklevelUnset', 
                cpos:cpos, num:k+1, klevel:this.board[cpos].kklevel[k]});
            } else if (Sudokizer.config.kateilevel === this.board[cpos].kklevel[k]) {
              actionlist.push({cmd:'kklevelUnset', 
                cpos:cpos, num:k+1, klevel:this.board[cpos].kklevel[k]});
            }
          }
        }
      // 入力マス：仮定レベル条件を満たした場合のみ削除
      } else {
        if (Sudokizer.config.kateilevel === 0 ||
            Sudokizer.config.kateilevel === klevel) {
          actionlist.push({cmd:'numUnset', cpos:cpos, num:num});
          actionlist.push({cmd:'klevelUnset', cpos:cpos, klevel:klevel});
        }
      }
    }
    this.basicAction(actionlist);
  }

  /**
   * マスヒント入力
   * @param {int} cpos マスの位置
   * @param {string} num 候補数字
   */
  hintIns(cpos, num) {
    let actionlist = []
    if (!this.board[cpos].ishint) {
      // 空白マスに新規ヒント追加の場合：候補消去
      if (this.board[cpos].num === '0') {
        for (let k = 0; k < this.bsize; k++) {
          if (this.board[cpos].kouho[k]) {
            actionlist.push({cmd:'kouhoSwitch', cpos:cpos, num:k+1});
            actionlist.push({cmd:'kklevelUnset',
              cpos:cpos, num:k+1, klevel:this.board[cpos].kklevel[k]});
          }
        }
      // 既入力済み記号の塗り替え
      } else {
        actionlist.push({cmd: 'numUnset', cpos:cpos, num:this.board[cpos].num});
      }
      actionlist.push({cmd:'ishintSwitch', cpos:cpos});
    // ヒント塗り替えの場合：既入力済み記号s消去
    } else {
      actionlist.push({cmd:'numUnset', cpos:cpos, num:this.board[cpos].num});
    }
    actionlist.push({cmd: 'numSet', cpos:cpos, num:num});
    this.basicAction(actionlist);
  }

  /**
   * マスヒント消去
   * @param {int} cpos マスの位置
   */
  hintDel(cpos) {
    let actionlist = []
    let num = this.board[cpos].num;
    let klevel = this.board[cpos].klevel;
    // ヒントマスの場合(ヒント＋除外候補消去)
    if (this.board[cpos].ishint) {
      actionlist.push({cmd:'numUnset', cpos:cpos, num:num});
      actionlist.push({cmd:'ishintSwitch', cpos:cpos});
      if (this.board[cpos].num === '?') {
        for (let k = 0; k < this.bsize; k++) {
          if (this.board[cpos].kouho[k]) {
            actionlist.push({cmd:'kouhoSwitch', cpos:cpos, num:k+1});
            actionlist.push({cmd:'kklevelUnset',
              cpos:cpos, num:k+1, klevel:this.board[cpos].kklevel[k]});
          }
        }
      }
    } else {
      // 状態リセット
      if (this.board[cpos].num !== '0') {
        actionlist.push({cmd:'numUnset', cpos:cpos, num:num});
        actionlist.push({cmd:'klevelUnset', cpos:cpos, klevel:klevel});
      } else {
        for (let k = 0; k < this.bsize; k++) {
          if (this.board[cpos].kouho[k]) {
            actionlist.push({cmd:'kouhoSwitch', cpos:cpos, num:k+1});
            actionlist.push({cmd:'kklevelUnset',
              cpos:cpos, num:k+1, klevel:this.board[cpos].kklevel[k]});
          }
        }
      }  
    }
    this.basicAction(actionlist);
  }

  /**
   * 候補設定
   * @param {int} cpos マスの位置
   * @param {string} num 候補数字
   * @param {int} klevel 仮定レベル
   */
  kouhoSet(cpos, num, klevel) {
    let actionlist = []
    // 仮定レベル０：単なる候補のスイッチ
    if (klevel === 0) {
      actionlist.push({cmd:'kouhoSwitch', cpos:cpos, num:num});
    // 仮定レベル０以外：候補ありかつレベルが同じ場合のみ有効無効スイッチ
    } else {
      if (this.board[cpos].kouho[num - 1]) {
        if (this.board[cpos].kklevel[num - 1] === 0) {
          actionlist.push({cmd:'kklevelSet', cpos:cpos, num:num, klevel:klevel});
        } else if (this.board[cpos].kklevel[num - 1] === klevel) {
          actionlist.push({cmd:'kklevelUnset', cpos:cpos, num:num, klevel:klevel});
        }
      }
    }
    this.basicAction(actionlist);
  }


  // ================ 初期化系 =================

  /**
   * 盤面の初期化 
   * @return {Array} 新規盤面と新規アクション
   */
  clear() {
    let newboard = this.transCreate();
    for (let c = 0; c < this.numcells; c++) {
      newboard.board[c].clear('question');
    }
    let alist = this.diff(newboard);
    return [newboard, alist];
  }

  /**
   * 解答消去
   * @return {Array} 新規盤面と新規アクション
   */
  ansClear() {
    let newboard = this.transCreate();   // 差分をとるためコピー先で操作を実行
    for (let c = 0; c < this.numcells; c++) {
      newboard.board[c].clear('answer');
    }
    let alist = this.diff(newboard);     // 操作の差分を取得
    return [newboard, alist];
  }

  /**
   * 候補消去
   * @return {Array} 新規盤面と新規アクション
   */
  kouhoClear() {
    let newboard = this.transCreate();   // 差分をとるためコピー先で操作を実行
    for (let c = 0; c < this.numcells; c++) {
      newboard.board[c].clear('kouho');
    }
    let alist = this.diff(newboard);     // 操作の差分を取得
    return [newboard, alist];
  }


  // ============== 複合盤面操作 =============

  /**
   * 回転・反転のラッパー関数
   * @param {string} cmd 下記参照
   * @return {Array} 新規盤面と新規アクション
   */
  transform(cmd) {
    let newboard = this.transCreate(cmd);
    let alist = this.diff(newboard);
    return [newboard, alist];
  }

  /**
   * 回転・反転・コピーを行う関数
   * @param {string} cmd rotate90, rotate180, rotate270, inverseUD, inverseLR
   *                     未指定の場合は新規コピー
   * @return {Board} 変形後の新規盤面
   */
  transCreate(cmd) {
    let newboard = new Board();
    // 作者情報引継ぎ
    newboard.author_ja = this.board.author_ja;
    newboard.author_en = this.board.author_en;
    
    for (let c = 0; c < this.numcells; c++) {
      let i = Math.floor(c / this.bsize);
      let j = c % this.bsize;
      let c2 = 0;                // cの変形後の位置
      // 90度回転
      if (cmd === 'rotate90') {
        let i2 = j;
        let j2 = this.bsize - i - 1;
        c2 = i2 * this.bsize + j2;
      // 180度回転
      } else if (cmd === 'rotate180') {
        c2 = this.numcells - c - 1;
      // 270度回転
      } else if (cmd === 'rotate270') {
        let i2 = this.bsize - j - 1;
        let j2 = i;
        c2 = i2 * this.bsize + j2;
      // 上下反転
      } else if (cmd === 'inverseUD') {
        let i2 = this.bsize - i - 1;
        c2 = i2 * this.bsize + j;
      // 左右反転
      } else if (cmd === 'inverseLR') {
        let j2 = this.bsize - j - 1;
        c2 = i * this.bsize + j2;
      // それ以外の場合はコピー
      } else {
        c2 = c;
      }
      newboard.board[c2].copyInto(this.board[c]);
    }
    return newboard;
  }


  // ============================== 操作差分獲得 ==================================

  /**
   * 現在の盤面Aから新規盤面Bに至る差分を取得（B - Aに相当）
   * @param {Board} newboard 差分をとる元となる盤面 B側
   * @return {array} AからBに至るまでのコマンドのリスト
   */
  diff(newboard) {
    let actions = []
    for (let c = 0; c < this.numcells; c++) {
      let ca = this.board[c];
      let cb = newboard.board[c];
      // 入力数字
      if (ca.num !== cb.num) {
        if (ca.num !== '0') {
          actions.push({cmd: 'numUnset', cpos: c, num: ca.num});
        }
        if (cb.num !== '0') {
          actions.push({cmd: 'numSet', cpos: c, num: cb.num});
        }
      }
      // ヒントフラグ
      if (ca.ishint !== cb.ishint) {
        actions.push({cmd: 'ishintSwitch', cpos: c});
      }
      // 仮定レベル
      if (ca.klevel !== cb.klevel) {
        if (ca.klevel !== 0) {
          actions.push({cmd: 'klevelUnset', cpos: c, klevel: ca.klevel});
        }
        if (cb.klevel !== 0) {
          actions.push({cmd: 'klevelSet', cpos: c, klevel: cb.klevel});
        }
      }
      for (let k = 0; k < this.bsize; k++) {
        // 候補フラグ
        if (ca.kouho[k] !== cb.kouho[k]) {
          actions.push({cmd: 'kouhoSwitch', cpos: c, num: k+1});
        }
        // 候補仮定レベル
        if (ca.kklevel[k] !== cb.kklevel[k]) {
          if (ca.kklevel[k] !== 0) {
            actions.push({cmd: 'kklevelUnset', cpos: c, num: k+1, klevel: ca.kklevel[k]});
          }
          if (cb.kklevel[k] !== 0) {
            actions.push({cmd: 'kklevelSet', cpos: c, num: k+1, klevel: cb.kklevel[k]});
          }
        }
      }
    }
    if (Sudokizer.config.debugmode) {
      console.log('Diff: ', actions);
    }
    return actions;
  }


  // ================================ URL出力 ==================================

  /**
   * URL出力関数メインルーチン
   * @param {boolean} reedit 再編集用URLかどうか
   * @return {string} URLのクエリ文字列部分
   */
  urlWrite(reedit) {
    // URL前半部分を構築
    let prefix = reedit ? this.puzzlename + '_edit' : this.puzzlename;
    prefix += ('/' + this.bsize + '/' + this.bsize + '/');
    let urlpuz = '';  // パズル部分のURL
    let spcnt = 0;    // 空白の連続数
    // URLパズル部分の生成
    for (let ci = 0; ci < this.numcells; ci++) {
      let c = this.board[ci].num;
      // 空白
      if (c === '0' || !this.board[ci].ishint) {
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
   * @param {int} spcnt 連続するスペースの個数
   * @return {string} 空白部分を文字列換算したもの
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
   * @param {string} url URLのクエリ部分
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
   * @param {array} urlparts URLを/で区切った結果の配列
   */
  urlValidate(urlparts) {
    if (urlparts.length <= 3) {
      alert('URLクエリが不正です');
      return false;
    }
    if (urlparts[0] !== this.puzzlename && 
        urlparts[0] !== this.puzzlename + '_edit') {
      alert('URLのパズル名が不正です');
      return false;
    }
    if (urlparts[1] !== String(this.bsize) || urlparts[2] != String(this.bsize)) {
      alert('URLの盤面サイズが不正です');
      return false;
    }
    return true;
  }

  
  // ============================ pencilBox入出力 ================================

  /**
   * 通常のpencilbox形式でファイル読み込み
   * @param {Array} lines  読み込んだ文字列の行のリスト
   * @return {Object}
   *   newboard: 新規盤面
   *   actionlist: 盤面変更に伴うコマンドリスト
   *   authorinfo: 作者の日本語名と英語名
   */
  pbReadNormal(lines) {
    let newboard = new Board();
    try {
      // サイズバリデーション
      if (Number(lines[0]) !== newboard.bsize) {
        console.log(lines[0], newboard.bsize);
        throw 'BoardSizeError';
      }
      // ヒント読み込み
      for (let l = 1; l < 1 + newboard.bsize; l++) {
        let tokens = lines[l].split(' ');
        for (let j = 0; j < newboard.bsize; j++) {
          if (tokens[j] !== '.') {
            let c = (l - 1) * newboard.bsize + j;
            newboard.board[c].num = tokens[j];
          }
        }
      } 
      // 解答読み込み
      for (let l = 10; l < 10 + newboard.bsize; l++) {
        let tokens = lines[l].split(' ');
        for (let j = 0; j < newboard.bsize; j++) {
          let c = (l - 10) * newboard.bsize + j;
          if (tokens[j] === '.') {
            // ?ヒント
            if (newboard.board[c].num === '0') {
              newboard.board[c].num = '?';
            }
            newboard.board[c].ishint = true;
          } else {
            newboard.board[c].num = tokens[j];
          }
        }
      }
    } catch(err) {
      console.log(err);
      alert('盤面の読み込みに失敗しました');
    }
    
    return {
      'newboard': newboard,
      'actionlist': this.diff(newboard),
      'authorinfo': ['', '']
    };
  }

  /**
   * nikolicom形式でファイルを読み込み
   * @param {Array} lines  読み込んだ文字列の行のリスト
   * @return {Object}
   *   newboard: 新規盤面
   *   actionlist: 盤面変更に伴うコマンドリスト
   *   authorinfo: 作者の日本語名と英語名
   */
  pbReadNikolicom(lines) {
    let newboard = new Board();
    try {
      newboard.author_ja = lines[1].split(':')[1];
      newboard.author_en = lines[1].split(':')[2];
      // サイズバリデーション
      if (!(Number(lines[2][1]) === newboard.bsize && 
            Number(lines[2][3]) === newboard.bsize)) {
        console.log(lines[2][1], lines[2][3])
        throw 'BoardSizeError';
      }
      // ヒント盤面
      for (let l = 3; l < 3 + newboard.bsize; l++) {
        for (let j = 0; j < newboard.bsize; j++) {
          if (lines[l][j] !== '0') {
            let c = (l - 3) * newboard.bsize + j;
            newboard.board[c].ishint = true;
          }
        }
      }
      let lines2 = lines[12].split('\n');  // なんか後半だけ\n区切りだった
      // 解答盤面
      for (let l = 0; l < newboard.bsize; l++) {
        for (let j = 0; j < newboard.bsize; j++) {
          let c = l * newboard.bsize + j;
          newboard.board[c].num = lines2[l][j];
        }
      }
    } catch(err) {
      console.log(err);
      alert('盤面の読み込みに失敗しました');
    }
    return {
      'newboard': newboard,
      'actionlist': this.diff(newboard),
      'authorinfo': [newboard.author_ja, newboard.author_en]
    };
  }

  /**
   * 独自形式で盤面に読み込み
   * @param {Array} lines  読み込んだ文字列の行のリスト
   * @return {Object}
   *   newboard: 新規盤面
   *   actionlist: 盤面変更に伴うコマンドリスト
   *   authorinfo: 作者の日本語名と英語名
   */
  pbReadOriginal(lines) {
    let newboard = new Board();
    try {
      let rows = lines[0].split(' ');
      // サイズバリデーション
      if (rows.length - 1 !== newboard.bsize) {
        throw 'BoardSizeError';
      }
      for (let i = 0; i < newboard.bsize; i++) {
        if (rows[i].length !== newboard.bsize) {
          throw 'BoardSizeError';
        }
      }
      // ヒント盤面
      for (let i = 0; i < newboard.bsize; i++) {
        for (let j = 0; j < newboard.bsize; j++) {
          if (rows[i][j] !== '0') {
            let c = i * newboard.bsize + j;
            newboard.board[c].num = rows[i][j];
            newboard.board[c].ishint = true;
          }
        }
      }
    } catch(err) {
      console.log(err);
      alert('盤面の読み込みに失敗しました');
    }
    return {
      'newboard': newboard,
      'actionlist': this.diff(newboard),
      'authorinfo': [newboard.author_ja, newboard.author_en]
    };
  }

  /**
   * 通常のpencilbox形式での出力
   * @param {Array} authorinfo 著者情報（日本語名と英語名）
   * @return {string} 書き出す文字列
   */
  pbWriteNormal(authorinfo) {
    let ret = '';     // ここにファイル内容を文字列で書いていく
    let nl = '\n';    // 改行コード
    ret += this.bsize + nl;   // 1行目：サイズ情報
    // ヒント情報
    for (let i = 0; i < this.bsize; i++) {
      for (let j = 0; j < this.bsize; j++) {
        let c = i * this.bsize + j;
        if (this.board[c].ishint && this.board[c].num !== '?') {
          ret += this.board[c].num + ' ';  // ?以外のヒントマス
        } else {
          ret += '. ';                // 解答マス + ?マス
        }
      }
      ret += nl;
    }
    // 解答情報
    for (let i = 0; i < this.bsize; i++) {
      for (let j = 0; j < this.bsize; j++) {
        let c = i * this.bsize + j;
        if (this.board[c].ishint) {
          ret += '. ';
        } else {
          ret += this.board[c].num + ' ';
        }
      }
      ret += nl;
    }
    return ret;
  }

  /**
   * nikolicom形式での出力
   * @param {Array} authorinfo 著者情報（日本語名と英語名）
   * @return {string} 書き出す文字列
   */
  pbWriteNikolicom(authorinfo) {
    let ret = '';     // ここにファイル内容を文字列で書いていく
    let nl = '\r\n';    // 改行コード
    ret += '--' + nl;                                        // 1行目
    ret += ':' + authorinfo[0] + ':' + authorinfo[1] + nl;   // 2行目（作者情報）
    ret += ';' + this.bsize + '*' + this.bsize + nl;         // 3行目（サイズ情報）
    // ヒント情報
    for (let i = 0; i < this.bsize; i++) {
      for (let j = 0; j < this.bsize; j++) {
        let c = i * this.bsize + j;
        if (this.board[c].ishint) {
          ret += this.board[c].num;  // ヒントマス
        } else {
          ret += '0';                // 解答マス
        }
      }
      ret += nl;
    }
    nl = '\n';
    // 解答情報
    for (let i = 0; i < this.bsize; i++) {
      for (let j = 0; j < this.bsize; j++) {
        let c = i * this.bsize + j;
        ret += this.board[c].num;
      }
      ret += nl;
    }
    ret += '--' + nl;
    return ret;
  }

  /**
   * nikolicom形式で出力する際の事前バリデーション
   * @return {boolean} ちゃんと基準を満たして出力OKかどうか
   */
  validateNikolicom() {
    // 1. ?ヒントがないか
    for (let c = 0; c < this.numcells; c++) {
      if (this.board[c].num === '?') {
        return {ok:false, msg:'?ヒントが残っています'};
      }
    }
    // 2. ヒントが対象配置かどうか
    for (let c = 0; c < this.numcells; c++) {
      if (this.board[c].ishint && !this.board[this.numcells - c - 1].ishint) {
        return {ok:false, msg:'ヒントが対象配置ではありません'};
      }
    }
    // 3. 解答がすべて埋まっているか
    if (!Sudokizer.engine.ansCheck(this)) {
      return {ok:false, msg:'解答が間違っています'};
    }
    // 4. 一意解が存在するか
    let retobj = Sudokizer.engine.allStepSolve(this);
    if (retobj[2] !== 1) {
      return {ok:false,msg:'複数解が存在します'};
    }
    return {ok:true, msg:'OK'};
  }
}


// ============================== canvas描画 ====================================

/**
 * Drawerクラス
 * 
 * もともとBoardクラスの中で定義していたが新たに別のクラスとして分離
 */
class Drawer {
  /**
   * コンストラクタ
   * デフォルトの描画オプションの設定
   */
  constructor() {
    this.default_drawoption = {
      'cursor': true,
      'dispsize': Sudokizer.config.dispsize,
      'offset'  : Sudokizer.config.drawpadding,
      'cellerror': true,
      'highlight': 0,
    }
  }

  /**
   * デフォルト設定で足りない設定を補う
   * @param {Object} drawoption drawoptionを一部設定したもの
   * @return {Object} drawoptionの完全体
   */
  setDrawOption(drawoption) {
    let ret_drawoption = {}
    for (let key in this.default_drawoption) {
      if (drawoption && drawoption[key]) {
        ret_drawoption[key] = drawoption[key];
      } else {
        ret_drawoption[key] = this.default_drawoption[key];
      }
    }
    return ret_drawoption;
  }

  /**
   * 盤面再描画/フロント同期用呼び出しルーチン
   * @param {Board} board: 書き出す盤面
   * @param {Object} drawoption: 描画用オプション
   *   - boolean cursor: カーソルを表示するか
   *   - int dispsize:   マスの表示サイズ
   *   - Array errorcells: 誤りセルのリスト
   */
  redraw(board, drawoption) {
    // デフォルト設定を補ってくる
    drawoption = this.setDrawOption(drawoption);
    // canvasフォーカス時のみカーソルを表示
    if (document.activeElement.getAttribute('id') === 'main_board') {
      drawoption.cursor = true;
    }
    // canvas描画本体 + 同期処理
    this.drawBoardCanvas(board, drawoption);
    Sudokizer.astack.sync_undoredo();   // 戻る、進むボタンのdisabled状態制御
    Sudokizer.solvelog.flush();         // 解答ログの反映
  }

  /**
   * canvasへの描画
   * @param {Object} cfg: 描画用追加設定
   */
  drawBoardCanvas(board, cfg) {
    let canvas = document.querySelector('#main_board');
    let ctx = canvas.getContext('2d');
    // 描画プロセス
    this.drawBack(ctx, board, cfg)        // 背景描画
    this.drawCells(ctx, board, cfg);      // セル描画
    this.drawBorders(ctx, board, cfg);    // 境界描画
    this.drawTexts(ctx, board, cfg);      // テキスト類描画
    if (cfg.cursor) {
      this.drawCursor(ctx, board, cfg);   // カーソル描画
    }
  }

  /**
   * canvasの背景描画
   * @param {Object} ctx 
   * @param {Board} board 
   * @param {Drawoption} cfg 
   */
  drawBack(ctx, board, cfg) {
    let ofs = cfg.offset;
    let csize = cfg.dispsize;
    let wholesize = ofs * 2 + csize * board.bsize;
    // キャンバスのサイズ変更
    $('#main_board').attr('width', wholesize);
    $('#main_board').attr('height', wholesize);
    // 背景色
    ctx.fillStyle = Sudokizer.config.colorset.bg;
    ctx.fillRect(0, 0, wholesize, wholesize); 
  }

  /**
   * canvasへのセルの描画
   * @param {Object} ctx: 描画コンテキスト
   * @param {Board} board: 描画対象の盤面
   * @param {Drawoption} cfg: 描画オプション
   */
  drawCells(ctx, board, cfg) {
    let ofs = cfg.offset;
    let csize = cfg.dispsize;
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < board.bsize; i++) {
      for (let j = 0; j < board.bsize; j++) {
        let c = i * board.bsize + j;
        // エラーマス
        if (!Sudokizer.engine.duplicateCheck(board, c)) {
          ctx.fillStyle = Sudokizer.config.colorset.er;
        // 正常マス   
        } else {
          ctx.fillStyle = Sudokizer.config.colorset.bg;
          // マスハイライト
          if (cfg.highlight !== 0 && String(cfg.highlight) === board.board[c].num) {
            ctx.fillStyle = Sudokizer.config.colorset.hl;
          }
        }
        let ofsx = ofs + csize * j;
        let ofsy = ofs + csize * i;
        ctx.strokeRect(ofsx, ofsy, csize, csize);
        ctx.fillRect(ofsx, ofsy, csize, csize);
        // 候補ハイライト
        if (cfg.highlight !== 0) {
          this.drawSubcellHighlight(ctx, board, cfg, c, ofsx, ofsy);
        }
      }
    }
  }

  /**
   * 候補数字のハイライト
   * @param {object} ctx : 描画コンテキスト
   * @param {Board} board: 盤面
   * @param {Drawoption} cfg: 描画設定
   * @param {int} cid    : マス番号
   * @param {int} ofsx   : 横方向マスオフセット
   * @param {int} ofsy   : 縦方向マスオフセット
   */
  drawSubcellHighlight(ctx, board, cfg, cid, ofsx, ofsy) {
    let csize = cfg.dispsize;     
    let csqrt = Math.sqrt(board.bsize);
    let subcsize = csize / csqrt;
    ctx.fillStyle = Sudokizer.config.colorset.hl;
    for (let ki = 0; ki < csqrt; ki++) {
      for (let kj = 0; kj < csqrt; kj++) {
        let k = ki * csqrt + kj;
        if (k === cfg.highlight - 1 && board.board[cid].kouho[cfg.highlight - 1]) {
          let posx = ofsx + subcsize * kj;
          let posy = ofsy + subcsize * ki;
          ctx.fillRect(posx, posy, subcsize, subcsize);
        }
      }
    }
  }

  /**
   * canvasへの境界線の描画
   * @param {Object} ctx: 描画コンテキスト
   * @param {Board} board: 描画対象の盤面
   * @param {Drawoption} cfg: 描画オプション
   */
  drawBorders(ctx, board, cfg) {
    let ofs = cfg.offset;
    let csize = cfg.dispsize;
    ctx.lineWidth = 3;
    let csqrt = Math.sqrt(board.bsize);
    for (let i = 0; i < csqrt; i++) {
      for (let j = 0; j < csqrt; j++) {
        ctx.strokeRect(ofs + csize * j * csqrt, ofs + csize * i * csqrt,
                       csize * csqrt, csize * csqrt);
      }
    }
  }

  /**
   * canvasへの描画：ヒント数字と候補数字の部分
   * @param {Object} ctx: 描画コンテキスト
   * @param {Board} board: 描画対象の盤面
   * @param {Drawoption} cfg: 描画オプション
   */
  drawTexts(ctx, board, cfg) {
    let ofs = cfg.offset;
    let csize = cfg.dispsize;
    ctx.lineWidth = 1;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < board.bsize; i++) {
      for (let j = 0; j < board.bsize; j++) {
        let cid = i * board.bsize + j;
        let ofsx = ofs + j * csize;
        let ofsy = ofs + i * csize;
        let fontsize = csize / 1.2;
        // ヒントマス
        if (board.board[cid].ishint) {
          // ヒント数字
          if (board.board[cid].num !== '0') {
            ctx.fillStyle = Sudokizer.config.colorset.ht;
            ctx.font = fontsize + 'px ' + Sudokizer.config.dispfont;
            ctx.fillText(board.board[cid].num, ofsx + csize / 2, ofsy + csize / 2);
          }
          // 除外候補数字 (?ヒントマスのみ)
          if (board.board[cid].num === '?') {
            this.drawKouho(ctx, board, cfg, cid, ofsx, ofsy);
          }
        // 通常マス
        } else {
          // 入力数字（非ヒントの入力済みマス）
          if (board.board[cid].num !== '0') {
            ctx.fillStyle = Sudokizer.config.colorset['l' + board.board[cid].klevel];
            ctx.font = fontsize + 'px ' + Sudokizer.config.dispfont;
            ctx.fillText(board.board[cid].num, ofsx + csize / 2, ofsy + csize / 2);
          // 候補数字（非ヒントの空白マス）
          } else {
            this.drawKouho(ctx, board, cfg, cid, ofsx, ofsy);
          }
        }
      }
    }
    ctx.fillStyle = "black";
  }

  /**
   * canvasへの候補数字の描画
   * @param {object} ctx : 描画コンテキスト
   * @param {Board} board: 盤面
   * @param {Drawoption} cfg: 描画設定
   * @param {int} cid    : マス番号
   * @param {int} ofsx   : 横方向マスオフセット
   * @param {int} ofsy   : 縦方向マスオフセット
   */
  drawKouho(ctx, board, cfg, cid, ofsx, ofsy) {
    let csize = cfg.dispsize;
    let fontsize = csize / 3.5;         
    let csqrt = Math.sqrt(board.bsize);  // 3

    ctx.font = fontsize + 'px sans-serif';
    // 通常候補
    if (!board.board[cid].ishint || board.board[cid].num === '?') {
      for (let ki = 0; ki < csqrt; ki++) {
        for (let kj = 0; kj < csqrt; kj++) {
          let k = ki * csqrt + kj;
          if (board.board[cid].kouho[k]) {
            ctx.fillStyle = Sudokizer.config.colorset['l0'];
            let posx = ofsx + (csize / csqrt) * (kj + 0.5);    // フォントx座標
            let posy = ofsy + (csize / csqrt) * (ki + 0.5);   // フォントy座標
            ctx.fillText(k + 1, posx, posy);
            // 候補レベルに応じて斜線を引く
            if (board.board[cid].kklevel[k] > 0) {
              ctx.fillStyle = Sudokizer.config.colorset['l' + board.board[cid].kklevel[k]];
              ctx.fillText('＼', posx, posy);
            }
          }
        }
      }
    }
    /*
    // 除外候補を表示する
    } else {
      ctx.fillStyle = Sudokizer.config.colorset.ex;
      for (let ki = 0; ki < csqrt; ki++) {
        for (let kj = 0; kj < csqrt; kj++) {
          let k = ki * csqrt + kj;
          if (board.board[cid].exkouho[k]) {
            let posx = ofsx + (csize / csqrt) * (kj + 0.5);    // フォントx座標
            let posy = ofsy + (csize / csqrt) * (ki + 0.5);   // フォントy座標
            ctx.fillText(k + 1, posx, posy);
            ctx.fillText('＼', posx, posy);
          }
        }
      }
    }
    */
  }

  /**
   * canvasへのカーソルの描画
   * @param {Object} ctx: 描画コンテキスト
   * @param {Board} board: 描画対象の盤面
   * @param {Drawoption} cfg: 描画オプション
   */
  drawCursor(ctx, board, cfg) {
    let ofs = cfg.offset;
    let csize = cfg.dispsize;
    let cpos = Sudokizer.config.cursorpos;
    let cx = cpos % board.bsize;
    let cy = Math.floor(cpos / board.bsize);

    ctx.lineWidth = 2;
    if (Sudokizer.config.qamode === 'question') {   // 問題モード
      ctx.strokeStyle = Sudokizer.config.colorset.ex;
    } else {                                        // 解答モード
      ctx.strokeStyle = Sudokizer.config.colorset['l' + Sudokizer.config.kateilevel];
    }
    if (Sudokizer.config.kouhomode) {  // 候補モード：点線
      ctx.setLineDash([5, 3]);
    }
    ctx.strokeRect(ofs + cx * csize + 1, ofs + cy * csize + 1, csize - 3, csize - 3);
    // 各種描画プロパティを元に戻す
    ctx.setLineDash([]); 
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
  }

  /**
   * コンソールへの出力（デバッグ用）
   * 直接コンソールからたたいて呼び出すこと
   */
  drawBoardConsole(board) {
    let line = '';
    let horizon = ' +-------+-------+-------+';
    for (let i = 0; i < board.numcells; i++) {
      if (i % 27 === 0) {
        console.log(horizon);
      }
      if (i % 3 === 0) {
        line += ' |';
      }
      line += ' ' + board.board[i].num;
      if (i % 9 === 8) {
        line += ' |'
        console.log(line);
        line = '';
      }
    }
    console.log(horizon);
  }
}


// =================================================================

/**
 * ActionStackクラス
 * 
 * Undo, Redoに関する操作のスタック
 */
class ActionStack {

  /**
   * コンストラクタ
   */
  constructor() {
    this.stack = [
      new Action([{cmd:'default'}])
    ];
    this.sp = 0;      // スタックポインタ
    this.spmax = 0;   // 現在の最新位置
  }

  /**
   * アクションをプッシュ
   * @param {Action} newaction コマンドのリスト
   */
  push(newaction) {
    if (newaction.oplist.length !== 0) {
      this.sp++;
      this.spmax = this.sp;  // 現在以降のアクションを無効化
      if (this.spmax > this.stack.length) {
        this.stack.push(newaction)
      } else {
        this.stack[this.sp] = newaction;
      }
      if (Sudokizer.config.debugmode) {
        console.log(this.stack, this.sp, this.spmax);
      }
    }
  }

  /**
   * 操作を一つ元に戻す
   */
  undo() {
    if (this.sp > 0) {
      this.stack[this.sp].revert(Sudokizer.board);
      this.sp--;
    }
    if (Sudokizer.config.debugmode) {
      console.log(this.stack, this.sp, this.spmax);
    }
  }

  /**
   * 操作を一つ進める
   */
  redo() {
    if (this.sp < this.spmax) {
      this.sp++;
      this.stack[this.sp].commit(Sudokizer.board);
    }
    if (Sudokizer.config.debugmode) {
      console.log(this.stack, this.sp, this.spmax);
    }
  }

  /**
   * スタックを空にする
   */
  clear() {
    this.sp = 0;
    this.spmax = 0;
  }

  /**
   * Undo, Redoボタンの状態同期
   */
   sync_undoredo() {
    // Undo: スタックが空 (sp = 0) のとき
    if (this.sp === 0) {
      $('#opform_undo').prop('disabled', true);
    } else {
      $('#opform_undo').prop('disabled', false);
    }
    // Redo: スタックが最新 (sp = spmax) のとき
    if (this.sp === this.spmax) {
      $('#opform_redo').prop('disabled', true);
    } else {
      $('#opform_redo').prop('disabled', false);
    }
  }
}

/**
 * Actionクラス
 * 
 * 原始コマンドのリストを管理
 */
class Action {

  /**
   * コンストラクタ
   * @param {Array} oplist コマンドオブジェクトの配列
   * 
   * コマンドオブジェクトの構成
   *   op.cmd   : コマンド名
   *   op.cpos  : マス番号
   *   op.num   : 対象数字および記号
   *   op.klevel: 仮定レベル
   */
  constructor(oplist) {
    this.oplist = oplist;
  }

  /**
   * アクションリストをグローバル盤面に適用する
   * @param {Board} board コマンドを適用する盤面
   */
  commit(board) {
    for (let op of this.oplist) {
      if (op.cmd === 'numSet') {
        board.numSetAtomic(op.cpos, op.num);
      } else if (op.cmd === 'numUnset') {
        board.numUnsetAtomic(op.cpos, op.num);
      } else if (op.cmd === 'klevelSet') {
        board.klevelSetAtomic(op.cpos, op.klevel);
      } else if (op.cmd === 'klevelUnset') {
        board.klevelUnsetAtomic(op.cpos, op.klevel);
      } else if (op.cmd === 'kklevelSet') {
        board.kklevelSetAtomic(op.cpos, op.num, op.klevel);
      } else if (op.cmd === 'kklevelUnset') {
        board.kklevelUnsetAtomic(op.cpos, op.num, op.klevel);
      } else if (op.cmd === 'ishintSwitch') {
        board.ishintSwitchAtomic(op.cpos);
      } else if (op.cmd === 'kouhoSwitch') {
        board.kouhoSwitchAtomic(op.cpos, op.num);
      } else {
        throw 'Commit Error: ' + op.cmd;
      }
    }
  }

  /**
   * アクションリストを逆適用する。
   * @param {Board} board コマンドを適用する盤面
   */
  revert(board) {
    let revlist = this.oplist.slice().reverse();   // 非破壊リバース
    for (let op of revlist) {
      if (op.cmd === 'numSet') {
        board.numUnsetAtomic(op.cpos, op.num);
      } else if (op.cmd === 'numUnset') {
        board.numSetAtomic(op.cpos, op.num);
      } else if (op.cmd === 'klevelSet') {
        board.klevelUnsetAtomic(op.cpos, op.klevel);
      } else if (op.cmd === 'klevelUnset') {
        board.klevelSetAtomic(op.cpos, op.klevel);
      } else if (op.cmd === 'kklevelSet') {
        board.kklevelUnsetAtomic(op.cpos, op.num, op.klevel);
      } else if (op.cmd === 'kklevelUnset') {
        board.kklevelSetAtomic(op.cpos, op.num, op.klevel);
      } else if (op.cmd === 'ishintSwitch') {
        board.ishintSwitchAtomic(op.cpos);
      } else if (op.cmd === 'kouhoSwitch') {
        board.kouhoSwitchAtomic(op.cpos, op.num);
      } else {
        throw 'Revert Error';
      }
    }
  }
}


// =====================================================================

/**
 * SolveLogクラス
 * 
 * 解答履歴ログをとっておくためのクラス
 */
class SolveLog {
  constructor() {
    this.logstack = [];
  }

  /**
   * ログをプッシュ
   * @param {string} msg ログに表示するメッセージ
   */
  push(msg) {
    let msgid = ('000' + this.logstack.length).slice(-3)
    this.logstack.push(msgid + ': ' + msg);
  }

  /**
   * ログを消去する
   */
  clear() {
    this.logstack = [];
  }

  /**
   * 手筋ログフォームに反映させる
   */
  flush() {
    let formval = '';
    for (let line of this.logstack) {
      formval += (line + '\n');
    }
    let formobj = document.querySelector('#solvelog_form');
    formobj.value = formval;
    formobj.scrollTop = formobj.scrollHeight;
    $('#difficulty').text(this.difficultyAnalyze());
  }

  /**
   * 手筋ログから難易度を推定
   * @return {String} 難易度の文字列
   */
  difficultyAnalyze() {
    let difficulty = '???';
    let max_strid = -1;
    for (let line of this.logstack) {
      let mainline = line.substring(5);
      // 特殊なケースの処理
      if (mainline === 'Give Up...') {
        max_strid = -1;
        difficulty = 'ニコリ基準外';
        break;
      } else if (mainline === 'No Answer!') {
        max_strid = -1;
        difficulty = '???';
        break;
      } else if (mainline === 'Congratulations!') {
        break;
      }
      // 通常ケースの処理
      let strid = Number(mainline.substr(0, 2));
      max_strid = (max_strid < strid) ? strid : max_strid;
    }
    if (max_strid > 0) {
      if (max_strid <= 2) {
        difficulty = 'らくらく';
      } else if (max_strid <= 5) {
        difficulty = 'おてごろ';
      } else if (max_strid <= 15) {
        difficulty = 'たいへん';
      } else {
        difficulty = 'アゼン　';
      }
    }
    return difficulty;
    
  }
  
}