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
    this.cellidx = this.createCellIndex(unittype, id, unitsize);
    this.unitsize = this.cellidx.length;
  }
  /**
   * ユニットに含まれるマスの番号を配列で返す
   */
  createCellIndex(unittype, id, unitsize) {
    let cellidx = []
    // 横行ユニット
    if (unittype === 'row') {
      for (let j = 0; j < unitsize; j++) {
        cellidx.push(id * unitsize + j);
      }
    // 楯列ユニット
    } else if (unittype === 'col') {
      for (let i = 0; i < unitsize; i++) {
        cellidx.push(i * unitsize + id);
      }
    // ブロックユニット
    } else if (unittype === 'block') {
      let sqrtsize = Math.sqrt(unitsize); // 3
      for (let i = 0; i < sqrtsize; i++) {
        for (let j = 0; j < sqrtsize; j++) {
          let ofsx = (id % sqrtsize) * sqrtsize;
          let ofsy = Math.floor(id / sqrtsize) * sqrtsize * unitsize;
          cellidx.push(ofsx + ofsy + i * unitsize + j);
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
    this.cellidx = this.createCellIndex(cid, bsize);
  }

  /**
   * ピアに含まれるセルのインデックスリストを作成
   */
  createCellIndex(cid, bsize) {
    let rowid = Math.floor(cid / bsize);
    let colid = cid % bsize;
    let sqrtsize = Math.sqrt(bsize);
    let cellidx = []
    // 同じ行
    for (let j = 0; j < bsize; j++) {
      cellidx.push(rowid * bsize + j);
    }
    // 同じ列
    for (let i = 0; i < bsize; i++) {
      cellidx.push(i * bsize + colid);
    }
    // 同じブロック
    for (let i = 0; i < sqrtsize; i++) {
      for (let j = 0; j < sqrtsize; j++) {
        let ofsx = Math.floor(colid / sqrtsize) * sqrtsize;
        let ofsy = Math.floor(rowid / sqrtsize) * sqrtsize * bsize;
        cellidx.push(ofsx + ofsy + i * bsize + j);
      }
    }
    // 重複排除と自身のマス排除
    cellidx = cellidx.filter((x, i, arr) => (arr.indexOf(x) === i && x !== cid));
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
 * 数独エンジンクラス
 */
class SdkEngine {
  constructor() {
    // 解答エンジンに関する諸設定
    this.config = {
      multians_thres: 2,  // 別解発生時に探索を打ち切る解の個数
    }
    // 適用するストラテジー関数のリスト
    this.strategylist = [
      this.hiddenSingle,
      this.nakedSingle,
    ];
  }

  // 横行
  createRows(board) {
    let units = []
    for (let i = 0; i < board.bsize; i++) {
      units.push(new Unit('row', i, board.bsize));
    }
    return units;
  }
  // 縦列
  createCols(board) {
    let units = []
    for (let i = 0; i < board.bsize; i++) {
      units.push(new Unit('col', i, board.bsize));
    }
    return units;
  }
  // ブロック
  createBlocks(board) {
    let units = []
    for (let i = 0; i < board.bsize; i++) {
      units.push(new Unit('block', i, board.bsize));
    }
    return units;
  }
  // 全て
  createUnits(board) {
    let units = []
    units = units.concat(this.createRows(board));
    units = units.concat(this.createCols(board));
    units = units.concat(this.createBlocks(board));
    return units;
  }


  // =========================== フロント基本機能 =============================

  /**
   * 解答チェック機能（簡易実装版）
   * @param Board board: チェック対象の盤面オブジェクト
   */
  ansCheck(board) {
    let units = this.createUnits(board);
    let okflg = true;
    for (let unit of units) {
      if (!unit.validCheck(board)) {
        okflg = false;
        break;
      }
    }
    alert(okflg ? '正解です' : '不正解です');
  }

  /**
   * 自動候補埋め機能（簡易実装版）
   * @param takediff: 差分をとるかどうか。ストラテジーで内部的に使う場合はfalse指定。
   */
  autoIdentifyKouho(board, takediff=true) {
    let newboard = board.transCreate();
    for (let c = 0; c < newboard.numcells; c++) {
      if (board.board[c].num === '0') {
        let peer = new Peer(c, newboard.bsize);
        peer.identifyKouho(newboard);
      }
    }
    // アクション追加
    if (takediff) {
      let actionlist = board.diff(newboard);
      return [newboard, actionlist];
    } else {
      return newboard;
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


  // ============================== ストラテジー本体　===============================

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

  /**
   * hiddenSingle
   * テスト用の暫定クラス
   */
  hiddenSingle(board) {
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
   * nakedSingle
   * テスト用の暫定クラス
   */
  nakedSingle(board) {
    return {ok:true, status: 'newcell', cellinfo: [0]}
  }



}