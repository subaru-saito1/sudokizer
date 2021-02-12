"use strict";

/**
 * front.js
 * 
 * フロントUIに関する処理
 */


/* ============================== ファイル処理系 ============================== */

/**
 * 新規盤面作成
 */
function newFile(evt) {
  alert('New File');
  // Sudokizer.astack.clear(action);
}

/**
 * ぱずぷれURL出力
 */
function urlWritePuzpre(evt) {
  alert('URL write for puzpre');
}

/**
 * puzzlink URL出力
 */
function urlWritePuzzlink(evt) {
  alert('URL write for puzzlink');
}

/**
 * 画像出力
 */
function imgWrite(evt) {
  // 1. ファイル名取得
  // 2. 画像保存
  alert('Image Write');
}

/**
 * pencilBox形式読み込み
 */
function pencilBoxRead(evt) {
  alert('pencilBox Read');
  // Sudokizer.astack.push(action);
}

/**
 * pencilBox出力
 */
function pencilBoxWrite(evt) {
  alert('pencilBox Write');
}

/**
 * 独自テキスト形式読み込み
 */
function easyTextRead(evt) {
  alert('easytext read');
  // Sudokizer.astack.push(action);
}

/**
 * 独自テキスト形式出力
 */
function easyTextWrite(evt) {
  alert('easytext write');
}


/**
 * URL出力関数メインルーチン
 */
function urlWrite(board) {
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
function urlRead(urlstring) {
  // 1. ?の後ろのみ取り出す
  // 2. 3つ目の/以降を取り出す
  // 3. urlWriteと逆の処理でboardを生成
}




/* =========================== 盤面変換系 ================================= */

/**
 * 現在の盤面を新しいウィンドウにコピー
 */
function boardNewWindow(evt) {
  alert('Copy Board');
}

/**
 * 90度右回転
 */
function boardRotate90Deg(evt) {
  alert('rotate 90deg right');
  // Sudokizer.astack.push(action);
}

/**
 * 180度右回転
 */
function boardRotate180Deg(evt) {
  alert('rotate 180deg');
  // Sudokizer.astack.push(action);
}

/**
 * 90度左回転
 */
function boardRotate270Deg(evt) {
  alert('rotate 90deg left');
  // Sudokizer.astack.push(action);
}

/**
 * 上下反転
 */
function boardInverseUD(evt) {
  alert('inverse up-to-down');
  // Sudokizer.astack.push(action);
}

/**
 * 左右反転
 */
function boardInverseLR(evt) {
  alert('inverse left-to-right');
  // Sudokizer.astack.push(action);
}


/* ============================= 表示設定系 ================================ */

/**
 * 表示サイズ設定
 */
function setCellSize(evt) {
  alert('set cell size');
  redraw();
}

/**
 * フォント設定
 */
function setFont(evt) {
  alert('set font');
  redraw();
}

/**
 * 表示色設定
 */
function setColor(evt) {
  alert('set color');
  redraw();
}

/**
 * 色設定デフォルト
 */
function setColorDefault(evt) {
  // defcolorset を colorset に shallow copy
  Sudokizer.config.colorset = Object.assign({}, Sudokizer.config.defcolorset);
  alert('reste color settings');
  redraw();
}

/* ============================= デバッグモード ============================= */

/**
 * デバッグモード切替。完成。
 */
function debugMode(evt) {
  Sudokizer.config.debugmode = !Sudokizer.config.debugmode;
  alert('debug mode');
}

/* ============================= 入力モード設定 ============================== */

/**
 * 問題入力モード
 */
function setQMode(evt) {
  Sudokizer.config.qamode = 'question';
  alert('Qmode')
  redraw();
}

/**
 * 解答入力モード
 */
function setAMode(evt) {
  Sudokizer.config.qamode = 'answer';
  alert('Amode');
  redraw();
}

/**
 * 候補入力モード
 */
function switchKMode(evt) {
  Sudokizer.config.kouhomode = !Sudokizer.config.kouhomode;
  alert('Kmode');
  redraw();
}

/* ================================ 盤面編集 ================================= */

/**
 * undo
 */
function actionUndo(evt) {
  // とりあえずここにメモ: ActionStackのメソッド
  // - undo：ポインタを1個前に戻して盤面をチェックアウト + redraw()
  // - redo：ポインタを1個次に進めて盤面をチェックアウト + redraw()
  // - push：現在のポインタの位置にアクションを「破壊的に」追加 + redraw()
  // - clear: actionstack初期化 + redraw()

  // Sudokizer.astack.undo();
  alert('undo')
}

/**
 * redo
 */
function actionRedo(evt) {
  // Sudokizer.astack.redo();
  alert('redo');
}

/**
 * 解答消去
 */
function answerClear(evt) {
  alert('clear answer');
  // Sudokizer.astack.push(action);
}

/**
 * 候補消去
 */
function kouhoClear(evt) {
  alert('clear kouho');
  // Sudokizer.astack.push(action);
}

/**
 * 仮定レベル変更
 */
function setKateiLevel(evt) {
  alert('katei Level');
  redraw();
}



/* ================================ 制作支援 ================================= */

/**
 * 解答チェック
 */
function answerCheck(evt) {
  alert('answer check');
}

/**
 * 候補自動洗い出し
 */
function autoKouho(evt) {
  alert('auto kouho calculate');
  // Sudokizer.astack.push(action);
}

/**
 * ？ヒント条件から半自動生成
 */
function autoGenerate(evt) {
  alert('semi-auto generation via ? hints');
  // Sudokizer.astack.push(action);
}

/**
 * 1ステップ解答
 */
function stepSolve(evt) {
  alert('stepsolve');
  // Sudokizer.astack.push(action);
}

/**
 * 全ステップ解答
 */
function allSolve(evt) {
  alert('allSolve');
  // Sudokizer.astack.push(action);
}


/* ================================ Canvas ================================== */

/**
 * 盤面へのクリック
 */
function clickBoard(evt) {
  // alert('board clicked');
  console.log(evt);
  // Sudokizer.astack.push(action);
}
/**
 * 盤面へのキーボード押下
 */
function keyDownBoard(evt) {
  alert('keyboard downed');
  console.log(evt);
  // Sudokizer.astack.push(action);
}



/* ==============================================================
 *                        盤面描画ルーチン
 * =============================================================
 */

/**
 * 盤面再描画用呼び出しルーチン
 * Sudokizerの中身が変わった際に呼び出す実装
 */
function redraw() {
  drawBoard(Sudokizer.board);
}

/**
 * 盤面のメイン描画ルーチン
 */
function drawBoard(board) {
  // 設定に応じてcanvasかsvgかconsoleか変更
  if (Sudokizer.config.drawmedia === 'canvas') {
    drawBoardCanvas(board);
  } else if (Sudokizer.config.drawmedia === 'svg') {
    drawBoardSVG(board);
  } else {
    drawBoardConsole(board);
  }
}

/**
 * canvasへの描画
 */
function drawBoardCanvas(board) {
  alert('draw Board Canvas');
}

/**
 * SVGへの描画
 */
function drawBoardCanvas(board) {
  alert('draw Board SVG');
}

/**
 * コンソールへの出力（デバッグ用）
 */
function drawBoardConsole(board) {
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