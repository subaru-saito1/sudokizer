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

  /**
   * ユニットに正しく１～９まで入っているか調べる
   * @param Board board: チェック対象の盤面
   */
  validCheck(board) {
    // UnitとBoardの紐づけがないのでちゃんと確認しておく
    if (this.unitsize !== board.bsize) {
      throw 'Unit.validCheck: invalid board size' + 
            '(' + this.unitsize + ', ' + board.bsize + ')';
    }
    let flgfield = 0x00000000;
    for (let c of this.cellidx) {
      // 空白 or ?ヒントがあったら即死
      if (board.board[c].num === '0' || board.board[c].num === '?') {
        return false;
      }
      // 数字が入っていたら対応するビット部分を1に変更
      flgfield |= (0x00000001 << Number(board.board[c].num) - 1);
    }
    // チェック
    for (let i = 0; i < this.unitsize; i++) {
      if ((flgfield & 0x00000001 << i) === 0) {
        return false;
      }
    }
    return true;
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

  /**
   * 中心マスの候補数字洗いだし
   */
  identifyKouho(board) {
    // 中心が空白マスの場合のみ適用
    if (board.board[this.cid].num === '0') {
      for (let k = 0; k < this.bsize; k++) {
        board.board[this.cid].kouho[k] = true;
        board.board[this.cid].kklevel[k] = 0;
      }
      for (let c of this.cellidx) {
        let cnum = board.board[c].num;
        if (cnum !== '0' && cnum !== '?') {
          board.board[this.cid].kouho[cnum - 1] = false;
        }
      }
    }
  }

  /**
   * 中心マスの数字をピアの各マスの候補から除外
   */
  removeKouho(board) {
    let centernum = board.board[this.cid].num;
    if (centernum !== '0') {
      for (let c of this.cellidx) {
        if (board.board[c].num === '0') {
          board.board[c].kouho[centernum-1] = false;
        }
      }
    }
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

  /**
   * 解答チェック機能（簡易実装版）
   * @param Board board: チェック対象の盤面オブジェクト
   */
  ansCheck(board) {
    let okflg = true;
    for (let unit of board.units) {
      if (!unit.validCheck(board)) {
        okflg = false;
        break;
      }
    }
    alert(okflg ? '正解です' : '不正解です');
  }

  /**
   * 自動候補埋め機能（フロントラッパー）。
   */
  autoIdentifyKouhoWrapper(board) {
    let newboard = board.transCreate();
    this.autoIdentifyKouho(newboard);
    // アクション追加
    let actionlist = board.diff(newboard);
    return [newboard, actionlist];
  }
  /**
   * 自動候補埋め機能（本体）
   */
  autoIdentifyKouho(board) {
    for (let c = 0; c < board.numcells; c++) {
      if (board.board[c].num === '0') {
        board.peers[c].identifyKouho(board);
      }
    }
  }

  /**
   * 一ステップ解答
   */
  oneStepSolve(board) {
    let newboard;
    // 候補が空の空白マスがあったら自動候補埋めから
    if (!this.noKouhoCheck(board).ok) {
      newboard = this.autoIdentifyKouho(board, false);
    } else {
      newboard = board.transCreate();
    }
    console.log(newboard);
    let retobj = this.strategySelector(newboard);
    let actionlist = board.diff(newboard);
    return [newboard, actionlist];
  }

  /**
   * 全解答
   */
  allStepSolve(board) {
    let newboard = this.autoIdentifyKouho(board, false)
    // 本体部分は再帰関数で回す
    let anscnt = this.allStepSolveRecursive(newboard);
    if (anscnt === 0) {
      alert('解なし');
    } else if (anscnt === 1) {
      alert('一意解が存在します');
    } else {
      alert('複数解が存在します');
    }
    let actionlist = board.diff(newboard);
    return [newboard, actionlist];
  }

  /**
   * 全解答再帰アルゴリズム
   * @param Board board コピー後の盤面
   * @return int 解の個数
   */
  allStepSolveRecursive(board) {
    while (true) {
      // ストラテジーセレクタ1回分
      // 全マス埋まったら return 1
      // 破綻したら即 return 0
      return 1;

      // 先に進まなくなったら再帰
      let newboard = board.transCreate();
      // 候補数が最も少ないマスを選んでランダムに埋める
      // 埋めた後の盤面を再帰で渡す
      // 返り値（解の個数）を現在の解の個数に加算
      // 解の個数が2以上だった時点で即 return 2;
    }
  }


  // ============================== ストラテジーセレクタ　===============================

  /**
   * ストラテジーセレクタ
   * - ストラテジーを選択して一ステップだけ解く
   * - マスが埋まった場合、そのピアの候補の削除処理を実行
   * - 破綻判定もする
   * @param Board board: 解く盤面 
   * @param Object ret: 色々な情報を返す
   *   - bool ok    : 正常に進めばtrue, 失敗（破綻とお手上げ）ならfalse
   *   - bool status: 'newcell', 'newkouho', 'noanswer', 'giveup'
   *   - bool cellinfo: 影響があったマス/破綻したマス のリスト
   */
  strategySelector(board) {
    for (let i in this.strategylist) {
      // ストラテジー呼び出し
      let ret = this.strategylist[i](board);
      if (ret.ok) {
        // 新たに数字が入った場合、候補情報を同期
        if (ret.status === 'newcell') {
          let peer = new Peer(ret.cellinfo[0], board.bsize);
          peer.removeKouho(board);
        }
      }
    }
    // 破綻していた場合
    if (this.noKouhoCheck(board).ok) {
      return {ok: false, status: 'noanswer'};
    }
  }

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


  // =========================== ストラテジー本体 ============================

  /**
   * naked singleストラテジー
   * テスト用の暫定クラス
   */
  nakedSingleStrategy(board) {
    for (let c = 0; c < board.numcells; c++) {
      if (board.board[c].num === '0') {
        // trueのkouhoが一つかどうか調べて唯一の候補を割り出し
        let onlykouho = '0';
        let kouhocnt = 0;
        for (let k in board.board[c].kouho) {
          if (board.board[c].kouho[k]) {
            onlykouho = String(k + 1);
            kouhocnt++;
          }
        }
        // 確定（盤面操作あり）
        if (kouhocnt === 1) {
          board.board[c].num = onlykouho;
          board.board[c].kouho[onlykouho-1] = false;
          board.board[c].kklevel[onlykouho-1] = 0;
          return {ok:true, status:'newcell', cellinfo:[c]};
        }
      }
    }
    return {ok:false, status:'notfound'};
  }

  /**
   * hidden single
   * テスト用の暫定クラス
   */
  hiddenSingleStrategy(board) {
    return {ok:true, status: 'newcell', cellinfo: [0]}
  }



}