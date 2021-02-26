"use strict";

/**
 * ユニット：9マスの論理ペアのクラス
 */
class Unit {
  /**
   * コンストラクタ
   * @param string unittype: 'row', 'col', 'block'
   * @param int id: 左上から右側、下側に数えた時の番号。0-origin
   * @param int unitsize: ユニットの構成マス数(9)
   */
  constructor(unittype, id, unitsize=9) {
    this.unittype = unittype;
    this.id = id;
    this.unitsize = unitsize;
    this.cellidx = this.createCellIndex();
  }
  /**
   * ユニットに含まれるマスの番号を配列で返す
   */
  createCellIndex() {
    let cellidx = []
    // 横行ユニット
    if (this.unittype === 'row') {
      for (let j = 0; j < this.unitsize; j++) {
        cellidx.push(this.id * this.unitsize + j);
      }
    // 楯列ユニット
    } else if (this.unittype === 'col') {
      for (let i = 0; i < this.unitsize; i++) {
        cellidx.push(i * this.unitsize + this.id);
      }
    // ブロックユニット
    } else if (this.unittype === 'block') {
      let sqrtsize = Math.sqrt(this.unitsize); // 3
      for (let i = 0; i < sqrtsize; i++) {
        for (let j = 0; j < sqrtsize; j++) {
          let ofsx = (this.id % sqrtsize) * sqrtsize;
          let ofsy = Math.floor(this.id / sqrtsize) * sqrtsize * this.unitsize;
          cellidx.push(ofsx + ofsy + i * this.unitsize + j);
        }
      }
    } else {
      throw 'Unit.createCellIndex: Invalid Unittype';
    }
    return cellidx;
  }
}


/**
 * ピア：特定のセルと結びつく20マスのペア
 */
class Peer {
  /**
   * コンストラクタ
   * @param int cid; 中心となるセル番号
   * @param int bsize: 盤面サイズ (9)
   */
  constructor(cid, bsize) {
    this.cid = cid;
    this.bsize = bsize;
    this.cellidx = this.createCellIndex();
  }

  /**
   * ピアに含まれるセルのインデックスリストを作成
   */
  createCellIndex() {
    let rowid = Math.floor(this.cid / this.bsize);
    let colid = this.cid % this.bsize;
    let sqrtsize = Math.sqrt(this.bsize);
    let cellidx = []
    // 同じ行
    for (let j = 0; j < this.bsize; j++) {
      cellidx.push(rowid * this.bsize + j);
    }
    // 同じ列
    for (let i = 0; i < this.bsize; i++) {
      cellidx.push(i * this.bsize + colid);
    }
    // 同じブロック
    for (let i = 0; i < sqrtsize; i++) {
      for (let j = 0; j < sqrtsize; j++) {
        let ofsx = Math.floor(colid / sqrtsize) * sqrtsize;
        let ofsy = Math.floor(rowid / sqrtsize) * sqrtsize * this.bsize;
        cellidx.push(ofsx + ofsy + i * this.bsize + j);
      }
    }
    // 重複排除と自身のマス排除
    cellidx = cellidx.filter((x, i, arr) => (arr.indexOf(x) === i && x !== this.cid));
    return cellidx;
  }
}

/**
 * 列とブロックの交差部分3マスの集合
 */
class Cross {
  /**
   * コンストラクタ
   * @param string linetype: 'row' or 'col'
   * @param int blockid: ブロックの番号
   * @param int lineid: 行/列の番号
   * @param bsize 盤面サイズ(9)
   */
  constructor(linetype, blockid, lineid, bsize) {
    this.linetype = linetype;
    this.blockid = blockid;
    this.lineid = lineid;
    this.bsize = bsize;
    this.cellidx = this.createCellIndex();
    this.blockidx = this.createBlockIndex();
    this.lineidx = this.createLineIndex();
  }
  /**
   * クロスに含まれる3マスの座標を取得
   */
  createCellIndex() {
    let sqrtsize = Math.sqrt(this.bsize);
    let cellidx = []
    if (this.linetype === 'row') {
      // 行とブロックが重なるかどうか判定
      if (Math.floor(this.blockid / sqrtsize) === Math.floor(this.lineid / sqrtsize)) {
        for (let j = 0; j < sqrtsize; j++) {
          let ofsx = (this.blockid % sqrtsize) * sqrtsize;
          cellidx.push(this.lineid * this.bsize + ofsx + j)
        }
      } else {
        throw 'Cross.createCellIndex: Non-overlap block and lines';
      }
    } else if (this.linetype === 'col') {
      // 列とブロックが重なるかどうか判定
      if ((this.blockid % sqrtsize) === Math.floor(this.lineid / sqrtsize)) {
        for (let i = 0; i < sqrtsize; i++) {
          let ofsy = Math.floor(this.blockid / sqrtsize) * sqrtsize * this.bsize;
          cellidx.push(ofsy + i * this.bsize + this.lineid);
        }
      } else {
        throw 'Cross.createCellIndex: Non-overlap block and lines';
      }
    } else {
      throw 'Cross.createCellIndex: Invalid linetype';
    }
    return cellidx;
  }
  /**
   * クロスに含まれない同じブロックの座標リスト
   */
  createBlockIndex() {
    let sqrtsize = Math.sqrt(this.bsize);   // 3
    let cellidx = []
    for (let i = 0; i < sqrtsize; i++) {
      if (this.linetype === 'row' && this.lineid % sqrtsize === i) {
        continue;
      }
      for (let j = 0; j < sqrtsize; j++) {
        if (this.linetype === 'col' && this.lineid % sqrtsize === j) {
          continue;
        }
        let ofsx = (this.blockid % sqrtsize) * sqrtsize;
        let ofsy = Math.floor(this.blockid / sqrtsize) * sqrtsize * this.bsize;
        cellidx.push(ofsx + ofsy + i * this.bsize + j);
      }
    }
    return cellidx;
  }
  /**
   * クロスに含まれない同じラインの座標リスト
   */
  createLineIndex() {
    let sqrtsize = Math.sqrt(this.bsize);   // 3
    let cellidx = []
    if (this.linetype === 'row') {
      for (let j = 0; j < this.bsize; j++) {
        if (Math.floor(j / sqrtsize) !== (this.blockid % sqrtsize)) {
          cellidx.push(this.lineid * this.bsize + j);
        }
      }
    } else {            // col
      for (let i = 0; i < this.bsize; i++) {
        if (Math.floor(i / sqrtsize) !== Math.floor(this.blockid / sqrtsize)) {
          cellidx.push(i * this.bsize + this.lineid);
        }
      }
    }
    return cellidx;
  }
}


// =================================================================================

/** 
 * 数独エンジンクラス
 */
class SdkEngine {
  /**
   * コンストラクタ：解答エンジンに関する設定とストラテジーリストの設定
   */
  constructor() {
    // 解答エンジンに関する諸設定
    this.config = {
      multians_thres: 2,  // 別解発生時に探索を打ち切る解の個数
    }
    // 適用するストラテジー関数のリスト
    this.strategylist = [
      this.hiddenSingleStrategy,
      this.nakedSingleStrategy,
    ];
  }

  // ============================== フロントラッパー ==============================
  /**
   * 解答チェック機能（簡易実装版）
   * @param Board board: チェック対象の盤面オブジェクト
   * @return bool : 完成しているかどうか
   */
  ansCheck(board) {
    for (let u in board.units) {
      if (!this.validCheck(board, u)) {
        return false;
      }
    }
    return true;
  }

  /**
   * 自動候補埋め機能。
   */
  autoIdentifyKouhoWrapper(board) {
    let newboard = board.transCreate();
    this.autoIdentifyKouho(newboard);
    // アクション追加
    let actionlist = board.diff(newboard);
    return [newboard, actionlist];
  }

  /**
   * 一ステップ解答
   */
  oneStepSolve(board) {
    let newboard = board.transCreate();
    // 候補のない空白マスがあったら自動候補埋めから再開
    if (!this.noKouhoCheck(board).ok) {
      this.autoIdentifyKouho(newboard);
    } 
    let retobj = this.strategySelector(newboard);
    let actionlist = board.diff(newboard);
    return [newboard, actionlist];
  }

  /**
   * 全解答
   */
  allStepSolve(board) {
    let newboard = board.transCreate();
    this.autoIdentifyKouho(newboard)
    // 本体部分は再帰関数で回す
    let anscnt = this.allStepSolveRecursive(newboard);
    let actionlist = board.diff(newboard);
    return [newboard, actionlist, anscnt];
  }

  /**
   * 全解答再帰アルゴリズム
   * @param Board board コピー後の盤面
   * @return int 解の個数
   */
  allStepSolveRecursive(board) {
    let anscnt = 0;
    while (true) {
      let retobj = this.strategySelector(board);
      console.log(board.board, retobj);
      // OKだった場合：解答チェックしてOKなら脱出
      if (retobj.ok) {
        if (retobj.status === 'done') {
          return 1;
        }
      // NGだった場合：破綻なら即死、お手上げなら背理法
      } else {
        if (retobj.status === 'noanswer') {
          return 0;
        } else if (retobj.status === 'giveup') {
          // 最小候補数を持つ最も若いマスを検査
          let mincpos = this.decideMinKouhoCell(board);
          // そのマスを対象にループ開始
          for (let k = 0; k < board.bsize; k++) {
            if (board.board[mincpos].kouho[k]) {
              let newboard = board.transCreate();
              console.log(mincpos, k);
              this.answerInsert(newboard, mincpos, String(k+1));
              this.peerRemoveKouho(newboard, mincpos);
              anscnt += this.allStepSolveRecursive(newboard);
            }
            // 複数解が出すぎたら脱出
            if (anscnt >= this.config.multians_thres) {
              break;
            }
          }
          return anscnt;
        }
      }
    }
  }


  // ============================== ストラテジーセレクタ　===============================

  /**
   * ストラテジーセレクタ
   * - ストラテジーを選択して一ステップだけ解く。候補の同期や破綻判定もやる。
   * @param Board board: 解く盤面 
   * @return Object ret: 色々な情報を返す
   *   - bool ok    : 正常に進めばtrue, 失敗（破綻とお手上げ）ならfalse
   *   - bool status: 'newcell', 'newkouho', 'noanswer', 'giveup'
   *   - bool cellinfo: 影響があったマス/破綻したマス のリスト
   */
  strategySelector(board) {
    for (let i in this.strategylist) {
      // ストラテジー呼び出し
      // メモ：callじゃないと呼び出し先のthisがSdkEngineじゃなく配列で渡されてしまう
      let ret = this.strategylist[i].call(this, board);
      if (ret.ok) {
        // 新たに数字が入った場合、候補情報を同期して返す
        if (ret.status === 'newcell') {
          this.peerRemoveKouho(board, ret.cellinfo[0]);
        }
        // 破綻していないかチェック
        if (!this.noKouhoCheck(board).ok) {
          return {ok: false, status: 'noanswer'};
        }
        // 正常成功
        addSolveLog(ret.msg);
        return ret;
      }
    }
    // 既に完成している
    if (this.ansCheck(board)) {
      addSolveLog('Conglaturations!')
      return {ok:true, status:'done'};
    } else {
      addSolveLog('Give Up...')
      return {ok:false, status:'giveup'};
    }
  }


  // ============================= ユーティリティ ==============================
  /**
   * 破綻していないか（候補が0個の空白マスがないか）チェック
   * @return ok: 破綻していなければtrue
   * @return cell: 破綻していた場合、そのセル番号
   */
  noKouhoCheck(board) {
    for (let c = 0; c < board.numcells; c++) {
      if (board.board[c].num === '0') {
        // 候補が全部falseだった場合
        if (!board.board[c].kouho.reduce((acc, cur) => (acc || cur), false)) {
          return {ok: false, cell: c};
        }
      } 
    }
    // 候補が全部trueだった場合
    return {ok: true};
  }

  /**
   * ユニットに正しく１～９まで入っているか調べる
   * @param Board board: チェック対象の盤面
   * @param int unitid: ユニット番号
   */
  validCheck(board, unitid) {
    let flgfield = 0x00000000;
    for (let c of board.units[unitid].cellidx) {
      // 空白 or ?ヒントがあったら即死
      let num = board.board[c].num;
      if (num === '0' || num === '?') {
        return false;
      }
      // 数字が入っていたら対応するビット部分を1に変更
      flgfield |= (0x00000001 << Number(num) - 1);
    }
    // チェック
    for (let i = 0; i < board.bsize; i++) {
      if ((flgfield & 0x00000001 << i) === 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * 自動候補埋め機能（本体）
   */
  autoIdentifyKouho(board) {
    for (let c = 0; c < board.numcells; c++) {
      if (board.board[c].num === '0') {
        // 空白マスの候補状態を初期化
        for (let k = 0; k < board.bsize; k++) {
          board.board[c].kouho[k] = true;
          board.board[c].kklevel[k] = 0;
        }
        // ピアを見て候補を削っていく
        for (let c2 of board.peers[c].cellidx) {
          let c2num = board.board[c2].num;
          if (c2num !== '0' && c2num !== '?') {
            board.board[c].kouho[c2num - 1] = false;
          }
        }
      }
    }
  }

  /**
   * 指定ピアの各マスから中心マスの数字に相当する候補を削除
   */
  peerRemoveKouho(board, cid) {
    let centernum = board.board[cid].num;
    if (centernum !== '0') {
      for (let c of board.peers[cid].cellidx) {
        if (board.board[c].num === '0') {
          board.board[c].kouho[centernum-1] = false;
        }
      }
    }
  }

  /**
   * ユニットIDと数字を指定して、そのユニットに唯一入れられる場所があるか探す
   * 非破壊検査
   * @param Board board: 盤面全体
   * @param int unitid: 検査対象ユニット
   * @param int num: 検査対象数字 1-origin
   * @return bool ok: OKかどうか
   * @return int cid: OKの場合、埋めるべきマスを返す
   */
  hiddenSingleCheck(board, unitid, num) {
    let cnt = 0;
    let lastcid;
    for (let cid of board.units[unitid].cellidx) {
      // 既に入っている
      if (board.board[cid].num === String(num)) {
        return {ok:false};
      }
      // 候補が見つかった場合
      if (board.board[cid].kouho[num-1]) {
        cnt++;
        lastcid = cid;
      }
    }
    if (cnt === 1) {
      return {ok:true, cid:lastcid};
    } else {
      return {ok:false};
    }
  }

  /**
   * Board.ansInsのアクションを追加しないバージョン。候補入り空白マスへの入力
   * @param Board board: 変更する盤面オブジェクト
   * @param int cnum: 変更マス
   * @param string num: 入れる値
   */
  answerInsert(board, cpos, num) {
    // 前提条件
    if (!board.board[cpos].ishint && board.board[cpos].num === '0') {
      // 内容：マス入力、仮定レベルリセット、候補リセット、候補仮定レベルリセット
      board.board[cpos].num = num;
      board.board[cpos].klevel = 0;
      for (let k = 0; k < board.bsize; k++) {
        board.board[cpos].kouho[k] = false;
        board.board[cpos].kklevel[k] = 0;
      }
    }
  }

  /**
   * 最も候補数字の個数の少ないマスを決定する
   * @param Board board: 盤面
   * @return int: 最も候補数字の少ないマス
   */
  decideMinKouhoCell(board) {
    let minnumkouho = board.bsize + 1;
    let mincpos;
    for (let c = 0; c < board.numcells; c++) {
      if (board.board[c].num === '0' && !board.board[c].ishint) {
        let numkouho = board.board[c].kouho.filter(x => x === true).length;
        if (numkouho < minnumkouho) {
          minnumkouho = numkouho;
          mincpos = c;
        }
      }
    }
    return mincpos; 
  }



  // =========================== ストラテジー本体 ============================

  /**
   * naked singleストラテジー
   * @param Board board
   * @return bool ok
   * @return string status: newcell or notfound
   * @return array(int) cellinfo
   */
  nakedSingleStrategy(board) {
    for (let c = 0; c < board.numcells; c++) {
      if (board.board[c].num === '0') {
        // trueのkouhoが一つかどうか調べて唯一の候補を割り出し
        let onlykouho = '0';
        let kouhocnt = 0;
        for (let k in board.board[c].kouho) {
          if (board.board[c].kouho[k]) {
            onlykouho = String(Number(k) + 1);
            kouhocnt++;
          }
        }
        // 確定（盤面操作あり）
        if (kouhocnt === 1) {
          this.answerInsert(board, c, onlykouho);   // 盤面操作
          // メッセージ生成
          let x = c % board.bsize + 1;
          let y = Math.floor(c / board.bsize) + 1;
          return {ok:true, status:'newcell', cellinfo:[c], strategy:'Naked Single',
                  msg: 'Naked Single: Cell(' + x + ', ' + y + ') to ' + onlykouho};
        }
      }
    }
    return {ok:false, status:'notfound', strategy:'Naked Single'};
  }

  /**
   * hidden single
   * @param Board board
   * @return bool ok
   * @return string status: newcell or notfound
   * @return array(int) cellinfo
   */
  hiddenSingleStrategy(board) {
    for (let u in board.units) {
      for (let n = 0; n < board.bsize; n++) {
        let ret = this.hiddenSingleCheck(board, u, n+1)
        // 確定（盤面操作あり）
        if (ret.ok) {
          this.answerInsert(board, ret.cid, String(n+1));   // 盤面操作
          // メッセージ生成
          let x = ret.cid % board.bsize + 1;
          let y = Math.floor(ret.cid / board.bsize) + 1;
          return {ok:true, status:'newcell', cellinfo:[ret.cid], strategy:'Hidden Single',
                  msg: 'Hidden Single: Cell(' + x + ', ' + y + ') to ' + (n+1)};
        }
      }
    }
    return {ok:false, status:'notfound', strategy:'Hidden Single'};
  }
}