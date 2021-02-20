"use strict";

/**
 * classes.js
 * 
 * クラス定義のためのファイル
 * 本当はinit.jsにまとめたいけどホイスティングが効かないとなるとねえ
 */


// =========================================================================

/**
 * Cellsクラス
 */
class Cell {
  constructor(bsize) {
    this.num = '0';        // 0で空白、1~9で数字、?でヒント
    this.ishint = false;   // ヒントフラグ
    this.klevel = '0';     // 仮定レベル
    this.kouho = [];       // 候補リスト
    this.exkouho = [];     // 除外候補リスト
    this.kklevel = [];     // 候補の仮定レベルリスト
    for (let i = 0; i < bsize; i++) {
      this.kouho.push(false);
      this.exkouho.push(false);
      this.kklevel.push('0');
    }
  }

  /**
   * セルの中身をクリアする
   * @param string mode: クリアモード(question, answer, kouho)
   */
  clear(mode) {
    if (mode === 'question') {
      this.num = '0';
      this.ishint = false;
      this.klevel = '0';
      for (let i = 0; i < Sudokizer.board.bsize; i++) {
        this.exkouho[i] = false;
        this.kouho[i] = false;
        this.kklevel[i] = '0';
      }
    } else {
      if (!this.ishint) {
        // 仮定レベル0なら全消し、それ以外ならそのレベルのものだけ削除
        if (Sudokizer.config.kateilevel === '0' ||
            Sudokizer.config.kateilevel === this.klevel) {
          if (mode === 'answer') {
            this.num = '0';
          }
          for (let i = 0; i < Sudokizer.board.bsize; i++) {
            this.exkouho[i] = false;
          }
        }
        // 候補数字消去
        for (let i = 0; i < Sudokizer.board.bsize; i++) {
          if (Sudokizer.config.kateilevel === '0' ||
              Sudokizer.config.kateilevel === this.kklevel[i]) {
            this.kouho[i] = false;
            this.kklevel[i] = '0';
          }
        }
        
      }
    }
  }

  /**
   * セルの中身をコピーする
   */
  copyInto(fromcell) {
    this.num = fromcell.num;
    this.ishint = fromcell.ishint;
    this.klevel = fromcell.klevel;
    for (let k = 0; k < Sudokizer.board.bsize; k++) {
      this.kouho[k] = fromcell.kouho[k];
      this.exkouho[k] = fromcell.exkouho[k];
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
   */
  constructor() {
    this.puzzlename = 'sudoku';
    this.bsize = 9;
    this.numcells = this.bsize ** 2;
    this.author_ja = '';      // 作者情報
    this.author_en = '';      // 作者情報
    this.board = [];
    for (let i = 0; i < this.numcells; i++) {
      this.board.push(new Cell(this.bsize));
    }
  }

  // ============================ 基本盤面操作 ===============================

  // マス解答入力
  ansInsAtomic(cpos, num, klevel) {
    if (!this.board[cpos].ishint) {
      this.board[cpos].num = num;
      this.board[cpos].klevel = klevel;
    } else {
      throw 'ansInsAtomic Validation Error';
    }
  }
  // マス解答削除
  ansDelAtomic(cpos, num, klevel) {
    if (!this.board[cpos].ishint &&
        this.board[cpos].num === num &&
        this.board[cpos].klevel === klevel) {
      this.board[cpos].num = '0';
      this.board[cpos].klevel = '0';
    } else {
      throw 'ansDelAtomic Validation Error';
    }
  }
  // マスヒント入力
  hintInsAtomic(cpos, num) {
    if (true) {
      this.board[cpos].num = num;
      this.board[cpos].ishint = true;
    } else {
      throw 'hintInsAtomic Validation Error';
    }
  }
  // マスヒント削除
  hintDelAtomic(cpos, num) {
    if (this.board[cpos].ishint &&
        this.board[cpos].num === num) {
      this.board[cpos].num = '0';
      this.board[cpos].ishint = false;
    } else {
      throw 'hintDelAtomic Validation Error';
    }
  }
  // 候補ON
  kouhoOnAtomic(cpos, num, klevel) {
    if (!this.board[cpos].ishint &&
        !this.board[cpos].kouho[num - 1]) {
      this.board[cpos].kouho[num - 1] = true;
      this.board[cpos].kklevel[num - 1] = klevel;
    } else {
      throw 'kouhoOnAtomic Validation Error';
    }  
  }
  // 候補OFF
  kouhoOffAtomic(cpos, num, klevel) {
    if (!this.board[cpos].ishint &&
        this.board[cpos].kouho[num - 1] &&
        this.board[cpos].kklevel[num - 1] === klevel) {
      this.board[cpos].kouho[num - 1] = false;
      this.board[cpos].kklevel[num - 1] = '0';
    } else {
      throw 'kouhoOffAtomic Validation Error';
    }  
  }
  // 除外候補ON
  exkouhoOnAtomic(cpos, num) {
    if (this.board[cpos].ishint &&
        this.board[cpos].num === '?' &&
        !this.board[cpos].exkouho[num - 1]) {
      this.board[cpos].exkouho[num - 1] = true;
    } else {
      throw 'exkouhoOnAtomic Validation Error';
    }
  }
  // 除外候補OFF
  exkouhoOffAtomic(cpos, num) {
    if (this.board[cpos].ishint &&
        this.board[cpos].num === '?' &&
        this.board[cpos].exkouho[num - 1]) {
      this.board[cpos].exkouho[num - 1] = false;
    } else {
      throw 'exkouhoOffAtomic Validation Error';
    }
  }


  // ==================== 基本アクション ======================

  /**
   * マス解答入力
   */
  ansIns(cpos, num, klevel) {
    this.ansInsAtomic(cpos, num, klevel);
    for (let i = 0; i < this.bsize; i++) {
      // 候補消去
      if (this.board[cpos].kouho[i]) {
        this.kouhoOffAtomic(cpos, i+1, this.board[cpos].kklevel[i]);
      }
    }
  }

  /**
   * マス解答消去
   */
  ansDel(cpos) {
    if (!this.board[cpos].ishint) {
      let num = this.board[cpos].num;
      let klevel = this.board[cpos].klevel;
      // 空白マス：ヒント除去
      if (this.board[cpos].num === '0') {
        for (let i = 0; i < this.bsize; i++) {
          if (this.board[cpos].kouho[i] &&
              (Sudokizer.config.kateilevel === '0' ||
               Sudokizer.config.kateilevel === this.board[cpos].kklevel[i])) {
            this.kouhoOffAtomic(cpos, i+1, this.board[cpos].kklevel[i]);
          }
        }
      // 入力マス：仮定レベル条件を満たした場合のみ削除
      } else {
        if (Sudokizer.config.kateilevel === '0' ||
            Sudokizer.config.kateilevel === klevel) {
          this.ansDelAtomic(cpos, num, klevel);
        }
      }
    }
  }

  /**
   * マスヒント入力
   */
  hintIns(cpos, num) {
    // 新規ヒント追加の場合：候補消去
    if (!this.board[cpos].ishint) {
      for (let i = 0; i < this.bsize; i++) {
        if (this.board[cpos].kouho[i]) {
          this.kouhoOffAtomic(cpos, i+1, this.board[cpos].kklevel[i]);
        }
      }
    // ヒント塗り替えの場合：除外候補消去
    } else {
      for (let i = 0; i < this.bsize; i++) {
        if (this.board[cpos].exkouho[i]) {
          this.exkouhoOffAtomic(cpos, i+1);
        }
      }
    }
    this.hintInsAtomic(cpos, num);
  }

  /**
   * マスヒント消去
   */
  hintDel(cpos) {
    let num = this.board[cpos].num;
    let klevel = this.board[cpos].klevel;
    // ヒントマスの場合(ヒント＋除外候補消去)
    if (this.board[cpos].ishint) {
      for (let i = 0; i < this.bsize; i++) {
        if (this.board[cpos].exkouho[i]) {
          this.exkouhoOffAtomic(cpos, i+1);
        }
      }
      this.hintDelAtomic(cpos, num);
    } else {
      // 空白の場合（候補除去）
      if (this.board[cpos].num === '0') {
        for (let i = 0; i < this.bsize; i++) {
          if (this.board[pos].kouho[i]) {
            this.kouhoOffAtomic(cpos, i+1, klevel);
          }
        }
      // 入力済みマスの場合
      } else {
        this.ansDelAtomic(cpos, num, klevel);
      }
    }
  }

  /**
   * 候補設定
   */
  kouhoSet(cpos, num, klevel) {
    if (this.board[cpos].kouho[num - 1]) {
      this.kouhoOffAtomic(cpos, num, klevel);
    } else {
      this.kouhoOnAtomic(cpos, num, klevel);
    }
  }

  /**
   * 除外候補設定
   */
  exkouhoSet(cpos, num) {
    if (this.board[cpos].exkouho[num - 1]) {
      this.exkouhoOffAtomic(cpos, num);
    } else {
      this.exkouhoOnAtomic(cpos, num);
    }
  }


  // ================ 初期化系 =================
  /**
   * 盤面の初期化 
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
   * @param string cmd: 下記参照
   * @return [newboard, alist] 新規盤面と差分リスト
   */
  transform(cmd) {
    let newboard = this.transCreate(cmd);
    let alist = this.diff(newboard);
    return [newboard, alist];
  }

  /**
   * 回転・反転・コピーを行う関数
   * @param string cmd: rotate90, rotate180, rotate270, inverseUD, inverseLR
   * 　　　　　　　　    未指定の場合は新規コピー
   * @return 変形後の新しい盤面オブジェクト
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
  diff(newboard) {
    // this.board -> newboard.board の差分をActionList形式で取得
    return [{'op': 'placeholder'}];
  }


  // ================================ URL出力 ==================================

  /**
   * URL出力関数メインルーチン
   * 
   * @return string URLのクエリ部分
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
   * @param array lines  読み込んだ文字列のリスト
   * @return array 著者情報の配列（nikolicom側とインタフェースを合わせたいので）
   */
  pbReadNormal(lines) {
    try {
      this.clear();     // 盤面初期化
      // サイズバリデーション
      if (Number(lines[0]) !== this.bsize) {
        throw 'BoardSizeError';
      }
      // ヒント読み込み
      for (let l = 1; l < 1 + this.bsize; l++) {
        let tokens = lines[l].split(' ');
        for (let j = 0; j < this.bsize; j++) {
          if (tokens[j] !== '.') {
            let c = (l - 1) * this.bsize + j;
            this.board[c].num = tokens[j];
          }
        }
      } 
      // 解答読み込み
      for (let l = 10; l < 10 + this.bsize; l++) {
        let tokens = lines[l].split(' ');
        for (let j = 0; j < this.bsize; j++) {
          let c = (l - 10) * this.bsize + j;
          if (tokens[j] === '.') {
            // ?ヒント
            if (this.board[c].num === '0') {
              this.board[c].num = '?';
            }
            this.board[c].ishint = true;
          } else {
            this.board[c].num = tokens[j];
          }
        }
      }
    } catch(err) {
      console.log(err);
      alert('盤面の読み込みに失敗しました');
    }
    // デバッグモード
    if (Sudokizer.config.debugmode) {
      console.log(this);
    }
    redraw();
    return ['', ''];    // 著者情報（空）
  }

  /**
   * nikolicom形式でファイルを読み込み
   * @param array lines  読み込んだ文字列のリスト
   * @return array 著者情報の配列
   */
  pbReadNikolicom(lines) {
    try {
      this.author_ja = lines[1].split(':')[1];
      this.author_en = lines[1].split(':')[2];
      this.clear();     // 盤面初期化
      // サイズバリデーション
      if (!(Number(lines[2][1]) === this.bsize && 
            Number(lines[2][3]) === this.bsize)) {
        console.log(lines[2][1], lines[2][3])
        throw 'BoardSizeError';
      }
      // ヒント盤面
      for (let l = 3; l < 3 + this.bsize; l++) {
        for (let j = 0; j < this.bsize; j++) {
          if (lines[l][j] !== '0') {
            let c = (l - 3) * this.bsize + j;
            this.board[c].ishint = true;
          }
        }
      }
      let lines2 = lines[12].split('\n');  // なんか後半だけ\n区切りだった
      // 解答盤面
      for (let l = 0; l < this.bsize; l++) {
        for (let j = 0; j < this.bsize; j++) {
          let c = l * this.bsize + j;
          this.board[c].num = lines2[l][j];
        }
      }
    } catch(err) {
      console.log(err);
      alert('盤面の読み込みに失敗しました');
    }
    // デバッグモード
    if (Sudokizer.config.debugmode) {
      console.log(this);
    }
    redraw();
    return [this.author_ja, this.author_en];
  }

  /**
   * 通常のpencilbox形式での出力
   * @return dousimasyo
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
    // デバッグモード
    if (Sudokizer.config.debugmode) {
      console.log(ret);
    }
    return ret;
  }

  /**
   * nikolicom形式での出力
   * @return dousimasyo
   */
  pbWriteNikolicom(authorinfo) {
    let ret = '';     // ここにファイル内容を文字列で書いていく
    let nl = '\n';    // 改行コード
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
    // 解答情報
    for (let i = 0; i < this.bsize; i++) {
      for (let j = 0; j < this.bsize; j++) {
        let c = i * this.bsize + j;
        ret += this.board[c].num;
      }
      ret += nl;
    }
    ret += '--' + nl;
    // デバッグモード
    if (Sudokizer.config.debugmode) {
      console.log(ret);
    }
    return ret;
  }

  /**
   * nikolicom形式で出力する際の事前バリデーション
   * - ?ヒントがないか
   * - 解答がちゃんと埋まっているか
   */
  validateNikolicom() {
    // 暫定
    return true;
  }
  


  // ============================== canvas描画 ====================================

  /**
   * canvasへの描画
   */
  drawBoardCanvas(cfg) {
    let canvas = document.querySelector('#main_board');
    let ctx = canvas.getContext('2d');
    let ofs = Sudokizer.config.drawpadding;
    let csize = cfg.dispsize;
    // 全体のサイズ設定
    let allsize = ofs * 2 + csize * this.bsize;
    $('#main_board').attr('width', allsize);
    $('#main_board').attr('height', allsize);

    // 背景描画
    ctx.fillStyle = Sudokizer.config.colorset.bg;
    ctx.fillRect(0, 0, allsize, allsize);
    ctx.strokeStyle = "black";
    // セルの描画
    for (let i = 0; i < this.bsize; i++) {
      for (let j = 0; j < this.bsize; j++) {
        ctx.strokeRect(ofs + csize * j, ofs + csize * i, csize, csize);
      }
    }
    // 境界線描画
    ctx.lineWidth = 3;
    let csqrt = Math.sqrt(this.bsize);
    for (let i = 0; i < csqrt; i++) {
      for (let j = 0; j < csqrt; j++) {
        ctx.strokeRect(ofs + csize * j * csqrt, ofs + csize * i * csqrt,
                       csize * csqrt, csize * csqrt);
      }
    }
    ctx.lineWidth = 1;
    // テキスト描画
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    this.drawBoardCanvasTexts(ctx, ofs, csize);
    // カーソル描画
    if (cfg === undefined || cfg.cursor) {
      this.drawBoardCanvasCursor(ctx, ofs, csize);
    }
  }

  /**
   * canvasへの描画：ヒント数字と候補数字の部分
   * @param object ctx  : 描画コンテキスト
   * @param int ofs  : 盤面描画オフセット
   * @param int csize: セルの大きさ
   */
  drawBoardCanvasTexts(ctx, ofs, csize) {
    for (let i = 0; i < this.bsize; i++) {
      for (let j = 0; j < this.bsize; j++) {
        let cid = i * this.bsize + j;
        let ofsx = ofs + j * csize;
        let ofsy = ofs + i * csize;
        let fontsize = csize / 1.2;
        // ヒントマス
        if (this.board[cid].ishint) {
          // ヒント数字
          if (this.board[cid].num !== '0') {
            ctx.fillStyle = Sudokizer.config.colorset.ht;
            ctx.font = fontsize + 'px ' + Sudokizer.config.dispfont;
            ctx.fillText(this.board[cid].num, ofsx + csize / 2, ofsy + csize / 2);
          }
          // 除外候補数字 (?ヒントマスのみ)
          if (this.board[cid].num === '?') {
            this.drawBoardCanvasKouho(ctx, cid, ofsx, ofsy, csize);
          }
        // 通常マス
        } else {
          // 入力数字（非ヒントの入力済みマス）
          if (this.board[cid].num !== '0') {
            ctx.fillStyle = Sudokizer.config.colorset['l' + this.board[cid].klevel];
            ctx.font = fontsize + 'px ' + Sudokizer.config.dispfont;
            ctx.fillText(this.board[cid].num, ofsx + csize / 2, ofsy + csize / 2);
          // 候補数字（非ヒントの空白マス）
          } else {
            this.drawBoardCanvasKouho(ctx, cid, ofsx, ofsy, csize);
          }
        }
      }
    }
    ctx.fillStyle = "black";
  }

  /**
   * canvasへの候補数字の描画
   * @param object ctx : 描画コンテキスト
   * @param int cid    : マス番号
   * @param int ofsx   : 横方向マスオフセット
   * @param int ofsy   : 縦方向マスオフセット
   * @param int csize  : セルサイズ
   */
  drawBoardCanvasKouho(ctx, cid, ofsx, ofsy, csize) {
    let fontsize = csize / 3.5;         
    let csqrt = Math.sqrt(this.bsize);  // 3

    ctx.font = fontsize + 'px sans-serif';
    // 通常候補
    if (!this.board[cid].ishint) {
      for (let ki = 0; ki < csqrt; ki++) {
        for (let kj = 0; kj < csqrt; kj++) {
          let k = ki * csqrt + kj;
          if (this.board[cid].kouho[k]) {
            ctx.fillStyle = Sudokizer.config.colorset['l' + this.board[cid].kklevel[k]];
            let posx = ofsx + (csize / csqrt) * (kj + 0.5);    // フォントx座標
            let posy = ofsy + (csize / csqrt) * (ki + 0.5);   // フォントy座標
            ctx.fillText(k + 1, posx, posy);
          }
        }
      }
    // 除外候補
    } else {
      ctx.fillStyle = Sudokizer.config.colorset.ex;
      for (let ki = 0; ki < csqrt; ki++) {
        for (let kj = 0; kj < csqrt; kj++) {
          let k = ki * csqrt + kj;
          if (this.board[cid].exkouho[k]) {
            let posx = ofsx + (csize / csqrt) * (kj + 0.5);    // フォントx座標
            let posy = ofsy + (csize / csqrt) * (ki + 0.5);   // フォントy座標
            ctx.fillText(k + 1, posx, posy);
            ctx.fillText('＼', posx, posy);
          }
        }
      }
    }
  }

  /**
   * canvasへのカーソルの描画
   * @param object ctx : 描画コンテキスト
   * @param int ofs    : 盤面のオフセット
   * @param int csize  : マスのサイズ
   */
  drawBoardCanvasCursor(ctx, ofs, csize) {
    let cpos = Sudokizer.config.cursorpos;
    let cx = cpos % this.bsize;
    let cy = Math.floor(cpos / this.bsize);

    ctx.lineWidth = 2;
    if (Sudokizer.config.qamode === 'question') {   // 問題モード
      ctx.strokeStyle = Sudokizer.config.colorset.ex;
    } else {                                        // 解答モード
      ctx.strokeStyle = Sudokizer.config.colorset['l' + Sudokizer.config.kateilevel];
    }
    if (Sudokizer.config.kouhomode) {  // 候補モード：点線
      ctx.setLineDash([5, 3]);
    }
    ctx.strokeRect(ofs + cx * csize + 2, ofs + cy * csize + 2, csize - 4, csize - 4);
    // 各種描画プロパティを元に戻す
    ctx.setLineDash([]); 
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
  }

  /**
   * SVGへの描画
   */
  drawBoardSVG() {
    console.log('draw Board SVG');
  }

  /**
   * コンソールへの出力（デバッグ用）
   */
  drawBoardConsole() {
    let line = '';
    let horizon = ' +-------+-------+-------+';
    for (let i = 0; i < this.numcells; i++) {
      if (i % 27 === 0) {
        console.log(horizon);
      }
      if (i % 3 === 0) {
        line += ' |';
      }
      line += ' ' + this.board[i].num;
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
  constructor() {
    this.stack = [
      new Action([{cmd:'default'}])
    ];
    this.sp = 0;      // スタックポインタ
    this.spmax = 0;   // 現在の最新位置
    console.log(this.stack, this.sp, this.spmax);
  }
  /**
   * アクションをプッシュ
   */
  push(newaction) {
    this.sp++;
    this.spmax = this.sp;  // 現在以降のアクションを無効化
    if (this.spmax > this.stack.length) {
      this.stack.push(newaction)
    } else {
      this.stack[this.sp] = newaction;
    }
    console.log(this.stack, this.sp, this.spmax);
  }
  /**
   * 操作を一つ元に戻す
   */
  undo() {
    if (this.sp > 0) {
      this.stack[this.sp].revert();
      this.sp--;
    }
    console.log(this.stack, this.sp, this.spmax);
  }
  /**
   * 操作を一つ進める
   */
  redo() {
    if (this.sp < this.spmax) {
      this.sp++;
      this.stack[this.sp].commit();
    }
    console.log(this.stack, this.sp, this.spmax);
  }
  /**
   * スタックを空にする
   */
  clear() {
    this.sp = 0;
    this.spmax = 0;
  }
}

/**
 * Actionクラス
 */
class Action {
  constructor(oplist) {
    this.oplist = oplist;
  }

  /**
   * アクションリストをグローバル盤面に適用する
   */
  commit() {
    for (let op of this.oplist) {
      // マスに入力する
      if (op.cmd === 'ansins') {
      // マスから削除する
      } else if (op.cmd === 'ansdel') {
      // ヒントマスを入力する
      } else if (op.cmd === 'hintins') {
      // ヒントマスから削除する
      } else if (op.cmd === 'hintdel') {
      // 候補をONにする
      } else if (op.cmd === 'kouhoon') {
      // 候補をOFFにする
      } else if (op.cmd === 'kouhooff') {
      // 除外候補をONにする
      } else if (op.cmd === 'exkouhoon') {
      // 除外候補をOFFにする
      } else if (op.cmd === 'exkouhooff') {
      }
    }
  }

  /**
   * アクションリストを逆適用する。
   */
  revert() {
    let revlist = this.oplist.slice().reverse();   // 非破壊リバース
    for (let op of revlist) {
      // マスに入力する
      if (op.cmd === 'ansins') {
      // マスから削除する
      } else if (op.cmd === 'ansdel') {
      // ヒントマスを入力する
      } else if (op.cmd === 'hintins') {
      // ヒントマスから削除する
      } else if (op.cmd === 'hintdel') {
      // 候補をONにする
      } else if (op.cmd === 'kouhoon') {
      // 候補をOFFにする
      } else if (op.cmd === 'kouhooff') {
      // 除外候補をONにする
      } else if (op.cmd === 'exkouhoon') {
      // 除外候補をOFFにする
      } else if (op.cmd === 'exkouhooff') {
      }
    }
  }
}


