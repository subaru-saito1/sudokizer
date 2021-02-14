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
  // 新規オブジェクト作成というよりは盤面状態を全リセット
  for (let i = 0; i < Sudokizer.board.numcells; i++) {
    Sudokizer.board.board[i].clear('question');
  }
  redraw();
  // Sudokizer.astack.clear(action);
}

/**
 * ぱずぷれURL出力
 */
function urlWritePuzpre(evt) {
  let urlprefix = 'http://pzv.jp/p.html'
  let url = urlprefix + '?' + Sudokizer.board.urlWrite();
  alert('URL write for puzpre: \n' + url);
  console.log(url);
}

/**
 * puzzlink URL出力
 */
function urlWritePuzzlink(evt) {
  let urlprefix = 'https://puzz.link/p'
  let url = urlprefix + '?' + Sudokizer.board.urlWrite();
  alert('URL write for puzzlink: \n' + url);
  console.log(url);
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
 * 表示サイズ設定 ＜完成＞
 */
function setCellSize(evt) {
  let sizeobj = $('#menu_dispsize_size');
  let csize = sizeobj.val();
  // 有効範囲にいる場合のみ変更
  if (csize >= sizeobj.attr('min') && csize <= sizeobj.attr('max')) {
    Sudokizer.config.dispsize = csize;
    // canvasサイズ変更
    let boardsize = Sudokizer.config.drawpadding * 2 + csize * Sudokizer.board.bsize;
    $('#main_board').attr('width', boardsize);
    $('#main_board').attr('height', boardsize);
  }
  // デバッグモード
  if (Sudokizer.config.debugmode) {
    console.log(Sudokizer.config);
  }
  redraw();
}

/**
 * フォント設定（なかった）
 */
/*
function setFont(evt) {
  alert('set font');
  redraw();
}
*/

/**
 * 表示色設定 ＜完成＞
 */
function setColor(evt) {
  // 変化があった要素を特定。thisでとってこれる。
  let aftercolor = $(this).val();
  let propname = $(this).attr('id').substr(-2);
  Sudokizer.config.colorset[propname] = aftercolor;
  // デバッグモード
  if (Sudokizer.config.debugmode) {
    console.log(Sudokizer.config);
  }
  redraw();
}

/**
 * 色設定デフォルト ＜完成＞
 */
function setColorDefault(evt) {
  // defcolorset を colorset に shallow copy
  Sudokizer.config.colorset = Object.assign({}, Sudokizer.config.defcolorset);
  // フォーム側に色を反映
  for (let propname in Sudokizer.config.colorset) {
    $('#menu_dispcolor_' + propname).val(Sudokizer.config.colorset[propname]);
  }
  // デバッグモード
  if (Sudokizer.config.debugmode) {
    console.log(Sudokizer.config);
  }
  redraw();
}

/* ============================= デバッグモード ============================= */

/**
 * デバッグモード切替 ＜完成＞
 */
function debugMode(evt) {
  Sudokizer.config.debugmode = !Sudokizer.config.debugmode;
  if (Sudokizer.config.debugmode) {
    console.log(Sudokizer.config);
  }
}

/* ============================= 入力モード設定 ============================== */

/**
 * 問題入力モード ＜完成＞
 */
function setQMode(evt) {
  Sudokizer.config.qamode = 'question';
  if (Sudokizer.config.debugmode) {
    console.log(Sudokizer.config);
  }
  redraw();
}

/**
 * 解答入力モード ＜完成＞
 */
function setAMode(evt) {
  Sudokizer.config.qamode = 'answer';
  if (Sudokizer.config.debugmode) {
    console.log(Sudokizer.config);
  }
  redraw();
}

/**
 * 候補入力モード ＜完成＞
 */
function switchKMode(evt) {
  Sudokizer.config.kouhomode = !Sudokizer.config.kouhomode;
  if (Sudokizer.config.debugmode) {
    console.log(Sudokizer.config);
  }
  redraw();
}

/* ================================ 盤面編集 ================================= */

/**
 * undo
 */
function actionUndo(evt) {
  // とりあえずここにメモ: ActionStackのメソッド
  // - undo：ポインタを1個前に戻して盤面をチェックアウト
  // - redo：ポインタを1個次に進めて盤面をチェックアウト
  // - push：現在のポインタの位置にアクションを「破壊的に」追加
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
  for (let i = 0; i < Sudokizer.board.numcells; i++) {
    Sudokizer.board.board[i].clear('answer');
  }
  redraw();
  // Sudokizer.astack.push(action);
}

/**
 * 候補消去
 */
function kouhoClear(evt) {
  for (let i = 0; i < Sudokizer.board.numcells; i++) {
    Sudokizer.board.board[i].clear('kouho');
  }
  redraw();
  // Sudokizer.astack.push(action);
}

/**
 * 仮定レベル変更 ＜完成＞
 */
function setKateiLevel(evt) {
  Sudokizer.config.kateilevel = $('#opform_kateilevel').val();
  if (Sudokizer.config.debugmode) {
    console.log(Sudokizer.config);
  }
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
  if (Sudokizer.config.drawmedia === 'canvas') {
    Sudokizer.board.drawBoardCanvas();
  } else if (Sudokizer.config.drawmedia === 'svg') {
    Sudokizer.board.drawBoardSVG();
  } else {
    if (Sudokizer.config.debugmode) {
      Sudokizer.board.drawBoardConsole();
    }
  }
}