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
    this.rowidx = []
    this.colidx = []
    this.blockidx = []
    this.cellidx = []
    this.createCellIndex();
  }

  /**
   * ピアに含まれるセルのインデックスリストを作成
   */
  createCellIndex() {
    let rowid = Math.floor(this.cid / this.bsize);
    let colid = this.cid % this.bsize;
    let sqrtsize = Math.sqrt(this.bsize);
    // 同じ行
    for (let j = 0; j < this.bsize; j++) {
      this.rowidx.push(rowid * this.bsize + j);
    }
    // 同じ列
    for (let i = 0; i < this.bsize; i++) {
      this.colidx.push(i * this.bsize + colid);
    }
    // 同じブロック
    for (let i = 0; i < sqrtsize; i++) {
      for (let j = 0; j < sqrtsize; j++) {
        let ofsx = Math.floor(colid / sqrtsize) * sqrtsize;
        let ofsy = Math.floor(rowid / sqrtsize) * sqrtsize * this.bsize;
        this.blockidx.push(ofsx + ofsy + i * this.bsize + j);
      }
    }
    // 重複排除と自身のマス排除
    this.cellidx = this.cellidx.concat(this.rowidx, this.colidx, this.blockidx)
    this.cellidx = Array.from(new Set(this.cellidx));
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
      multians_thres: 100,  // 別解発生時に探索を打ち切る解の個数
    }
    // 高速解答用のストラテジー関数のリスト
    this.strategylist = [
      this.nakedSingleStrategy,
      this.hiddenSingleStrategy,
    ];
    // 分析用のストラテジー関数リスト
    this.strategylist_for_analysis = [
      this.easyNakedSingleStrategy,   // ユニットヒント数6~8個のnaked single
      this.blockHiddenSingleStrategy, // ブロッケン
      this.mediumNakedSingleStrategy, // ユニットヒント数5個
      this.lineHiddenSingleStrategy,  // レッツミー
      this.hardNakedSingleStrategy,   // ユニットヒント数3,4個
      // ここからHard必須手筋
      this.blockDrivenEitherwayStrategy, // ブロック始動型いずれにせよ理論
      this.blockHiddenPairStrategy,      // ブロック型 予約
      this.lineDrivenEitherwayStrategy,  // 列始動型いずれにせよ理論
      this.lineHiddenPairStrategy,       // 列始動型 予約
      this.blockNakedPairStrategy,       // ブロック始動型 逆予約
      this.lineNakedPairStrategy,        // 列始動型 逆予約
      /*
      this.blockHiddenTripleStrategy,    // ブロック始動型 3つ組
      this.blockNakedTripleStrategy,     // ブロック始動型　逆3つ組
      this.lineHiddenTripleStrategy,     // 列始動型　３つ組
      this.lineNakedTripleStrategy,      // 列始動型 逆３つ組
      // 唖然手筋
      this.nakedQuadrapleStrategy,      // naked 4つ組
      this.hiddenQuadrapleStrategy,     // hidden 4つ組
      this.xWingStrategy,               // X-wing 井桁理論
      this.swordFishStrategy,           // swordfish
      */
    ]
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
    // 1ステップ解答を実行してログをとる
    let retobj = this.strategySelector(newboard, true);
    let actionlist = board.diff(newboard);
    Sudokizer.solvelog.push(retobj.msg);
    return [newboard, actionlist];
  }

  /**
   * 全解答
   */
  allStepSolve(board) {
    let newboard = board.transCreate();
    this.autoIdentifyKouho(newboard)
    // 再帰関数：ret[0]はanscnt, ret[1]
    let ret = this.allStepSolveRecursive(newboard, 0);
    let actionlist = board.diff(ret[1]);
    return [ret[1], actionlist, ret[0]];
  }

  /**
   * 全解答再帰アルゴリズム
   * @param Board board 元盤面
   * @param int klevel  再帰の深さ（デバッグ用）
   * @return int 解の個数
   * @return ansboard 解答盤面
   */
  allStepSolveRecursive(board, klevel) {
    let newboard = board.transCreate();
    // 1ステップ解かせるループ
    while (true) {
      let retobj = this.strategySelector(newboard, false);
      Sudokizer.solvelog.push(retobj.msg);
      // OKだった場合：解答チェックしてOKなら脱出
      if (retobj.ok) {
        if (retobj.status === 'done') {
          return [1, newboard];
        }
      // NGだった場合：破綻なら即死、お手上げなら背理法
      } else {
        if (retobj.status === 'noanswer') {
          return [0, newboard];
        } else if (retobj.status === 'giveup') {
          // 最小候補数を持つ最も若いマスを検査
          let mincpos = this.decideMinKouhoCell(newboard);
          // そのマスを対象にループ開始
          let anscnt = 0;
          let ansboard = newboard;
          for (let k = 0; k < board.bsize; k++) {
            if (newboard.board[mincpos].kouho[k]) {
              let newboard2 = newboard.transCreate();
              this.answerInsert(newboard2, mincpos, String(k+1));
              this.peerRemoveKouho(newboard2, mincpos);
              let ret = this.allStepSolveRecursive(newboard2, klevel+1);
              anscnt += ret[0];
              if (ret[0] >= 1) {
                ansboard = ret[1];
              }
            }
            // 複数解が出すぎたら脱出
            if (anscnt >= this.config.multians_thres) {
              break;
            }
          }
          return [anscnt, ansboard];
        }
      }
    }
  }


  // ============================== ストラテジーセレクタ　===============================

  /**
   * ストラテジーセレクタ
   * - ストラテジーを選択して一ステップだけ解く。候補の同期や破綻判定もやる。
   * @param Board board: 解く盤面 
   * @param analyze_mode: 分析モード
   * @return Object ret: 色々な情報を返す
   *   - bool ok    : 正常に進めばtrue, 失敗（破綻とお手上げ）ならfalse
   *   - bool status: 'newcell', 'newkouho', 'noanswer', 'giveup'
   *   - bool cellinfo: 影響があったマス/破綻したマス のリスト
   */
  strategySelector(board, analyze_mode=false) {
    let strategies
    if (analyze_mode) {
      strategies = this.strategylist_for_analysis;
    } else {
      strategies = this.strategylist;
    }
    for (let i in strategies) {
      // ストラテジー呼び出し
      let ret = strategies[i].call(this, board);
      if (ret.ok) {
        // 新たに数字が入った場合、候補情報を同期して返す
        if (ret.status === 'newcell') {
          this.peerRemoveKouho(board, ret.cellinfo[0]);
        }
        // 破綻していた場合
        if (!this.noKouhoCheck(board).ok) {
          return {ok:false, status:'noanswer', msg:'No Answer!'};
        }
        // 正常成功
        return ret;
      }
    }
    // 完成チェック
    if (this.ansCheck(board)) {
      return {ok:true, status:'done', msg:'Congratulations!'};
    // お手上げ（背理法）
    } else {
      return {ok:false, status:'giveup', msg:'Give Up...'};
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
   * @param Board board : 盤面 
   * @param int cid     : マス番号
   */
  peerRemoveKouho(board, cid) {
    let centernum = board.board[cid].num;
    if (centernum !== '0') {
      this.removeKouho(board, board.peers[cid].cellidx, centernum);
    }
  }

  /**
   * 指定したマスリストから指定したnumの候補を削除する
   * @param Board board: 盤面
   * @param array clist: マスの番号リスト
   * @param string num: 数字
   * @return 削除したマスと候補をまとめたオブジェクト
   */
  removeKouho(board, clist, num) {
    let retobj = {'num':num, 'cellinfo':[]}
    for (let c of clist) {
      if (board.board[c].num === '0' && board.board[c].kouho[num-1]) {
        board.board[c].kouho[num-1] = false;
        board.board[c].kklevel[num-1] = 0;
        retobj.cellinfo.push(c);
      }
    }
    return retobj;
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
   * （再帰探索用）最も候補数字の個数の少ないマスを決定する
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

  /**
   * 組み合わせ。nlistの中からk個取り出す全パターンをリスト形式で返す
   * 例：combination([1,2,3], 2) => [[1,2], [1,3], [2,3]]
   * @param array nlist: 元となるリスト 
   * @param int k: 何個分取り出すか
   * @return list 長さkのリストをnCk個分まとめたリスト
   */
  combination(nlist, k) {
    // kの条件
    if (k < 0 || k > nlist.length) {
      throw 'Combination Argument Error!: ' + nlist.length + 'C' + k;
    }
    let outer = []
    // 原始条件 k = 0
    if (k === 0) {
      outer.push([]);
    // 原始条件 k = n
    } else if (k === nlist.length) {
      outer.push(nlist);
    // 原始条件 k = 1
    } else if (k === 1) {
      for (let n of nlist) {
        outer.push([n]);
      }
    // 再帰条件 k > 2
    } else {
      for (let i = 0; i <= nlist.length - k; i++) {
        let inner = this.combination(nlist.slice(i+1), k-1);
        for (let il of inner) {
          outer.push([nlist[i]].concat(il))
        }
      }
    }
    return outer;
  }

  /**
   * 指定したマスリストの中にnuｍの候補がどれだけあるか調べる
   */
  countKouhoWithin(board, clist, num) {
    let cnt = 0;
    for (let c of clist) {
      if (board.board[c].kouho[num-1]) {
        cnt++;
      }
    }
    return cnt;
  }

  /**
   * 指定マスの候補のリストを返す
   * @param Board board: 盤面
   * @param int cid    : マス番号
   * @return []int     : 候補のリストを文字列のリスト形式で返す
   */
  kouhoList(board, cid) {
    let kouholist = []
    for (let k = 0; k < board.bsize; k++) {
      if (board.board[cid].kouho[k]) {
        kouholist.push(k+1);
      }
    }
    return kouholist;
  }

  /**
   * 指定マスの候補のUnionを返す
   * @param Board board: 盤面
   * @param array clist: セルのリスト
   */
  kouhoUnion(board, clist) {
    let kunion = [];
    for (let c of clist) {
      kunion = kunion.concat(this.kouhoList(board, c));
    }
    return Array.from(new Set(kunion));
  }

  /**
   * 指定マスリストの中のヒント数を返す
   * @param Board board: 盤面
   * @param array clist: セルインデックスのリスト
   * @return int: 上のリストで指定されたマスのうちヒントが埋まっている個数
   */
  countHints(board, clist) {
    let cnt = 0;
    for (let c of clist) {
      if (board.board[c].num !== '0') {
        cnt++;
      }
    }
    return cnt;
  }

  /**
   * (Naked Single用)
   * 対象マスを含む3ユニット（行、列、ブロック）のうち
   * 最も多く数字が埋まっているユニットの埋まっている数字の個数を返す
   * @param Board board: 盤面
   * @param int cpos: 対象となるマスの番号
   * @param return cposの所属ユニットにどれだけ数字が埋まっているか
   */
  maxCountHints(board, cpos) {
    let maxhints = 0;
    let h1 = this.countHints(board, board.peers[cpos].blockidx);
    let h2 = this.countHints(board, board.peers[cpos].rowidx);
    let h3 = this.countHints(board, board.peers[cpos].colidx);
    maxhints = (h1 > maxhints) ? h1 : maxhints;
    maxhints = (h2 > maxhints) ? h2 : maxhints;
    maxhints = (h3 > maxhints) ? h3 : maxhints;
    return maxhints
  }

  /**
   * (Hidden Single用)
   * ユニットIDと数字を指定して、そのユニットに唯一入れられる場所があるか非破壊的に探す
   * @param Board board: 盤面全体
   * @param obj unitid: 検査対象ユニット
   * @param int num: 検査対象数字 1-origin
   * @return bool ok: OKかどうか
   * @return int cid: OKの場合、埋めるべきマスを返す
   */
  hiddenSingleCheck(board, unit, num) {
    let cnt = 0;
    let lastcid;
    for (let cid of unit.cellidx) {
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

 



  // =========================== ストラテジー本体 ============================
 
  /**
   * NNaked single
   * @param int minh, maxh: 最小ヒント数と最大ヒント数
   * @return 以下の仕様を持つ関数
   *   @param Board board
   *   @return bool ok
   *   @return string status: newcell or notfound
   *   @return array(int) cellinfo
   */
  nakedSingleFactory(minh, maxh) {
    return function(board) {
      for (let c = 0; c < board.numcells; c++) {
        if (board.board[c].num === '0') {
          let kouholist = this.kouhoList(board, c);
          if (kouholist.length === 1) {
            let maxhints = this.maxCountHints(board, c);
            if (maxhints >= minh && maxhints <= maxh) {
              this.answerInsert(board, c, kouholist[0]);   // 盤面操作
              // メッセージ生成
              let x = c % board.bsize + 1;
              let y = Math.floor(c / board.bsize) + 1;
              return {ok:true, status:'newcell', cellinfo:[c], strategy:'Naked Single',
                      msg: 'Naked Single (' + maxhints + ' hints):' + 
                            'Cell(' + x + ', ' + y + ') to ' + kouholist[0]};
            }
          }
        }
      }
      return {ok:false, status:'notfound', strategy:'Naked Single'};
    }
  }
  nakedSingleStrategy = this.nakedSingleFactory(1, 9);
  easyNakedSingleStrategy = this.nakedSingleFactory(6, 8);
  mediumNakedSingleStrategy = this.nakedSingleFactory(5, 5);
  hardNakedSingleStrategy = this.nakedSingleFactory(3, 4);


  /**
   * hidden single
   * @param string prefix: メッセージなどのプレフィックス
   * @return 以下の仕様を持つ関数
   *   @param Board board
   *   @return bool ok
   *   @return string status: newcell or notfound
   *   @return array(int) cellinfo
   */
  hiddenSingleFactory(prefix) {
    return function(board) {
      // ファクトリー用条件分岐
      let units;
      if (prefix === '') {
        units = board.units;
      } else if (prefix === 'Block ') {
        units = board.blocks;
      } else if (prefix === 'Line ') {
        units = board.lines;
      } else {
        throw 'hiddenSingleStrategyFactory: Invalid prefix Error';
      }
      // 本処理
      for (let u of units) {
        for (let n = 0; n < board.bsize; n++) {
          let ret = this.hiddenSingleCheck(board, u, n+1)
          if (ret.ok) {
            this.answerInsert(board, ret.cid, String(n+1));   // 盤面操作
            // メッセージ生成
            let x = ret.cid % board.bsize + 1;
            let y = Math.floor(ret.cid / board.bsize) + 1;
            return {ok:true, status:'newcell', cellinfo:[ret.cid], 
                    strategy: prefix + 'Hidden Single',
                    msg: prefix + 'Hidden Single: Cell(' + x + ', ' + y + ') to ' + (n+1)};
          }
        }
      }
      return {ok:false, status:'notfound', strategy:prefix+'Hidden Single'};
    }
  }
  hiddenSingleStrategy = this.hiddenSingleFactory('');
  blockHiddenSingleStrategy = this.hiddenSingleFactory('Block ');
  lineHiddenSingleStrategy  = this.hiddenSingleFactory('Line ');


  /**
   * ブロック駆動型いずれにせよ理論
   */
  blockDrivenEitherwayStrategy(board) {
    for (let cr of board.crosses) {
      for (let n = 0; n < board.bsize; n++) {
        let retobj;
        if (this.countKouhoWithin(board, cr.cellidx, String(n+1)) >= 1 &&
            this.countKouhoWithin(board, cr.blockidx, String(n+1)) === 0) {
          retobj = this.removeKouho(board, cr.lineidx, String(n+1));
          // 削除確定、メッセージ設定
          if (retobj.cellinfo.length > 0) {
            return {ok:true, status:'newkouho', strategy:'Block-driven Eitherway',
                    cellinfo: retobj.cellinfo,
                    msg: 'Block-driven Eitherway (Number: ' + retobj.num + ')'}
          }
        }
      }
    }
    return {ok:false, status:'notfound', strategy:'Block-driven Eitherway'};
  }
  /**
   * ライン駆動型いずれにせよ理論
   */
  lineDrivenEitherwayStrategy(board) {
    for (let cr of board.crosses) {
      for (let n = 0; n < board.bsize; n++) {
        let retobj;
        if (this.countKouhoWithin(board, cr.cellidx, String(n+1)) >= 1 &&
            this.countKouhoWithin(board, cr.lineidx, String(n+1)) === 0) {
          retobj = this.removeKouho(board, cr.blockidx, String(n+1));
          // 削除確定、メッセージ設定
          if (retobj.cellinfo.length > 0) {
            return {ok:true, status:'newkouho', strategy:'Block-driven Eitherway',
                    cellinfo: retobj.cellinfo,
                    msg: 'Block-driven Eitherway (Number: ' + retobj.num + ')'}
          }
        }
      }
    }
    return {ok:false, status:'notfound', strategy:'Block-driven Eitherway'};
  }

  /**
   * naked piar
   * @param string prefix: メッセージなどのプレフィックス
   * @return 以下の仕様を持つ関数
   *   @param Board board
   *   @return bool ok
   *   @return string status: newcell or notfound
   *   @return array(int) cellinfo
   */
  nakedPairFactory(prefix) {
    return function(board) {
      // ファクトリー用条件分岐
      let units;
      if (prefix === '') {
        units = board.units;
      } else if (prefix === 'Block ') {
        units = board.blocks;
      } else if (prefix === 'Line ') {
        units = board.lines;
      } else {
        throw 'nakedPairFactory: Invalid prefix Error';
      }
      // 本処理
      for (let u of units) {
        let ret = this.searchNakedPair(board, u.cellidx);
        if (ret.ok) {
          return {ok:true, status:'newcell', cellinfo:[ret.cid], 
                  strategy: prefix + 'Naked Pair',
                  msg: prefix + 'Naked Pair'};
        }
      }
      return {ok:false, status:'notfound', strategy:prefix+'Hidden Single'};
    }
  }
  nakedPairStrategy = this.nakedPairFactory('');
  blockNakedPairStrategy = this.nakedPairFactory('Block ');
  lineNakedPairStrategy  = this.nakedPairFactory('Line ');

  /**
   * naked pairの本体
   * @param Board board : 盤面
   * @param array clist : 探索対象のマスのリスト
   */
  searchNakedPair(board, clist) {
    let kunion = this.kouhoUnion(clist);
  }


}