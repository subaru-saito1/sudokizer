
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

class SdkEngine {

  /**
   * Unitオブジェクトのリストを生成。9x9番目の場合は27個分
   */

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

}