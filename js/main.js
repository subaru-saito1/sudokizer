
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
}



/**
 * 数独エンジンクラス
 */
class SdkEngine {

   // 横行
  static createRows(board) {
    let units = []
    for (let i = 0; i < board.bsize; i++) {
      units.push(new Unit('row', i, board.bsize));
    }
    return units;
  }
  // 縦列
  static createCols(board) {
    let units = []
    for (let i = 0; i < board.bsize; i++) {
      units.push(new Unit('col', i, board.bsize));
    }
    return units;
  }
  // ブロック
  static createBlocks(board) {
    let units = []
    for (let i = 0; i < board.bsize; i++) {
      units.push(new Unit('block', i, board.bsize));
    }
    return units;
  }
  // 全て
  static createUnits(board) {
    let units = []
    units = units.concat(SdkEngine.createRows(board));
    units = units.concat(SdkEngine.createCols(board));
    units = units.concat(SdkEngine.createBlocks(board));
    return units;
  }


  // =========================== フロント基本機能 =============================

  /**
   * 解答チェック機能（簡易実装版）
   * @param Board board: チェック対象の盤面オブジェクト
   */
  static ansCheck(board) {
    let units = SdkEngine.createUnits(board);
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
   */
  static autoIdentifyKouho(board) {
    let newboard = board.transCreate();
    for (let c = 0; c < newboard.numcells; c++) {
      if (board.board[c].num === '0') {
        let peer = new Peer(c, newboard.bsize);
        peer.identifyKouho(newboard);
      }
    }
    // アクション追加
    let actionlist = board.diff(newboard);
    return [newboard, actionlist];
  }

}